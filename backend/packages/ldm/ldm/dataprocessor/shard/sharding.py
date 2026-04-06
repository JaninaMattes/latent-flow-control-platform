from __future__ import annotations

import io
import json
from pathlib import Path
from typing import Any, Iterable, Iterator, Optional, Sequence

import webdataset as wds
from PIL import Image

CLASS_LABELS = [
    0,
    1,
    88,
    89,
    93,
    96,
    130,
    154,
    158,
    236,
    248,
    250,
    259,
    263,
    264,
    270,
    290,
    291,
    292,
    294,
    295,
    296,
    330,
    332,
    339,
    340,
    388,
    387,
]

VALID_SUFFIXES = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}


def build_class_map(split_dir: Path) -> dict[str, int]:
    """
    Map synset folder names to integer class ids based on sorted folder order.

    Warning:
    This only preserves the expected ImageNet label ids if your folder ordering
    matches the exact label convention used elsewhere in your project.
    """
    classes = sorted(p.name for p in split_dir.iterdir() if p.is_dir())
    return {cls_name: idx for idx, cls_name in enumerate(classes)}


def iter_local_imagenet_samples(split_dir: Path) -> Iterator[dict[str, Any]]:
    """
    Local folder adapter. Yields:
      {
        "key": str,
        "label": int,
        "image_bytes": bytes,
      }
    """
    class_map = build_class_map(split_dir)

    for class_dir in sorted(split_dir.iterdir()):
        if not class_dir.is_dir():
            continue

        synset = class_dir.name
        class_id = class_map[synset]

        for img_path in sorted(class_dir.iterdir()):
            if not img_path.is_file() or img_path.suffix not in VALID_SUFFIXES:
                continue

            with open(img_path, "rb") as f:
                image_bytes = f.read()

            yield {
                "key": f"{synset}_{img_path.stem}",
                "label": class_id,
                "image_bytes": image_bytes,
            }


def iter_hf_stream_samples(
    dataset_iter: Iterable[dict[str, Any]],
) -> Iterator[dict[str, Any]]:
    """
    Example adapter for a streaming dataset, e.g. Hugging Face.
    Expected incoming sample fields:
      {
        "image": PIL.Image.Image or ndarray-like,
        "label": int,
        ...
      }
    """
    for idx, sample in enumerate(dataset_iter):
        image = sample["image"]
        if not isinstance(image, Image.Image):
            image = Image.fromarray(image)

        buf = io.BytesIO()
        image.convert("RGB").save(buf, format="JPEG", quality=95)

        yield {
            "key": sample.get("key", f"sample_{idx:09d}"),
            "label": int(sample["label"]),
            "image_bytes": buf.getvalue(),
        }


def compute_class_quotas(
    class_labels: Sequence[int], target_total: int
) -> dict[int, int]:
    """
    Create near-balanced quotas across classes.
    Example:
      26 classes, N=100
      => 22 classes get 4, 4 classes get 3
    """
    if target_total <= 0:
        raise ValueError("target_total must be > 0")
    if not class_labels:
        raise ValueError("class_labels must not be empty")

    labels = list(class_labels)
    base = target_total // len(labels)
    remainder = target_total % len(labels)

    quotas: dict[int, int] = {}
    for i, cls in enumerate(labels):
        quotas[cls] = base + (1 if i < remainder else 0)

    return quotas


def load_progress(progress_file: Path) -> dict[str, Any]:
    if progress_file.exists():
        return json.loads(progress_file.read_text())

    return {
        "seen_stream_items": 0,
        "kept_samples": 0,
        "kept_batches": 0,
        "next_shard_id": 0,
        "per_class_counts": {},
        "done": False,
    }


def save_progress(progress_file: Path, state: dict[str, Any]) -> None:
    progress_file.write_text(json.dumps(state, indent=2, sort_keys=True))


def quotas_satisfied(per_class_counts: dict[int, int], quotas: dict[int, int]) -> bool:
    return all(per_class_counts.get(cls, 0) >= quota for cls, quota in quotas.items())


