import * as THREE from 'three';
import { Bag, DecorContext, ROOM, animatedPiece, flame, modelPiece, type ModelFit } from './kit';
import type { Built } from './tables';
import { dotTexture } from './ambience';

/**
 * Halloween (sold only around it, src/data/lounge.ts): carved pumpkins, a skull candle, a bubbling
 * cauldron, bats under the ceiling and ghosts drifting through the room. Models: Kay Lousberg's
 * KayKit, Kenney's Graveyard Kit, Quaternius, Armory_3D (all CC0).
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

/** A small flame's light, flickering. */
function candle(g: THREE.Object3D, at: [number, number, number], color: number, base: number, reach: number, seed: number) {
  const light = new THREE.PointLight(color, base, reach, 1.8);
  light.position.set(...at);
  g.add(light);
  return flame(light, base, seed);
}

/** On the table: a little smaller than life, turned to the board from either side (as trinkets.ts). */
const onTable = (id: string, fit: ModelFit, flameAt: number, color = 0xff8a2a): Make => (ctx, bag) => {
  const g = new THREE.Group();
  g.add(modelPiece(bag, id, { ...fit, turn: (fit.turn ?? 0) * (ctx.mirror ? -1 : 1), max: ctx.limit }));
  const flick = candle(g, [0, 0, flameAt], color, 4, 9, 1);
  return { root: g, update: (t) => flick(t) };
};

/** Carved pumpkins and candles heaped in a corner, glowing. */
const pumpkins: Make = (_c, bag) => {
  const g = new THREE.Group();
  const k = (n: string) => `ext/kenney/${n}.glb`;
  const put: [string, number, number, number, number][] = [
    [k('pumpkin-carved'), -4, -2, 4.5, 0.15],
    [k('pumpkin-tall-carved'), 3.5, -1.5, 5.5, -0.15],
    [k('pumpkin'), 0, -6, 3.2, 1],
    [k('pumpkin-carved'), 6, -6.5, 3.4, -0.3],
    [k('candle-multiple'), -6.5, -7, 2.2, 0],
    [k('lantern-candle'), -1, -2, 4.5, 0],
  ];
  for (const [id, x, y, h, turn] of put) {
    const p = modelPiece(bag, id, { height: h, turn });
    p.position.set(x, y, 0);
    g.add(p);
  }
  const flicks = [candle(g, [-4, -4, 2.2], 0xff7a1a, 7, 14, 0), candle(g, [3.5, -3.5, 2.6], 0xff7a1a, 7, 14, 2), candle(g, [-6.5, -7, 3], 0xffb050, 4, 10, 4)];
  return { root: g, update: (t) => flicks.forEach((f) => f(t)) };
};

/** A witch's cauldron with a green brew: a glow and bubbles rising off it. */
const cauldron: Make = (ctx, bag) => {
  const g = new THREE.Group();
  g.add(modelPiece(bag, 'ext/cauldron.glb', { height: 9, anchor: 'back', max: ctx.limit }));
  const glow = new THREE.PointLight(0x5aff4a, 10, 20, 1.6);
  glow.position.set(0, -5, 10);
  g.add(glow);
  const n = 40;
  const pos = new Float32Array(n * 3);
  const geo = bag.keep(new THREE.BufferGeometry());
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const bubbles = new THREE.Points(geo, bag.keep(new THREE.PointsMaterial({ map: dotTexture(), color: '#8aff6a', size: 0.7, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })));
  bubbles.frustumCulled = false;
  g.add(bubbles);
  const seeds = Array.from({ length: n }, (_, i) => [Math.sin(i * 12.9) * 2.2, Math.cos(i * 7.3) * 1.6, (i * 0.37) % 1] as const);
  return {
    root: g,
    update: (t) => {
      seeds.forEach(([x, y, p], i) => {
        const k = (t * 0.35 + p) % 1;
        pos.set([x * (1 - k * 0.4) + Math.sin(t * 2 + i) * 0.2, -5 + y * 0.8, 7 + k * 5], i * 3);
      });
      geo.attributes.position.needsUpdate = true;
      glow.intensity = 10 * (0.85 + Math.sin(t * 3.1) * 0.1 + Math.sin(t * 7.7) * 0.05);
    },
  };
};

/** Bats (Quaternius, CC0) wheeling under the ceiling round the room. */
const bats: Make = (_c, bag) => {
  const g = new THREE.Group();
  const top = ROOM.floor + ROOM.wallH;
  const flock = Array.from({ length: 6 }, (_, i) => {
    const bat = animatedPiece(bag, 'ext/bat.glb', { height: 3.6 }, 'Bat_Flying');
    const holder = new THREE.Group();
    holder.add(bat.root);
    g.add(holder);
    return { bat, holder, r: 10 + (i % 3) * 5, speed: 0.35 + (i % 2) * 0.15, phase: (i / 6) * Math.PI * 2, z: top - 8 - (i % 3) * 2.5 };
  });
  // A cold light up there, so they show against the dark ceiling.
  const moon = new THREE.PointLight(0x9a7aff, 10, 40, 1.4);
  moon.position.set(0, 0, top - 3);
  g.add(moon);
  return {
    root: g,
    update: (t, dt) =>
      flock.forEach((b) => {
        const a = b.phase + t * b.speed;
        b.holder.position.set(Math.cos(a) * b.r * 1.3, Math.sin(a) * b.r, b.z + Math.sin(t * 2 + b.phase) * 0.8);
        // Facing where it flies (a model looks down -y once stood up).
        b.holder.rotation.z = Math.atan2(Math.cos(a), -1.3 * Math.sin(a)) + Math.PI / 2;
        b.bat.update(dt);
      }),
  };
};

/** Two little ghosts (Kenney, CC0) drifting slowly about the room, see-through. */
const ghosts: Make = (_c, bag) => {
  const g = new THREE.Group();
  const pale = bag.keep(new THREE.MeshStandardMaterial({ color: '#e8f0ff', emissive: '#6a80b0', emissiveIntensity: 0.6, transparent: true, opacity: 0.55, depthWrite: false }));
  const pair = [0, 1].map((i) => {
    const ghost = animatedPiece(bag, 'ext/kenney/character-ghost.glb', { height: 6, tweak: (m) => (m.material = pale) }, 'idle');
    const holder = new THREE.Group();
    holder.add(ghost.root);
    g.add(holder);
    return { ghost, holder, phase: i * Math.PI, r: 20 + i * 4 };
  });
  return {
    root: g,
    update: (t, dt) =>
      pair.forEach((p) => {
        const a = p.phase + t * 0.08;
        p.holder.position.set(Math.cos(a) * p.r * 1.2, Math.sin(a * 1.3) * p.r * 0.8, ROOM.floor + 5 + Math.sin(t * 0.9 + p.phase) * 1.5);
        p.holder.rotation.z = Math.atan2(1.3 * 0.8 * Math.cos(a * 1.3), -1.2 * Math.sin(a)) + Math.PI / 2;
        p.ghost.update(dt);
      }),
  };
};

export const HALLOWEEN: Record<string, Make> = {
  tr_jackolantern: onTable('ext/jackolantern.glb', { height: 3.4, turn: 0.4 }, 1.6),
  tr_skull_candle: onTable('ext/skull_candle.glb', { height: 3.6, turn: 0.5 }, 3.4, 0xffb050),
  fu_pumpkins: pumpkins,
  fu_cauldron: cauldron,
  c_bats: bats,
  a_ghosts: ghosts,
};
