# tests/test_model_loading.py


import pytest
from pathlib import Path
from services.model_loader import load_model


@pytest.mark.slow
def test_model_loader():

    # arrange section
    checkpoint = Path(__file__).resolve().parents[1] / "models/your_checkpoint.ckpt"
    model = load_model(str(checkpoint), "cpu")

    # assertion section
    assert model is not None
    assert not model.training
    # assertion all parameters 
    assert all(not p.requires_grad for p in model.model.parameters())