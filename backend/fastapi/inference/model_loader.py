# ldm/model_loader.py

from jutils import freeze
from ldm.trainer import TrainerModuleLatentFlow



def load_model(checkpoint: str, device: str = "cpu") -> TrainerModuleLatentFlow:
    """
    Loads the LatentFlow model from checkpoint for inference.
    """
    module = TrainerModuleLatentFlow.load_from_checkpoint(
        checkpoint,
        map_location="cpu"
    )
    module.eval()
    freeze(module.model)
    module.to(device)
    return module
