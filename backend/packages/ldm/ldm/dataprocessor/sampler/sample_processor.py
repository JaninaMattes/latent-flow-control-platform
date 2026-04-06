import datetime
import os, sys
from matplotlib import pyplot as plt
from omegaconf import OmegaConf
import numpy as np
from itertools import islice
import einops

import torch

# Load jutil modules
from jutils.nn import AutoencoderKL
from jutils import instantiate_from_config
from jutils import exists, freeze, default
from jutils import ims_to_grid
from jutils import instantiate_from_config

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
sys.path.append(project_root)

# Load custom modules
from ldm.flow import FlowModel
from ldm.models.transformer.dit import DiT_models
from data_processing.sampler.data_handler import NumpyDataHandler, HDF5DatasetManager
from data_processing.sampler.data_filter import make_filtered_loader


# Set precision to high
torch.set_float32_matmul_precision('high')




#############################################################
#                          Utils                           # 
#############################################################

def img_to_grid(img, stack="row", split=4):
    """ Convert (b, c, h, w) to (h, w, c) """
    if stack not in ["row", "col"]:
        raise ValueError(f"Unknown stack type {stack}")
    if split is not None and img.shape[0] % split == 0:
        splitter = dict(b1=split) if stack == "row" else dict(b2=split)
        img = einops.rearrange(img, "(b1 b2) c h w -> (b1 h) (b2 w) c", **splitter)
    else:
        to = "(b h) w c" if stack == "row" else "h (b w) c"
        img = einops.rearrange(img, "b c h w -> " + to)
    return img


def un_normalize_img(img):
    """ Convert from [-1, 1] to [0, 255] """
    img = ((img * 127.5) + 127.5).clip(0, 255).to(torch.uint8)
    return img

def normalize_img(img):
    """ Convert from [0, 255] to [-1, 1] """
    img = img.to(torch.float32) / 127.5 - 1
    return img


def show_samples(intermediates, split=4, save_to_file=None):
    """ Show samples """
    intermediates = dict(sorted(intermediates.items(), key=lambda x: float(x[0]), reverse=True))  # Sort by timestep
    ims = torch.stack(list(intermediates.values()), dim=1)
    ims = einops.rearrange(ims, "t b c h w -> (t b) c h w")
    ims = un_normalize_img(ims)
    ims_grid = ims_to_grid(ims, stack="row", split=split)

    plt.imshow(ims_grid.cpu().numpy())
    plt.title(r"Forward Diffusion $x_1 \rightarrow x_0$")
    plt.axis("off")
    if save_to_file:
        plt.savefig(save_to_file, bbox_inches='tight')
    plt.show()
    plt.close() 





#############################################################
#                 Pipelione Latent Sampler                   # 
#############################################################

