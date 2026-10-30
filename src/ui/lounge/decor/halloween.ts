import * as THREE from 'three';
import { Bag, DecorContext, flame, modelPiece, type ModelFit } from './kit';
import type { Built } from './tables';

/**
 * Halloween (sold only around it, src/data/lounge.ts): a carved pumpkin with a candle in it (Kay
 * Lousberg's KayKit, CC0).
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

export const HALLOWEEN: Record<string, Make> = {
  tr_jackolantern: onTable('ext/jackolantern.glb', { height: 3.4, turn: 0.4 }, 1.6),
};
