"""Recompute E01 headline proof timings from the archived browser exports."""

import json
from decimal import Decimal
from pathlib import Path
from statistics import median

RAW = Path(__file__).resolve().parents[1] / "raw"


def read(name):
    return json.loads((RAW / name).read_text(encoding="utf-8"), parse_float=Decimal)


def prove_times(rows):
    return [
        Decimal(row["proveTimeMs"])
        for row in rows
        if not row["warmup"]
        and row["proofVerified"] is True
        and row["backendDestroyed"] is True
        and row["error"] is None
        and row["cleanupError"] is None
    ]


def compare(title, control, treatment, expected_counts=(10, 10)):
    left, right = prove_times(control), prove_times(treatment)
    if (len(left), len(right)) != expected_counts:
        raise ValueError(f"{title}: unexpected sample counts {(len(left), len(right))}")
    a, b = median(left), median(right)
    print(f"{title}: {a:.2f} / {b:.2f} ms; ratio {a/b:.2f}; n={len(left)}/{len(right)}")


for depth in (7, 10, 11):
    rows = read(f"desktop-depth{depth}-B2-B3-ABBA.json")
    compare(
        f"Desktop depth {depth} B3/B2",
        [r for r in rows if r["group"] == "B3" and r["requestedThreads"] == 1],
        [r for r in rows if r["group"] == "B2" and r["requestedThreads"] == 14],
    )

compare(
    "Desktop depth 7 B1/B2",
    read("desktop-depth7-B1-ABBA.json"),
    read("desktop-depth7-B2-ABBA.json"),
)
compare(
    "Android depth 7 M1/M2 (all, order deviation)",
    read("android-depth7-M1-order-check.json"),
    read("android-depth7-M2-order-check.json"),
    (15, 10),
)
android = read("android-depth7-M2-M3-ABBA.json")
compare(
    "Android depth 7 M3/M2",
    [r for r in android if r["requestedThreads"] == 1],
    [r for r in android if r["requestedThreads"] == 8],
)
large = read("android-depth11-M2-check.json")
samples = prove_times(large)
if len(samples) != 3:
    raise ValueError("Android depth 11: expected three successful measurements")
print(f"Android depth 11 M2: median {median(samples):.2f} ms; n={len(samples)}")
