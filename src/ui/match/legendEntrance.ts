import { getCard } from '@/data/cards';
import type { GameEvent, PlayerId } from '@/engine/types';

export type LegendTheme = 'gold' | 'meowchick' | 'liu' | 'abandoneer' | 'rendoslav' | 'qvido' | 'qinny' | 'tallys';

/** Legendaries with their own entrance; every other Legendary gets the golden one. */
const THEMES: Record<string, LegendTheme> = {
  neu_meowchick: 'meowchick',
  ast_liu_kano: 'liu',
  neu_captain_abandoneer: 'abandoneer',
  neu_rendoslav: 'rendoslav',
  emb_qvido: 'qvido',
  ast_bubblemaker_qinny: 'qinny',
  vod_tallys_the_menace: 'tallys',
};

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
