import pytest
from pathlib import Path
from jutils import freeze

from ldm.models.wrapper.beta_vae import BVaeLDMWrapper
from ldm.trainer import TrainerModuleLatentFlow

@pytest.mark.slow
def test_beta_vae_model_loads_successfully():
    """
    Integration test: load real checkpoint and verify model setup.
    """
    # arrange section
    checkpoint = (
        Path(__file__).resolve().parents[3]
        / "models"
        / "checkpoints"
        / "BetaVAE_0.50x-1.00x-0.1b_last.ckpt"
    )
    assert checkpoint.exists(), f"Checkpoint not found: {checkpoint}"

    vae_module = BVaeLDMWrapper(str(checkpoint), device="cpu")
    vae_module.eval()
    freeze(vae_module.model)
    vae_module.to("cpu")

    assert vae_module is not None
    assert not vae_module.training

    params = list(vae_module.model.parameters())
    assert all(not p.requires_grad for p in params)

    device = next(vae_module.parameters()).device
    assert device.type == "cpu"

    

@pytest.mark.slow
def test_flow_matching_model_loads_successfully():
    """
    Integration test: load real checkpoint and verify model setup.
    """
    checkpoint = (
        Path(__file__).resolve().parents[3]
        / "models"
        / "checkpoints"
        / "DITSXL_BETA05x10x_01b.ckpt"
    )

    assert checkpoint.exists(), f"Checkpoint not found: {checkpoint}"

    fm_module = TrainerModuleLatentFlow.load_from_checkpoint(
        checkpoint_path=str(checkpoint),
        map_location="cpu",
        weights_only=False
    )

    fm_module.eval()
    freeze(fm_module.model)
    fm_module.to("cpu")

    assert fm_module is not None
    assert not fm_module.training

    params = list(fm_module.model.parameters())
    assert all(not p.requires_grad for p in params)

    device = next(fm_module.parameters()).device
    assert device.type == "cpu"