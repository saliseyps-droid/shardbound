/**
 * The Lounge: the player's game room. Every piece of decor has a fixed slot; a slot takes pieces of
 * one kind (the four furniture slots take any furniture). The room is shown in the Lounge and around
 * the 3D table (against the AI the player's own, online the host's).
 */

export type DecorKind = 'table' | 'trinket' | 'rug' | 'floor' | 'walls' | 'painting' | 'poster' | 'lights' | 'furniture' | 'ceiling';
export type DecorStyle = 'base' | 'general' | 'fantasy' | 'faction';

export const SLOTS = [
  'table',
  'tableLeft',
  'tableRight',
  'rug',
  'floor',
  'walls',
  'painting',
  'posterLeft',
  'posterRight',
  'lights',
  'furnBackLeft',
  'furnBackRight',
  'furnLeft',
  'furnRight',
  'ceiling',
] as const;
export type SlotId = (typeof SLOTS)[number];

export const SLOT_KIND: Record<SlotId, DecorKind> = {
  table: 'table',
  tableLeft: 'trinket',
  tableRight: 'trinket',
  rug: 'rug',
  floor: 'floor',
  walls: 'walls',
  painting: 'painting',
  posterLeft: 'poster',
  posterRight: 'poster',
  lights: 'lights',
  furnBackLeft: 'furniture',
  furnBackRight: 'furniture',
  furnLeft: 'furniture',
  furnRight: 'furniture',
  ceiling: 'ceiling',
};

export const SLOT_NAME: Record<SlotId, string> = {
  table: 'Table',
  tableLeft: 'On the table, left',
  tableRight: 'On the table, right',
  rug: 'Rug',
  floor: 'Floor',
  walls: 'Walls',
  painting: 'Painting',
  posterLeft: 'Left poster',
  posterRight: 'Right poster',
  lights: 'Lights',
  furnBackLeft: 'Back left corner',
  furnBackRight: 'Back right corner',
  furnLeft: 'By the left wall',
  furnRight: 'By the right wall',
  ceiling: 'Ceiling',
};

export interface DecorItem {
  id: string;
  kind: DecorKind;
  name: string;
  description: string;
  style: DecorStyle;
  /** Gold; 0 = a free default everyone owns. */
  price: number;
}

const item = (kind: DecorKind, style: DecorStyle, price: number) => (id: string, name: string, description: string): DecorItem => ({ id, kind, name, description, style, price });

