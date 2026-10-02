import { emptyArena } from './arena';
import { STARTING_CURRENCY } from '@/config/economy';
import { STARTER_DECKS, starterCardIds, starterDeckCards } from '@/data/starterDecks';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { defaultBuild } from '@/data/wardenTalents';
import { DEFAULT_CARD_BACK } from '@/data/cardBacks';
import type { Deck } from './decks';
import { newRanked } from './ranked';
import { CURRENT_SAVE_VERSION, emptyVariants, type GameSave } from './save';

/** Copies of each starter card granted to new accounts. */
export const STARTER_COPIES = 2;

export function createNewSave(username: string, avatar: string, now: number, id: string): GameSave {
  const cards: GameSave['collection']['cards'] = {};
  for (const f of [...PLAYABLE_FACTIONS, 'NEUTRAL' as const]) {
    for (const cardId of starterCardIds(f)) cards[cardId] = { ...emptyVariants(), NORMAL: STARTER_COPIES };
  }
  const decks: Deck[] = STARTER_DECKS.map((d, i) => ({
    id: d.id,
    name: d.name,
    heroFaction: d.heroFaction,
    cards: starterDeckCards(d.heroFaction),
    talents: defaultBuild(d.heroFaction),
    favorite: i === 0,
    createdAt: now,
    updatedAt: now,
    isStarter: true,
  }));
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    profile: {
      id,
      username: username.trim().slice(0, 20) || 'Warden',
      avatar,
      level: 1,
      xp: 0,
      totalXp: 0,
      gold: STARTING_CURRENCY.gold,
      essence: STARTING_CURRENCY.essence,
      wins: 0,
      losses: 0,
      draws: 0,
      packsOpened: 0,
      cardsCrafted: 0,
      cardsRecycled: 0,
      favoriteDeckId: decks[0]?.id ?? null,
      selectedDeckId: decks[0]?.id ?? null,
      createdAt: now,
      lastSeenAt: now,
      title: null,
      titles: [],
      tutorialCompleted: false,
      firstWinDay: null,
      winsToday: 0,
      winsTodayDay: null,
      factionWins: {},
      ranked: newRanked(),
      cardBacks: [DEFAULT_CARD_BACK],
      cardBack: DEFAULT_CARD_BACK,
    },
    collection: { cards, unseen: [] },
    decks,
    economy: { packs: { ...STARTING_CURRENCY.packs }, pity: {} },
    quests: { active: [], lastRefreshDay: null, rerollDay: null, rerollsUsed: 0, totalCompleted: 0 },
    daily: { nextIndex: 0, lastClaimDay: null, lastClaimAt: 0, totalClaims: 0 },
    pve: { completed: {} },
    matchHistory: [],
    recentRewards: [],
    redeemedCodes: [],
    arena: emptyArena(),
  };
}
