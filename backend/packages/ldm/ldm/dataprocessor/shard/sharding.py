from __future__ import annotations

import io
import json
from pathlib import Path
from typing import Any, Iterable, Iterator, Optional, Sequence

import webdataset as wds
from datasets import load_dataset
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
    266,
    269,
    270,
    277,
    279,
    282,
    289,
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
    387,
    388,
]


def hf_sample_to_record(sample: dict[str, Any], idx: int) -> dict[str, Any]:
    """
    Normalize HF samples into:
      {
        "key": str,
        "label": int,
        "image_bytes": bytes,
      }
    Supports:
      - standard image datasets: image / label
      - timm/imagenet-1k-wds: jpg / cls / __key__
    """
    if "jpg" in sample and "cls" in sample:
        image = sample["jpg"]
        label = int(sample["cls"])
        key = sample.get("__key__", f"sample_{idx:09d}")
    elif "image" in sample and "label" in sample:
        image = sample["image"]
        label = int(sample["label"])
        key = sample.get("key", f"sample_{idx:09d}")
    else:
        raise KeyError(f"Unsupported sample schema. Keys: {list(sample.keys())}")

    if not isinstance(image, Image.Image):
        image = Image.fromarray(image)

    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="JPEG", quality=95)

    return {
        "key": key,
        "label": label,
        "image_bytes": buf.getvalue(),
    }


def iter_hf_stream_records(
    dataset_iter: Iterable[dict[str, Any]],
) -> Iterator[dict[str, Any]]:
    for idx, sample in enumerate(dataset_iter):
        yield hf_sample_to_record(sample, idx)


def compute_class_quotas(
    class_labels: Sequence[int],
    target_total: int,
) -> dict[int, int]:
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


def quotas_satisfied(
    per_class_counts: dict[int, int],
    quotas: dict[int, int],
) -> bool:
    return all(per_class_counts.get(cls, 0) >= quota for cls, quota in quotas.items())


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
    Write a balanced subset of streamed samples into local WebDataset shards.

    Output record format:
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

    if state.get("done", False):
        return state

    seen_stream_items = int(state["seen_stream_items"])
    kept_samples = int(state["kept_samples"])
    kept_batches = int(state["kept_batches"])
    next_shard_id = int(state["next_shard_id"])
    per_class_counts = {int(k): int(v) for k, v in state["per_class_counts"].items()}

    pattern = str(out_dir / f"{prefix}-%06d.tar")

    with wds.ShardWriter(pattern, maxcount=maxcount, start_shard=next_shard_id) as sink:
        for source_idx, sample in enumerate(source_iter):
            if source_idx < seen_stream_items:
                continue

            seen_stream_items += 1
            label = int(sample["label"])

            if label not in allowed:
                if seen_stream_items % progress_every == 0:
                    save_progress(
                        progress_file,
                        {
                            "seen_stream_items": seen_stream_items,
                            "kept_samples": kept_samples,
                            "kept_batches": kept_batches,
                            "next_shard_id": sink.shard,
                            "per_class_counts": per_class_counts,
                            "done": False,
                        },
                    )
                continue

            current_count = per_class_counts.get(label, 0)
            if current_count >= quotas[label]:
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
                state = {
                    "seen_stream_items": seen_stream_items,
                    "kept_samples": kept_samples,
                    "kept_batches": kept_batches,
                    "next_shard_id": sink.shard,
                    "per_class_counts": per_class_counts,
                    "done": False,
                }
                save_progress(progress_file, state)
                print(
                    f"[{prefix}] kept={kept_samples}/{target_total} "
                    f"seen={seen_stream_items} "
                    f"batches={kept_batches}"
                )

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


def build_split(
    hf_dataset_name: str,
    hf_split: str,
    out_dir: Path,
    prefix: str,
    class_labels: Sequence[int],
    target_total: int,
    maxcount: int,
    tracking_batch_size: int,
    progress_every: int,
    resume: bool = True,
) -> dict[str, Any]:
    ds = load_dataset(hf_dataset_name, split=hf_split, streaming=True)
    source_iter = iter_hf_stream_records(ds)

    return write_stratified_stream_to_shards(
        source_iter=source_iter,
        out_dir=out_dir,
        prefix=prefix,
        class_labels=class_labels,
        target_total=target_total,
        maxcount=maxcount,
        tracking_batch_size=tracking_batch_size,
        progress_every=progress_every,
        resume=resume,
    )


if __name__ == "__main__":
    this_file = Path(__file__).resolve()
    project_root = this_file.parents[3]
    dataset_root = project_root / "dataset" / "imagenet_shards"

    hf_dataset = "timm/imagenet-1k-wds"

    train_state = build_split(
        hf_dataset_name=hf_dataset,
        hf_split="train",
        out_dir=dataset_root,
        prefix="ImageNetTrain-train",
        class_labels=CLASS_LABELS,
        target_total=28000,
        maxcount=5000,
        tracking_batch_size=256,
        progress_every=500,
        resume=True,
    )
    print("train_state:", json.dumps(train_state, indent=2))

    val_state = build_split(
        hf_dataset_name=hf_dataset,
        hf_split="validation",
        out_dir=dataset_root,
        prefix="ImageNetValidation-validation",
        class_labels=CLASS_LABELS,
        target_total=2800,
        maxcount=2000,
        tracking_batch_size=256,
        progress_every=200,
        resume=True,
    )
    print("val_state:", json.dumps(val_state, indent=2))
