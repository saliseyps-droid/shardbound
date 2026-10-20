"""Glow layers for the animated boards: keeps only what glows on a play-mat, everything else black.

The match lays each over its mat with `mix-blend-mode: screen` and breathes its opacity
(src/ui/match/AnimatedBoard.tsx), so black adds nothing and the glowing parts seem to pulse.

    python tools/board_glow.py            # every board in BOARDS
    python tools/board_glow.py board-9    # just these
"""

import os
import sys

import numpy as np
from PIL import Image, ImageFilter

SRC = "src/assets/boards"
DST = "src/assets/boards/fx"
WIDTH = 1600  # the glow is soft: half the mat's resolution is plenty

# What glows on each mat: 'red' (hot red rims), 'bright' (bright, colourful light), 'gold' (gold trim),
# 'ice' (white-cyan frost), with a threshold (lo) where the glow starts. Mats without a glow (the forest,
# the butterflies, the second inn table) only get particles.
BOARDS = {
    "board-3": ("gold", 0.28),
    "board-5": ("bright", 0.7),
    "board-9": ("red", 0.0),
    "board-10": ("ice", 0.62),
    "inferno-board-1": ("red", 0.0),
    "inferno-board-2": ("red", 0.0),
    "heaven-board-1": ("bright", 0.6),
}


def weight_of(a: np.ndarray, mode: str, lo: float) -> np.ndarray:
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = np.maximum(np.maximum(r, g), b) / 255.0
    mn = np.minimum(np.minimum(r, g), b) / 255.0
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    if mode == "red":
        # Strong red well above green and blue.
        return np.clip((r - np.maximum(g, b) * 1.6) / 90.0, 0, 1) * np.clip((r - 110.0) / 80.0, 0, 1)
    if mode == "bright":
        return np.clip((mx - lo) / (1 - lo), 0, 1) ** 1.5 * np.clip(sat * 2 + 0.3, 0, 1)
    if mode == "gold":
        # Hue of gold/orange (~20-55 degrees) without a per-pixel colorsys call.
        h = np.degrees(np.arctan2(np.sqrt(3) * (g - b), 2 * r - g - b)) % 360
        warm = np.clip(1 - np.abs(h - 34) / 26, 0, 1)
        return warm * np.clip((mx - lo) / (1 - lo), 0, 1) * np.clip((sat - 0.3) / 0.3, 0, 1)
    if mode == "ice":
        cool = np.clip((b - r) / 60.0 + 0.5, 0, 1)
        return cool * np.clip((mx - lo) / (1 - lo), 0, 1) ** 1.2
    raise ValueError(mode)


def build(name: str) -> None:
    mode, lo = BOARDS[name]
    im = Image.open(os.path.join(SRC, f"{name}.webp")).convert("RGB")
    small = im.resize((WIDTH, round(WIDTH * im.height / im.width)), Image.LANCZOS)
    a = np.asarray(small).astype(np.float32)
    glow = a * weight_of(a, mode, lo)[..., None]
    out = Image.fromarray(glow.clip(0, 255).astype(np.uint8))
    # A little bloom so the pulse spills past the painted edges.
    bloom = out.filter(ImageFilter.GaussianBlur(10))
    merged = np.clip(np.asarray(out).astype(np.float32) + np.asarray(bloom).astype(np.float32) * 0.8, 0, 255)
    os.makedirs(DST, exist_ok=True)
    Image.fromarray(merged.astype(np.uint8)).save(os.path.join(DST, f"{name}-glow.webp"), "WEBP", quality=80)


# Mats with painted smoke outside their frame: only that smoke, for the churning smoke layer (<mat>-smoke.webp).
SMOKE = {"inferno-board-2"}


def smoke_area(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """Where smoke may be: anywhere but the red table inside the frame and the red rims of the frame's long edges."""
    table = (x > 0.135) & (x < 0.865) & (y > 0.16) & (y < 0.84)
    rims = (x > 0.17) & (x < 0.83) & (((y > 0.06) & (y < 0.13)) | ((y > 0.87) & (y < 0.94)))
    return (~(table | rims)).astype(np.float32)


def smoke_points(name: str, n: int = 64) -> list:
    """Where the painted smoke is densest, in % of the mat: the places its wisps rise from."""
    a = np.asarray(Image.open(os.path.join(SRC, f"{name}.webp")).convert("RGB").resize((400, 228))).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h, w = r.shape
    yy, xx = np.mgrid[0:h, 0:w]
    m = (r > 70) & (r > 2.6 * np.maximum(g, b)) & (smoke_area(xx / w, yy / h) > 0)
    rng = np.random.default_rng(7)
    ys, xs = np.nonzero(m)
    pick = rng.choice(len(xs), size=min(n, len(xs)), replace=False)
    return sorted((round(float(xs[i]) / w * 100, 1), round(float(ys[i]) / h * 100, 1)) for i in pick)


def build_smoke(name: str) -> None:
    im = Image.open(os.path.join(SRC, f"{name}.webp")).convert("RGB")
    small = im.resize((WIDTH, round(WIDTH * im.height / im.width)), Image.LANCZOS)
    a = np.asarray(small).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h, w = r.shape
    yy, xx = np.mgrid[0:h, 0:w]
    weight = np.clip((r - np.maximum(g, b) * 2.6) / 70.0, 0, 1) * smoke_area(xx / w, yy / h)
    out = Image.fromarray((a * weight[..., None]).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))
    out.save(os.path.join(DST, f"{name}-smoke.webp"), "WEBP", quality=80)


# Mats with a painted sea around them: only that sea (<mat>-sea.webp), for the same slow churn as the smoke.
SEA = {"board-12"}


def build_sea(name: str) -> None:
    im = Image.open(os.path.join(SRC, f"{name}.webp")).convert("RGB")
    small = im.resize((WIDTH, round(WIDTH * im.height / im.width)), Image.LANCZOS)
    a = np.asarray(small).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h, w = r.shape
    x = np.mgrid[0:h, 0:w][1] / w
    # Blue-green water and its white foam at the far edges.
    sea = ((b > r + 12) & (g > r + 5)) | ((r > 150) & (g > 170) & (b > 170) & ((x < 0.05) | (x > 0.95)))
    soft = np.asarray(Image.fromarray((sea * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
    Image.fromarray((a * soft[..., None]).clip(0, 255).astype(np.uint8)).save(os.path.join(DST, f"{name}-sea.webp"), "WEBP", quality=82)


if __name__ == "__main__":
    for n in sys.argv[1:] or BOARDS:
        if n in BOARDS:
            build(n)
            print(n)
    for n in sys.argv[1:] or SMOKE:
        if n in SMOKE:
            build_smoke(n)
            print(n, "smoke at", [list(p) for p in smoke_points(n)])
    for n in sys.argv[1:] or SEA:
        if n in SEA:
            build_sea(n)
            print(n, "sea")
