/**
 * The Lounge: the player's game room. Every piece of decor has a fixed slot; a slot takes pieces of
 * one kind (the four furniture slots take any furniture). The room is shown in the Lounge and around
 * the 3D table (against the AI the player's own, online the host's).
 */

export type DecorKind = 'table' | 'rug' | 'floor' | 'walls' | 'painting' | 'poster' | 'lights' | 'furniture' | 'ceiling';
export type DecorStyle = 'base' | 'general' | 'fantasy' | 'faction';

export const SLOTS = [
  'table',
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

  item('rug', 'base', 0)('r_wine', 'Wine Rug', 'Deep wine with a faded gold border.'),
  item('rug', 'general', 400)('r_persian', 'Eastern Rug', 'Red and blue patterns with tassels.'),
  item('rug', 'general', 350)('r_bear', 'Bearskin', 'A brown bearskin, head and all.'),
  item('rug', 'fantasy', 600)('r_runic', 'Rune Circle', 'A dark rug with a glowing ring of runes.'),
  item('rug', 'fantasy', 900)('r_starmap', 'Star Map', 'The night sky with slowly twinkling constellations.'),
  item('rug', 'faction', 700)('r_ember', 'Ember Rug', 'Black with orange sparks rising from it.'),
  item('rug', 'faction', 700)('r_frost', 'Frost Rug', 'White rime and patterns of ice.'),

  item('floor', 'base', 0)('f_stone', 'Stone Tiles', 'Dark stone tiles.'),
  item('floor', 'general', 300)('f_planks', 'Wooden Planks', 'A warm floor of planks.'),
  item('floor', 'fantasy', 800)('f_checker', 'Marble Checkers', 'Polished black and white marble.'),
  item('floor', 'faction', 900)('f_moss', 'Moss and Roots', 'Soft moss with roots and flowers.'),
  item('floor', 'faction', 900)('f_ice', 'Frozen Lake', 'Clear ice over dark water.'),
  item('floor', 'faction', 1000)('f_lava', 'Lava Seams', 'Basalt tiles with lava running in the seams.'),

  item('walls', 'base', 0)('w_stone', 'Stone Walls', 'Rough dark stone.'),
  item('walls', 'general', 400)('w_timber', 'Timber Frame', 'White plaster between dark beams.'),
  item('walls', 'general', 600)('w_wallpaper', 'Gilded Wallpaper', 'Dark green wallpaper with a golden pattern.'),
  item('walls', 'fantasy', 1200)('w_library', 'Library', 'Walls lined with shelves of books.'),
  item('walls', 'fantasy', 1400)('w_crystal', 'Crystal Cave', 'Rock with glowing crystals growing through it.'),
  item('walls', 'faction', 900)('w_brass', 'Brass Panels', 'Riveted plates, pipes and gauges.'),
  item('walls', 'faction', 1400)('w_void', 'Starry Void', 'Walls fading into a dark full of stars and violet mist.'),

  item('painting', 'general', 400)('p_map', 'Map of the Realm', 'An old map on parchment in a wooden frame.'),
  item('painting', 'fantasy', 500)('p_crown', 'The Sundered Crown', 'The campaign’s painting in a golden frame.'),
  item('painting', 'fantasy', 600)('p_dragon', 'Dragon over the Peaks', 'A great painting of a dragon.'),
  item('painting', 'fantasy', 800)('p_warden', 'Portrait of your Warden', 'An oil portrait of the Warden you have chosen.'),
  item('painting', 'fantasy', 600)('p_battle', 'The Great Battle', 'A wide canvas of the factions at war.'),

  item('poster', 'general', 150)('po_wanted', 'Wanted', 'A faded “Wanted” poster with a reward.'),
  item('poster', 'fantasy', 300)('po_legend', 'Legend Poster', 'The art of a Legendary card, framed.'),
  item('poster', 'faction', 250)('po_cinder', 'Cinder Legion Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_thorn', 'Thornweald Circle Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_brass', 'Brass Dominion Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_lumen', 'Lumen Conclave Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_hollow', 'Hollow Choir Banner', 'A hanging cloth banner of the faction.'),
  item('poster', 'faction', 250)('po_rime', 'Rimetide Court Banner', 'A hanging cloth banner of the faction.'),

  item('lights', 'base', 0)('l_torch', 'Torches', 'Iron holders with burning torches.'),
  item('lights', 'general', 300)('l_lantern', 'Lanterns', 'Metal lanterns with a warm light.'),
  item('lights', 'general', 400)('l_candelabra', 'Candelabra', 'Three-armed candlesticks.'),
  item('lights', 'fantasy', 700)('l_crystal', 'Glowing Crystals', 'Blue crystals casting a cold light.'),
  item('lights', 'faction', 600)('l_brazier', 'Braziers', 'Iron bowls with tall flames and sparks.'),
  item('lights', 'faction', 800)('l_wisp', 'Wisps', 'Green lights drifting in slow circles.'),

  item('furniture', 'general', 250)('fu_barrels', 'Barrels', 'Old oak barrels stacked in the corner.'),
  item('furniture', 'general', 200)('fu_plant', 'Potted Plant', 'A big green plant in a clay pot.'),
  item('furniture', 'general', 500)('fu_bookshelf', 'Bookshelf', 'A tall shelf of books and scrolls.'),
  item('furniture', 'general', 450)('fu_globe', 'Globe', 'A great globe on a wooden stand, slowly turning.'),
  item('furniture', 'general', 900)('fu_clock', 'Grandfather Clock', 'A tall clock of dark wood, ticking away.'),
  item('furniture', 'fantasy', 800)('fu_cabinet', 'Gothic Cabinet', 'A carved cabinet with pointed arches.'),
  item('furniture', 'fantasy', 600)('fu_chest', 'Treasure Chest', 'A chest left ajar, gold glowing inside.'),
  item('furniture', 'fantasy', 700)('fu_armor', 'Armour Stand', 'Plate armour, a shield and a sword.'),
  item('furniture', 'fantasy', 1000)('fu_trophy', 'Trophy Cabinet', 'A glass cabinet of cups and medals.'),
  item('furniture', 'fantasy', 1200)('fu_statue', 'Warden Statue', 'A weathered gothic figure of stone.'),
  item('furniture', 'fantasy', 1500)('fu_dragon_skull', 'Dragon Skull', 'A huge horned skull on a stone plinth.'),
  item('furniture', 'faction', 800)('fu_anvil', 'Anvil and Forge', 'An anvil, a hammer and glowing coals.'),
  item('furniture', 'faction', 900)('fu_tree', 'Little Thornweald Tree', 'A twisted tree shedding leaves.'),
  item('furniture', 'faction', 1800)('fu_golem', 'Brass Golem', 'A dormant golem whose eyes now and then flicker.'),
  item('furniture', 'faction', 1000)('fu_altar', 'Lumen Altar', 'A white altar under a holy light.'),
  item('furniture', 'faction', 900)('fu_harp', 'Haunted Harp', 'A harp played by an unseen hand.'),
  item('furniture', 'faction', 1200)('fu_ice_statue', 'Ice Statue', 'A clear statue of ice.'),

  item('ceiling', 'general', 300)('c_lantern', 'Hanging Lantern', 'A lantern on a chain.'),
  item('ceiling', 'general', 600)('c_chandelier', 'Iron Chandelier', 'A ring of candles on chains.'),
  item('ceiling', 'fantasy', 500)('c_banners', 'Ceiling Banners', 'A row of faction banners above the table.'),
  item('ceiling', 'fantasy', 1100)('c_orb', 'Floating Orb', 'A glowing orb circled by runes.'),
];

export const DECOR_BY_ID: Record<string, DecorItem> = Object.fromEntries(DECOR.map((d) => [d.id, d]));

export type RoomLayout = Record<SlotId, string | null>;

/** Today's room: what every player has from the start. Empty slots hold nothing. */
export const DEFAULT_ROOM: RoomLayout = {
  table: 't_tavern',
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
export const OPTIONAL_KINDS: ReadonlySet<DecorKind> = new Set(['painting', 'poster', 'furniture', 'ceiling']);

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
