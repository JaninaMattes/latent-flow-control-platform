import os
from pathlib import Path

import torch
from jutils import freeze

from ldm.frameworks.beta_vae.bvae_model_t2i import BetaVAEModel

""" Wrapper to automatically load an LDM-based Beta-VAE model. """


class BVaeLDMWrapper(BetaVAEModel):
    def __init__(self, ckpt_path: str, device="cpu") -> None:
        if not os.path.exists(ckpt_path):
            raise FileNotFoundError(f"[BVaeWrapper] Checkpoint not found: {ckpt_path}")
        checkpoint = torch.load(
            ckpt_path,
            map_location=device,
            weights_only=False,
        )

        # Extract model config
        bvae_cfg = checkpoint["hyper_parameters"]["vae_cfg"]
        encoder_cfg = bvae_cfg["params"]["encoder_cfg"]
        decoder_cfg = bvae_cfg["params"]["decoder_cfg"]
        beta = bvae_cfg["params"]["beta"]
        kld_weight = bvae_cfg["params"]["kld_weight"]
        loss_type = bvae_cfg["params"]["loss_type"]

        super().__init__(
            encoder_cfg=encoder_cfg,
            decoder_cfg=decoder_cfg,
            beta=beta,
            kld_weight=kld_weight,
            loss_type=loss_type,
        )
        freeze(self)

        self.load_checkpoint(checkpoint)
        print(f"[BVaeWrapper] Loaded checkpoint from {ckpt_path}.")

    def load_checkpoint(self, checkpoint: dict) -> None:
        state_dict = checkpoint["state_dict"]
        model_keys = set(self.state_dict().keys())

        # Filter keys for only relevant model parameters
        new_state_dict = {
            k.replace("model.", ""): v
            for k, v in state_dict.items()
            if k.replace("model.", "") in model_keys
        }
        self.load_state_dict(new_state_dict, strict=False)
        self.eval()


if __name__ == "__main__":
    parent_path = Path(__file__).resolve().parents[3]
    ckpt_path = parent_path / "checkpoints" / "BetaVAE_0.50x-1.00x-0.1b_last.ckpt"

    print("Using checkpoint:", ckpt_path)
    print("Exists:", ckpt_path.exists())

    model = BVaeLDMWrapper(str(ckpt_path), device="cpu")
    print(model)
