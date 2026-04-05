# ldm/model_loader.py

from packages.ldm.ldm.trainer import TrainerModuleLatentFlow
from jutils import freeze


def load_model(checkpoint: str, device: str = "cpu"):
    """
    Loads the LatentFlow model from checkpoint for inference.
    """
    module = TrainerModuleLatentFlow.load_from_checkpoint(
        checkpoint, map_location=device
    )
    module.eval()
    freeze(module.model)
    module.to(device)
    return module
