import * as THREE from 'three';
import { Bag, DecorContext, PER_METRE, ROOM, std } from './kit';
import type { Built } from './tables';
import { scanned } from './surfaces';

/**
 * The ceiling: one plane over the room at the top of the walls, facing down, so it hides when the
 * camera looks in from above (as the one-sided walls do). Painted skies are drawn on a canvas from a
 * fixed seed (both players see the same stars) and glow a little of their own.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;
const TOP = ROOM.floor + ROOM.wallH;
const W = ROOM.x * 2;
const H = ROOM.y * 2;

function overhead(bag: Bag, mat: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(W, H)), mat);
  m.rotation.x = Math.PI;
  m.position.z = TOP;
  m.receiveShadow = true;
  return m;
}

/** A small seeded random generator (mulberry32). */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Paint = (g: CanvasRenderingContext2D, w: number, h: number, rnd: () => number) => void;

const dark: Paint = (g, w, h) => {
  const bg = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
  bg.addColorStop(0, '#0e1026');
  bg.addColorStop(1, '#04040a');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
};

/** Stars: many faint points, a few bright ones with a halo. */
const stars = (n: number): Paint => (g, w, h, rnd) => {
  const tints = ['#ffffff', '#cfe0ff', '#fff2d0', '#ffd8d0'];
  for (let i = 0; i < n; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = 0.6 + rnd() ** 4 * 2.6;
    g.globalAlpha = 0.35 + rnd() * 0.65;
    g.fillStyle = tints[Math.floor(rnd() * tints.length)];
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    if (r > 2.4) {
      const halo = g.createRadialGradient(x, y, 0, x, y, r * 6);
      halo.addColorStop(0, 'rgba(220,230,255,.45)');
      halo.addColorStop(1, 'rgba(220,230,255,0)');
      g.fillStyle = halo;
      g.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
    }
  }
  g.globalAlpha = 1;
};

/** Soft coloured clouds, added light on light. */
const clouds = (colors: string[], n: number, size: number): Paint => (g, w, h, rnd) => {
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = (0.4 + rnd()) * size * w;
    const c = colors[i % colors.length];
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, c);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 0.18 + rnd() * 0.2;
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
};

/** A shaded sphere lit from the upper left, with an optional ring around it. */
function planet(g: CanvasRenderingContext2D, x: number, y: number, r: number, light: string, shade: string, ring?: string) {
  const back = () => {
    if (!ring) return;
    g.strokeStyle = ring;
    g.lineWidth = r * 0.16;
    g.globalAlpha = 0.85;
    g.beginPath();
    g.ellipse(x, y, r * 2.1, r * 0.55, -0.35, Math.PI, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  };
  back();
  const grad = g.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  grad.addColorStop(0, light);
  grad.addColorStop(1, shade);
  g.fillStyle = grad;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  if (ring) {
    g.strokeStyle = ring;
    g.lineWidth = r * 0.16;
    g.globalAlpha = 0.85;
    g.beginPath();
    g.ellipse(x, y, r * 2.1, r * 0.55, -0.35, 0, Math.PI);
    g.stroke();
    g.globalAlpha = 1;
  }
}

const planets: Paint = (g, w, h, rnd) => {
  planet(g, w * 0.3, h * 0.36, h * 0.13, '#f4dca0', '#6a4a20', '#d8c08a');
  planet(g, w * 0.72, h * 0.66, h * 0.07, '#ff9a6a', '#5a1a10');
  planet(g, w * 0.78, h * 0.24, h * 0.09, '#8ad0ff', '#123060');
  // A grey moon with craters.
  const mx = w * 0.18;
  const my = h * 0.78;
  const mr = h * 0.05;
  planet(g, mx, my, mr, '#e8e8e8', '#3a3a40');
  g.fillStyle = 'rgba(40,40,48,.35)';
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * mr * 0.7;
    g.beginPath();
    g.arc(mx + Math.cos(a) * d, my + Math.sin(a) * d, mr * (0.08 + rnd() * 0.12), 0, Math.PI * 2);
    g.fill();
  }
};

