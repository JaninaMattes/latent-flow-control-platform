from dataclasses import dataclass


@dataclass
class GenerationConfig:
    num_steps: int = 50
    cfg_scale: float = 1.0
    ccfg_scale: float = 1.0
    num_classes: int = 1000
    use_labels: bool = False