import * as THREE from 'three';
import { GLYPHS, iconColor, type AbilityIconKind } from '@/ui/components/AbilityIcon';

/**
 * The faces of the 3D cards, drawn on a canvas as in the 3D table mockup: on the table the whole
 * art in a gold frame with the ability icons along its foot (no text), in the hand the full card
 * (art, name banner, type line, rules text with the keywords in gold).
 */

const FW = 500;
const FH = 700;
const FONT_DISPLAY = "Almendra, 'Palatino Linotype', Georgia, serif";
const FONT_BODY = "'Alegreya Sans', 'Segoe UI', sans-serif";
const FONT_NUM = "'Alegreya Sans SC', 'Alegreya Sans', 'Segoe UI', sans-serif";

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** A round ability icon (dark disc, gold rim, coloured sign) at x, y with radius r. */
export function drawIcon(g: CanvasRenderingContext2D, kind: AbilityIconKind, x: number, y: number, r: number) {
  g.save();
  g.translate(x, y);
  g.fillStyle = 'rgba(14,10,24,.92)';
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = r * 0.14;
  g.strokeStyle = '#e8b04b';
  g.stroke();
  // The glyphs are drawn on a 20-unit box: scale it to the disc.
  const k = r / 10;
  g.scale(k, k);
  const c = iconColor(kind);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const p of GLYPHS[kind]) {
    const path = new Path2D(p.d);
    if (p.fill) {
      g.fillStyle = c;
      g.fill(path);
    } else {
      g.strokeStyle = c;
      g.lineWidth = p.width ?? 1.5;
      g.stroke(path);
    }
  }
  g.restore();
}

const GOLD = ['#f3d892', '#b3822e', '#6b4512', '#d9b25c'];
const DARK_GOLD = ['#a77b35', '#5c3d14', '#3a2508', '#8a6224'];
/** Card finishes (game Variant): the frame each one gets on the table. */
export type Finish = 'NORMAL' | 'FOIL' | 'PRISMATIC' | 'GILDED';
const RAINBOW = ['#ff6b8a', '#ffd36a', '#7ef29a', '#5fd8ff', '#b38cff', '#ff6b8a'];
const BLACK_GOLD = ['#f5d27a', '#1a1408', '#0a0806', '#e8b04b'];

function frame(g: CanvasRenderingContext2D, enemy: boolean, finish: Finish = 'NORMAL') {
  const golds = finish === 'GILDED' ? BLACK_GOLD : enemy ? DARK_GOLD : GOLD;
  const stops = finish === 'PRISMATIC' ? RAINBOW : golds;
  const fr = g.createLinearGradient(0, 0, FW, FH);
  stops.forEach((c, i) => fr.addColorStop(i / (stops.length - 1), c));
  g.fillStyle = fr;
  g.fillRect(0, 0, FW, FH);
  // A narrow band: the picture takes nearly the whole card.
  g.fillStyle = '#151226';
  g.fillRect(9, 9, FW - 18, FH - 18);
  return golds;
}

/** Draws `img` to cover the box, its focus (object-position %) kept in view. */
function cover(g: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number, fx = 50, fy = 40) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.drawImage(img, x + (w - dw) * (fx / 100), y + (h - dh) * (fy / 100), dw, dh);
  g.restore();
}