/** Figures of stars joined by thin golden lines. */
const constellations: Paint = (g, w, h, rnd) => {
  for (let k = 0; k < 9; k++) {
    let x = w * (0.1 + 0.8 * rnd());
    let y = h * (0.1 + 0.8 * rnd());
    const pts: [number, number][] = [[x, y]];
    for (let i = 0; i < 4 + Math.floor(rnd() * 4); i++) {
      const a = rnd() * Math.PI * 2;
      const d = w * (0.03 + rnd() * 0.05);
      x = Math.min(w - 20, Math.max(20, x + Math.cos(a) * d));
      y = Math.min(h - 20, Math.max(20, y + Math.sin(a) * d));
      pts.push([x, y]);
    }
    g.strokeStyle = 'rgba(232,192,106,.55)';
    g.lineWidth = 2;
    g.beginPath();
    pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.stroke();
    for (const [px, py] of pts) {
      const halo = g.createRadialGradient(px, py, 0, px, py, 16);
      halo.addColorStop(0, 'rgba(255,240,200,.9)');
      halo.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = halo;
      g.fillRect(px - 16, py - 16, 32, 32);
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(px, py, 3.2, 0, Math.PI * 2);
      g.fill();
    }
  }
};

/** Curtains of light: many thin vertical strokes along waving bands, green fading to violet. */
const aurora: Paint = (g, w, h, rnd) => {
  g.globalCompositeOperation = 'lighter';
  for (let band = 0; band < 3; band++) {
    const base = h * (0.25 + band * 0.22);
    const amp = h * (0.05 + rnd() * 0.05);
    const freq = 2 + rnd() * 2;
    const phase = rnd() * Math.PI * 2;
    for (let x = 0; x < w; x += 3) {
      const y = base + Math.sin((x / w) * Math.PI * freq + phase) * amp;
      const len = h * (0.08 + 0.06 * Math.sin(x * 0.013 + band));
      const grad = g.createLinearGradient(x, y - len, x, y + len * 0.3);
      grad.addColorStop(0, 'rgba(160,80,255,0)');
      grad.addColorStop(0.55, 'rgba(120,90,255,.10)');
      grad.addColorStop(0.85, 'rgba(60,255,160,.22)');
      grad.addColorStop(1, 'rgba(60,255,160,0)');
      g.fillStyle = grad;
      g.fillRect(x, y - len, 3, len * 1.3);
    }
  }
  g.globalCompositeOperation = 'source-over';
};

/** A painted sky over the room; it shimmers gently. */
const sky = (paints: Paint[], seed: number, glowing = 0.9): Make => (_ctx, bag) => {
  const mat = std(bag, { color: '#ffffff', roughness: 1 });
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = Math.round((2048 * H) / W);
  const g = c.getContext('2d');
  if (g) {
    const rnd = seeded(seed);
    for (const p of paints) p(g, c.width, c.height, rnd);
    const t = bag.keep(new THREE.CanvasTexture(c));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    mat.map = t;
    mat.emissiveMap = t;
    mat.emissive.set('#ffffff');
    mat.emissiveIntensity = glowing;
  }
  return { root: overhead(bag, mat), update: (t) => (mat.emissiveIntensity = glowing * (0.92 + Math.sin(t * 0.7) * 0.08)) };
};

export const ROOFS: Record<string, Make> = {
  rf_black: (_ctx, bag) => ({ root: overhead(bag, std(bag, { color: '#141416', roughness: 0.95 })) }),
  rf_planks: (_ctx, bag) => ({ root: overhead(bag, scanned(bag, 'dark_wooden_planks', W / (2 * PER_METRE), H / (2 * PER_METRE))) }),
  rf_stars: sky([dark, stars(2600)], 11),
  rf_constellations: sky([dark, stars(1600), constellations], 23),
  rf_nebula: sky([dark, clouds(['#7a3cff', '#2a6aff', '#ff3a9a', '#3ad0ff'], 34, 0.16), stars(2200)], 37),
  rf_planets: sky([dark, stars(2000), clouds(['#3a5aff', '#8a3aff'], 10, 0.14), planets], 41),
  rf_aurora: sky([dark, stars(1800), aurora], 53),
};
