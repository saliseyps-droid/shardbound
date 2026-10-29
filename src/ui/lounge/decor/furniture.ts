import * as THREE from 'three';
import { Bag, DecorContext, marbleTexture, mesh, modelPiece, std, type ModelFit } from './kit';
import type { Built } from './tables';

/**
 * Furniture: models at their real size against the table (all CC0: Poly Haven, Quaternius' Fantasy
 * Props, Kenney's Mini Arcade). Each stands with its back to its slot's wall and its front to the
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

/** Kenney's arcade machines are toy-sized: 2.4 of their units make about a real machine. */
const ARCADE = 2.4;
const arcade = (name: string, turn = 0) => model(`arcade/${name}.glb`, { scale: ARCADE, turn });

export const FURNITURE: Record<string, Make> = {
  fu_bookshelf: model('wooden_bookshelf_worn'),
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
  fu_wine: model('wine_barrel_01'),
  fu_crates: model('wooden_crate_02', { turn: Math.PI / 2 }),
  fu_plant: model('potted_plant_02', { scale: 1.3 }),
  fu_statue: model('gothic_statue'),
  fu_cabinet: model('GothicCabinet_01'),
  fu_commode: model('GothicCommode_01'),
  fu_bust: onPlinth('marble_bust_01', { scale: 1.2 }),
  fu_horse: onPlinth('horse_statue_01', { scale: 3.5 }),
  fu_cannon: model('cannon_01', { turn: Math.PI / 2 }),
  fu_armchair: model('ArmChair_01'),
  fu_rocking: model('Rockingchair_01'),
  fu_stove: model('scandinavian_masonry_heater'),
  fu_spinning: model('spinning_wheel_01'),
  // Fantasy (Quaternius).
  fu_cauldron: lit('qk/Cauldron', {}, 0x7aff5a, 10, [0, -5, 9]),
  fu_dummy: model('qk/Dummy'),
  fu_lectern: model('qk/BookStand', { turn: Math.PI / 2 }),
  fu_anvil: model('qk/Anvil'),
  fu_bookcase: model('qk/Bookcase_2'),
  fu_candelabra: lit('qk/CandleStick_Stand', {}, 0xffc27a, 12, [0, -4, 16]),
  fu_cage: model('qk/Cage_Small'),
  fu_apples: model('qk/Barrel_Apples'),
  fu_workbench: model('qk/Workbench'),
  fu_wood_chest: model('qk/Chest_Wood'),
  // Modern (Poly Haven).
  fu_lounge_chair: model('mid_century_lounge_chair'),
  fu_modern_chair: model('modern_arm_chair_01'),
  fu_sofa: model('sofa_02'),
  fu_ottoman: model('Ottoman_01'),
  fu_coffee_table: model('modern_coffee_table_02'),
  fu_sideboard: model('modern_wooden_cabinet'),
  fu_steel_shelf: model('steel_frame_shelves_02'),
  // Arcade (Kenney).
  fu_arcade: arcade('arcade-machine'),
  fu_pinball: arcade('pinball'),
  fu_claw: arcade('claw-machine'),
  fu_air_hockey: arcade('air-hockey'),
  fu_prize_wheel: arcade('prize-wheel'),
  fu_slots: arcade('gambling-machine'),
  fu_dance: arcade('dance-machine'),
  fu_hoops: arcade('basketball-game'),
  fu_vending: arcade('vending-machine'),
  fu_tickets: arcade('ticket-machine'),
};
