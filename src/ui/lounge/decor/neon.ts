import * as THREE from 'three';
import { Bag, DecorContext, ROOM, canvasTexture, mesh, std } from './kit';
import type { Built } from './tables';

/**
 * Neon for a modern room: glowing glass tubes bent into signs (on the walls), strips along the walls,
 * a ring on the ceiling. A tube is a bright core with a soft halo behind it and a coloured light that
 * reaches the room; it hums with a faint flicker.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;
type Stroke = [number, number][];

/** A soft round glow (white; tinted by the material). */
let halo: THREE.Texture | null = null;
const haloTexture = () =>
  (halo ??= canvasTexture(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,0.9)');
    r.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  }));

/** Glowing tubes along strokes (in the wall's plane: x along it, z up), `out` in front of the wall. */
function tubes(bag: Bag, strokes: Stroke[], scale: number, color: string, radius = 0.14, out = -0.5): THREE.Group {
  const g = new THREE.Group();
  const core = bag.keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35), toneMapped: false }));
  for (const s of strokes) {
    const path = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 1; i < s.length; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(s[i - 1][0] * scale, out, s[i - 1][1] * scale), new THREE.Vector3(s[i][0] * scale, out, s[i][1] * scale)));
    g.add(new THREE.Mesh(bag.keep(new THREE.TubeGeometry(path, Math.max(8, s.length * 6), radius, 8, false)), core));
  }
  return g;
}

/** A neon sign on the wall: a dark backing, the tubes, a halo and a coloured light. */
function sign(strokes: Stroke[], color: string, size = 4.2, backing = true): Make {
  return (ctx, bag) => {
    // Fit the slot: the strokes span about 2 × 2 units at scale 1.
    const fit = ctx.limit ? Math.min(size, ctx.limit.w * 0.4, ctx.limit.h * 0.4) : size;
    const g = new THREE.Group();
    if (backing) g.add(mesh(new THREE.BoxGeometry(fit * 2.4, 0.2, fit * 2.4), std(bag, { color: '#0d0b12', roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }), bag, [0, -0.1, 0]));
    const t = tubes(bag, strokes, fit, color);
    g.add(t);
    const glowMat = bag.keep(new THREE.MeshBasicMaterial({ map: haloTexture(), color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    const glow = new THREE.Mesh(bag.keep(new THREE.PlaneGeometry(fit * 2.45, fit * 2.45)), glowMat);
    glow.rotation.x = Math.PI / 2;
    glow.position.y = -0.25;
    g.add(glow);
    const light = new THREE.PointLight(color, 9, 26, 1.7);
    light.position.set(0, -3, 0);
    g.add(light);
    const seed = Math.random() * 10;
    return {
      root: g,
      update: (time) => {
        // A steady hum, and now and then a quick stutter.
        const stutter = Math.sin(time * 0.7 + seed) > 0.995 ? 0.4 : 1;
        const k = (0.92 + Math.sin(time * 50 + seed) * 0.03) * stutter;
        light.intensity = 9 * k;
        glowMat.opacity = 0.55 * k;
      },
    };
  };
}

// ---------- The signs' strokes (x and z in about -1..1). ----------

const circle = (cx: number, cz: number, r: number, from = 0, to = Math.PI * 2, n = 24): Stroke =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / n;
    return [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
  });

const heart: Stroke[] = [
  Array.from({ length: 41 }, (_, i) => {
    const t = (i / 40) * Math.PI * 2;
    return [(16 * Math.sin(t) ** 3) / 17, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 + 0.1];
  }),
];
const bolt: Stroke[] = [[[-0.15, 1], [-0.6, -0.05], [-0.05, -0.05], [-0.35, -1], [0.6, 0.2], [0.05, 0.2], [0.35, 1], [-0.15, 1]]];
const crown: Stroke[] = [[[-1, -0.6], [-1, 0.6], [-0.5, 0], [0, 0.85], [0.5, 0], [1, 0.6], [1, -0.6], [-1, -0.6]], [[-1, -0.85], [1, -0.85]]];
const star: Stroke[] = [Array.from({ length: 11 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5; const r = i % 2 ? 0.42 : 1; return [Math.cos(a) * r, Math.sin(a) * r]; })];
const controller: Stroke[] = [
  [[-0.7, 0.45], [0.7, 0.45], [1, 0], [1, -0.5], [0.75, -0.6], [0.4, -0.2], [-0.4, -0.2], [-0.75, -0.6], [-1, -0.5], [-1, 0], [-0.7, 0.45]],
  [[-0.65, 0.12], [-0.35, 0.12]],
  [[-0.5, 0.27], [-0.5, -0.03]],
  circle(0.45, 0.2, 0.07, 0, Math.PI * 2, 10),
  circle(0.62, 0.05, 0.07, 0, Math.PI * 2, 10),
];
/** Block letters on a 0..1 box, laid out in a row. */
const LETTERS: Record<string, Stroke[]> = {
  G: [[[1, 0.85], [0.75, 1], [0.25, 1], [0, 0.75], [0, 0.25], [0.25, 0], [0.75, 0], [1, 0.25], [1, 0.5], [0.55, 0.5]]],
  P: [[[0, 0], [0, 1], [0.75, 1], [1, 0.8], [1, 0.6], [0.75, 0.45], [0, 0.45]]],
  L: [[[0, 1], [0, 0], [0.9, 0]]],
  A: [[[0, 0], [0.5, 1], [1, 0]], [[0.22, 0.42], [0.78, 0.42]]],
  Y: [[[0, 1], [0.5, 0.5], [1, 1]], [[0.5, 0.5], [0.5, 0]]],
  W: [[[0, 1], [0.22, 0], [0.5, 0.6], [0.78, 0], [1, 1]]],
  I: [[[0.5, 0], [0.5, 1]]],
  N: [[[0, 0], [0, 1], [1, 0], [1, 1]]],
};
function word(text: string): Stroke[] {
  const n = text.length;
  const w = 2 / (n * 1.25 - 0.25);
  return [...text].flatMap((ch, i) => (LETTERS[ch] ?? []).map((s) => s.map(([x, z]) => [-1 + i * w * 1.25 + x * w, (z - 0.5) * w * 1.4] as [number, number])));
}

export const NEON_SIGNS: Record<string, Make> = {
  po_neon_heart: sign(heart, '#ff3aa8'),
  po_neon_bolt: sign(bolt, '#ffe14a'),
  po_neon_crown: sign(crown, '#c77dff'),
  po_neon_star: sign(star, '#4ab8ff'),
  po_neon_controller: sign(controller, '#3affd8'),
  po_neon_gg: sign(word('GG'), '#7aff4a'),
  po_neon_play: sign(word('PLAY'), '#ff4ad8'),
  // The big one on the back wall.
  p_neon_win: sign(word('WIN'), '#ff6a3a', 7.5),
};

// ---------- Strips along the side walls (the lights slot). ----------

function strips(color: string): Make {
  return (_c, bag) => {
    const g = new THREE.Group();
    const lights: THREE.PointLight[] = [];
    const core = bag.keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.3), toneMapped: false }));
    const geo = bag.keep(new THREE.CylinderGeometry(0.16, 0.16, ROOM.y * 2 - 4, 8));
    for (const side of [-1, 1]) {
      for (const z of [ROOM.floor + ROOM.wallH - 2.5, ROOM.floor + 0.6]) {
        const t = new THREE.Mesh(geo, core);
        t.position.set(side * (ROOM.x - 0.4), 0, z);
        g.add(t);
      }
      for (const y of [-16, 0, 16]) {
        const l = new THREE.PointLight(color, 8, 30, 1.7);
        l.position.set(side * (ROOM.x - 3), y, ROOM.floor + ROOM.wallH - 4);
        g.add(l);
        lights.push(l);
      }
    }
    return { root: g, update: (t) => lights.forEach((l, i) => (l.intensity = 8 * (0.94 + Math.sin(t * 40 + i) * 0.03))) };
  };
}

