import * as THREE from 'three';
import { Bag, DecorContext, ROOM, modelPiece, type ModelFit } from './kit';
import type { Built } from './tables';

/**
 * Hung from the ceiling over the table (models from Poly Haven, CC0): no lower than z ≈ 17, so they
 * stay above the match camera's view of the board, with a warm light of their own.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;
const CEIL = ROOM.floor + ROOM.wallH;

const hanging = (id: string, fit: ModelFit, color = 0xffc27a, power = 30): Make => (_c, bag) => {
  const g = new THREE.Group();
  const m = modelPiece(bag, id, { ...fit, mount: 'hang' });
  m.position.z = CEIL;
  const light = new THREE.PointLight(color, power, 44, 1.6);
  light.position.set(0, 0, CEIL - (fit.height ?? 6) + 1);
  g.add(m, light);
  return { root: g, update: (t) => (light.intensity = power * (1 + Math.sin(t * 9) * 0.05 + Math.sin(t * 17) * 0.03)) };
};

export const CEILINGS: Record<string, Make> = {
  c_lantern: hanging('lantern_chandelier_01', { height: 8 }),
  c_chandelier: hanging('Chandelier_01', { height: 7 }, 0xffc27a, 34),
  c_chandelier_brass: hanging('Chandelier_02', { height: 6 }),
  c_chandelier_crystal: hanging('Chandelier_03', { height: 7 }, 0xfff0d8, 32),
  c_candle_ring: hanging('qk/Chandelier', { height: 8 }, 0xffc27a, 34),
};
