import * as THREE from 'three';
import { Bag, DecorContext, marbleTexture, mesh, modelPiece, std, type ModelFit } from './kit';
import type { Built } from './tables';

/**
 * Furniture: real models (Poly Haven, CC0, public/decor) at their real size against the table, their
 * front facing -y; the room stands each in a slot on the floor, turned towards the table.
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;

const model = (id: string, fit: ModelFit = {}): Make => (_c, bag) => ({ root: modelPiece(bag, id, fit) });

/** A small piece raised on a marble plinth (a bust, a figure). */
const onPlinth = (id: string, fit: ModelFit, plinthH = 9): Make => (_c, bag) => {
  const g = new THREE.Group();
  const marble = std(bag, { map: bag.keep(marbleTexture('#e4ddd2', '#a8a094', undefined, 401)), roughness: 0.35 });
  g.add(mesh(new THREE.BoxGeometry(4.2, 4.2, 0.6), marble, bag, [0, 0, 0.3]));
  g.add(mesh(new THREE.BoxGeometry(3.2, 3.2, plinthH - 1.2), marble, bag, [0, 0, plinthH / 2]));
  g.add(mesh(new THREE.BoxGeometry(4, 4, 0.6), marble, bag, [0, 0, plinthH - 0.3]));
  const m = modelPiece(bag, id, fit);
  m.position.z = plinthH;
  g.add(m);
  return { root: g };
};

export const FURNITURE: Record<string, Make> = {
  fu_bookshelf: model('wooden_bookshelf_worn'),
  fu_chest: model('treasure_chest'),
  fu_barrels: (_c, bag) => {
    // Three barrels: two side by side, one on top of them.
    const g = new THREE.Group();
    const at: [string, number, number, number, number][] = [['Barrel_01', -3.6, 0, 0, 0.3], ['Barrel_02', 3.4, 0.4, 0, 1.2], ['Barrel_01', 0, 0.2, 10.6, 2.1]];
    for (const [id, x, y, z, turn] of at) {
      const b = modelPiece(bag, id, { turn });
      b.position.set(x, y, z);
      g.add(b);
    }
    return { root: g };
  },
  fu_wine: model('wine_barrel_01'),
  fu_crates: model('wooden_crate_02'),
  fu_plant: model('potted_plant_02', { scale: 1.3 }),
  fu_statue: model('gothic_statue'),
  fu_cabinet: model('GothicCabinet_01', { scale: 0.85 }),
  fu_commode: model('GothicCommode_01'),
  fu_bust: onPlinth('marble_bust_01', { scale: 1.2 }),
  fu_horse: onPlinth('horse_statue_01', { scale: 3.5 }),
  fu_cannon: model('cannon_01'),
  fu_armchair: model('ArmChair_01'),
  fu_rocking: model('Rockingchair_01'),
  fu_stove: model('scandinavian_masonry_heater'),
  fu_spinning: model('spinning_wheel_01'),
};
