import * as THREE from 'three';
import { DEFAULT_ROOM, SLOTS, type RoomLayout, type SlotId } from '@/data/lounge';
import crownArt from '@/assets/cinematics/world_crown_isle.webp';
import dragonArt from '@/assets/cinematics/inf_wyrm_hall.webp';
import battleArt from '@/assets/cinematics/inf_legions.webp';
import aetherArt from '@/assets/cinematics/world_aether.webp';
import heavenArt from '@/assets/cinematics/hv_celestial_city.webp';
import throneArt from '@/assets/cinematics/inf_throne_room.webp';
import innArt from '@/assets/cinematics/inn_2.webp';
import chapelArt from '@/assets/cinematics/lamp_chapel.webp';
import cathedralArt from '@/assets/cinematics/bs_cathedral.webp';
import gladeArt from '@/assets/cinematics/aethra_glade.webp';
import { getCard } from '@/data/cards';
import { cardArtUri } from '@/ui/components/cardArt';
import { Bag, ROOM, TRINKET_X, type DecorContext, type Limit } from './kit';
import { TABLES, type Built } from './tables';
import { FLOORS, RUGS, WALLS } from './surfaces';
import { LIGHTS, PAINTINGS, POSTERS } from './wall';
import { FURNITURE } from './furniture';
import { CEILINGS } from './ceiling';
import { TRINKETS } from './trinkets';
import { DOORS } from './doors';
import { ROOFS } from './roofs';
import { SHAPED_TABLES } from './shapedTables';
import { NEON_CEILINGS, NEON_LIGHTS, NEON_SIGNS } from './neon';
import { LIVING } from './living';
import { WINDOWS } from './views';
import { HALLOWEEN } from './halloween';

/**
 * The room's decor from a layout: one piece per slot, each in its place. Used around the 3D table and
 * in the Lounge (which swaps single slots as the player furnishes).
 */

type Make = (ctx: DecorContext, bag: Bag) => Built;
const BUILDERS: Record<string, Make> = { ...TABLES, ...SHAPED_TABLES, ...FLOORS, ...WALLS, ...RUGS, ...PAINTINGS, ...POSTERS, ...LIGHTS, ...FURNITURE, ...CEILINGS, ...TRINKETS, ...DOORS, ...ROOFS, ...NEON_SIGNS, ...NEON_LIGHTS, ...NEON_CEILINGS, ...LIVING, ...WINDOWS, ...HALLOWEEN };

/** Every catalogue id has a builder (checked by a test). */
export const hasBuilder = (id: string) => id in BUILDERS;

/**
 * Where each placed piece stands (world), which way its front faces (a turn about z; 0 faces -y, towards
 * the player's seat), and the most room it may take, so nothing runs into a wall or another slot:
 * - back wall: the painting in the middle, a piece of furniture either side, backs to the wall;
 * - side walls: furniture towards the player's end, the light in the middle, a wall piece beyond it;
 * - front wall (behind the player): the door;
 * - the table's short sides: small things, facing the player.
 */
const WALL_GAP = 0.25;
const FLOOR_ITEM = { w: 22, d: 13, h: 28 };
const SIDE_ITEM = { w: 16, d: 13, h: 28 };
/** Between the board's edge and the table's (about 4.3 wide), with a little room either side. */
const TRINKET = { w: 3.8, d: 4.5, h: 7 };
export const SLOT_PLACE: Partial<Record<SlotId, { at: THREE.Vector3; face: number; limit?: Limit }>> = {
  tableLeft: { at: new THREE.Vector3(-TRINKET_X, -0.5, 0), face: 0, limit: TRINKET },
  tableRight: { at: new THREE.Vector3(TRINKET_X, -0.5, 0), face: 0, limit: TRINKET },
  painting: { at: new THREE.Vector3(0, ROOM.y, 13), face: 0, limit: { w: 20, d: 2, h: 12 } },
  posterLeft: { at: new THREE.Vector3(-ROOM.x, 13, 12), face: Math.PI / 2, limit: { w: 12, d: 3, h: 16 } },
  posterRight: { at: new THREE.Vector3(ROOM.x, 13, 12), face: -Math.PI / 2, limit: { w: 12, d: 3, h: 16 } },
  furnBackLeft: { at: new THREE.Vector3(-21, ROOM.y - WALL_GAP, ROOM.floor), face: 0, limit: FLOOR_ITEM },
  furnBackRight: { at: new THREE.Vector3(21, ROOM.y - WALL_GAP, ROOM.floor), face: 0, limit: FLOOR_ITEM },
  furnLeft: { at: new THREE.Vector3(-ROOM.x + WALL_GAP, -14, ROOM.floor), face: Math.PI / 2, limit: SIDE_ITEM },
  furnRight: { at: new THREE.Vector3(ROOM.x - WALL_GAP, -14, ROOM.floor), face: -Math.PI / 2, limit: SIDE_ITEM },
  door: { at: new THREE.Vector3(0, -ROOM.y + WALL_GAP, ROOM.floor), face: Math.PI, limit: { w: 22, d: 3, h: 28 } },
  ceiling: { at: new THREE.Vector3(0, 0, 0), face: 0, limit: { w: 12, d: 12, h: 9 } },
};

