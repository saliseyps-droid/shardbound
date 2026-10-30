import * as THREE from 'three';
import { Bag, DecorContext, marbleTexture, mesh, modelPiece, std, type ModelFit } from './kit';
import type { Built } from './tables';

/**
 * Furniture: models at their real size against the table (all CC0: Poly Haven, Quaternius' Fantasy
 * Props). Each stands with its back to its slot's wall and its front to the
 * room, shrunk only when it would not fit the slot (ctx.limit).
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

const model = (id: string, fit: ModelFit = {}): Make => (ctx, bag) => ({ root: modelPiece(bag, id, { ...fit, anchor: 'back', max: ctx.limit }) });

/** A model with a light of its own (a flame, a brew): colour, strength, where it shines from. */
const lit = (id: string, fit: ModelFit, color: number, power: number, at: [number, number, number]): Make => (ctx, bag) => {
  const g = new THREE.Group();
  g.add(modelPiece(bag, id, { ...fit, anchor: 'back', max: ctx.limit }));
  const light = new THREE.PointLight(color, power, 18, 1.8);
  light.position.set(...at);
  g.add(light);
  return { root: g, update: (t) => (light.intensity = power * (1 + Math.sin(t * 7) * 0.08 + Math.sin(t * 13) * 0.05)) };
};

/** A small piece raised on a marble plinth (a bust, a figure), standing out from the wall. */
const onPlinth = (id: string, fit: ModelFit, plinthH = 9): Make => (_c, bag) => {
  const g = new THREE.Group();
  const marble = std(bag, { map: bag.keep(marbleTexture('#e4ddd2', '#a8a094', undefined, 401)), roughness: 0.35 });
  g.add(mesh(new THREE.BoxGeometry(4.2, 4.2, 0.6), marble, bag, [0, 0, 0.3]));
  g.add(mesh(new THREE.BoxGeometry(3.2, 3.2, plinthH - 1.2), marble, bag, [0, 0, plinthH / 2]));
  g.add(mesh(new THREE.BoxGeometry(4, 4, 0.6), marble, bag, [0, 0, plinthH - 0.3]));
  const m = modelPiece(bag, id, fit);
  m.position.z = plinthH;
  g.add(m);
  g.position.y = -2.6;
  return { root: g };
};

export const FURNITURE: Record<string, Make> = {
  fu_chest: model('treasure_chest'),
  fu_barrels: (_c, bag) => {
    // Three barrels: two side by side, one on top of them, against the wall.
    const g = new THREE.Group();
    const at: [string, number, number, number, number][] = [['qk/Barrel', -3.9, 0, 0, 0.3], ['qk/Barrel', 3.9, 0.4, 0, 1.2], ['qk/Barrel', 0, 0.2, 9.4, 2.1]];
    for (const [id, x, y, z, turn] of at) {
      const b = modelPiece(bag, id, { turn, scale: 0.82 });
      b.position.set(x, y, z);
      g.add(b);
    }
    g.position.y = -4.9;
    return { root: g };
  },
  fu_plant: model('potted_plant_02', { scale: 1.3 }),
  fu_statue: model('gothic_statue'),
  fu_commode: model('GothicCommode_01'),
  fu_bust: onPlinth('marble_bust_01', { scale: 1.2 }),
  fu_horse: onPlinth('horse_statue_01', { scale: 3.5 }),
  fu_cannon: model('cannon_01', { turn: Math.PI / 2 }),
  fu_armchair: model('ArmChair_01'),
  fu_rocking: model('Rockingchair_01'),
  fu_spinning: model('spinning_wheel_01', { turn: 1.3 }),
  // Fantasy (Quaternius).
  fu_dummy: model('qk/Dummy'),
  fu_candelabra: lit('qk/CandleStick_Stand', {}, 0xffc27a, 12, [0, -4, 16]),
  // Modern (Poly Haven).
  fu_modern_chair: model('modern_arm_chair_01'),
  // Bigger than life (the room is seen from afar), and allowed a little past its slot's width.
  fu_sofa: (ctx, bag) => ({ root: modelPiece(bag, 'sofa_02', { scale: 1.45, anchor: 'back', max: ctx.limit && { ...ctx.limit, w: ctx.limit.w + 8 } }) }),
  fu_steel_shelf: model('steel_frame_shelves_02'),
};
