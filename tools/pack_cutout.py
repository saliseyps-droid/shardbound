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
  python tools/pack_cutout.py SHEET.jpg COL ROW OUT.webp [--shape-from COL ROW] [--kingdoms-patch] [--row-shift DY] [--bg-flood] [--mirror]
Check the result on a magenta background and the outline over a brightened original before shipping.
"""
import argparse
from PIL import Image, ImageFilter
import numpy as np

S, M, SS = 2, 16, 4  # sheet upscale, crop margin, mask supersampling
XS = [26, 254, 482, 711]  # column x (at 1x)
ROWS = [(22, 423), (450, 839), (866, 1253), (1280, 1658)]  # row y ranges (at 1x)
ROW_SHIFT = 0  # other sheets (packs4) sit a little higher: --row-shift
EDGE_T = 16  # background level for the side profile; packs4 has a lighter background: --threshold


def crop(sheet: Image.Image, col: int, row: int) -> np.ndarray:
    x = XS[col] * S
    y0, y1 = ((v + ROW_SHIFT) * S for v in ROWS[row])
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
    T = EDGE_T
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


def cutout(A: np.ndarray, template: np.ndarray | None = None, edges: tuple[int, int] | None = None) -> Image.Image:
    h, w = A.shape[:2]
    ytop, ybot = edges or texture_edges(A)
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


def bg_flood_cutout(A: np.ndarray, tol: int = 7, erode: int = 0) -> Image.Image:
    """Sheets with an even grey background and a soft drop shadow (packs4).
    The pack is whatever is brighter or redder than the background (its light rim, seals and art);
    gaps are closed, then everything the outside can't reach is filled in. The shadow and the
    darker-than-background halo stay outside. `tol` = brightness margin above the background."""
    from PIL import ImageDraw
    h, w = A.shape[:2]
    corners = np.concatenate([A[:6, :6].reshape(-1, 3), A[:6, -6:].reshape(-1, 3), A[-6:, :6].reshape(-1, 3), A[-6:, -6:].reshape(-1, 3)])
    bg_l = float(np.median(corners.mean(axis=1)))
    Ai = A.astype(int)
    lum = Ai.mean(axis=2)
    redness = Ai[..., 0] - np.maximum(Ai[..., 1], Ai[..., 2])
    solid = (lum > bg_l + tol) | (redness > 25)
    P = 30  # pad so the outside is connected all round
    m = Image.fromarray(np.pad(solid, P).astype(np.uint8) * 255)
    m = m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))  # close small gaps in the rim
    ImageDraw.floodfill(m, (0, 0), 128)
    pack = np.asarray(m) != 128
    m = Image.fromarray(pack.astype(np.uint8) * 255).crop((P, P, P + w, P + h))
    # Keep only the pack itself (bits of neighbouring packs can reach into the crop).
    ImageDraw.floodfill(m, (w // 2, h // 2), 128)
    m = m.point(lambda v: 255 if v == 128 else 0).filter(ImageFilter.MedianFilter(7))
    if erode:
        m = m.filter(ImageFilter.MinFilter(2 * erode + 1))
    # The crimped seals' dark edge is ragged against the background: square both seals off
    # at their outermost row, as wide as the seal just inside.
    M = np.asarray(m) > 127
    cover = M[:, w // 4: 3 * w // 4].mean(axis=1)
    rows = np.where(cover > 0.3)[0]
    ytop, ybot = int(rows.min()), int(rows.max())
    for y0, y1, ref in ((ytop, ytop + 20, ytop + 22), (ybot - 20, ybot + 1, ybot - 22)):
        xs = np.where(M[ref])[0]
        M[y0:y1, xs.min(): xs.max() + 1] = True
    M[:ytop] = False
    M[ybot + 1:] = False
    big = Image.fromarray(M.astype(np.uint8) * 255).resize((w * SS, h * SS), Image.BILINEAR).filter(ImageFilter.GaussianBlur(SS * 0.8)).point(lambda v: 255 if v > 127 else 0)
    B = np.asarray(big).copy()
    period, depth = 9.0, 3.0  # crimp teeth, as in cutout()
    for Xi in range(w * SS):
        d = int(round(depth * abs(((Xi / SS / period) % 1.0) - 0.5) * 2 * SS))
        B[ytop * SS: ytop * SS + d, Xi] = 0
        B[(ybot + 1) * SS - d: (ybot + 1) * SS, Xi] = 0
    big = Image.fromarray(B)
    alpha = big.resize((w, h), Image.LANCZOS)
    rgba = Image.fromarray(np.dstack([A, np.asarray(alpha)]).astype(np.uint8), 'RGBA')
    return rgba.crop(rgba.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())


def mirror_left_edge(img: Image.Image) -> Image.Image:
    """Packs are symmetric: rebuild the right edge of the alpha mask by mirroring the left one
    across the pack axis (fixes notches where the background leaked through a gap in the rim)."""
    A = np.asarray(img).copy()
    a = A[:, :, 3]
    h, w = a.shape
    rows = [y for y in range(h) if (a[y] > 128).any()]
    lefts = np.array([np.where(a[y] > 128)[0].min() for y in rows])
    rights = np.array([np.where(a[y] > 128)[0].max() for y in rows])
    axis2 = float(np.median(lefts + rights))  # 2 x axis, robust against the notch rows
    out = a.copy()
    for y in rows:
        for x in range(int(np.ceil(axis2 / 2)), w):
            src = int(round(axis2 - x))
            out[y, x] = a[y, src] if 0 <= src < w else 0
    A[:, :, 3] = out
    res = Image.fromarray(A, 'RGBA')
    return res.crop(res.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheet')
    ap.add_argument('col', type=int)
    ap.add_argument('row', type=int)
    ap.add_argument('out')
    ap.add_argument('--shape-from', nargs=2, type=int, metavar=('COL', 'ROW'))
    ap.add_argument('--kingdoms-patch', action='store_true', help='cover the stray line in the Kingdoms at War art')
    ap.add_argument('--threshold', type=int, default=16, help='side-profile background level (packs4: 30)')
    ap.add_argument('--edges', nargs=2, type=int, metavar=('TOP', 'BOTTOM'), help='seal top/bottom in crop pixels when the texture measurement fails (packs4 Legions: 17 803)')
    ap.add_argument('--mirror', action='store_true', help='make the right edge a mirror of the left (packs4 Legions of Shadow)')
    ap.add_argument('--bg-flood', action='store_true', help='remove the even background instead of measuring edges (packs4)')
    ap.add_argument('--erode', type=int, default=0, help='with --bg-flood: shrink by this many px to drop the drop shadow (packs4: 12)')
    ap.add_argument('--row-shift', type=int, default=0, help='move the row ranges by this many 1x pixels (packs4: -18)')
    a = ap.parse_args()
    global ROW_SHIFT, EDGE_T
    ROW_SHIFT = a.row_shift
    EDGE_T = a.threshold
    sheet = Image.open(a.sheet)
    A = crop(sheet, a.col, a.row)
    if a.kingdoms_patch:
        src = list(range(302 * S + M, 310 * S + M))
        for t, y in enumerate(range(331 * S + M, 343 * S + M)):
            A[y, 38 * S + M: 166 * S + M] = A[src[t % len(src)], 38 * S + M: 166 * S + M]
    template = crop(sheet, *a.shape_from) if a.shape_from else None
    img = bg_flood_cutout(A, erode=a.erode) if a.bg_flood else cutout(A, template, tuple(a.edges) if a.edges else None)
    if a.mirror:
        img = mirror_left_edge(img)
    img.save(a.out, quality=92, method=6)
    print(a.out, img.size)


if __name__ == '__main__':
    main()
