import * as THREE from 'three';
import { Bag, DecorContext, modelPiece, type ModelFit } from './kit';
import type { Built } from './tables';

/**
 * Small things on the table's short sides (models from Poly Haven, CC0), at their real size beside the
 * board. A lamp brings a small flame: dim, so it never glares on the cards.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

/** A little smaller than life, so they stay beside the board. */
const SIZE = 0.65;
const small = (id: string, fit: ModelFit = {}): Make => (_c, bag) => ({ root: modelPiece(bag, id, { ...fit, scale: (fit.scale ?? 1) * SIZE }) });

const lamp = (id: string, fit: ModelFit, flameAt: number): Make => (_c, bag) => {
  const g = new THREE.Group();
  g.add(modelPiece(bag, id, { ...fit, scale: (fit.scale ?? 1) * SIZE }));
  const light = new THREE.PointLight(0xffb35a, 3, 7, 1.8);
  light.position.set(0, 0, flameAt);
  g.add(light);
  return { root: g, update: (t) => (light.intensity = 3 * (1 + Math.sin(t * 11) * 0.12 + Math.sin(t * 23) * 0.08)) };
};

export const TRINKETS: Record<string, Make> = {
  tr_jug: small('jug_01'),
  tr_bowl: small('wooden_bowl_01'),
  tr_magnifier: small('magnifying_glass_01', { turn: 0.6 }),
  tr_goblets: small('brass_goblets'),
  tr_vase: small('antique_ceramic_vase_01'),
  tr_vase_brass: small('brass_vase_01'),
  tr_elephant: small('carved_wooden_elephant', { turn: 0.5 }),
  tr_books: small('book_encyclopedia_set_01', { scale: 0.8 }),
  tr_oil_lamp: lamp('vintage_oil_lamp', {}, 3),
  tr_tea: small('tea_set_01', { scale: 0.8 }),
  tr_clock: small('mantel_clock_01'),
  tr_lamp: lamp('brass_diya_lantern', {}, 1.5),
  tr_compass: small('seadogs_compass', { scale: 1.5 }),
  tr_horse: small('horse_statue_01', { scale: 1.3, turn: -0.5 }),
};