export const NEON_LIGHTS: Record<string, Make> = {
  l_neon_pink: strips('#ff3aa8'),
  l_neon_cyan: strips('#3ad8ff'),
  l_neon_purple: strips('#a64aff'),
};

// ---------- A ring on the ceiling. ----------

export const NEON_CEILINGS: Record<string, Make> = {
  c_neon_ring: (_c, bag) => {
    const g = new THREE.Group();
    const top = ROOM.floor + ROOM.wallH;
    const ring = (r: number, color: string, z: number) => {
      const m = new THREE.Mesh(bag.keep(new THREE.TorusGeometry(r, 0.16, 8, 64)), bag.keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.3), toneMapped: false })));
      m.position.z = z;
      g.add(m);
    };
    ring(6, '#3ad8ff', top - 3);
    ring(4.4, '#ff3aa8', top - 3.6);
    for (const x of [-4.2, 4.2]) {
      const wire = mesh(new THREE.CylinderGeometry(0.03, 0.03, 3, 4), std(bag, { color: '#222' }), bag, [x, 0, top - 1.5]);
      wire.rotation.x = Math.PI / 2;
      g.add(wire);
    }
    const a = new THREE.PointLight('#3ad8ff', 14, 40, 1.7);
    a.position.set(0, 0, top - 5);
    const b = new THREE.PointLight('#ff3aa8', 10, 34, 1.7);
    b.position.set(0, 0, top - 6);
    g.add(a, b);
    return { root: g, update: (t) => (g.rotation.z = t * 0.05) };
  },
};
