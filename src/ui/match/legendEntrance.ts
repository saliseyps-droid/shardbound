import { getCard } from '@/data/cards';
import type { GameEvent, PlayerId } from '@/engine/types';

export type LegendTheme = 'gold' | 'meowchick' | 'liu' | 'abandoneer' | 'rendoslav' | 'qvido' | 'qinny' | 'tallys' | 'elinda' | 'skolky' | 'r3d3' | 'dragon';

/** Legendaries with their own entrance; every other Legendary gets the golden one. */
const THEMES: Record<string, LegendTheme> = {
  neu_meowchick: 'meowchick',
  ast_liu_kano: 'liu',
  neu_captain_abandoneer: 'abandoneer',
  neu_rendoslav: 'rendoslav',
  emb_qvido: 'qvido',
  ast_bubblemaker_qinny: 'qinny',
  vod_tallys_the_menace: 'tallys',
  ver_elinda: 'elinda',
  tid_skolky: 'skolky',
  irn_bronzehorn_colossus: 'r3d3',
};

export function legendTheme(cardId: string): LegendTheme {
  if (THEMES[cardId]) return THEMES[cardId];
  // Every other Legendary Dragon flies in (coloured by its element, see dragonElement).
  return getCard(cardId)?.tags?.includes('Dragon') ? 'dragon' : 'gold';
}

export type DragonElement = 'fire' | 'ice' | 'void' | 'moon' | 'gold';

/** A dragon's element, from its faction: the colour of its wings, roar and particles. */
export function dragonElement(cardId: string): DragonElement {
  switch (getCard(cardId)?.faction) {
    case 'TIDE':
      return 'ice';
    case 'VOID':
      return 'void';
    case 'ASTRAL':
      return 'moon';
    case 'EMBER':
      return 'fire';
    default:
      return 'gold';
  }
}

/** An Epic or Legendary spell played in this transition: it gets a flourish while it is cast. */
export function bigSpell(events: GameEvent[]): { cardId: string; player: PlayerId; rarity: 'EPIC' | 'LEGENDARY' } | null {
  for (const e of events) {
    if (e.type !== 'CARD_PLAYED') continue;
    const card = getCard(e.cardId);
    if (card?.cardType === 'SPELL' && (card.rarity === 'EPIC' || card.rarity === 'LEGENDARY')) return { cardId: e.cardId, player: e.player, rarity: card.rarity };
  }
  return null;
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
