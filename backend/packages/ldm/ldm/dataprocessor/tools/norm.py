import csv
import gc
import logging
import math
import os

import numpy as np
import torch





################################################################
#                        Normalization                        #
################################################################

def z_score_normalize(tensor: torch.Tensor, dim: int = 0, eps: float = 1e-8) -> torch.Tensor:
    """
    Perform z-score normalization on a tensor.

    Args:
        tensor (torch.Tensor): The input tensor to normalize.
        dim (int): The dimension along which to compute the mean and std. Default is 0.
    """
    if isinstance(tensor, np.ndarray):
        tensor = torch.from_numpy(tensor)

    mean = tensor.mean(dim=dim, keepdim=True)
    std = tensor.std(dim=dim, keepdim=True) + eps # avoid division by zero

    return (tensor - mean) / std


def normalize_minus_one_one_np(x: np.ndarray) -> np.ndarray:
    """Normalize a NumPy array to the range [-1, 1]."""
    x_min = np.min(x)
    x_max = np.max(x)
    x_norm = 2 * (x - x_min) / (x_max - x_min) - 1
    return x_norm.astype(np.float32)

def normalize_zero_one_np(x: np.ndarray) -> np.ndarray:
    """Normalize a NumPy array to the range [0, 1]."""
    x_min = np.min(x)
    x_max = np.max(x)
    x_norm = (x - x_min) / (x_max - x_min)
    return x_norm.astype(np.float32)


def normalize_zero_one_torch(x: torch.Tensor) -> torch.Tensor:
    """Normalize a PyTorch tensor to the range [0, 1]."""
    x_min = x.min()
    x_max = x.max()
    x_norm = (x - x_min) / (x_max - x_min)
    return x_norm.float()


def normalize_minus_one_one_torch(x: torch.Tensor) -> torch.Tensor:
    """Normalize a PyTorch tensor to the range [-1, 1]."""
    x_min = x.min()
    x_max = x.max()
    x_norm = 2 * (x - x_min) / (x_max - x_min) - 1
    return x_norm.float()


def normalize_minus_one_one(x: torch.Tensor) -> torch.Tensor:
    """Normalize a tensor to the range [-1, 1]."""
    x -= x.min(1, keepdim=True)[0]
    x /= x.max(1, keepdim=True)[0]
    x = x * 2 - 1
    return x.to(torch.float32)


def normalize_zero_one(x: torch.Tensor) -> torch.Tensor:
    """Normalize a tensor to the range [0, 1]."""
    x -= x.min(1, keepdim=True)[0]
    x /= x.max(1, keepdim=True)[0]
    return x


def normalize_minus_one_one(tensor:torch.Tensor, min_val:float=None, max_val:float=None, eps:float = 1e-8) -> torch.Tensor:
    """Normalize a tensor to the range [-1, 1]."""
    if min_val is None:
        min_val = tensor.min()
    if max_val is None:
        max_val = tensor.max()
    
    if max_val - min_val > 0:
        tensor = 2 * (tensor - min_val) / (max_val - min_val + eps) - 1
        tensor = torch.clamp(tensor, -1, 1).to(torch.float32)
    else:
        tensor = torch.zeros_like(tensor) # If constant, return zeros
    
    return tensor


def normalize_zero_one(tensor:torch.Tensor, min_val:float=None, max_val:float=None, eps:float = 1e-8) -> torch.Tensor:
    """Normalize a tensor to the range [0, 1]."""
    if min_val is None:
        min_val = tensor.min()
    if max_val is None:
        max_val = tensor.max()
    
    if max_val - min_val > 0:
        tensor = (tensor - min_val) / (max_val - min_val + eps)
        tensor = torch.clamp(tensor, 0, 1).to(torch.float32)
    else:
        tensor = torch.zeros_like(tensor) # If constant, return zeros
    
    return tensor


