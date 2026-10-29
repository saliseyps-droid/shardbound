/**
 * The Lounge: the player's game room. Every piece of decor has a fixed slot; a slot takes pieces of
 * one kind (the four furniture slots take any furniture). The room is shown in the Lounge and around
 * the 3D table (against the AI the player's own, online the host's).
 */

export type DecorKind = 'table' | 'trinket' | 'rug' | 'floor' | 'walls' | 'painting' | 'poster' | 'lights' | 'furniture' | 'ceiling' | 'door';
export type DecorStyle = 'base' | 'general' | 'fantasy' | 'faction' | 'arcade';

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
  'door',
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
  door: 'door',
};

export const SLOT_NAME: Record<SlotId, string> = {
  table: 'Table',
  tableLeft: 'On the table, left',
  tableRight: 'On the table, right',
  rug: 'Rug',
  floor: 'Floor',
  walls: 'Walls',
  painting: 'Painting',
  posterLeft: 'Left wall, high',
  posterRight: 'Right wall, high',
  lights: 'Lights',
  furnBackLeft: 'Back wall, left',
  furnBackRight: 'Back wall, right',
  furnLeft: 'Left wall',
  furnRight: 'Right wall',
  ceiling: 'Ceiling',
  door: 'Door',
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

  // Fantasy furniture (Quaternius, CC0).
  item('furniture', 'fantasy', 900)('fu_cauldron', 'Bubbling Cauldron', 'An iron cauldron with a green brew.'),
  item('furniture', 'fantasy', 500)('fu_dummy', 'Training Dummy', 'A straw dummy for sword practice.'),
  item('furniture', 'fantasy', 600)('fu_lectern', 'Spellbook Lectern', 'A lectern with an open spellbook.'),
  item('poster', 'fantasy', 800)('po_alchemy', 'Alchemist’s Shelf', 'A shelf of little bottles and potions.'),
  item('furniture', 'fantasy', 600)('fu_anvil', 'Anvil', 'A smith’s anvil on a log.'),
  item('furniture', 'fantasy', 700)('fu_bookcase', 'Wizard’s Bookcase', 'A tall bookcase full of tomes.'),
  item('furniture', 'fantasy', 400)('fu_candelabra', 'Candelabrum', 'A tall iron stand of burning candles.'),
  item('furniture', 'fantasy', 450)('fu_cage', 'Hanging Cage', 'A small iron cage on a stand.'),
  item('furniture', 'general', 250)('fu_apples', 'Barrel of Apples', 'A barrel heaped with red apples.'),
  item('furniture', 'general', 500)('fu_workbench', 'Workbench', 'A sturdy bench with tools.'),
  item('furniture', 'general', 350)('fu_wood_chest', 'Wooden Chest', 'A plain chest bound with iron.'),
  // Arcade (Kenney Mini Arcade, CC0).
  item('furniture', 'arcade', 1500)('fu_arcade', 'Arcade Machine', 'A classic arcade cabinet with a glowing screen.'),
  item('furniture', 'arcade', 1800)('fu_pinball', 'Pinball', 'A pinball table full of lights.'),
  item('furniture', 'arcade', 1600)('fu_claw', 'Claw Machine', 'Try your luck at grabbing a prize.'),
  item('furniture', 'arcade', 1400)('fu_air_hockey', 'Air Hockey', 'A table for fast air hockey.'),
  item('furniture', 'arcade', 1200)('fu_prize_wheel', 'Prize Wheel', 'Spin the wheel and win.'),
  item('furniture', 'arcade', 1300)('fu_slots', 'Slot Machine', 'Three reels and a lever.'),
  item('furniture', 'arcade', 1600)('fu_dance', 'Dance Machine', 'Arrows, lights and music.'),
  item('furniture', 'arcade', 1500)('fu_hoops', 'Basketball Game', 'Shoot hoops for tickets.'),
  item('furniture', 'arcade', 1000)('fu_vending', 'Vending Machine', 'Snacks for a long match.'),
  item('furniture', 'arcade', 800)('fu_tickets', 'Ticket Machine', 'Prints your winning tickets.'),

  // Small things for the table.
  item('trinket', 'fantasy', 200)('tr_potion_red', 'Red Potion', 'A round bottle of a red potion.'),
  item('trinket', 'fantasy', 200)('tr_potion_blue', 'Blue Potion', 'A slim bottle of a blue potion.'),
  item('trinket', 'fantasy', 300)('tr_potion_big', 'Large Potion', 'A big flask of something glowing.'),
  item('trinket', 'fantasy', 300)('tr_coins', 'Pile of Gold', 'A pile of gold coins.'),
  item('trinket', 'fantasy', 400)('tr_coins_big', 'Hoard of Gold', 'A heap of gold coins.'),
  item('trinket', 'fantasy', 250)('tr_chalice', 'Golden Chalice', 'A chalice fit for a victory.'),
  item('trinket', 'fantasy', 300)('tr_candles', 'Candlestick', 'Three candles on an iron stick.'),
  item('trinket', 'general', 200)('tr_book_stack', 'Stack of Books', 'Old books piled up.'),
  item('trinket', 'general', 150)('tr_scroll', 'Scroll', 'A rolled up scroll.'),
  item('trinket', 'fantasy', 200)('tr_key', 'Golden Key', 'A big golden key.'),
  item('trinket', 'general', 100)('tr_mug', 'Tankard', 'A wooden tankard of ale.'),
  item('trinket', 'fantasy', 200)('tr_bottles', 'Little Bottles', 'A cluster of small bottles.'),
  item('trinket', 'arcade', 300)('tr_prizes', 'Prizes', 'Plush toys won at the arcade.'),

  // On the walls.
  item('poster', 'fantasy', 400)('po_banner_red', 'Red Banner', 'A long red banner with a golden sign.'),
  item('poster', 'fantasy', 400)('po_banner_blue', 'Blue Banner', 'A long blue banner with a golden sign.'),
  item('poster', 'general', 300)('po_shield_wood', 'Wooden Shield', 'A round wooden shield.'),
  item('poster', 'general', 300)('po_dartboard', 'Dartboard', 'A worn dartboard.'),
  item('poster', 'fantasy', 500)('po_hammer', 'War Hammer', 'An ornate war hammer on the wall.'),
  item('poster', 'fantasy', 600)('po_estoc', 'Antique Sword', 'A long antique sword on the wall.'),
  item('poster', 'fantasy', 500)('po_mace', 'Ornate Mace', 'A decorated mace on the wall.'),
  item('poster', 'general', 150)('po_pegs', 'Peg Rack', 'A rack of pegs with a few things hung on it.'),
  item('poster', 'general', 300)('po_sword', 'Bronze Sword', 'A bronze sword hung on the wall.'),

  // Lights and the ceiling.
  item('lights', 'fantasy', 350)('l_wall_lantern', 'Wall Lanterns', 'Iron lanterns fixed to the walls.'),
  item('lights', 'general', 250)('l_iron_torch', 'Iron Torches', 'Torches in iron cups.'),
  item('ceiling', 'fantasy', 700)('c_candle_ring', 'Candle Chandelier', 'A great ring of candles on chains.'),

  // Paintings: scenes from the campaigns.
  item('painting', 'fantasy', 500)('p_aether', 'The Aether', 'The shining sky above the world.'),
  item('painting', 'fantasy', 500)('p_heaven', 'The Celestial City', 'A city of light among the clouds.'),
  item('painting', 'fantasy', 500)('p_throne', 'The Throne Room', 'A dark throne room of fire.'),
  item('painting', 'fantasy', 400)('p_inn', 'The Inn', 'A warm inn by the road.'),
  item('painting', 'fantasy', 500)('p_chapel', 'The Lamplit Chapel', 'A chapel lit by many lamps.'),
  item('painting', 'fantasy', 500)('p_cathedral', 'The Cathedral', 'A great cathedral of black stone.'),
  item('painting', 'fantasy', 400)('p_glade', 'The Glade', 'A quiet glade in the forest.'),

  // More floors, walls, rugs and tables.
  item('floor', 'general', 400)('f_dark_planks', 'Dark Planks', 'Dark, worn planks.'),
  item('walls', 'general', 500)('w_beams', 'Log Wall', 'Walls of round wooden logs.'),
  item('rug', 'general', 350)('r_fur', 'Patterned Rug', 'A soft rug with a woven pattern.'),
  item('rug', 'general', 300)('r_wool', 'Wool Rug', 'A grey herringbone wool rug.'),
  item('table', 'general', 600)('t_walnut', 'Walnut Table', 'A table of dark walnut.'),
  item('table', 'general', 500)('t_old_oak', 'Old Oak Table', 'A heavy table of weathered oak.'),

  // Doors.
  item('door', 'base', 0)('d_castle', 'Castle Door', 'A heavy wooden door bound with iron.'),
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
  door: 'd_castle',
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
