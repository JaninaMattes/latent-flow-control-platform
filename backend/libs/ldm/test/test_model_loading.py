import pytest
from pathlib import Path
from jutils import freeze

from ldm.trainer import TrainerModuleLatentFlow


@pytest.mark.slow
def test_model_loads_successfully():
    """
    Integration test: load real checkpoint and verify model setup.
    """
    checkpoint = Path(__file__).resolve().parents[1] / "models" / "your_checkpoint.ckpt"

    fm_module = TrainerModuleLatentFlow.load_from_checkpoint(
        checkpoint=str(checkpoint),
        map_location="cpu"
    )

    fm_module.eval()
    freeze(fm_module.model)
    fm_module.to("cpu")

    # Assertions
    assert fm_module is not None
    assert not fm_module.training

    params = list(fm_module.model.parameters())
    assert all(not p.requires_grad for p in params)

    device = next(fm_module.parameters()).device
    assert device.type == "cpu"