export const DECOR: DecorItem[] = [
  item('table', 'base', 0)('t_tavern', 'Tavern Table', 'Planks on turned legs: the table every Warden starts with.'),
  item('table', 'general', 400)('t_dark_oak', 'Dark Oak', 'Near-black oak with brass corners.'),
  item('table', 'fantasy', 1200)('t_marble', 'Marble Table', 'White marble veined with gold, on column legs.'),
  item('table', 'fantasy', 2500)('t_royal', 'Royal Table', 'Red velvet, gold inlay and carved lion legs.'),
  item('table', 'faction', 1500)('t_cinder', 'Cinder Forge', 'Obsidian split by glowing seams of lava.'),
  item('table', 'faction', 1500)('t_thorn', 'Rootwoven Table', 'Living roots woven into a tabletop, moss on the edges.'),
  item('table', 'faction', 1500)('t_brass', 'Brass Engine', 'Riveted plates and turning gears in the frame.'),
  item('table', 'faction', 1500)('t_rime', 'Rimetide Ice', 'A top of blue ice with bubbles frozen inside.'),
  item('table', 'faction', 1500)('t_lumen', 'Lumen Stone', 'White stone with golden runes that softly glow.'),
  item('table', 'faction', 1500)('t_hollow', 'Bone Table', 'Pale bones with a violet glow beneath the top.'),

  item('trinket', 'general', 100)('tr_jug', 'Jug', 'A clay jug of something to drink.'),
  item('trinket', 'general', 100)('tr_bowl', 'Wooden Bowl', 'A turned wooden bowl.'),
  item('trinket', 'general', 150)('tr_magnifier', 'Magnifying Glass', 'For reading the small print on the cards.'),
  item('trinket', 'general', 200)('tr_goblets', 'Brass Goblets', 'A pair of brass goblets.'),
  item('trinket', 'general', 200)('tr_vase', 'Ceramic Vase', 'An old painted vase.'),
  item('trinket', 'general', 250)('tr_vase_brass', 'Brass Vase', 'A small brass vase.'),
  item('trinket', 'general', 250)('tr_elephant', 'Carved Elephant', 'A little elephant carved of wood.'),
  item('trinket', 'general', 300)('tr_books', 'Old Books', 'A row of heavy old books.'),
  item('trinket', 'general', 300)('tr_oil_lamp', 'Oil Lamp', 'An oil lamp with a small warm flame.'),
  item('trinket', 'general', 400)('tr_tea', 'Tea Set', 'A teapot and cups for a long match.'),
  item('trinket', 'general', 500)('tr_clock', 'Mantel Clock', 'A small clock to keep your turns honest.'),
  item('trinket', 'fantasy', 300)('tr_lamp', 'Brass Lamp', 'A brass lamp with a flickering flame.'),
  item('trinket', 'fantasy', 350)('tr_compass', 'Sea Dog’s Compass', 'A brass compass that always points to the win.'),
  item('trinket', 'fantasy', 400)('tr_horse', 'Horse Figurine', 'A little bronze horse.'),

  item('rug', 'base', 0)('r_wine', 'Wine Rug', 'Deep red velvet with a gold-lined border.'),
  item('rug', 'general', 400)('r_persian', 'Jacquard Rug', 'Red jacquard, a blue border and tassels.'),
  item('rug', 'general', 450)('r_damask', 'Damask Rug', 'Dark damask with a green and gold border.'),
  item('rug', 'general', 300)('r_tartan', 'Tartan Blanket', 'A soft checked blanket with tassels.'),
  item('rug', 'general', 200)('r_hessian', 'Woven Mat', 'A rough woven mat.'),

  item('floor', 'base', 0)('f_stone', 'Stone Blocks', 'Worn blocks of grey stone.'),
  item('floor', 'general', 300)('f_planks', 'Old Planks', 'A warm floor of old planks.'),
  item('floor', 'general', 500)('f_cobble', 'Cobblestones', 'Rounded cobbles with moss between them.'),
  item('floor', 'general', 600)('f_terracotta', 'Terracotta Tiles', 'Square tiles of fired clay.'),
  item('floor', 'fantasy', 700)('f_parquet', 'Herringbone Parquet', 'Polished wood laid in a herringbone.'),
  item('floor', 'fantasy', 800)('f_slate', 'Flagstones', 'Large flat stones fitted together.'),

  item('walls', 'base', 0)('w_stone', 'Castle Bricks', 'Old castle bricks.'),
  item('walls', 'general', 400)('w_plaster', 'Plaster and Stone', 'Stone walls with patches of plaster.'),
  item('walls', 'general', 500)('w_slates', 'Rough Stone', 'Walls of rough stacked stone.'),
  item('walls', 'general', 600)('w_red_brick', 'Red Brick', 'Old red bricks.'),
  item('walls', 'fantasy', 900)('w_sandstone', 'Sandstone Blocks', 'Great blocks of pale sandstone.'),
  item('walls', 'fantasy', 1000)('w_panel', 'Wood Panelling', 'Dark wooden panels all around.'),

  item('painting', 'general', 400)('p_map', 'Map of the Realm', 'An old map on parchment in a wooden frame.'),
  item('painting', 'fantasy', 500)('p_crown', 'The Sundered Crown', 'The campaign’s painting in a golden frame.'),
  item('painting', 'fantasy', 600)('p_dragon', 'Dragon over the Peaks', 'A great painting of a dragon.'),
  item('painting', 'fantasy', 800)('p_warden', 'Portrait of your Warden', 'An oil portrait of the Warden you have chosen.'),
  item('painting', 'fantasy', 600)('p_battle', 'The Great Battle', 'A wide canvas of the factions at war.'),

  item('poster', 'general', 150)('po_wanted', 'Wanted', 'A faded “Wanted” poster with a reward.'),
  item('poster', 'fantasy', 300)('po_legend', 'Legend Poster', 'The art of a Legendary card, framed.'),
  item('poster', 'fantasy', 700)('po_shield', 'Knight’s Shield', 'A battered kite shield hung on the wall.'),
  item('poster', 'general', 600)('po_lion', 'Lion Head', 'A carved lion’s head on the wall.'),
  item('poster', 'general', 500)('po_bull', 'Bull Head', 'A bull’s head trophy on the wall.'),
  item('poster', 'fantasy', 800)('po_mirror', 'Ornate Mirror', 'A gilded mirror with a carved frame.'),
  item('poster', 'faction', 250)('po_cinder', 'Cinder Legion Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_thorn', 'Thornweald Circle Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_brass', 'Brass Dominion Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_lumen', 'Lumen Conclave Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_hollow', 'Hollow Choir Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_rime', 'Rimetide Court Banner', 'A hanging cloth banner of the faction.'),

  item('lights', 'base', 0)('l_torch', 'Torches', 'Iron holders with burning torches.'),
  item('lights', 'general', 300)('l_lantern', 'Lanterns', 'Metal lanterns with a warm light.'),
  item('lights', 'general', 400)('l_wooden_lantern', 'Wooden Lanterns', 'Old wooden lanterns on iron brackets.'),

  item('furniture', 'general', 250)('fu_barrels', 'Barrels', 'Old oak barrels stacked in the corner.'),
  item('furniture', 'general', 300)('fu_wine', 'Wine Barrel', 'A wine barrel on its cradle.'),
  item('furniture', 'general', 200)('fu_crates', 'Wooden Crates', 'Sturdy crates for the tavern’s stores.'),
  item('furniture', 'general', 200)('fu_plant', 'Potted Plant', 'A big green plant in a clay pot.'),
  item('furniture', 'general', 500)('fu_bookshelf', 'Bookshelf', 'A worn wooden bookshelf.'),
  item('furniture', 'general', 500)('fu_armchair', 'Armchair', 'A deep armchair to rest in between matches.'),
  item('furniture', 'general', 450)('fu_rocking', 'Rocking Chair', 'A wooden rocking chair.'),
  item('furniture', 'general', 400)('fu_spinning', 'Spinning Wheel', 'An old spinning wheel.'),
  item('furniture', 'fantasy', 600)('fu_chest', 'Treasure Chest', 'A chest of gold and treasure.'),
  item('furniture', 'fantasy', 800)('fu_cabinet', 'Gothic Cabinet', 'A carved cabinet with pointed arches.'),
  item('furniture', 'fantasy', 700)('fu_commode', 'Gothic Chest of Drawers', 'Dark carved drawers with gothic arches.'),
  item('furniture', 'fantasy', 900)('fu_bust', 'Marble Bust', 'A marble bust on a plinth.'),
  item('furniture', 'fantasy', 1000)('fu_horse', 'Bronze Horse', 'A bronze horse on a marble plinth.'),
  item('furniture', 'fantasy', 1200)('fu_statue', 'Gothic Statue', 'A weathered gothic figure of stone.'),
  item('furniture', 'fantasy', 1200)('fu_cannon', 'Ship’s Cannon', 'A ship’s cannon on its wooden carriage.'),
  item('furniture', 'fantasy', 1500)('fu_stove', 'Tiled Stove', 'A tall stove of glazed tiles.'),

  item('ceiling', 'general', 300)('c_lantern', 'Lantern Chandelier', 'A ring of lanterns on chains.'),
  item('ceiling', 'general', 600)('c_chandelier', 'Iron Chandelier', 'A wrought iron chandelier.'),
  item('ceiling', 'fantasy', 900)('c_chandelier_brass', 'Brass Chandelier', 'A brass chandelier with curling arms.'),
  item('ceiling', 'fantasy', 1200)('c_chandelier_crystal', 'Crystal Chandelier', 'A chandelier hung with crystals.'),
];

