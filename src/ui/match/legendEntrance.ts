import { getCard } from '@/data/cards';
import type { GameEvent, PlayerId } from '@/engine/types';

/** Legendaries with their own entrance; every other Legendary gets the golden one. */
const THEMES: Record<string, LegendTheme> = {
  neu_meowchick: 'meowchick',
};

export type LegendTheme = 'gold' | 'meowchick';

export function legendTheme(cardId: string): LegendTheme {
  return THEMES[cardId] ?? 'gold';
}

/** The Legendary unit played in this transition, if any: it gets a short entrance before it lands. */
export function legendEntrance(events: GameEvent[]): { cardId: string; player: PlayerId } | null {
  for (const e of events) {
    if (e.type !== 'CARD_PLAYED') continue;
    const card = getCard(e.cardId);
    if (card?.cardType === 'UNIT' && card.rarity === 'LEGENDARY') return { cardId: e.cardId, player: e.player };
  }
  return null;
}
