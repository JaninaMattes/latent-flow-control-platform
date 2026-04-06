import logging
import os
from functools import partial
from typing import Any, Optional, Sequence

import numpy as np
import torch
import torchvision
import webdataset as wds
from jutils import instantiate_from_config


################################################################
#                   WebDataset Utilities                       #
################################################################
def dict_collation_fn(
    samples: list[dict[str, Any]],
    combine_tensors: bool = True,
    combine_scalars: bool = True,
) -> dict[str, Any]:
    """Collate a list of dict samples into a batched dict."""
    if not samples:
        return {}

    keys = set.intersection(*(set(sample.keys()) for sample in samples))
    batched = {key: [] for key in keys}

    for sample in samples:
        for key in batched:
            batched[key].append(sample[key])

    result: dict[str, Any] = {}
    for key, values in batched.items():
        first = values[0]

        if isinstance(first, (int, float)):
            result[key] = np.array(values) if combine_scalars else values
        elif isinstance(first, torch.Tensor):
            result[key] = torch.stack(values) if combine_tensors else values
        elif isinstance(first, np.ndarray):
            result[key] = np.array(values) if combine_tensors else values
        else:
            result[key] = values

    return result


def identity(x: torch.Tensor) -> torch.Tensor:
    return x


def normalize_to_minus1_1(x: torch.Tensor) -> torch.Tensor:
    return x * 2.0 - 1.0


def sample_in_class_labels(
    sample: dict[str, Any], class_labels: frozenset[int]
) -> bool:
    return int(sample.get("cls", -1)) in class_labels


################################################################
#       Filter for Micro-subsets in WebDataset                 #
################################################################
def make_filtered_loader(
    data: Any,
    data_cfg: Any,
    class_labels: Sequence[int],
    train: bool = True,
    num_batches: Optional[int] = None,
    num_workers: Optional[int] = None,
    prefetch_factor: Optional[int] = None,
    persistent_workers: Optional[bool] = None,
) -> wds.WebLoader:
    """Create a filtered WebDataset loader that works locally and with multiprocessing."""
    tars = os.path.join(data.tar_base, data_cfg.shards)
    node_splitter = (
        wds.shardlists.split_by_node
        if data.multinode
        else wds.shardlists.single_node_only
    )

    class_labels_set = frozenset(int(x) for x in class_labels)
    class_filter = partial(sample_in_class_labels, class_labels=class_labels_set)

    dset_pipe = (
        wds.WebDataset(
            tars,
            shardshuffle=not data.multinode,
            nodesplitter=node_splitter,
            handler=wds.warn_and_continue,
        )
        .repeat()
        .decode("rgb", handler=wds.warn_and_continue)
        .select(class_filter)
        .map(data.filter_out_keys, handler=wds.warn_and_continue)
    )

    if num_batches is not None:
        bs = data.batch_size if train else data.val_batch_size
        dset_pipe = dset_pipe.slice(num_batches * bs)
        logging.info("Limited dataset to %s batches.", num_batches)

    image_transforms = [
        torchvision.transforms.ToTensor(),
        torchvision.transforms.Lambda(normalize_to_minus1_1),
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
    default_nw = data.num_workers if train else data.val_num_workers
    nw = default_nw if num_workers is None else num_workers

    if persistent_workers is None:
        persistent_workers = nw > 0

    loader_kwargs: dict[str, Any] = {
        "batch_size": None,
        "shuffle": False,
        "num_workers": nw,
    }

    if nw > 0:
        loader_kwargs["prefetch_factor"] = prefetch_factor
        loader_kwargs["persistent_workers"] = persistent_workers

    return wds.WebLoader(
        dset_pipe.batched(bs, partial=False, collation_fn=dict_collation_fn),
        **loader_kwargs,
    )


if __name__ == "__main__":
    pass
