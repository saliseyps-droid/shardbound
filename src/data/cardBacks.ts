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
];

const BY_ID = new Map(CARD_BACKS.map((b) => [b.id, b]));

export function getCardBack(id: string | null | undefined): CardBackDef | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** AI opponents and bosses use a random card back every match. */
export function randomCardBack(random: () => number = Math.random): string {
  return CARD_BACKS[Math.floor(random() * CARD_BACKS.length) % CARD_BACKS.length].id;
}
