import logging
import os
import sys

import numpy as np
import torch
import torchvision
import webdataset as wds
from typing import Any, List, Optional

from jutils import instantiate_from_config


project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
sys.path.append(project_root)


################################################################
#                   Webdatset Utilities                        #
################################################################
def dict_collation_fn(samples, combine_tensors=True, combine_scalars=True):
    """Take a list  of samples (as dictionary) and create a batch, preserving the keys.
    If `tensors` is True, `ndarray` objects are combined into
    tensor batches.
    :param dict samples: list of samples
    :param bool tensors: whether to turn lists of ndarrays into a single ndarray
    :returns: single sample consisting of a batch
    :rtype: dict
    """
    keys = set.intersection(*[set(sample.keys()) for sample in samples])
    batched = {key: [] for key in keys}

    for s in samples:
        [batched[key].append(s[key]) for key in batched]

    result = {}
    for key in batched:
        if isinstance(batched[key][0], (int, float)):
            if combine_scalars:
                result[key] = np.array(list(batched[key]))
        elif isinstance(batched[key][0], torch.Tensor):
            if combine_tensors:
                result[key] = torch.stack(list(batched[key]))
        elif isinstance(batched[key][0], np.ndarray):
            if combine_tensors:
                result[key] = np.array(list(batched[key]))
        else:
            result[key] = list(batched[key])
    return result


def identity(x):
    return x


#####################################################
#       Filter for Micro-subsets in WebDataset      #
#####################################################


def make_filtered_loader(
    data: Any,
    data_cfg: Any,
    class_labels: List[int],
    train: bool = True,
    num_batches: Optional[int] = None,
) -> wds.WebLoader:
    """Create a filtered WebDataset loader."""
    tars = os.path.join(data.tar_base, data_cfg.shards)
    node_splitter = (
        wds.shardlists.split_by_node
        if data.multinode
        else wds.shardlists.single_node_only
    )

    dset_pipe = (
        wds.WebDataset(
            tars,
            shardshuffle=not data.multinode,
            nodesplitter=node_splitter,
            handler=wds.warn_and_continue,
        )
        .repeat()
        .decode("rgb", handler=wds.warn_and_continue)
        .select(lambda sample: int(sample.get("cls", -1)) in class_labels)
        .map(data.filter_out_keys, handler=wds.warn_and_continue)
    )

    if num_batches is not None:
        bs = data.batch_size if train else data.val_batch_size
        dset_pipe = dset_pipe.slice(num_batches * bs)
        logging.info(f"Limited dataset to {num_batches} batches.")

    image_transforms = [
        torchvision.transforms.ToTensor(),
        torchvision.transforms.Lambda(lambda x: x * 2.0 - 1.0),  # Normalize to [-1,1]
    ]

    if "image_transforms" in data_cfg:
        custom_transforms = [
            instantiate_from_config(tt) for tt in data_cfg.image_transforms
        ]
        image_transforms.extend(custom_transforms)

    transform_dict = {
        data_cfg.image_key: torchvision.transforms.Compose(image_transforms)
    }
    dset_pipe = dset_pipe.map_dict(**transform_dict, handler=wds.warn_and_continue)

    if "rename" in data_cfg:
        dset_pipe = dset_pipe.rename(**data_cfg.rename)

    bs = data.batch_size if train else data.val_batch_size
    nw = data.num_workers if train else data.val_num_workers

    return wds.WebLoader(
        dset_pipe.batched(bs, partial=False, collation_fn=dict_collation_fn),
        batch_size=None,
        shuffle=False,
        num_workers=nw,
        prefetch_factor=2,  # Overlap data loading with model training
    )


if __name__ == "__main__":
    # Test the function
    pass
