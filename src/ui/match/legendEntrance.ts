import { getCard } from '@/data/cards';
import type { GameEvent, PlayerId } from '@/engine/types';

export type LegendTheme = 'gold' | 'meowchick' | 'liu' | 'abandoneer' | 'rendoslav' | 'qvido' | 'qinny' | 'tallys' | 'elinda' | 'skolky' | 'r3d3' | 'dragon' | 'artemis' | 'scar' | 'elinka' | 'simba' | 'gorn' | 'nereth' | 'sali' | 'vhessa' | 'ghul' | 'rimegrave' | 'azgaroth' | 'halcyon' | 'azrafel' | 'arbiter';

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
  emb_artemis_qinnys_bane: 'artemis',
  ver_scar_liu_kanos_mauler: 'scar',
  ast_archmage_elinka: 'elinka',
  vod_simba_ultimate_predator: 'simba',
  irn_steelmaker_gorn: 'gorn',
  tid_nereth_heart_of_the_maelstrom: 'nereth',
  neu_sali_the_creator: 'sali',
  // The Underflame's four lords.
  vod_vhessa_the_ash_serpent: 'vhessa',
  irn_ghul_the_forgemaster: 'ghul',
  tid_rimegrave_lord_of_the_frozen_lake: 'rimegrave',
  emb_azgaroth_the_ninth_sovereign: 'azgaroth',
  // The Twin Oath's three Legendaries.
  ast_halcyon_captain_of_the_pearl_gate: 'halcyon',
  emb_azrafel_angel_of_the_red_moon: 'azrafel',
  neu_the_arbiter: 'arbiter',
};

/**
 * Legendaries whose card art is landscape with a filler below (the Lamplighter legends): their
 * tall entrance frame shows the matching campaign portrait (src/assets/portraits) instead.
 */
export const ENTRANCE_PORTRAITS: Record<string, string> = {
  neu_nyx_lantern_of_nul: 'nul_lantern_warden',
  neu_vael_the_void_knell: 'nul_rootheart_colossus',
  neu_oblivia_keeper_of_the_last_page: 'nul_ring_of_thorns',
};

/** How long an entrance plays (ms, before reduced-motion scaling): the Arbiter's is the longest, then Sali's and Azgaroth's. */
export function legendDuration(cardId: string): number {
  const t = legendTheme(cardId);
  return t === 'arbiter' ? 3800 : t === 'sali' || t === 'azgaroth' ? 3400 : t === 'azrafel' ? 2500 : 2150;
}

/** Sali (or another card) took the Warden's place in this transition: its ascension plays. */
export function heroReplaced(events: GameEvent[]): { player: PlayerId; cardId: string } | null {
  for (const e of events) if (e.type === 'HERO_REPLACED') return { player: e.player, cardId: e.cardId };
  return null;
}

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