class SampleProcessor:
    def __init__(
        self, 
        selected_timesteps: list,                       # Timesteps to extract
        dataset_cfg: dict,                              # Dataset config
        dataset_dir: str,                               # Dataset directory
        hdf5_dir: str,                                  # HDF5 directory
        first_stage_ckpt = 'checkpoints/sd_ae.ckpt',    # First stage   (KL Autoencoder)
        second_stage_ckpt = 'checkpoints/SiT-XL-2-256x256.pt',                     # Second stage  (LDM using Flow Matching)#
        start_batch_id: int = 0,                        # Starting batch ID
        end_batch_id: int = 10000,                      # Ending batch ID
        input_size: int = 32,                           # Input size
        num_classes: int = 1000,                        # Number of classes
        class_labels: list = None,                      # Class labels to filter
        batch_size: int = 16,                           # Batch size
        num_steps: int = 100,                            # Number of steps
        sample_kwargs: dict = None,                     # DDIM sampling kwargs 
        dev: torch.device = None,                       # Device to use for sampling
        type: str = "train",                            # Type of sampling (sample or encode)
        log_every=1000,                                 # Log every n batches
        ):
        
        # Device settings
        self.device = dev if dev else torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.start_batch_id = start_batch_id
        self.end_batch_id = end_batch_id
        self.batch_size = batch_size
        self.num_classes = num_classes
        self.input_size = input_size
        self.log_every = log_every

        # Dataset settings
        self.data_dir = dataset_dir
        self.hdf5_dir = hdf5_dir
        self.dataset_cfg = dataset_cfg
        self.type = type

        # Sampling settings
        y_null = torch.tensor([self.num_classes] * self.batch_size, device=self.device)
        self.sample_kwargs = sample_kwargs if sample_kwargs else {} 
        self.sample_kwargs.update(  # Add null
            num_steps = num_steps,
            cfg_scale = 1.0,
            uc_cond = y_null,
            cond_key = 'y'
        )     
        self.selected_timesteps = selected_timesteps
        
        # KL Autoencoder - first stage settings
        first_stage = AutoencoderKL(ckpt_path=first_stage_ckpt).to(self.device)
        self.first_stage = torch.compile(first_stage, fullgraph=True)
        freeze(self.first_stage)
        self.first_stage.eval()
            
        # Second stage (Flow with SiT) settings
        flow_model = net = DiT_models["DiT-XL/2"](
                input_size=self.input_size,
                num_classes=self.num_classes,
                learn_sigma=True,               # we "learn sigma" but never use it in SiT/DiT
                load_from_ckpt=second_stage_ckpt,
            ).to(self.device)
        flow_model = FlowModel(net, schedule="linear").to(self.device)
        self.second_stage = torch.compile(flow_model, fullgraph=True)
        freeze(self.second_stage)
        self.second_stage.eval()      


        # Load data
        dataset_cfg = OmegaConf.load(dataset_cfg)
        self.datamod = instantiate_from_config(dataset_cfg)
           
        if self.type == "train":
            self.datamod.train_dataloader = lambda: make_filtered_loader(
                data=self.datamod, data_cfg=self.datamod.train, class_labels=class_labels, train=True)
        else:
            self.datamod.val_dataloader = lambda: make_filtered_loader(
                data=self.datamod, data_cfg=self.datamod.validation, class_labels=class_labels, train=False)
        
        self.datamod.setup('fit')
                
        """ Data handler """
        self.datahandler = NumpyDataHandler(base_dir=self.data_dir)
    
    
    @torch.no_grad()
    def encode_first_stage(self, x):
        if exists(self.first_stage):
            x = self.first_stage.encode(x)
        return x
    
    @torch.no_grad()
    def decode_first_stage(self, z):
        if exists(self.first_stage):
            z = self.first_stage.decode(z)
        return z
    
    @torch.no_grad()
    def encode_second_stage(self, latent, y=None, return_intermediates=True, sample_kwargs=None):
        """ Forward diffusion """
        if exists(self.second_stage):
            xt, intermediates = self.second_stage.encode(latent, y=y, return_intermediates=return_intermediates, **(sample_kwargs or {}))               # x0: noise, x: target, t: timestep
        return xt, intermediates
    
    @torch.no_grad()
    def decode_second_stage(self, z, label=None):
        """ Euler sampling """
        if exists(self.second_stage):
            z = self.second_stage.generate(z, y=label, **self.sample_kwargs)
        return z
  
    
    @torch.no_grad()
    def __call__(self):
        """Generate noisy latents"""
        if self.type == 'train':
            dataloader = self.datamod.train_dataloader()
        else:
            dataloader = self.datamod.val_dataloader()
        
        # Get selected timesteps
        selected_timesteps = sorted(self.selected_timesteps, reverse=True)
        print(f"Selected timesteps: {selected_timesteps}")
        
        # Get batch
        for batch_idx, batch in enumerate(islice(dataloader, self.start_batch_id, self.end_batch_id), start=self.start_batch_id):
            if batch_idx >= self.end_batch_id:
                break
            x = batch['image'][:self.batch_size].to(self.device).float()
            y = batch['label'][:self.batch_size].to(self.device).long()
        
            # Pipeline
            latent = self.encode_first_stage(x)
            xt, intermediates = self.encode_second_stage(latent, y=y, return_intermediates=True, sample_kwargs=self.sample_kwargs)
            # Generate samples
            intermediates = {f"{t:.1f}": intermediates.get(f"{t:.1f}", None) for t in selected_timesteps}
            intermediates = {k: v for k, v in intermediates.items() if v is not None}
            
            # Plot samples
            if batch_idx % self.log_every == 0:
                print(f"Batch {batch_idx}/{self.end_batch_id} - {self.type}")
                img_file = os.path.join(self.data_dir, f"{self.type}_samples_{batch_idx}.png")
                show_samples(intermediates, split=4, save_to_file=img_file)
            
            data_dict = {
                'image': x.detach().cpu(),
                'latent': xt.detach().cpu(),
                'label': y.detach().cpu(),
                'intermediate_steps': selected_timesteps,
                'intermediates': list(intermediates.values()),
            }

            # Save to Numpy 
            self.datahandler.save_to_numpy(data_dict, group_name=self.type)
            torch.cuda.empty_cache()
        
        # Store to HDF5
        postfix = datetime.datetime.now().strftime("T%H%M%S")
        filename = f'imagenet256_data-{postfix}.hdf5'
        self.save_hdf5(self.data_dir, filename=filename, group_name=self.type)
        torch.cuda.empty_cache()
        
    
    
    def save_hdf5(self, data_dir, filename, group_name: str = 'train'):
        """ Save to HDF5 """
        hdfhandler = HDF5DatasetManager(data_dir)
        hdfhandler.save_to_hdf5(filename=filename, group_name=group_name)
        # Plot structure
        hdf5_file = os.path.join(data_dir, filename)
        hdfhandler.print_hdf5_structure(hdf5_file, save_to_file=True)
        print(f"Data saved to {hdf5_file}")
        
        # Load HDF5
        imgs, labels, latents = hdfhandler.retrieve_from_hdf5(
            file_path=hdf5_file, timestep=self.selected_timesteps[0], group_name=group_name, plot_samples=True
        )
        return imgs, labels, latents