/** A unit on the table: the whole art, no text, its lasting abilities as icons along the foot. */
export function unitFace(img: HTMLImageElement, o: { enemy: boolean; icons: AbilityIconKind[]; fx: number; fy: number; finish?: Finish }) {
  return canvasTexture(FW, FH, (g) => {
    const golds = frame(g, o.enemy, o.finish);
    const iw = FW - 24;
    const ih = FH - 24;
    cover(g, img, 12, 12, iw, ih, o.fx, o.fy);
    // A soft dark vignette at the picture's edges, so it sits in the frame instead of on it.
    const vig = g.createRadialGradient(FW / 2, FH / 2, FH * 0.32, FW / 2, FH / 2, FH * 0.62);
    vig.addColorStop(0, 'rgba(10,6,20,0)');
    vig.addColorStop(1, 'rgba(10,6,20,.45)');
    g.fillStyle = vig;
    g.fillRect(12, 12, iw, ih);
    const fade = g.createLinearGradient(0, FH * 0.72, 0, FH);
    fade.addColorStop(0, 'rgba(10,6,20,0)');
    fade.addColorStop(1, 'rgba(10,6,20,.75)');
    g.fillStyle = fade;
    g.fillRect(12, 12, iw, ih);
    // A thin bright line inside the band, a darker one outside it: an engraved edge.
    g.strokeStyle = 'rgba(0,0,0,.55)';
    g.lineWidth = 3;
    g.strokeRect(10.5, 10.5, FW - 21, FH - 21);
    g.strokeStyle = golds[0];
    g.globalAlpha = 0.8;
    g.lineWidth = 1.5;
    g.strokeRect(14, 14, iw - 4, ih - 4);
    g.globalAlpha = 1;
    const icons = o.icons.slice(0, 4);
    const r = icons.length > 3 ? 56 : 70;
    const gap = 14;
    const total = icons.length * 2 * r + (icons.length - 1) * gap;
    icons.forEach((kind, i) => drawIcon(g, kind, FW / 2 - total / 2 + r + i * (2 * r + gap), FH - 130, r));
  });
}

export interface HandCardData {
  name: string;
  type: string;
  tag: string;
  rarity: string;
  /** The rules text in pieces; keywords are drawn bold and gold. */
  rules: { text: string; kw: boolean }[];
  fx: number;
  fy: number;
}

/** A card in the hand: art, name banner, type line with the rarity gem, rules text (as in the mockup). */
export function handFace(img: HTMLImageElement | null, d: HandCardData) {
  return canvasTexture(FW, FH, (g) => {
    const golds = frame(g, false);
    const ah = FH * 0.5;
    if (img) cover(g, img, 20, 20, FW - 40, ah, d.fx, d.fy);
    // Name banner across the foot of the art.
    const by = 20 + ah - 26;
    const bn = g.createLinearGradient(0, by, 0, by + 58);
    bn.addColorStop(0, '#3a2a52');
    bn.addColorStop(1, '#1a1530');
    g.fillStyle = bn;
    g.beginPath();
    g.moveTo(40, by);
    g.lineTo(FW - 40, by);
    g.lineTo(FW - 22, by + 29);
    g.lineTo(FW - 40, by + 58);
    g.lineTo(40, by + 58);
    g.lineTo(22, by + 29);
    g.closePath();
    g.fill();
    g.strokeStyle = golds[1];
    g.lineWidth = 3;
    g.stroke();
    g.font = `700 40px ${FONT_DISPLAY}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#fff6de';
    g.shadowColor = '#000';
    g.shadowBlur = 4;
    g.fillText(d.name, FW / 2, by + 31, FW - 90);
    g.shadowBlur = 0;
    // Type line, the rarity gem in the middle.
    const ty = by + 82;
    g.font = `500 22px ${FONT_BODY}`;
    g.fillStyle = '#b9ae95';
    g.textAlign = 'left';
    g.fillText(d.type, 42, ty);
    g.textAlign = 'right';
    g.fillText(d.tag, FW - 42, ty);
    g.save();
    g.translate(FW / 2, ty);
    g.rotate(Math.PI / 4);
    g.fillStyle = d.rarity;
    g.shadowColor = d.rarity;
    g.shadowBlur = 8;
    g.fillRect(-8, -8, 16, 16);
    g.restore();
    // The rules panel.
    const py = ty + 22;
    const ph = FH - py - 70;
    g.fillStyle = 'rgba(80,60,120,.28)';
    g.strokeStyle = 'rgba(160,130,200,.45)';
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(34, py, FW - 68, ph, 10);
    g.fill();
    g.stroke();
    const words = d.rules.flatMap((p) => p.text.split(/\s+/).filter(Boolean).map((w) => ({ w, kw: p.kw })));
    let size = 30;
    const wordW = (x: { w: string; kw: boolean }) => {
      g.font = `${x.kw ? 800 : 500} ${size}px ${FONT_BODY}`;
      return g.measureText(x.w + ' ').width;
    };
    const layout = () => {
      const lines: { w: string; kw: boolean }[][] = [[]];
      let lw = 0;
      for (const x of words) {
        const ww = wordW(x);
        if (lw + ww > FW - 100 && lines[lines.length - 1].length) {
          lines.push([]);
          lw = 0;
        }
        lines[lines.length - 1].push(x);
        lw += ww;
      }
      return lines;
    };
    let lines = layout();
    while (lines.length * size * 1.18 > ph - 24 && size > 16) {
      size -= 2;
      lines = layout();
    }
    let y = py + ph / 2 - ((lines.length - 1) * size * 1.18) / 2;
    g.textAlign = 'left';
    for (const line of lines) {
      const lineW = line.reduce((a, x) => a + wordW(x), 0);
      let x = FW / 2 - lineW / 2;
      for (const word of line) {
        g.font = `${word.kw ? 800 : 500} ${size}px ${FONT_BODY}`;
        g.fillStyle = word.kw ? '#ffd27a' : '#efe4c8';
        g.fillText(word.w, x, y);
        x += g.measureText(word.w + ' ').width;
      }
      y += size * 1.18;
    }
  });
}

/** A white number with a black outline, for the stat gems (cached per number and colour). */
const numbers = new Map<string, THREE.CanvasTexture>();
export function numberTexture(n: string, color = '#ffffff') {
  const key = `${n}|${color}`;
  let t = numbers.get(key);
  if (!t) {
    t = canvasTexture(128, 128, (g) => {
      g.font = `800 ${n.length > 2 ? 64 : 88}px ${FONT_NUM}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineWidth = 12;
      g.strokeStyle = '#000';
      g.strokeText(n, 64, 70);
      g.fillStyle = color;
      g.fillText(n, 64, 70);
    });
    numbers.set(key, t);
  }
  return t;
}

