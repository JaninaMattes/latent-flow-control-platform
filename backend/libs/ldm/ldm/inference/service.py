import torch

class LatentFlowInferenceService:
    def __init__(self, flow_ckpt_path: str, bvae_ckpt_path: str, device: str = "cpu"):
        ...

    def load(self) -> None:
        ...

    def preprocess_image_bytes(self, image_bytes: bytes) -> torch.Tensor:
        ...

    def predict_from_image_bytes(self, image_bytes: bytes, **kwargs):
        ...

    def predict_from_pil(self, image: Image.Image, **kwargs):
        ...

    def predict_from_tensor(self, x: torch.Tensor, **kwargs):
        ...