import * as THREE from 'three';
import type { Bag, DecorContext } from './kit';
import { PER_METRE, mesh, modelPiece, std } from './kit';
import { scanned } from './surfaces';
import type { Built } from './tables';

/** The door on the wall behind the player (Poly Haven, CC0): standing on the floor, its back to the wall. */

type Make = (ctx: DecorContext, bag: Bag) => Built;

/** A modern flat door: dark walnut veneer in a black steel frame, a long matte black handle. */
const walnutDoor: Make = (_c, bag) => {
  const g = new THREE.Group();
  const W = 11;
  const H = 25;
  const frame = std(bag, { color: '#141418', metalness: 0.5, roughness: 0.4 });
  const r = 1 / (1 * PER_METRE);
  g.add(mesh(new THREE.BoxGeometry(W, 0.6, H), scanned(bag, 'smoked_walnut_veneer', r * W, r * H, { roughness: 0.6 }, '#5a4434'), bag, [0, -0.3, H / 2]));
  for (const x of [-W / 2 - 0.35, W / 2 + 0.35]) g.add(mesh(new THREE.BoxGeometry(0.7, 0.9, H + 0.7), frame, bag, [x, -0.45, (H + 0.7) / 2]));
  g.add(mesh(new THREE.BoxGeometry(W + 1.4, 0.9, 0.7), frame, bag, [0, -0.45, H + 0.35]));
  g.add(mesh(new THREE.BoxGeometry(0.25, 0.5, 6), std(bag, { color: '#3a3a3e', metalness: 0.3, roughness: 0.75 }), bag, [W / 2 - 1.2, -0.9, H * 0.45]));
  return { root: g };
};

export const DOORS: Record<string, Make> = {
  d_walnut: walnutDoor,
  d_castle: (ctx, bag) => ({ root: modelPiece(bag, 'large_castle_door', { height: 26, anchor: 'back', max: ctx.limit }) }),
};
