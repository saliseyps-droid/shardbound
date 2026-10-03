/** Cosmetic card backs (art in src/assets/cardbacks/<id>.webp). Bought with Gold; they never change how anything plays. */
export interface CardBackDef {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const DEFAULT_CARD_BACK = 'compass';

export const CARD_BACKS: CardBackDef[] = [
  { id: 'compass', name: "Warden's Compass", price: 0, description: 'Midnight blue and a golden compass star. Every Warden starts with it.' },
  { id: 'crimson_sigil', name: 'Crimson Sigil', price: 300, description: 'A gilded seal on deep red velvet.' },
  { id: 'arcane_hexagram', name: 'Arcane Hexagram', price: 450, description: 'Glowing runes circling a violet star.' },
  { id: 'tree_of_life', name: 'Tree of Life', price: 300, description: 'The golden tree of the Thornweald on living green.' },
  { id: 'silver_thorn', name: 'Silver Thorn', price: 300, description: 'Wrought silver thorns on black.' },
  { id: 'brass_clockwork', name: 'Brass Clockwork', price: 300, description: 'Riveted bronze plates around a great gear.' },
  { id: 'sunlit_ivory', name: 'Sunlit Ivory', price: 450, description: 'A golden sunburst on pale ivory.' },
  { id: 'rimetide_frost', name: 'Rimetide Frost', price: 300, description: 'A perfect ice crystal on frozen blue.' },
  { id: 'hollow_vortex', name: 'Hollow Vortex', price: 450, description: 'A violet whirl pulling into the dark.' },
  { id: 'leather_tome', name: 'Leather Tome', price: 300, description: 'Tooled leather from an old spellbook cover.' },
  { id: 'moonlit_night', name: 'Moonlit Night', price: 450, description: 'A golden crescent among the stars.' },
  { id: 'ember_rune', name: 'Ember Rune', price: 300, description: 'A burning rune in cracked volcanic rock.' },
  { id: 'royal_crest', name: 'Royal Crest', price: 750, description: 'A fleur-de-lis shield on aged parchment.' },
  { id: 'tidal_wave', name: 'Tidal Wave', price: 300, description: 'A rolling wave in the teal deep.' },
  { id: 'gilded_obsidian', name: 'Gilded Obsidian', price: 1000, description: 'Clean gold lines on polished black.' },
  { id: 'cathedral_glass', name: 'Cathedral Glass', price: 1250, description: 'A rose window of coloured glass.' },
  // Second collection (cardbacks1)
  { id: 'golden_star', name: 'Golden Star', price: 450, description: 'A golden gem in a star of brass on midnight blue.' },
  { id: 'verdant_spiral', name: 'Verdant Spiral', price: 300, description: 'A glowing green spiral on mossy stone.' },
  { id: 'violet_crystal', name: 'Violet Crystal', price: 450, description: 'An amethyst set in a ring of runes.' },
  { id: 'crimson_dragon', name: 'Crimson Dragon', price: 600, description: 'A coiled dragon seal on blood-red velvet.' },
  { id: 'ivory_sapphire', name: 'Ivory Sapphire', price: 450, description: 'A sapphire star on cracked pale marble.' },
  { id: 'teal_eclipse', name: 'Teal Eclipse', price: 300, description: 'A cold teal eye inside a wrought-iron compass.' },
  { id: 'bronze_hammer', name: 'Bronze Hammer', price: 300, description: 'The forge hammer of the Dominion in bronze relief.' },
  { id: 'frost_star', name: 'Frost Star', price: 450, description: 'Shards of ice bursting from a frozen star.' },
  { id: 'void_eye', name: 'Void Eye', price: 600, description: 'A violet eye that never closes.' },
  { id: 'ruby_filigree', name: 'Ruby Filigree', price: 450, description: 'A ruby among endless golden filigree.' },
  { id: 'bone_skull', name: 'Bone Skull', price: 450, description: 'A skull in old bronze on poisoned green.' },
  { id: 'crescent_moon', name: 'Crescent Moon', price: 450, description: 'A golden crescent inside a starry astrolabe.' },
  { id: 'jade_phoenix', name: 'Jade Phoenix', price: 600, description: 'A jade gem with phoenix wings on carved sandstone.' },
  { id: 'molten_core', name: 'Molten Core', price: 450, description: 'A burning rune in cracked, glowing rock.' },
  { id: 'elder_oak', name: 'Elder Oak', price: 300, description: 'The great oak of the Circle carved in old wood.' },
  { id: 'nebula_spiral', name: 'Nebula Spiral', price: 750, description: 'A galaxy turning in a frame of dark silver.' },
];

const BY_ID = new Map(CARD_BACKS.map((b) => [b.id, b]));

export function getCardBack(id: string | null | undefined): CardBackDef | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** AI opponents and bosses use a random card back every match. */
export function randomCardBack(random: () => number = Math.random): string {
  return CARD_BACKS[Math.floor(random() * CARD_BACKS.length) % CARD_BACKS.length].id;
}