/** Raised stat gems for a card w×h (world units, card face at z): attack octahedron, health hexagon, cost hexagon. */
export function makeGem(kind: 'atk' | 'hp' | 'cost', scale: number) {
  const color = kind === 'atk' ? '#e89a2a' : kind === 'hp' ? '#c8322a' : '#3aa6d8';
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.22, emissive: color, emissiveIntensity: 0.2 });
  const m = new THREE.Mesh(kind === 'atk' ? new THREE.OctahedronGeometry(0.27 * scale, 0) : new THREE.CylinderGeometry(0.24 * scale, 0.24 * scale, 0.12 * scale, 6), mat);
  if (kind === 'atk') m.scale.set(1, 1, 0.4);
  else m.rotation.x = Math.PI / 2;
  m.castShadow = true;
  // The number lies on the gem's top, turning with the card (so it never slides off it or shows through
  // another card).
  const num = new THREE.Mesh(new THREE.PlaneGeometry(0.46 * scale, 0.46 * scale), new THREE.MeshBasicMaterial({ map: numberTexture('0'), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }));
  num.userData.lift = (kind === 'atk' ? 0.12 : 0.07) * scale;
  return { gem: m, num, value: '', color: '' };
}

/** A tight glow hugging a card's edge (white; tinted by the material): the card fills the inner 220 × 308 of its 256 × 344. */
export const SNUG = { w: 256 / 220, h: 344 / 308 };
export const snugGlowTexture = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 344;
  const g = c.getContext('2d')!;
  g.strokeStyle = '#fff';
  g.shadowColor = '#fff';
  for (const [blur, width, alpha] of [
    [14, 5, 0.6],
    [5, 3, 1],
  ]) {
    g.globalAlpha = alpha;
    g.shadowBlur = blur;
    g.lineWidth = width;
    g.beginPath();
    g.roundRect(18, 18, 220, 308, 12);
    g.stroke();
  }
  return new THREE.CanvasTexture(c);
};

/**
 * A diagonal band of light that sweeps across a card's face (Foil, Prismatic, Gilded), for additive
 * blending: opaque black (adds nothing) with the band in white, or the rainbow for Prismatic.
 */
export function sheenTexture(rainbow: boolean) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, 256, 256);
  // Across x only (black at both edges), so the texture tiles without seams; it is turned diagonal.
  const grad = g.createLinearGradient(0, 0, 256, 0);
  const band = rainbow ? ['#000000', '#7a2a3a', '#806a2a', '#2a7a40', '#2a6a80', '#5a3a80', '#000000'] : ['#000000', '#9a9a9a', '#000000'];
  band.forEach((col, k) => grad.addColorStop(0.32 + (k / (band.length - 1)) * 0.36, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI / 4;
  return t;
}
