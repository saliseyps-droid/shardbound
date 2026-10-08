import type { ActiveMatch } from './activeMatch';
import type { PackId } from '@/config/economy';
import type { ArenaState } from './arena';
import type { DungeonState } from './dungeon';
import type { Difficulty } from '@/config/progression';
import type { QuestType } from '@/config/quests';
import type { PlayableFaction, SetId, Variant } from '@/game/types';
import type { Deck } from './decks';
import type { RankedState } from './ranked';
import type { AiRankedState } from './aiRanked';
import type { BrawlState } from './brawl';
import type { PuzzleProgress } from './puzzles';

export const CURRENT_SAVE_VERSION = 5;

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  /** XP accumulated toward the next level. */
  xp: number;
  totalXp: number;
  gold: number;
  essence: number;
  wins: number;
  losses: number;
  draws: number;
  packsOpened: number;
  cardsCrafted: number;
  cardsRecycled: number;
  favoriteDeckId: string | null;
  selectedDeckId: string | null;
  createdAt: number;
  lastSeenAt: number;
  title: string | null;
  titles: string[];
  tutorialCompleted: boolean;
  /** Day key of the last first-win bonus. */
  firstWinDay: string | null;
  winsToday: number;
  winsTodayDay: string | null;
  factionWins: Partial<Record<PlayableFaction, number>>;
  /** Ranked online ladder. */
  ranked: RankedState;
  /** Ranked vs AI star ladder (src/domain/aiRanked.ts). */
  aiRanked: AiRankedState;
  /** Owned cosmetic card backs and the one in use. */
  cardBacks: string[];
  cardBack: string;
  /** Owned alternative Warden portraits (src/data/portraits.ts). */
  portraits: string[];
  /** Portrait per faction for all its decks; missing = the faction's default Warden. */
  factionPortraits: Partial<Record<PlayableFaction, string>>;
  /** One-time shop bundles already bought (src/config/economy.ts BUNDLES). */
  bundlesBought: string[];
  /** A match with stakes in progress (src/domain/activeMatch.ts); recorded as a loss if the app is reloaded mid-match. */
  activeMatch?: ActiveMatch | null;
  /** Achievements unlocked: id -> unlock time (src/domain/achievements.ts). */
  achievements: Record<string, number>;
  /** Consecutive wins (tutorial excluded) and the best run so far, for achievements. */
  winStreak: number;
  bestWinStreak: number;
  /** Tournaments won as champion. */
  tournamentsWon: number;
  /** Brawl fights won in the current rotation (src/domain/brawl.ts); missing until the first win. */
  brawl?: BrawlState;
  /** Daily puzzle solves and streak (src/domain/puzzles.ts); missing until the first. */
  puzzle?: PuzzleProgress;
  /** Brawl matches won, all rotations (achievements); missing until the first. */
  brawlWins?: number;
}

export type VariantCounts = Record<Variant, number>;

export interface CollectionState {
  cards: Record<string, VariantCounts>;
  /** Card ids obtained but not yet viewed (for "NEW" badges). */
  unseen: string[];
}

export interface EconomyState {
  packs: Partial<Record<PackId, number>>;
  /** Packs opened since last Epic / Legendary, per set (and for the Prismatic pack). */
  pity: Partial<Record<PackId, { EPIC: number; LEGENDARY: number }>>;
}

export interface Quest {
  id: string;
  templateId: string;
  type: QuestType;
  name: string;
  description: string;
  target: number;
  progress: number;
  gold: number;
  xp: number;
  faction?: PlayableFaction;
  /** Weekly quests also reward booster packs. */
  packs?: { setId: SetId; amount: number };
  completed: boolean;
  claimed: boolean;
  createdAt: number;
}

export interface QuestState {
  active: Quest[];
  lastRefreshDay: string | null;
  rerollDay: string | null;
  rerollsUsed: number;
  totalCompleted: number;
  /** One bigger quest per week (Monday to Sunday). */
  /** The quests of the week (WEEKLY_QUEST_COUNT). */
  weekly: Quest[];
  /** dayKey of the Monday the weekly quest belongs to. */
  weekKey: string | null;
}

export interface DailyState {
  /** Index (0-6) of the next reward in the 7-day cycle. */
  nextIndex: number;
  lastClaimDay: string | null;
  lastClaimAt: number;
  totalClaims: number;
}

export interface PveState {
  completed: Record<string, { firstClearAt: number; wins: number }>;
}

export interface MatchRecord {
  id: string;
  date: number;
  durationMs: number;
  mode: 'PRACTICE' | 'PVE' | 'TUTORIAL' | 'PVP' | 'RANKED' | 'TOURNAMENT' | 'ARENA' | 'AI_RANKED' | 'BRAWL' | 'DUNGEON' | 'PUZZLE';
  /** Ranked rating change, when ranked. */
  ratingChange?: number;
  opponentId: string;
  opponentName: string;
  difficulty: Difficulty;
  deckId: string;
  deckName: string;
  deckFaction: PlayableFaction;
  result: 'WIN' | 'LOSS' | 'DRAW';
  turns: number;
  damageDealt: number;
  cardsPlayed: number;
  unitsDestroyed: number;
  goldEarned: number;
  xpEarned: number;
  conceded: boolean;
}

export type RewardEntry = {
  id: string;
  at: number;
  source: string;
  gold?: number;
  essence?: number;
  xp?: number;
  packs?: { setId: SetId; amount: number };
  cards?: { cardId: string; variant: Variant }[];
  title?: string;
};

export interface GameSave {
  saveVersion: number;
  profile: PlayerProfile;
  collection: CollectionState;
  decks: Deck[];
  economy: EconomyState;
  quests: QuestState;
  daily: DailyState;
  pve: PveState;
  matchHistory: MatchRecord[];
  recentRewards: RewardEntry[];
  /** Ids of redeem codes already used by this account. */
  redeemedCodes: string[];
  /** Arena run in progress, last result and records. */
  arena: ArenaState;
  /** Dungeon runs (src/domain/dungeon.ts); missing in older saves. */
  dungeon?: DungeonState;
}

export const MATCH_HISTORY_LIMIT = 100;
export const RECENT_REWARDS_LIMIT = 20;

export function emptyVariants(): VariantCounts {
  return { NORMAL: 0, FOIL: 0, PRISMATIC: 0 };
}

export function ownedCopies(collection: CollectionState, cardId: string): number {
  const v = collection.cards[cardId];
  return v ? v.NORMAL + v.FOIL + v.PRISMATIC : 0;
}

export function addCards(collection: CollectionState, cards: { cardId: string; variant: Variant }[]): CollectionState {
  const next: CollectionState = { cards: { ...collection.cards }, unseen: [...collection.unseen] };
  for (const { cardId, variant } of cards) {
    const prev = next.cards[cardId] ?? emptyVariants();
    if (ownedCopies(collection, cardId) === 0 && !next.unseen.includes(cardId)) next.unseen.push(cardId);
    next.cards[cardId] = { ...prev, [variant]: prev[variant] + 1 };
  }
  return next;
}

export function pushReward(save: GameSave, reward: Omit<RewardEntry, 'id' | 'at'>, now: number): GameSave {
  const entry: RewardEntry = { ...reward, id: `r_${now}_${save.recentRewards.length}_${Math.floor(Math.random() * 1e6)}`, at: now };
  return { ...save, recentRewards: [entry, ...save.recentRewards].slice(0, RECENT_REWARDS_LIMIT) };
}
