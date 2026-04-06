import datetime
import os
import random
from itertools import islice
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import einops
import torch
import webdataset as wds
from jutils import exists, freeze, ims_to_grid, instantiate_from_config
from jutils.nn import AutoencoderKL
from matplotlib import pyplot as plt
from omegaconf import OmegaConf

from ldm.dataprocessor.sampler.data_filter import make_filtered_loader
from ldm.dataprocessor.sampler.data_handler import (
    HDF5DatasetManager,
    NumpyDataHandler,
)
from ldm.flow import FlowModel
from ldm.models.transformer.dit import DiT_models

torch.set_float32_matmul_precision("high")


#############################################################
#                          Utils                            #
#############################################################


def img_to_grid(img: torch.Tensor, stack: str = "row", split: int = 4) -> torch.Tensor:
    """Convert (b, c, h, w) to a grid image."""
    if stack not in ["row", "col"]:
        raise ValueError(f"Unknown stack type {stack}")

    if split is not None and img.shape[0] % split == 0:
        splitter = dict(b1=split) if stack == "row" else dict(b2=split)
        img = einops.rearrange(img, "(b1 b2) c h w -> (b1 h) (b2 w) c", **splitter)
    else:
        to = "(b h) w c" if stack == "row" else "h (b w) c"
        img = einops.rearrange(img, "b c h w -> " + to)

    return img


def un_normalize_img(img: torch.Tensor) -> torch.Tensor:
    """Convert from [-1, 1] to [0, 255]."""
    return ((img * 127.5) + 127.5).clip(0, 255).to(torch.uint8)


def normalize_img(img: torch.Tensor) -> torch.Tensor:
    """Convert from [0, 255] to [-1, 1]."""
    return img.to(torch.float32) / 127.5 - 1


def show_samples(
    intermediates: Dict[str, torch.Tensor],
    split: int = 4,
    save_to_file: Optional[str] = None,
) -> None:
    """Show samples."""
    if not intermediates:
        return

    intermediates = dict(
        sorted(intermediates.items(), key=lambda x: float(x[0]), reverse=True)
    )
    ims = torch.stack(list(intermediates.values()), dim=1)
    ims = einops.rearrange(ims, "t b c h w -> (t b) c h w")
    ims = un_normalize_img(ims)
    ims_grid = ims_to_grid(ims, stack="row", split=split)

    plt.imshow(ims_grid.cpu().numpy())
    plt.title(r"Forward Diffusion $x_1 \rightarrow x_0$")
    plt.axis("off")
    if save_to_file:
        plt.savefig(save_to_file, bbox_inches="tight")
    plt.show()
    plt.close()


#############################################################
#                 Pipeline Latent Sampler                   #
#############################################################


