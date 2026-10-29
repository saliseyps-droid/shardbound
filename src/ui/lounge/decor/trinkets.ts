import * as THREE from 'three';
import { Bag, DecorContext, modelPiece, type ModelFit } from './kit';
import type { Built } from './tables';

/**
 * Small things on the table's short sides, facing the player (CC0 models: Poly Haven, Quaternius,
 * Kenney), a little smaller than life so they stay beside the board, and never bigger than the slot
 * allows. A lamp or candles bring a small flame: dim, so it never glares on the cards.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

/** A little smaller than life, so they stay beside the board. */
const SIZE = 0.65;
/** On the right side of the table a turn is mirrored, so a piece turned to the board faces it from both sides. */
const fitOf = (ctx: DecorContext, fit: ModelFit): ModelFit => ({ ...fit, turn: (fit.turn ?? 0) * (ctx.mirror ? -1 : 1), scale: (fit.scale ?? 1) * SIZE, max: ctx.limit });
const small = (id: string, fit: ModelFit = {}): Make => (ctx, bag) => ({ root: modelPiece(bag, id, fitOf(ctx, fit)) });

const lamp = (id: string, fit: ModelFit, flameAt: number): Make => (ctx, bag) => {
  const g = new THREE.Group();
  g.add(modelPiece(bag, id, fitOf(ctx, fit)));
  const light = new THREE.PointLight(0xffb35a, 3, 7, 1.8);
  light.position.set(0, 0, flameAt);
  g.add(light);
  return { root: g, update: (t) => (light.intensity = 3 * (1 + Math.sin(t * 11) * 0.12 + Math.sin(t * 23) * 0.08)) };
};

export const TRINKETS: Record<string, Make> = {
  tr_goblets: small('brass_goblets'),
  tr_vase: small('antique_ceramic_vase_01'),
  tr_vase_brass: small('brass_vase_01'),
  tr_elephant: small('carved_wooden_elephant', { height: 3.6, turn: 1.2 }),
  tr_compass: small('seadogs_compass', { scale: 1.5, turn: 0.7 }),
  tr_horse: small('horse_statue_01', { height: 3.6, turn: -0.5 }),
  // Fantasy (Quaternius).
  tr_coins_big: small('qk/Coin_Pile_2', { scale: 2 }),
  tr_candles: lamp('qk/CandleStick_Triple', { turn: Math.PI / 2 }, 4),
  tr_book_stack: small('qk/Book_Stack_1', { scale: 1.5, turn: 0.6 }),
  tr_scroll: small('qk/Scroll_1', { scale: 1.8, turn: 0.4 }),
  tr_key: small('qk/Key_Gold', { scale: 3, turn: 0.8 }),
  tr_mug: small('qk/Mug', { scale: 1.3 }),
  // Modern (Poly Haven).
  tr_succulent: small('potted_plant_04', { scale: 2 }),
  tr_tv: small('television_02', { scale: 1.2, turn: Math.PI / 2 }),
  tr_boombox: small('boombox', { turn: Math.PI / 2 }),
};
