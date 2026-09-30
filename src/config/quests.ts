import type { PlayableFaction } from '@/game/types';

export type QuestType =
  | 'PLAY_CARDS'
  | 'WIN_MATCHES'
  | 'PLAY_MATCHES'
  | 'PLAY_UNITS'
  | 'PLAY_SPELLS'
  | 'DEAL_DAMAGE'
  | 'DESTROY_UNITS'
  | 'WIN_WITH_FACTION'
  | 'OPEN_PACKS'
  | 'CRAFT_CARDS';

export interface QuestTemplate {
  id: string;
  type: QuestType;
  name: string;
  description: string;
  target: number;
  gold: number;
  xp: number;
  faction?: PlayableFaction;
}

export const QUEST_CONFIG = {
  maxActive: 3,
  /** A new quest is added each day while fewer than maxActive are active. */
  newPerDay: 1,
  rerollsPerDay: 1,
};

export const QUEST_TEMPLATES: QuestTemplate[] = [
  { id: 'q_play_cards', type: 'PLAY_CARDS', name: 'Card Slinger', description: 'Play 20 cards.', target: 20, gold: 50, xp: 120 },
  { id: 'q_win_3', type: 'WIN_MATCHES', name: 'Triumphant', description: 'Win 3 matches.', target: 3, gold: 80, xp: 180 },
  { id: 'q_play_matches', type: 'PLAY_MATCHES', name: 'Into the Fray', description: 'Play 3 matches.', target: 3, gold: 50, xp: 120 },
  { id: 'q_play_units', type: 'PLAY_UNITS', name: 'Muster the Ranks', description: 'Play 10 units.', target: 10, gold: 50, xp: 120 },
  { id: 'q_play_spells', type: 'PLAY_SPELLS', name: 'Arcane Study', description: 'Play 5 spells.', target: 5, gold: 50, xp: 120 },
  { id: 'q_damage', type: 'DEAL_DAMAGE', name: 'Relentless', description: 'Deal 50 damage.', target: 50, gold: 60, xp: 150 },
  { id: 'q_destroy', type: 'DESTROY_UNITS', name: 'Culling', description: 'Destroy 12 enemy units.', target: 12, gold: 60, xp: 150 },
  { id: 'q_open_packs', type: 'OPEN_PACKS', name: 'Treasure Hunter', description: 'Open a booster pack.', target: 1, gold: 40, xp: 80 },
  { id: 'q_craft', type: 'CRAFT_CARDS', name: 'Shardwright', description: 'Craft a card.', target: 1, gold: 40, xp: 80 },
  { id: 'q_win_ember', type: 'WIN_WITH_FACTION', faction: 'EMBER', name: 'Kindle the Legion', description: 'Win 2 matches with a Cinder Legion deck.', target: 2, gold: 70, xp: 160 },
  { id: 'q_win_verdant', type: 'WIN_WITH_FACTION', faction: 'VERDANT', name: 'Root and Bloom', description: 'Win 2 matches with a Thornweald deck.', target: 2, gold: 70, xp: 160 },
  { id: 'q_win_iron', type: 'WIN_WITH_FACTION', faction: 'IRON', name: 'Gears of War', description: 'Win 2 matches with a Brass Dominion deck.', target: 2, gold: 70, xp: 160 },
  { id: 'q_win_astral', type: 'WIN_WITH_FACTION', faction: 'ASTRAL', name: 'Starlit Victory', description: 'Win 2 matches with a Lumen Conclave deck.', target: 2, gold: 70, xp: 160 },
  { id: 'q_win_void', type: 'WIN_WITH_FACTION', faction: 'VOID', name: 'Hymn of Hollows', description: 'Win 2 matches with a Hollow Choir deck.', target: 2, gold: 70, xp: 160 },
  { id: 'q_win_tide', type: 'WIN_WITH_FACTION', faction: 'TIDE', name: 'Turn of the Tide', description: 'Win 2 matches with a Rimetide Court deck.', target: 2, gold: 70, xp: 160 },
];