def write_stratified_stream_to_shards(
    source_iter: Iterable[dict[str, Any]],
    out_dir: Path,
    prefix: str,
    class_labels: Sequence[int],
    target_total: int,
    maxcount: int = 5000,
    tracking_batch_size: int = 256,
    progress_every: int = 1000,
    progress_file: Optional[Path] = None,
    resume: bool = True,
) -> dict[str, Any]:
    """
    Stream samples and write WebDataset shards until target_total kept samples
    have been collected in a near-balanced stratified way.

    Each source sample must look like:
      {
        "key": str,
        "label": int,
        "image_bytes": bytes,
      }

    Output samples are written as:
      {
        "__key__": ...,
        "jpeg": ...,
        "cls": ...,
      }
    """
    out_dir.mkdir(parents=True, exist_ok=True)

    if progress_file is None:
        progress_file = out_dir / f"{prefix}-progress.json"

    quotas = compute_class_quotas(class_labels, target_total)
    allowed = set(class_labels)

    if resume:
        state = load_progress(progress_file)
    else:
        state = {
            "seen_stream_items": 0,
            "kept_samples": 0,
            "kept_batches": 0,
            "next_shard_id": 0,
            "per_class_counts": {},
            "done": False,
        }

    seen_stream_items = int(state["seen_stream_items"])
    kept_samples = int(state["kept_samples"])
    kept_batches = int(state["kept_batches"])
    next_shard_id = int(state["next_shard_id"])

    per_class_counts = {int(k): int(v) for k, v in state["per_class_counts"].items()}

    if state.get("done", False):
        return state

    pattern = str(out_dir / f"{prefix}-%06d.tar")

    # Note: start_shard is supported by ShardWriter in common webdataset versions.
    with wds.ShardWriter(pattern, maxcount=maxcount, start_shard=next_shard_id) as sink:
        for source_idx, sample in enumerate(source_iter):
            # Resume by skipping already-seen source items.
            if source_idx < seen_stream_items:
                continue

            seen_stream_items += 1

            label = int(sample["label"])
            if label not in allowed:
                if seen_stream_items % progress_every == 0:
                    state = {
                        "seen_stream_items": seen_stream_items,
                        "kept_samples": kept_samples,
                        "kept_batches": kept_batches,
                        "next_shard_id": sink.shard,
                        "per_class_counts": per_class_counts,
                        "done": False,
                    }
                    save_progress(progress_file, state)
                continue

            current_count = per_class_counts.get(label, 0)
            if current_count >= quotas[label]:
                if seen_stream_items % progress_every == 0:
                    state = {
                        "seen_stream_items": seen_stream_items,
                        "kept_samples": kept_samples,
                        "kept_batches": kept_batches,
                        "next_shard_id": sink.shard,
                        "per_class_counts": per_class_counts,
                        "done": False,
                    }
                    save_progress(progress_file, state)
                if quotas_satisfied(per_class_counts, quotas):
                    break
                continue

            sink.write(
                {
                    "__key__": sample["key"],
                    "jpeg": sample["image_bytes"],
                    "cls": label,
                }
            )

            per_class_counts[label] = current_count + 1
            kept_samples += 1
            kept_batches = kept_samples // tracking_batch_size

            if kept_samples % progress_every == 0:
                print(
                    f"[{prefix}] kept={kept_samples}/{target_total} "
                    f"seen={seen_stream_items} "
                    f"batches={kept_batches}"
                )
                state = {
                    "seen_stream_items": seen_stream_items,
                    "kept_samples": kept_samples,
                    "kept_batches": kept_batches,
                    "next_shard_id": sink.shard,
                    "per_class_counts": per_class_counts,
                    "done": False,
                }
                save_progress(progress_file, state)

            if kept_samples >= target_total or quotas_satisfied(
                per_class_counts, quotas
            ):
                break

        state = {
            "seen_stream_items": seen_stream_items,
            "kept_samples": kept_samples,
            "kept_batches": kept_batches,
            "next_shard_id": sink.shard,
            "per_class_counts": per_class_counts,
            "done": kept_samples >= target_total
            or quotas_satisfied(per_class_counts, quotas),
        }
        save_progress(progress_file, state)

    metadata = {
        "prefix": prefix,
        "target_total": target_total,
        "tracking_batch_size": tracking_batch_size,
        "maxcount": maxcount,
        "class_labels": list(class_labels),
        "class_quotas": quotas,
        "final_state": state,
    }
    (out_dir / f"{prefix}-metadata.json").write_text(
        json.dumps(metadata, indent=2, sort_keys=True)
    )

    return state


if __name__ == "__main__":
    # Example 1: local folder-based ImageNet
    imagenet_root = Path("/path/to/imagenet")
    out_root = Path("/path/to/wds_shards_subset")

    train_state = write_stratified_stream_to_shards(
        source_iter=iter_local_imagenet_samples(imagenet_root / "train"),
        out_dir=out_root,
        prefix="ImageNetTrain-train",
        class_labels=CLASS_LABELS,
        target_total=26000,  # ~1000 per class for 26 classes
        maxcount=5000,  # samples per tar shard
        tracking_batch_size=256,  # tracked logical batch size
        progress_every=500,
        resume=True,
    )

    print("train_state:", json.dumps(train_state, indent=2))

    # Example 2: validation if you have local folders
    val_state = write_stratified_stream_to_shards(
        source_iter=iter_local_imagenet_samples(imagenet_root / "val"),
        out_dir=out_root,
        prefix="ImageNetValidation-validation",
        class_labels=CLASS_LABELS,
        target_total=2600,  # ~100 per class
        maxcount=2000,
        tracking_batch_size=256,
        progress_every=200,
        resume=True,
    )

    print("val_state:", json.dumps(val_state, indent=2))
