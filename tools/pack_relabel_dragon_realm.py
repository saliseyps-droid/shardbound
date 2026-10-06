import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

S = sys.argv[1]
im = Image.open(f'{S}/dr.webp').convert('RGBA')
A = np.asarray(im).copy()
a = A[:, :, 3]
h, w = a.shape

# 1) Straight sides: the dark red rim blends into the background, so rows in the body lost bits of
#    the side. Every body row gets at least the alpha of a clean reference row.
ref = a[150].copy()
for y in range(140, 690):
    a[y] = np.maximum(a[y], ref)
A[:, :, 3] = a

img = Image.fromarray(A, 'RGBA')

# 2) Label: wipe "15-CARD BOOSTER" off the plate and write "CARD PACK".
#    Plate box (measured on the cut-out): inner text area.
x0, y0, x1, y1 = 88, 636, 334, 663
rgb = img.convert('RGB')
plate = rgb.crop((x0, y0, x1, y1))
P = np.asarray(plate).astype(int)
lum = P.mean(axis=2)
text = lum > 78  # cream letters (and their soft edges) on dark red
# Replace letter pixels by the plate colour from the same row (median of non-letter pixels), then soften.
clean = P.copy()
for yy in range(P.shape[0]):
    bgpx = P[yy][~text[yy]]
    col = np.median(bgpx, axis=0) if len(bgpx) else P[yy].mean(axis=0)
    m = Image.fromarray((text[yy:yy+1] * 255).astype(np.uint8))
    clean[yy][text[yy]] = col
cleanimg = Image.fromarray(clean.astype(np.uint8))
mask = Image.fromarray((text * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.5))
blurred = cleanimg.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.6))
plate2 = Image.composite(blurred, plate, mask)
rgb.paste(plate2, (x0, y0))

# Write the new label, centred, cream with a dark shadow like the original.
draw = ImageDraw.Draw(rgb)
font = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 19)
label = 'CARD PACK'
spacing = 3
widths = [draw.textlength(ch, font=font) for ch in label]
total = sum(widths) + spacing * (len(label) - 1)
cx = (x0 + x1) / 2
x = cx - total / 2
ty = (y0 + y1) / 2 - 11
for ch, cw in zip(label, widths):
    draw.text((x + 1, ty + 1), ch, font=font, fill=(25, 8, 6))
    draw.text((x, ty), ch, font=font, fill=(236, 220, 186))
    x += cw + spacing

out = Image.merge('RGBA', (*rgb.split(), img.getchannel('A')))
# 3) Fill holes inside the outline (the dark side rim blended into the background, leaving 18px gaps).
O = np.asarray(out).copy(); oa = O[:, :, 3]
for yy in range(oa.shape[0]):
    xs = np.where(oa[yy] > 128)[0]
    if len(xs):
        oa[yy, xs.min() + 2: xs.max() - 1] = 255
O[:, :, 3] = oa
out = Image.fromarray(O, 'RGBA')
out.save(f'{S}/dr_fixed.webp', quality=92, method=6)
bg = Image.new('RGBA', out.size, (255, 0, 255, 255)); bg.alpha_composite(out)
bg.convert('RGB').save(f'{S}/dr_fixed_mag.png')
bg.convert('RGB').crop((40, 600, 380, 720)).resize((680, 240)).save(f'{S}/dr_fixed_label.png')
print('ok', out.size)
