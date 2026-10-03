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
  { id: 'ember_orc_warchief', faction: 'EMBER', name: 'Orc Warchief', price: 400 },
  { id: 'ember_flameborn', faction: 'EMBER', name: 'Flameborn Duelist', price: 400 },
  { id: 'ember_black_drake', faction: 'EMBER', name: 'Black Drake', price: 600 },
  { id: 'verdant_ancient_treant', faction: 'VERDANT', name: 'Ancient Treant', price: 400 },
  { id: 'verdant_bamboo_monk', faction: 'VERDANT', name: 'Bamboo Monk', price: 600 },
  { id: 'verdant_dryad', faction: 'VERDANT', name: 'Grove Dryad', price: 400 },
  { id: 'iron_lion_lord', faction: 'IRON', name: 'Lion Lord', price: 600 },
  { id: 'iron_goblin_tinker', faction: 'IRON', name: 'Goblin Tinker', price: 400 },
  { id: 'iron_dwarf_forgemaster', faction: 'IRON', name: 'Dwarf Forgemaster', price: 400 },
  { id: 'astral_white_seer', faction: 'ASTRAL', name: 'White Seer', price: 400 },
  { id: 'astral_eagle_herald', faction: 'ASTRAL', name: 'Eagle Herald', price: 600 },
  { id: 'void_night_elf', faction: 'VOID', name: 'Night Elf', price: 400 },
  { id: 'void_horned_warlock', faction: 'VOID', name: 'Horned Warlock', price: 400 },
  { id: 'tide_sapphire_dragon', faction: 'TIDE', name: 'Sapphire Dragon', price: 600 },
  { id: 'tide_sea_elf', faction: 'TIDE', name: 'Sea Elf', price: 400 },
  { id: 'tide_frost_lich', faction: 'TIDE', name: 'Frost Lich', price: 400 },
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
