import * as THREE from 'three';
import { energyColors } from '@/ui/match/table3d/bodyRules';
import { Bag, DecorContext, ROOM, canvasTexture, rng } from './kit';
import type { Built } from './tables';

/**
 * Something in the room's air: specks that drift, glow and fade (dust in the lamplight, fireflies,
 * embers, sparks in the Warden's colour). Each speck is a soft dot that moves by its own rule;
 * the room keeps them inside its walls.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

/** A soft round dot (white; tinted per speck). */
let dot: THREE.Texture | null = null;
export const dotTexture = () =>
  (dot ??= canvasTexture(64, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.25, 'rgba(255,255,255,0.7)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
  }));

interface Kind {
  count: number;
  /** World size of a speck (it shrinks with distance). */
  size: number;
  colors: string[];
  /** Where the specks live: a box (min/max x, y, z). */
  box: [number, number, number, number, number, number];
  /** Brightness 0–1 at time t for a speck with phase p. */
  glow: (t: number, p: number) => number;
  /** Position of a speck at time t from its start s and phase p. */
  move: (s: THREE.Vector3, t: number, p: number, out: THREE.Vector3) => void;
  additive?: boolean;
}

const wrap = (v: number, lo: number, hi: number) => lo + ((((v - lo) % (hi - lo)) + (hi - lo)) % (hi - lo));
const ROOM_BOX: Kind['box'] = [-ROOM.x + 2, ROOM.x - 2, -ROOM.y + 2, ROOM.y - 2, ROOM.floor + 1, ROOM.floor + ROOM.wallH - 2];

function specks(kind: Kind): Make {
  return (_ctx, bag) => {
    const r = rng(77);
    const [x0, x1, y0, y1, z0, z1] = kind.box;
    const start = Array.from({ length: kind.count }, () => new THREE.Vector3(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), z0 + r() * (z1 - z0)));
    const phase = start.map(() => r() * 100);
    const pos = new Float32Array(kind.count * 3);
    const col = new Float32Array(kind.count * 3);
    const base = start.map((_, i) => new THREE.Color(kind.colors[i % kind.colors.length]));
    const geo = bag.keep(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = bag.keep(
      new THREE.PointsMaterial({
        size: kind.size,
        map: dotTexture(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: kind.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
        toneMapped: false,
        fog: true,
      }),
    );
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    const v = new THREE.Vector3();
    const update = (t: number) => {
      for (let i = 0; i < kind.count; i++) {
        kind.move(start[i], t, phase[i], v);
        pos[i * 3] = wrap(v.x, x0, x1);
        pos[i * 3 + 1] = wrap(v.y, y0, y1);
        pos[i * 3 + 2] = wrap(v.z, z0, z1);
        const k = kind.glow(t, phase[i]);
        col[i * 3] = base[i].r * k;
        col[i * 3 + 1] = base[i].g * k;
        col[i * 3 + 2] = base[i].b * k;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    };
    update(0);
    return { root: points, update };
  };
}

const DUST: Kind = {
  count: 500,
  size: 0.3,
  colors: ['#fff1d6', '#ffe2b0'],
  box: ROOM_BOX,
  glow: (t, p) => 0.35 + 0.25 * Math.sin(t * 0.8 + p),
  move: (s, t, p, o) => o.set(s.x + Math.sin(t * 0.07 + p) * 2.5 + t * 0.15, s.y + Math.cos(t * 0.05 + p * 1.3) * 2.5, s.z + Math.sin(t * 0.09 + p * 0.7) * 1.5 - t * 0.04),
};

const FIREFLIES: Kind = {
  count: 70,
  size: 1.4,
  colors: ['#d8ff6a', '#b8ff4a', '#fff27a'],
  box: [-ROOM.x + 3, ROOM.x - 3, -ROOM.y + 3, ROOM.y - 3, ROOM.floor + 2, ROOM.floor + 22],
  // Each one blinks: a slow pulse that goes dark between glows.
  glow: (t, p) => Math.max(0, Math.sin(t * (0.6 + (p % 1) * 0.6) + p)) ** 3,
  move: (s, t, p, o) => o.set(s.x + Math.sin(t * 0.21 + p) * 5 + Math.sin(t * 0.6 + p * 2) * 1.2, s.y + Math.cos(t * 0.17 + p * 1.7) * 5, s.z + Math.sin(t * 0.3 + p * 0.9) * 2.5),
};

const EMBERS: Kind = {
  count: 160,
  size: 0.6,
  colors: ['#ff8a2a', '#ffb04a', '#ff5a1a'],
  box: ROOM_BOX,
  glow: (t, p) => 0.55 + 0.45 * Math.sin(t * 6 + p * 3),
  // Rising slowly, swaying, and coming round again from the floor.
  move: (s, t, p, o) => o.set(s.x + Math.sin(t * 0.5 + p) * 1.6, s.y + Math.cos(t * 0.4 + p) * 1.6, s.z + t * (1.2 + (p % 1) * 1.4)),
};

/** Sparks in the room owner's colour, circling slowly round the table. */
const sparks = (ctx: DecorContext): Kind => {
  const [tint, deep] = energyColors(ctx.faction);
  return {
    count: 220,
    size: 0.7,
    colors: [tint, deep, '#ffffff'],
    box: ROOM_BOX,
    glow: (t, p) => 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.2 + p * 5)) ** 2,
    move: (s, t, p, o) => {
      const a = Math.atan2(s.y, s.x) + t * (0.05 + (p % 1) * 0.05);
      const rad = Math.hypot(s.x, s.y) * 0.7 + 6;
      o.set(Math.cos(a) * rad, Math.sin(a) * rad * 0.85, s.z + Math.sin(t * 0.4 + p) * 2);
    },
  };
};

export const AMBIENCE: Record<string, Make> = {
  a_dust: specks(DUST),
  a_fireflies: specks(FIREFLIES),
  a_embers: specks(EMBERS),
  a_sparks: (ctx, bag) => specks(sparks(ctx))(ctx, bag),
};
