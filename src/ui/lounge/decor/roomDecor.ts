import * as THREE from 'three';
import { DEFAULT_ROOM, SLOTS, type RoomLayout, type SlotId } from '@/data/lounge';
import crownArt from '@/assets/cinematics/world_crown_isle.webp';
import dragonArt from '@/assets/cinematics/inf_wyrm_hall.webp';
import battleArt from '@/assets/cinematics/inf_legions.webp';
import { getCard } from '@/data/cards';
import { cardArtUri } from '@/ui/components/cardArt';
import { Bag, ROOM, type DecorContext } from './kit';
import { TABLES, type Built } from './tables';
import { FLOORS, RUGS, WALLS } from './surfaces';
import { LIGHTS, PAINTINGS, POSTERS } from './wall';
import { FURNITURE } from './furniture';
import { CEILINGS } from './ceiling';

/**
 * The room's decor from a layout: one piece per slot, each in its place. Used around the 3D table and
 * in the Lounge (which swaps single slots as the player furnishes).
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;
const BUILDERS: Record<string, Make> = { ...TABLES, ...FLOORS, ...WALLS, ...RUGS, ...PAINTINGS, ...POSTERS, ...LIGHTS, ...FURNITURE, ...CEILINGS };

/** Every catalogue id has a builder (checked by a test). */
export const hasBuilder = (id: string) => id in BUILDERS;

/** Where a wall or floor piece stands (world) and which way its front faces (turn about z). */
const furn = (x: number, y: number) => ({ at: new THREE.Vector3(x, y, ROOM.floor), face: Math.atan2(-x, y) });
export const SLOT_PLACE: Partial<Record<SlotId, { at: THREE.Vector3; face: number }>> = {
  painting: { at: new THREE.Vector3(0, ROOM.y, 12), face: 0 },
  posterLeft: { at: new THREE.Vector3(-ROOM.x, 8, 11), face: Math.PI / 2 },
  posterRight: { at: new THREE.Vector3(ROOM.x, 8, 11), face: -Math.PI / 2 },
  furnBackLeft: furn(-ROOM.x + 5, ROOM.y - 5),
  furnBackRight: furn(ROOM.x - 5, ROOM.y - 5),
  furnLeft: { at: new THREE.Vector3(-ROOM.x + 4, -10, ROOM.floor), face: Math.PI / 2 },
  furnRight: { at: new THREE.Vector3(ROOM.x - 4, -10, ROOM.floor), face: -Math.PI / 2 },
};

/** Where the Lounge pins each slot's marker. */
export const SLOT_ANCHOR: Record<SlotId, THREE.Vector3> = {
  table: new THREE.Vector3(-8, -6.5, 0.6),
  rug: new THREE.Vector3(13, -9.5, ROOM.floor + 0.2),
  floor: new THREE.Vector3(-20, -20, ROOM.floor + 0.2),
  walls: new THREE.Vector3(18, ROOM.y - 0.3, 20),
  painting: new THREE.Vector3(0, ROOM.y - 0.6, 12),
  posterLeft: new THREE.Vector3(-ROOM.x + 0.6, 8, 11),
  posterRight: new THREE.Vector3(ROOM.x - 0.6, 8, 11),
  lights: new THREE.Vector3(-ROOM.x + 1.5, -6, 9),
  furnBackLeft: new THREE.Vector3(-ROOM.x + 5, ROOM.y - 5, ROOM.floor + 16),
  furnBackRight: new THREE.Vector3(ROOM.x - 5, ROOM.y - 5, ROOM.floor + 16),
  furnLeft: new THREE.Vector3(-ROOM.x + 4, -10, ROOM.floor + 15),
  furnRight: new THREE.Vector3(ROOM.x - 4, -10, ROOM.floor + 15),
  ceiling: new THREE.Vector3(0, 0, 19),
};

/** Pictures the paintings and posters may hang. */
export function decorArt(key: 'crown' | 'dragon' | 'battle' | 'legend' | 'map'): string | undefined {
  if (key === 'crown') return crownArt;
  if (key === 'dragon') return dragonArt;
  if (key === 'battle') return battleArt;
  if (key === 'legend') {
    const c = getCard('emb_pyraxis_ashen_sovereign');
    return c ? cardArtUri(c) : undefined;
  }
  return undefined;
}

export interface RoomDecor {
  update(t: number, dt: number): void;
  /** Puts another piece (or nothing) in one slot. */
  set(slot: SlotId, id: string | null): void;
  /** The objects standing in a slot (for highlighting in the Lounge). */
  objects(slot: SlotId): THREE.Object3D | null;
  dispose(): void;
}

export function buildRoomDecor(scene: THREE.Scene, layout: RoomLayout, ctx: DecorContext): RoomDecor {
  const placed = new Map<SlotId, { built: Built; bag: Bag; id: string }>();

  const put = (slot: SlotId, id: string | null) => {
    const old = placed.get(slot);
    if (old) {
      scene.remove(old.built.root);
      old.bag.dispose();
      placed.delete(slot);
    }
    const make = id ? BUILDERS[id] : undefined;
    if (!id || !make) return;
    const bag = new Bag();
    let built: Built;
    try {
      built = make(ctx, bag);
    } catch (e) {
      // A piece that fails to build is left out (or the slot's default stands in): never the whole table.
      bag.dispose();
      console.warn(`Lounge: could not build ${id}`, e);
      if (id !== DEFAULT_ROOM[slot]) put(slot, DEFAULT_ROOM[slot]);
      return;
    }
    const place = SLOT_PLACE[slot];
    if (place) {
      const holder = new THREE.Group();
      holder.position.copy(place.at);
      holder.rotation.z = place.face;
      holder.add(built.root);
      built.root = holder;
    }
    scene.add(built.root);
    placed.set(slot, { built, bag, id });
  };

  for (const slot of SLOTS) {
    // A slot that must hold a piece but whose piece cannot be built shows the default.
    const id = layout[slot] ?? DEFAULT_ROOM[slot];
    put(slot, id && BUILDERS[id] ? id : DEFAULT_ROOM[slot]);
  }

  return {
    update: (t, dt) => placed.forEach((p) => p.built.update?.(t, dt)),
    set: (slot, id) => put(slot, id ?? DEFAULT_ROOM[slot]),
    objects: (slot) => placed.get(slot)?.built.root ?? null,
    dispose: () => {
      placed.forEach((p) => {
        scene.remove(p.built.root);
        p.bag.dispose();
      });
      placed.clear();
    },
  };
}