if __name__ == "__main__":
    # Set folders
    hdf5_file = None #"dataset/processed/imagenet-256/hdf5"
    dataset_dir = 'dataset/processed/needs-fix' # "dataset/processed/imagenet-256"
    dataset_cfg = "configs/data/imagenet256_mvl.yaml"
    
    # Set the selected timesteps
    selected_timesteps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    print(f"Selected timesteps: {selected_timesteps}")   
    
    # Define class labels for ImageNet-256
    # 0-999: ImageNet classes
    # class_labels = [0, 1, 88, 96, 154, 158, 250, 236, 269, 270, 290, 291, 292, 293, 294, 295, 296, 330, 332, 339, 340, 954, 957]
    class_labels = [0, 1, 88, 89, 93, 96, 130, 154, 158, 236, 248, 250, 259, 270, 290, 291, 292, 294, 295, 296, 330, 332, 339, 340, 954, 957] # V0 datasets
    
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
    #                 382, 383, 385, 386, 387, 388, 393, 396, 954, 957, 169] # 949, 953, 954, 947,  938, 
    
    print(f"Class labels: {len(class_labels)}")
    batch_size = 32 
    
    # Create samples
    """ Sample processor """
    processer = SampleProcessor(
        selected_timesteps=selected_timesteps,
        dataset_cfg=dataset_cfg,
        dataset_dir=dataset_dir,
        hdf5_dir=hdf5_file,
        start_batch_id=600,
        end_batch_id=1100,
        num_classes=1000,
        class_labels=class_labels,
        batch_size=batch_size if batch_size > 0 else len(class_labels),
        log_every=1000,
        type='train',  # 'train' or 'validation'
    )
    
    processer()
    print("Sample processing completed.")
    
    torch.cuda.empty_cache()