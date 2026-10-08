import type { PlayableFaction } from '@/game/types';

/**
 * Alternative Warden portraits (art in src/assets/portraits/<id>.webp), bought with Gold.
 * Each belongs to one faction and can replace that faction's default Warden portrait,
 * for all its decks (Profile) or for one deck (deck editor). Purely cosmetic.
 */
export interface PortraitDef {
  id: string;
  faction: PlayableFaction;
  name: string;
  price: number;
}

export const PORTRAITS: PortraitDef[] = [
  { id: 'ember_flame_corsair', faction: 'EMBER', name: 'Flame Corsair', price: 150 },
  { id: 'ember_flameborn', faction: 'EMBER', name: 'Flameborn Duelist', price: 150 },
  { id: 'ember_black_drake', faction: 'EMBER', name: 'Black Drake', price: 250 },
  { id: 'verdant_ancient_treant', faction: 'VERDANT', name: 'Ancient Treant', price: 150 },
  { id: 'verdant_bamboo_monk', faction: 'VERDANT', name: 'Bamboo Monk', price: 250 },
  { id: 'verdant_dryad', faction: 'VERDANT', name: 'Grove Dryad', price: 150 },
  { id: 'iron_lion_lord', faction: 'IRON', name: 'Lion Lord', price: 250 },
  { id: 'iron_goblin_tinker', faction: 'IRON', name: 'Goblin Tinker', price: 150 },
  { id: 'iron_dwarf_forgemaster', faction: 'IRON', name: 'Dwarf Forgemaster', price: 150 },
  { id: 'astral_white_seer', faction: 'ASTRAL', name: 'White Seer', price: 150 },
  { id: 'astral_eagle_herald', faction: 'ASTRAL', name: 'Eagle Herald', price: 250 },
  { id: 'void_night_elf', faction: 'VOID', name: 'Night Elf', price: 150 },
  { id: 'void_horned_warlock', faction: 'VOID', name: 'Horned Warlock', price: 150 },
  { id: 'tide_sapphire_dragon', faction: 'TIDE', name: 'Sapphire Dragon', price: 250 },
  { id: 'tide_sea_elf', faction: 'TIDE', name: 'Sea Elf', price: 150 },
  { id: 'tide_frost_lich', faction: 'TIDE', name: 'Frost Lich', price: 150 },
  { id: 'ember_exiled_warlord', faction: 'EMBER', name: 'Exiled Warlord', price: 150 },
  { id: 'ember_crimson_dragon', faction: 'EMBER', name: 'Crimson Dragon', price: 250 },
  { id: 'ember_fire_demon', faction: 'EMBER', name: 'Fire Demon', price: 250 },
  { id: 'verdant_forest_elf', faction: 'VERDANT', name: 'Forest Elf', price: 150 },
  { id: 'astral_golden_eagle', faction: 'ASTRAL', name: 'Golden Eagle', price: 150 },
  { id: 'astral_starlit_elf', faction: 'ASTRAL', name: 'Starlit Elf', price: 150 },
  { id: 'void_shadow_tyrant', faction: 'VOID', name: 'Shadow Tyrant', price: 250 },
  { id: 'void_spectral_king', faction: 'VOID', name: 'Spectral King', price: 250 },
  { id: 'tide_frost_elf_lord', faction: 'TIDE', name: 'Frost Elf Lord', price: 150 },
  { id: 'verdant_bloom_cat', faction: 'VERDANT', name: 'Bloomcrown Cat', price: 250 },
  { id: 'astral_silver_cat', faction: 'ASTRAL', name: 'Silvermoon Cat', price: 250 },
  { id: 'void_moon_cat', faction: 'VOID', name: 'Shadowmark Cat', price: 250 },
  { id: 'iron_candle_cat', faction: 'IRON', name: 'Candlelit Seer Cat', price: 250 },
  { id: 'tide_frosthood_cat', faction: 'TIDE', name: 'Frosthood Cat', price: 250 },
  { id: 'ember_emberhood_cat', faction: 'EMBER', name: 'Emberhood Cat', price: 250 },
  { id: 'void_starhood_cat', faction: 'VOID', name: 'Starhood Cat', price: 250 },
  { id: 'astral_goldhood_cat', faction: 'ASTRAL', name: 'Goldhood Cat', price: 250 },
];

const BY_ID = new Map(PORTRAITS.map((p) => [p.id, p]));

export function getPortrait(id: string | null | undefined): PortraitDef | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function portraitsOf(faction: PlayableFaction): PortraitDef[] {
  return PORTRAITS.filter((p) => p.faction === faction);
}

/** AI opponents: the default portrait or one of their faction's alternatives, at random. */
export function randomPortrait(faction: string | null | undefined, random: () => number = Math.random): string | null {
  const options = PORTRAITS.filter((p) => p.faction === faction);
  const i = Math.floor(random() * (options.length + 1));
  return i < options.length ? options[i].id : null;
}