class SampleProcessor:
    def __init__(
        self,
        selected_timesteps: List[float],
        dataset_cfg: str,
        dataset_dir: str,
        hdf5_dir: Optional[str],
        first_stage_ckpt: str = "checkpoints/sd_ae.ckpt",
        second_stage_ckpt: str = "checkpoints/SiT-XL-2-256x256.pt",
        start_batch_id: int = 0,
        end_batch_id: int = 10000,
        input_size: int = 32,
        num_classes: int = 1000,
        class_labels: Optional[List[int]] = None,
        batch_size: int = 16,
        num_steps: int = 100,
        sample_kwargs: Optional[Dict[str, Any]] = None,
        dev: Optional[torch.device] = None,
        type: str = "train",
        log_every: int = 1000,
        prefetch_factor: Optional[int] = None,
    ) -> None:
        self.device = dev or torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.start_batch_id = start_batch_id
        self.end_batch_id = end_batch_id
        self.batch_size = batch_size
        self.num_classes = num_classes
        self.input_size = input_size
        self.log_every = log_every
        self.prefetch_factor = prefetch_factor

        self.data_dir = dataset_dir
        self.hdf5_dir = hdf5_dir
        self.type = type
        self.class_labels = class_labels or []
        self.selected_timesteps = selected_timesteps

        # Null vector for Classifier-Free Guidance
        y_null = torch.tensor([self.num_classes] * self.batch_size, device=self.device)
        self.sample_kwargs = sample_kwargs.copy() if sample_kwargs else {}
        self.sample_kwargs.update(
            num_steps=num_steps,
            cfg_scale=1.0,
            uc_cond=y_null,
            cond_key="y",
        )

        # Stage 1: Pre-trained CNN beta-VAE model
        first_stage = AutoencoderKL(ckpt_path=first_stage_ckpt).to(self.device)
        self.first_stage = torch.compile(first_stage, fullgraph=True)
        freeze(self.first_stage)
        self.first_stage.eval()

        # Stage 2: Pre-trained class-conditional flow matching model
        net = DiT_models["DiT-XL/2"](
            input_size=self.input_size,
            num_classes=self.num_classes,
            learn_sigma=True,
            load_from_ckpt=second_stage_ckpt,
        ).to(self.device)
        flow_model = FlowModel(net, schedule="linear").to(self.device)
        self.second_stage = torch.compile(flow_model, fullgraph=True)
        freeze(self.second_stage)
        self.second_stage.eval()

        loaded_dataset_cfg = OmegaConf.load(dataset_cfg)
        self.datamod = instantiate_from_config(loaded_dataset_cfg)
        self.datamod.setup("fit")

        self._override_datamodule_dataloaders()
        self.datahandler = NumpyDataHandler(base_dir=self.data_dir)

    def _override_datamodule_dataloaders(self) -> None:
        self.datamod.train_dataloader = self.train_dataloader
        self.datamod.val_dataloader = self.val_dataloader

    def train_dataloader(self) -> wds.WebLoader:
        return make_filtered_loader(
            data=self.datamod,
            data_cfg=self.datamod.train,
            class_labels=self.class_labels,
            train=True,
            prefetch_factor=self.prefetch_factor,
        )

    def val_dataloader(self) -> wds.WebLoader:
        return make_filtered_loader(
            data=self.datamod,
            data_cfg=self.datamod.validation,
            class_labels=self.class_labels,
            train=False,
            prefetch_factor=self.prefetch_factor,
        )

    @torch.no_grad()
    def encode_first_stage(self, x: torch.Tensor) -> torch.Tensor:
        if exists(self.first_stage):
            return self.first_stage.encode(x)
        return x

    @torch.no_grad()
    def decode_first_stage(self, z: torch.Tensor) -> torch.Tensor:
        if exists(self.first_stage):
            return self.first_stage.decode(z)
        return z

    @torch.no_grad()
    def encode_second_stage(
        self,
        latent: torch.Tensor,
        y: Optional[torch.Tensor] = None,
        return_intermediates: bool = True,
        sample_kwargs: Optional[Dict[str, Any]] = None,
    ) -> Tuple[Optional[torch.Tensor], Optional[Dict[str, torch.Tensor]]]:
        """Forward diffusion."""
        if not exists(self.second_stage):
            return None, None

        xt, intermediates = self.second_stage.encode(
            latent,
            y=y,
            return_intermediates=return_intermediates,
            **(sample_kwargs or {}),
        )
        return xt, intermediates

    @torch.no_grad()
    def decode_second_stage(
        self, z: torch.Tensor, label: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        """Euler sampling."""
        if exists(self.second_stage):
            return self.second_stage.generate(z, y=label, **self.sample_kwargs)
        return z

    def _get_dataloader(self):
        if self.type == "train":
            return self.train_dataloader()
        return self.val_dataloader()

    @torch.no_grad()
    def __call__(self) -> None:
        """Generate noisy latents."""
        dataloader = self._get_dataloader()

        selected_timesteps = sorted(self.selected_timesteps, reverse=True)
        print(f"Selected timesteps: {selected_timesteps}")

        for batch_idx, batch in enumerate(
            islice(dataloader, self.start_batch_id, self.end_batch_id),
            start=self.start_batch_id,
        ):
            if batch_idx >= self.end_batch_id:
                break

            x = batch["image"][: self.batch_size].to(self.device).float()
            y = batch["label"][: self.batch_size].to(self.device).long()

            latent = self.encode_first_stage(x)
            xt, intermediates = self.encode_second_stage(
                latent,
                y=y,
                return_intermediates=True,
                sample_kwargs=self.sample_kwargs,
            )

            if xt is None or intermediates is None:
                raise RuntimeError("Second stage model is not available.")

            intermediates = {
                f"{t:.1f}": intermediates.get(f"{t:.1f}", None)
                for t in selected_timesteps
            }
            intermediates = {k: v for k, v in intermediates.items() if v is not None}

            if batch_idx % self.log_every == 0:
                print(f"Batch {batch_idx}/{self.end_batch_id} - {self.type}")
                img_file = os.path.join(
                    self.data_dir,
                    f"{self.type}_samples_{batch_idx}.png",
                )
                show_samples(intermediates, split=4, save_to_file=img_file)

            data_dict = {
                "image": x.detach().cpu(),
                "latent": xt.detach().cpu(),
                "label": y.detach().cpu(),
                "intermediate_steps": selected_timesteps,
                "intermediates": list(intermediates.values()),
            }

            self.datahandler.save_to_numpy(data_dict, group_name=self.type)

        postfix = datetime.datetime.now().strftime("T%H%M%S")
        filename = f"imagenet256_data-{postfix}.hdf5"
        self.save_hdf5(self.data_dir, filename=filename, group_name=self.type)

    def save_hdf5(
        self, data_dir: str, filename: str, group_name: str = "train"
    ) -> None:
        """Save to HDF5 using a HDF5-Manager."""
        hdfhandler = HDF5DatasetManager(data_dir)
        hdfhandler.save_to_hdf5(filename=filename, group_name=group_name)

        hdf5_file = os.path.join(data_dir, filename)
        hdfhandler.print_hdf5_structure(hdf5_file, save_to_file=True)
        print(f"Data saved to {hdf5_file}")

    def get_hdf5(
        self,
        data_dir: str,
        filename: str,
        group_name: str = "train",
    ):
        """Get files from HDF5 using a HDF5-Manager."""
        hdfhandler = HDF5DatasetManager(data_dir)
        hdf5_file = os.path.join(data_dir, filename)
        rand_idx = random.randint(0, len(self.selected_timesteps) - 1)
        imgs, labels, latents = hdfhandler.retrieve_from_hdf5(
            file_path=hdf5_file,
            timestep=self.selected_timesteps[rand_idx],
            group_name=group_name,
            plot_samples=True,
        )
        return imgs, labels, latents


if __name__ == "__main__":
    # sample_pipeline.py
    this_file = Path(__file__).resolve()

    # backend/packages/ldm
    project_root = this_file.parents[3]
    dataset_root = project_root / "dataset"

    hdf5_file = None  # "dataset/processed/imagenet-256/hdf5"
    dataset_dir = dataset_root  # "dataset/processed/imagenet-256"
    dataset_cfg = project_root / "ldm" / "configs" / "data" / "imagenet256_mvl.yaml"

    # Set the selected timesteps
    selected_timesteps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    print(f"Selected timesteps: {selected_timesteps}")

    # Define class labels for ImageNet-256
    # 0-999: ImageNet classes
    class_labels = [
        0,
        1,
        88,
        96,
        154,
        158,
        250,
        236,
        269,
        270,
        290,
        291,
        292,
        293,
        294,
        295,
        296,
        330,
        332,
        339,
        340,
        954,
        957,
    ]
    # class_labels = [
    #     87,
    #     88,
    #     89,
    #     90,
    #     93,
    #     96,
    #     130,
    #     154,
    #     158,
    #     236,
    #     248,
    #     250,
    #     259,
    #     263,
    #     264,
    #     266,
    #     269,
    #     270,
    #     271,
    #     277,
    #     278,
    #     288,
    #     287,
    #     290,
    #     291,
    #     292,
    #     293,
    #     294,
    #     295,
    #     296,
    #     322,
    #     323,
    #     324,
    #     330,
    #     332,
    #     339,
    #     340,
    #     388,
    #     387
    # ]  # V0 datasets

    # V0 - Dataset selection
    # class_labels: [
    # 0, 1, 154, 158,
    # 250, 236, 291,
    # 292, 294, 296,
    # 330, 332, 339,
    # 340, 954, 957
    # ]

    # V2 - Dataset selection
    # class_labels = [0, 1, 5, 6, 7, 8, 9, 14, 22, 43, 44, 46, 47, 48, 84, 88, 89, 93, 94, 95,
    #                 96, 97, 99, 100, 105, 127, 128, 130, 144, 145, 146, 151, 152, 154, 156, 158,
    #                 160, 162, 163, 167, 169, 170, 171, 195, 218, 219, 232, 234, 235, 236, 244,
    #                 245, 246, 247, 249, 250, 277, 278, 279, 280, 281, 282, 285, 286, 287,
    #                 288, 289, 290, 291, 292, 293, 294, 295, 296, 321, 322, 323, 324, 325,
    #                 326, 330, 332, 335, 339, 340, 346, 347, 350, 352, 353, 355, 365, 366,
    #                 382, 383, 385, 386, 387, 388, 393, 396, 954, 957, 169]

    print(f"Class labels: {len(class_labels)}")
    batch_size = 8

    # Create samples
    """ Sample processor """
    processer = SampleProcessor(
        selected_timesteps=selected_timesteps,
        dataset_cfg=str(dataset_cfg),
        dataset_dir=str(dataset_dir),
        hdf5_dir=str(hdf5_file),
        start_batch_id=0,
        end_batch_id=100,
        num_classes=1000,
        class_labels=class_labels,
        batch_size=batch_size if batch_size > 0 else len(class_labels),
        log_every=1000,
        type="train",  # 'train' or 'validation'
    )

    processer()
    print("Sample processing completed.")

    torch.cuda.empty_cache()