/** Where the Lounge pins each slot's marker. */
export const SLOT_ANCHOR: Record<SlotId, THREE.Vector3> = {
  table: new THREE.Vector3(-8, -6.5, 0.6),
  tableLeft: new THREE.Vector3(-TRINKET_X, -0.5, 4),
  tableRight: new THREE.Vector3(TRINKET_X, -0.5, 4),
  rug: new THREE.Vector3(13, -9.5, ROOM.floor + 0.2),
  floor: new THREE.Vector3(-20, -20, ROOM.floor + 0.2),
  walls: new THREE.Vector3(26, ROOM.y - 0.3, 20),
  painting: new THREE.Vector3(0, ROOM.y - 0.6, 13),
  posterLeft: new THREE.Vector3(-ROOM.x + 0.6, 13, 12),
  posterRight: new THREE.Vector3(ROOM.x - 0.6, 13, 12),
  lights: new THREE.Vector3(-ROOM.x + 1.5, 0, 9),
  furnBackLeft: new THREE.Vector3(-21, ROOM.y - 5, ROOM.floor + 16),
  furnBackRight: new THREE.Vector3(21, ROOM.y - 5, ROOM.floor + 16),
  furnLeft: new THREE.Vector3(-ROOM.x + 5, -14, ROOM.floor + 15),
  furnRight: new THREE.Vector3(ROOM.x - 5, -14, ROOM.floor + 15),
  door: new THREE.Vector3(0, -ROOM.y + 1, ROOM.floor + 14),
  ceiling: new THREE.Vector3(0, 0, 19),
  roof: new THREE.Vector3(-16, 12, ROOM.floor + ROOM.wallH - 0.4),
};

/** Pictures the paintings and posters may hang. */
const ART: Record<string, string> = { crown: crownArt, dragon: dragonArt, battle: battleArt, aether: aetherArt, heaven: heavenArt, throne: throneArt, inn: innArt, chapel: chapelArt, cathedral: cathedralArt, glade: gladeArt };
export function decorArt(key: string): string | undefined {
  if (ART[key]) return ART[key];
  if (key === 'abandoneer') {
    const c = getCard('neu_captain_abandoneer');
    return c ? cardArtUri(c) : undefined;
  }
  if (key === 'legend') {
    const c = getCard('emb_pyraxis_ashen_sovereign');
    return c ? cardArtUri(c) : undefined;
  }
  return undefined;
}

/** The wall a slot's piece stands against: when the camera is behind that wall (it then does not draw, being one-sided), the piece hides too. */
const SLOT_WALL: Partial<Record<SlotId, 'front' | 'back' | 'left' | 'right' | 'sides'>> = {
  door: 'front',
  painting: 'back',
  furnBackLeft: 'back',
  furnBackRight: 'back',
  posterLeft: 'left',
  furnLeft: 'left',
  posterRight: 'right',
  furnRight: 'right',
  lights: 'sides',
};
const behind = (wall: 'front' | 'back' | 'left' | 'right', p: THREE.Vector3) =>
  wall === 'front' ? p.y < -ROOM.y : wall === 'back' ? p.y > ROOM.y : wall === 'left' ? p.x < -ROOM.x : p.x > ROOM.x;

export interface RoomDecor {
  update(t: number, dt: number): void;
  /** Hides the pieces on the walls the camera is behind (as the walls themselves are). */
  cull(camera: THREE.Vector3): void;
  /** Puts another piece (or nothing) in one slot. */
  set(slot: SlotId, id: string | null): void;
  /** The objects standing in a slot (for highlighting in the Lounge). */
  objects(slot: SlotId): THREE.Object3D | null;
  /** The pieces that answer a click (to aim at). */
  clickable(): THREE.Object3D[];
  /** A click landed on `obj` at `at`: its piece answers (true) or nothing does. */
  click(obj: THREE.Object3D, at: THREE.Vector3): boolean;
  /** The music a piece plays now (the first that plays any), or null. */
  track(): string | null;
  /** The owner's faction or info changed (a new framed card…): every piece is built again with it. */
  setOwner(owner: Pick<DecorContext, 'faction' | 'info'>): void;
  dispose(): void;
}

export function buildRoomDecor(scene: THREE.Scene, layout: RoomLayout, ctx: DecorContext): RoomDecor {
  let context = ctx;
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
      built = make({ ...context, limit: SLOT_PLACE[slot]?.limit, mirror: slot === 'tableRight' }, bag);
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
    cull: (cam) =>
      placed.forEach((p, slot) => {
        const wall = SLOT_WALL[slot];
        if (!wall) return;
        // The lights stand on both side walls: each one goes with its own wall.
        if (wall === 'sides') {
          const spots = p.built.root.children;
          for (const c of spots) c.visible = !behind(c.position.x < 0 ? 'left' : 'right', cam);
          return;
        }
        p.built.root.visible = !behind(wall, cam);
      }),
    set: (slot, id) => put(slot, id ?? DEFAULT_ROOM[slot]),
    objects: (slot) => placed.get(slot)?.built.root ?? null,
    clickable: () => [...placed.values()].filter((p) => p.built.click).map((p) => p.built.root),
    click: (obj, at) => {
      for (const p of placed.values()) {
        if (!p.built.click) continue;
        for (let o: THREE.Object3D | null = obj; o; o = o.parent)
          if (o === p.built.root) {
            p.built.click(at);
            return true;
          }
      }
      return false;
    },
    setOwner: (owner) => {
      context = { ...context, ...owner };
      for (const [slot, p] of [...placed]) put(slot, p.id);
    },
    track: () => {
      for (const p of placed.values()) {
        const t = p.built.track?.();
        if (t) return t;
      }
      return null;
    },
    dispose: () => {
      placed.forEach((p) => {
        scene.remove(p.built.root);
        p.bag.dispose();
      });
      placed.clear();
    },
  };
}