export const DECOR_BY_ID: Record<string, DecorItem> = Object.fromEntries(DECOR.map((d) => [d.id, d]));

export type RoomLayout = Record<SlotId, string | null>;

/** Today's room: what every player has from the start. Empty slots hold nothing. */
export const DEFAULT_ROOM: RoomLayout = {
  table: 't_tavern',
  tableLeft: null,
  tableRight: null,
  rug: 'r_wine',
  floor: 'f_stone',
  walls: 'w_stone',
  painting: null,
  posterLeft: null,
  posterRight: null,
  lights: 'l_torch',
  furnBackLeft: null,
  furnBackRight: null,
  furnLeft: null,
  furnRight: null,
  ceiling: null,
};

/** Slots that can be left empty (the others always hold a piece: a room needs a table, a floor…). */
export const OPTIONAL_KINDS: ReadonlySet<DecorKind> = new Set(['trinket', 'painting', 'poster', 'furniture', 'ceiling']);

export const decorFor = (slot: SlotId) => DECOR.filter((d) => d.kind === SLOT_KIND[slot]);

export const ownsDecor = (owned: readonly string[], id: string) => DECOR_BY_ID[id]?.price === 0 || owned.includes(id);

/**
 * A layout safe to build: unknown pieces, pieces of the wrong kind, pieces not owned (when `owned` is
 * given; a host's room from the network is checked against the catalogue only) and a piece standing in
 * two slots at once fall back to the slot's default.
 */
export function sanitizeRoom(raw: unknown, owned?: readonly string[]): RoomLayout {
  const src = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out = { ...DEFAULT_ROOM };
  const used = new Set<string>();
  for (const slot of SLOTS) {
    const v = src[slot];
    if (v === null && OPTIONAL_KINDS.has(SLOT_KIND[slot])) {
      out[slot] = null;
      continue;
    }
    if (typeof v !== 'string') continue;
    const d = DECOR_BY_ID[v];
    if (!d || d.kind !== SLOT_KIND[slot] || used.has(v) || (owned && !ownsDecor(owned, v))) continue;
    out[slot] = v;
    used.add(v);
  }
  return out;
}

/** The slot a piece already stands in, if any (a piece stands in one slot at a time). */
export const slotOf = (room: RoomLayout, id: string): SlotId | null => SLOTS.find((s) => room[s] === id) ?? null;