def normalize_minus_one_one_np(array: np.ndarray, min_val:float=None, max_val:float=None, eps: float = 1e-8) -> np.ndarray:
    """Normalize a NumPy array to the range [-1, 1]."""
    if min_val is None:
        min_val = np.min(array)
    if max_val is None:
        max_val = np.max(array)
    
    if max_val - min_val > 0:
        array = 2 * (array - min_val) / (max_val - min_val + eps) - 1
        array = np.clip(array, -1, 1).astype(np.float32)
    else:
        array = np.zeros_like(array, dtype=np.float32)  # If constant, return zeros
    
    return array


def normalize_zero_one_np(array: np.ndarray, min_val:float=None, max_val:float=None, eps: float = 1e-8) -> np.ndarray:
    """Normalize a NumPy array to the range [0, 1]."""
    if min_val is None:
        min_val = np.min(array)
    if max_val is None:
        max_val = np.max(array)
    
    if max_val - min_val > 0:
        array = (array - min_val) / (max_val - min_val + eps)
        array = np.clip(array, 0, 1).astype(np.float32)
    else:
        array = np.zeros_like(array, dtype=np.float32)  # If constant, return zeros
    
    return array


def denorm_tensor(tensor, target_min=0, target_max=255, keep_channels=3) -> torch.Tensor:
    """Denormalize a tensor with multiple channels for visualization."""
    tensor = tensor.to(torch.float32)
    
    # Keep only the first 3 channels
    if tensor.size(1) > keep_channels:
        tensor = tensor[:, :keep_channels]  
          
    # Normalize and scale to target range on GPU
    orig_min = tensor.amin(dim=(2, 3), keepdim=True)
    orig_max = tensor.amax(dim=(2, 3), keepdim=True)
    range_scale = target_max - target_min
    
    # Handle edge case where orig_min == orig_max
    scale = torch.where(orig_max > orig_min, range_scale / (orig_max - orig_min), torch.tensor(1.0, device=tensor.device))
    offset = target_min - orig_min * scale

    denormalized = tensor * scale + offset
    denormalized = torch.clamp(denormalized, target_min, target_max)
    denormalized = denormalized.round().to(torch.uint8)

    return denormalized


def normalize_tensor(tensor, target_min=0, target_max=1, dtype='float') -> torch.Tensor:
    """Normalize a tensor tensor with multiple channels for visualization."""
    if isinstance(tensor, torch.Tensor):
        tensor = tensor.detach().cpu()
    
    # Output tensor
    normalized = torch.zeros_like(tensor, dtype=torch.float32)
    
    # Iterate over the batch
    for i in range(tensor.size(0)):
        img = tensor[i]
        orig_min = img.min().item()
        orig_max = img.max().item()
        
        # Skip if image is constant
        if orig_max == orig_min:
            normalized[i] = torch.zeros_like(img)
            continue
            
        # Normalize to [0,1] and scale to range
        img_normalized = (img - orig_min) / (orig_max - orig_min)
        img_normalized = img_normalized * (target_max - target_min) + target_min
        normalized[i] = img_normalized
    
    if dtype == 'float':
        normalized = normalized.to(torch.float32)
    elif dtype == 'int':
        if target_max <= 1:
            normalized = normalized * 255
        normalized = torch.clamp(torch.round(normalized), 0, 255)
        normalized = normalized.to(torch.uint8)
    
    return normalized






if __name__ == "__main__":
    # Example usage
    ipt1 = torch.randn(4, 4) * 10  # Random tensor
    ipt2 = torch.full((4, 4), 5)   # Constant tensor

    # Normalize to [-1, 1]
    normalized_minus_one_one = normalize_minus_one_one(ipt1)
    print("Normalized to [-1, 1]:\n", normalized_minus_one_one)

    # Normalize to [0, 1]
    normalized_zero_one = normalize_zero_one(ipt1)
    print("Normalized to [0, 1]:\n", normalized_zero_one)

    # Handle constant tensor normalization
    normalized_constant = normalize_zero_one(ipt2)
    print("Normalized constant tensor to [0, 1]:\n", normalized_constant)