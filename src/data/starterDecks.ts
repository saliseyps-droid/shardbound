import { collectibleCards } from '@/data/cards';
import type { PlayableFaction } from '@/game/types';

export interface StarterDeckDef {
  id: string;
  name: string;
  heroFaction: PlayableFaction;
  description: string;
}

/** Pre-built decks every new Warden receives. */
export const STARTER_DECKS: StarterDeckDef[] = [
  { id: 'starter_ember', name: 'Cinder Blitz', heroFaction: 'EMBER', description: 'Fast Swift units and burning spells. Hit hard, hit first.' },
  { id: 'starter_verdant', name: 'Thornweald Grove', heroFaction: 'VERDANT', description: 'Sturdy defenders that grow and heal over time.' },
  { id: 'starter_tide', name: 'Rimetide Tempo', heroFaction: 'TIDE', description: 'Freeze threats and control the flow of battle.' },
];

export function starterCardIds(faction?: PlayableFaction | 'NEUTRAL'): string[] {
  return collectibleCards()
    .filter((c) => c.starter && (!faction || c.faction === faction))
    .map((c) => c.id);
}

/** Starter deck list: every faction starter + every neutral starter, 2 copies each (30 cards). */
export function starterDeckCards(faction: PlayableFaction): Record<string, number> {
  const cards: Record<string, number> = {};
  for (const id of [...starterCardIds(faction), ...starterCardIds('NEUTRAL')]) cards[id] = 2;
  return cards;
}
