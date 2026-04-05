from __future__ import annotations

import logging
from io import BytesIO
from pathlib import Path
from typing import Any

import numpy as np
import torch
from jutils import freeze
from PIL import Image

from ldm.inference.config import GenerationConfig
from ldm.trainer import TrainerModuleLatentFlow

logger = logging.getLogger(__name__)


class LatentFlowInferenceService:
    def __init__(
        self,
        flow_ckpt_name: str,
        device: str = "cpu",
        default_img_size: tuple[int, int] = (256, 256),
    ) -> None:
        self.flow_ckpt_path = (
            Path(__file__).resolve().parents[1] / "checkpoints" / flow_ckpt_name
        )
        self.device = torch.device(device)
        self.default_img_size = default_img_size

        self._fm_module: TrainerModuleLatentFlow | None = None
        self._loaded = False

    @property
    def fm_module(self) -> TrainerModuleLatentFlow:
        # ensures that only one instance is loaded
        if self._fm_module is None:
            raise RuntimeError("Model is not loaded. Call load() first.")
        return self._fm_module

    def load_model(self) -> None:
        if self._loaded:
            return

        fm_module = TrainerModuleLatentFlow.load_from_checkpoint(
            checkpoint_path=self.flow_ckpt_path,
            map_location=str(self.device),
            weights_only=False,
        )
        fm_module.eval()
        freeze(fm_module.model)
        fm_module.to(self.device)

        self._fm_module = fm_module
        self._loaded = True

    def preprocess_image_bytes(self, image_bytes: bytes) -> torch.Tensor:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        return self.preprocess_pil(image)

    def preprocess_pil(self, image: Image.Image) -> torch.Tensor:
        image = image.convert("RGB").resize(self.default_img_size)
        arr = np.asarray(image, dtype=np.float32) / 255.0
        x = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0)  # [1, C, H, W]

        # The model expects [-1, 1]
        x = x * 2.0 - 1.0
        return x.to(self.device)

    def predict_from_image_bytes(
        self, image_bytes: bytes, **kwargs: Any
    ) -> torch.Tensor:
        x = self.preprocess_image_bytes(image_bytes)
        return self.predict_from_tensor(x, **kwargs)

    def predict_from_pil(self, image: Image.Image, **kwargs: Any) -> torch.Tensor:
        x = self.preprocess_pil(image)
        return self.predict_from_tensor(x, **kwargs)

    @torch.inference_mode()
    def encode_from_image(
        self,
        x: torch.Tensor,
        timestep: int,
        labels: torch.Tensor | None = None,
        cfg: GenerationConfig | None = None,
    ) -> torch.Tensor:
        """
        Encoding process with Euler sampling from x1 (clean sample) to x0 (noise) in num_steps.
        Args:
            x: source minibatch (bs, *dim)
            t: timestep minibatch (bs, *dim)
            labels: class minibatch (bs, *dim)
            kwargs: additional arguments for the network (e.g. conditioning information)
        """
        # Check if model is already loaded
        if not self._loaded:
            self.load_model()

        cfg = cfg or GenerationConfig()
        x = x.to(self.device)

        # TODO: Adapt the correct setup for encoding process
        sample_kwargs = {
            "num_steps": cfg.num_steps,
            "progress": False,
            "context": None,
            "y": labels if cfg.use_labels else None,
            "cfg_scale": cfg.cfg_scale,
            "ccfg_scale": cfg.ccfg_scale,
            "uc_cond_context": None,
            "uc_cond": None,
        }
        try:
            latent = self.fm_module.encode_first_stage(x)  # First stage
            xt = self.fm_module.encode_second_stage(
                latent, timestep, labels, **sample_kwargs
            )  # Second stage
            zt = self.fm_module.encode_third_stage(xt)
        except Exception:
            logging.error("FlowEcodingError", exc_info=True)
        return zt

    @torch.inference_mode()
    def generate_from_latent(
        self,
        latents: torch.Tensor,
        labels: torch.Tensor | None = None,
        cfg: GenerationConfig | None = None,
    ) -> torch.Tensor:
        """
        Args:
            z: source latent minibatch (bs, *dim)
            labels: class minibatch (bs, *dim)
            kwargs: additional arguments for the network (e.g. conditioning information)
        """
        # Check if model is already loaded
        if not self._loaded:
            self.load_model()

        cfg = cfg or GenerationConfig()
        latents = latents.to(self.device)

        context = self.fm_module.encode_third_stage(latents)
        z = torch.randn_like(latents)

        uc_context = torch.zeros_like(context)
        uc_label = None

        if cfg.use_labels:
            batch_size = latents.shape[0]
            uc_label = torch.full(
                (batch_size,),
                cfg.num_classes,
                device=self.device,
                dtype=torch.long,
            )
            if labels is not None:
                labels = labels.to(self.device).view(-1)

        sample_kwargs = {
            "num_steps": cfg.num_steps,
            "progress": False,
            "context": context,
            "y": labels if cfg.use_labels else None,
            "cfg_scale": cfg.cfg_scale,
            "ccfg_scale": cfg.ccfg_scale,
            "uc_cond_context": uc_context,
            "uc_cond": uc_label,
        }

        generated = self.fm_module.model.generate(x=z, **sample_kwargs)
        decoded = self.fm_module.decode_first_stage(generated)
        return decoded.detach()

    @torch.inference_mode()
    def predict_from_tensor(
        self,
        x: torch.Tensor,
        labels: torch.Tensor | None = None,
        cfg: GenerationConfig | None = None,
    ) -> torch.Tensor:
        if not self._loaded:
            self.load_model()
        raise NotImplemented("Not yet implemented!")

    @torch.inference_mode()
    def interpolate(
        self,
        x1: torch.Tensor,
        x2: torch.Tensor,
        alpha_vals: torch.Tensor,
        labels: torch.Tensor | None = None,
        cfg: GenerationConfig | None = None,
        interp_type: str = "linear",
    ) -> torch.Tensor:
        if not self._loaded:
            self.load_model()

        cfg = cfg or GenerationConfig()
        x1 = x1.to(self.device)
        x2 = x2.to(self.device)
        alpha_vals = alpha_vals.to(self.device)

        z1 = self.fm_module.encode_third_stage(x1).squeeze(0).float()
        z2 = self.fm_module.encode_third_stage(x2).squeeze(0).float()

        interp_context = self._interpolate_vectors(
            z1=z1,
            z2=z2,
            alpha_vals=alpha_vals,
            mode=interp_type,
        ).to(self.device)

        b, c, h, w = len(alpha_vals), *x1.shape[1:]
        random_x = torch.randn(b, c, h, w, device=self.device)

        uc_context = torch.zeros_like(interp_context)
        uc_label = None

        if cfg.use_labels:
            uc_label = torch.full(
                (b,),
                cfg.num_classes,
                device=self.device,
                dtype=torch.long,
            )

        sample_kwargs = {
            "num_steps": cfg.num_steps,
            "progress": False,
            "context": interp_context,
            "cfg_scale": cfg.cfg_scale,
            "ccfg_scale": cfg.ccfg_scale,
            "uc_cond_context": uc_context,
            "uc_cond": uc_label,
            "y": labels.to(self.device) if labels is not None else None,
        }

        generated = self.fm_module.model.generate(x=random_x, **sample_kwargs)
        decoded = self.fm_module.decode_first_stage(generated)
        return decoded.detach()

    @staticmethod
    def _interpolate_vectors(
        z1: torch.Tensor,
        z2: torch.Tensor,
        alpha_vals: torch.Tensor,
        mode: str = "linear",
        dot_threshold: float = 0.9995,
    ) -> torch.Tensor:
        if alpha_vals.numel() == 0:
            raise ValueError("alpha_vals must not be empty.")

        if mode == "linear":
            return torch.stack([(1 - a) * z1 + a * z2 for a in alpha_vals])

        if mode == "slerp":
            z1_norm = z1 / z1.norm()
            z2_norm = z2 / z2.norm()
            dot = torch.dot(z1_norm, z2_norm).clamp(-1.0, 1.0)

            if torch.abs(dot) > dot_threshold:
                return torch.stack([torch.lerp(z1, z2, a) for a in alpha_vals])

            omega = torch.acos(dot)
            sin_omega = torch.sin(omega)
            return torch.stack(
                [
                    torch.sin((1.0 - a) * omega) / sin_omega * z1_norm
                    + torch.sin(a * omega) / sin_omega * z2_norm
                    for a in alpha_vals
                ]
            )

        raise ValueError(f"Unknown interpolation mode: {mode}")
