"""
Precise booster-pack cut-outs from the pack sheet (packs2.jpg: 4 columns x 4 rows, upscaled 2x).

Why not colour keying: the packs are dark foil on a dark background, so keying by brightness
leaves ragged edges and eats the crimped seals. Instead the outline is measured:
  - top/bottom: where the crimped seals' vertical-stripe texture starts/ends,
  - left side: first pixels above the background level (the pack has a light rim on the left),
  - right side: the left profile mirrored across the pack axis (measured on the seals),
then drawn as a clean, anti-aliased shape with small regular teeth on the seals.
Very dark packs whose sides are invisible borrow the side profile of another pack from
the same sheet row (--shape-from), since all packs share one template.

Usage (Pillow + numpy):
  python tools/pack_cutout.py SHEET.jpg COL ROW OUT.webp [--shape-from COL ROW] [--kingdoms-patch]
Check the result on a magenta background and the outline over a brightened original before shipping.
"""
import argparse
from PIL import Image, ImageFilter
import numpy as np

S, M, SS = 2, 16, 4  # sheet upscale, crop margin, mask supersampling
XS = [26, 254, 482, 711]  # column x (at 1x)
ROWS = [(22, 423), (450, 839), (866, 1253), (1280, 1658)]  # row y ranges (at 1x)


def crop(sheet: Image.Image, col: int, row: int) -> np.ndarray:
    x = XS[col] * S
    y0, y1 = (v * S for v in ROWS[row])
    return np.asarray(sheet.crop((x - M, y0 - M, x + 204 * S + M, y1 + M)).convert('RGB')).copy()


def texture_edges(A: np.ndarray):
    L = np.asarray(Image.fromarray(A).convert('L')).astype(float)
    hp = L - np.asarray(Image.fromarray(L.astype(np.uint8)).filter(ImageFilter.BoxBlur(3))).astype(float)
    sm = np.convolve(np.abs(hp[:, 60:380]).mean(axis=1), np.ones(3) / 3, mode='same')
    h = len(sm)
    top = next(y for y in range(5, h) if sm[y] > 1.5 and sm[y + 2] > 2.5)
    bot = next(y for y in range(h - 5, 0, -1) if sm[y] > 1.5 and sm[y - 2] > 2.5)
    return top, bot


def left_profile(A: np.ndarray, ytop: int, ybot: int):
    L = np.asarray(Image.fromarray(A).convert('L').filter(ImageFilter.MedianFilter(5))).astype(int)
    h, w = L.shape
    T = 16
    xl = np.full(h, np.nan)
    for y in range(ytop, ybot + 1):
        xs = np.where(L[y, : w // 2] > T)[0]
        if len(xs):
            xl[y] = xs.min()
    sm = xl.copy()
    for y in range(ytop, ybot + 1):
        win = xl[max(ytop, y - 4): min(ybot, y + 4) + 1]
        win = win[~np.isnan(win)]
        sm[y] = np.median(win) if len(win) else np.nan
    known = np.where(~np.isnan(sm))[0]
    for y in range(ytop, ybot + 1):
        if np.isnan(sm[y]):
            sm[y] = sm[known[np.argmin(abs(known - y))]]
    sums = []
    for y in list(range(ytop + 4, ytop + 30)) + list(range(ybot - 30, ybot - 4)):
        xs = np.where(L[y] > T)[0]
        if len(xs):
            sums.append(xs.min() + xs.max())
    return sm, float(np.percentile(sums, 90))


def cutout(A: np.ndarray, template: np.ndarray | None = None) -> Image.Image:
    h, w = A.shape[:2]
    ytop, ybot = texture_edges(A)
    if template is not None:
        bt, bb = texture_edges(template)
        prof, axis2 = left_profile(template, bt, bb)
        src_rows = np.linspace(bt, bb, ybot - ytop + 1)
        sm = np.full(h, np.nan)
        sm[ytop: ybot + 1] = np.interp(src_rows, np.arange(len(prof)), np.nan_to_num(prof, nan=prof[bt]))
    else:
        sm, axis2 = left_profile(A, ytop, ybot)
    H, W = h * SS, w * SS
    mask = np.zeros((H, W), bool)
    X = np.arange(W) / SS
    for Y in range(ytop * SS, (ybot + 1) * SS):
        yi = min(ybot, max(ytop, int(Y / SS)))
        mask[Y] = (X >= sm[yi] + 0.5) & (X <= axis2 - sm[yi] - 0.5)
    period, depth = 9.0, 3.0  # crimp teeth
    for Xi in range(W):
        d = int(round(depth * abs(((Xi / SS / period) % 1.0) - 0.5) * 2 * SS))
        mask[ytop * SS: ytop * SS + d, Xi] = False
        mask[(ybot + 1) * SS - d: (ybot + 1) * SS, Xi] = False
    alpha = Image.fromarray((mask * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS)
    rgba = Image.fromarray(np.dstack([A, np.asarray(alpha)]).astype(np.uint8), 'RGBA')
    return rgba.crop(rgba.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheet')
    ap.add_argument('col', type=int)
    ap.add_argument('row', type=int)
    ap.add_argument('out')
    ap.add_argument('--shape-from', nargs=2, type=int, metavar=('COL', 'ROW'))
    ap.add_argument('--kingdoms-patch', action='store_true', help='cover the stray line in the Kingdoms at War art')
    a = ap.parse_args()
    sheet = Image.open(a.sheet)
    A = crop(sheet, a.col, a.row)
    if a.kingdoms_patch:
        src = list(range(302 * S + M, 310 * S + M))
        for t, y in enumerate(range(331 * S + M, 343 * S + M)):
            A[y, 38 * S + M: 166 * S + M] = A[src[t % len(src)], 38 * S + M: 166 * S + M]
    template = crop(sheet, *a.shape_from) if a.shape_from else None
    img = cutout(A, template)
    img.save(a.out, quality=92, method=6)
    print(a.out, img.size)


if __name__ == '__main__':
    main()
