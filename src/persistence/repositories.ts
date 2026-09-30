import type { Deck } from '@/domain/decks';
import type { CollectionState, DailyState, EconomyState, GameSave, MatchRecord, PlayerProfile, PveState, QuestState, RewardEntry } from '@/domain/save';
import type { KeyValueStore } from './storage';

/** Repository interfaces: the only way game code touches persistence. */
export interface PlayerRepository {
  load(): Promise<PlayerProfile | undefined>;
  save(profile: PlayerProfile): Promise<void>;
}
export interface CollectionRepository {
  load(): Promise<CollectionState | undefined>;
  save(collection: CollectionState): Promise<void>;
}
export interface DeckRepository {
  loadAll(): Promise<Deck[] | undefined>;
  saveAll(decks: Deck[]): Promise<void>;
}
export interface MatchRepository {
  loadRecent(): Promise<MatchRecord[] | undefined>;
  saveAll(records: MatchRecord[]): Promise<void>;
}
export interface ProgressData {
  economy: EconomyState;
  quests: QuestState;
  daily: DailyState;
  pve: PveState;
  recentRewards: RewardEntry[];
  redeemedCodes?: string[];
}
export interface ProgressRepository {
  load(): Promise<ProgressData | undefined>;
  save(progress: ProgressData): Promise<void>;
}

export const KEYS = {
  meta: 'meta',
  profile: 'profile',
  collection: 'collection',
  decks: 'decks',
  matches: 'matches',
  progress: 'progress',
} as const;

export interface SaveMeta {
  saveVersion: number;
  updatedAt: number;
}

/**
 * Composes all repositories over one KeyValueStore. `persist` writes only the
 * slices that changed (by reference) inside a single atomic transaction.
 */
export class SaveGateway {
  readonly player: PlayerRepository;
  readonly collection: CollectionRepository;
  readonly decks: DeckRepository;
  readonly matches: MatchRepository;
  readonly progress: ProgressRepository;

  constructor(private readonly store: KeyValueStore) {
    this.player = { load: () => store.get(KEYS.profile), save: (p) => store.set(KEYS.profile, p) };
    this.collection = { load: () => store.get(KEYS.collection), save: (c) => store.set(KEYS.collection, c) };
    this.decks = { loadAll: () => store.get(KEYS.decks), saveAll: (d) => store.set(KEYS.decks, d) };
    this.matches = { loadRecent: () => store.get(KEYS.matches), saveAll: (m) => store.set(KEYS.matches, m) };
    this.progress = { load: () => store.get(KEYS.progress), save: (p) => store.set(KEYS.progress, p) };
  }

  /** Loads raw slices. Validation/migration happens in migrations.ts. */
  async loadRaw(): Promise<Record<string, unknown> | null> {
    const meta = await this.store.get<SaveMeta>(KEYS.meta);
    const profile = await this.player.load();
    if (!meta && !profile) return null;
    const progress = (await this.progress.load()) as Partial<ProgressData> | undefined;
    return {
      saveVersion: meta?.saveVersion ?? 0,
      profile,
      collection: await this.collection.load(),
      decks: await this.decks.loadAll(),
      matchHistory: await this.matches.loadRecent(),
      ...(progress ?? {}),
    };
  }

  async persist(next: GameSave, prev: GameSave | null): Promise<void> {
    const entries: [string, unknown][] = [[KEYS.meta, { saveVersion: next.saveVersion, updatedAt: Date.now() } satisfies SaveMeta]];
    const changed = <K extends keyof GameSave>(k: K) => !prev || prev[k] !== next[k];
    if (changed('profile')) entries.push([KEYS.profile, next.profile]);
    if (changed('collection')) entries.push([KEYS.collection, next.collection]);
    if (changed('decks')) entries.push([KEYS.decks, next.decks]);
    if (changed('matchHistory')) entries.push([KEYS.matches, next.matchHistory]);
    if (changed('economy') || changed('quests') || changed('daily') || changed('pve') || changed('recentRewards') || changed('redeemedCodes')) {
      entries.push([KEYS.progress, { economy: next.economy, quests: next.quests, daily: next.daily, pve: next.pve, recentRewards: next.recentRewards, redeemedCodes: next.redeemedCodes } satisfies ProgressData]);
    }
    await this.store.setMany(entries);
  }

  async backupRaw(raw: unknown): Promise<string> {
    const key = `backup_${Date.now()}`;
    await this.store.set(key, raw);
    return key;
  }

  async clearSave(): Promise<void> {
    for (const k of Object.values(KEYS)) await this.store.delete(k);
  }
}
