import { DUNGEON, DUNGEON_MATCHES } from '@/config/dungeon';
import { CAMPAIGN, DIFFICULTY_POOLS, PRACTICE_OPPONENTS, type OpponentDef } from '@/data/opponents';
import { collectibleCards, getCard } from '@/data/cards';
import { DUNGEON_TREASURES, getTreasure } from '@/data/dungeonTreasures';
import { defaultBuild } from '@/data/wardenTalents';
import { createRng, hashString, nextFloat, shuffleInPlace, type RngState } from '@/core/rng';
import { dayKey, err, ok, type Result } from '@/core/utils';
import { PLAYABLE_FACTIONS, type CardDefinition, type PlayableFaction, type Rarity } from '@/game/types';
import type { BrawlSideMods } from '@/data/brawl';
import { maxCopiesFor, type Deck } from './decks';
import { pushReward, type GameSave } from './save';
import { isLaterKey, trustedNow } from './clock';

/**
 * Dungeon run (roguelike): one Warden, a small starting deck, three floors of three opponents.
 * Each normal win adds cards (one of three offers), each floor boss gives a treasure; one loss
 * ends the run and pays by the number of wins. See src/config/dungeon.ts.
 */
export interface DungeonRun {
  id: string;
  seed: number;
  startedAt: number;
  faction: PlayableFaction;
  /** Card ids in the deck (copies repeated). */
  deck: string[];
  /** Treasure ids taken (src/data/dungeonTreasures.ts). */
  treasures: string[];
  wins: number;
  /** A reward to choose before the next match. */
  pending: 'CARDS' | 'TREASURE' | null;
  /** Started with the day's free entry (retiring it before playing pays nothing). */
  free?: boolean;
}

export interface DungeonReward {
  gold: number;
  packs: number;
  essence: number;
}

export interface DungeonSummary {
  wins: number;
  faction: PlayableFaction;
  cleared: boolean;
  finishedAt: number;
  reward: DungeonReward;
  seen: boolean;
}

export interface DungeonState {
  run: DungeonRun | null;
  last: DungeonSummary | null;
  runsPlayed: number;
  bestWins: number;
  /** Full clears (all nine matches). */
  clears: number;
  /** Factions a run was fully cleared with. */
  clearedFactions: PlayableFaction[];
  /** dayKey of the last free entry (one free run per day). */
  freeEntryDay: string | null;
}

/** One reward option after a normal win. */
export interface DungeonOffer {
  kind: 'BUNDLE' | 'CARD';
  /** Archetype of a bundle (display). */
  label?: string;
  cards: string[];
}

export function emptyDungeon(): DungeonState {
  return { run: null, last: null, runsPlayed: 0, bestWins: 0, clears: 0, clearedFactions: [], freeEntryDay: null };
}

export const dungeonFloor = (wins: number) => Math.min(DUNGEON.floors - 1, Math.floor(wins / DUNGEON.perFloor));
export const isBossMatch = (wins: number) => wins % DUNGEON.perFloor === DUNGEON.perFloor - 1;

/** Deterministic random numbers for one step of a run (reloading never re-rolls). */
const rngFor = (run: Pick<DungeonRun, 'seed'>, step: string) => createRng(hashString(`dungeon:${run.seed}:${step}`));

const poolFor = (faction: PlayableFaction) => collectibleCards().filter((c) => c.faction === faction || c.faction === 'NEUTRAL');

export function hasFreeDungeonEntry(save: GameSave, now: number): boolean {
  return isLaterKey(dayKey(trustedNow(save, now)), dungeonOf(save).freeEntryDay);
}

/** The save's dungeon state (older saves have none yet). */
export const dungeonOf = (save: GameSave): DungeonState => save.dungeon ?? emptyDungeon();

/** A small, cheap starting deck of commons: two copies each, mostly low cost. */
export function startingDeck(faction: PlayableFaction, rng: RngState): string[] {
  const commons = poolFor(faction).filter((c) => c.rarity === 'COMMON' && c.manaCost <= 5);
  const own = shuffleInPlace(rng, commons.filter((c) => c.faction === faction));
  const neutral = shuffleInPlace(rng, commons.filter((c) => c.faction === 'NEUTRAL'));
  const picks = [...own.slice(0, 7), ...neutral.slice(0, 3)].sort((a, b) => a.manaCost - b.manaCost);
  const deck = picks.flatMap((c) => [c.id, c.id]);
  return deck.slice(0, DUNGEON.startDeckSize);
}

export function startDungeon(save: GameSave, faction: PlayableFaction, now: number, seed: number): Result<GameSave> {
  const d = dungeonOf(save);
  if (d.run) return err('You already have a Dungeon run in progress.');
  if (!(PLAYABLE_FACTIONS as readonly string[]).includes(faction)) return err('Choose a Warden.');
  const free = hasFreeDungeonEntry(save, now);
  if (!free && save.profile.gold < DUNGEON.entryGold) return err(`The Dungeon costs ${DUNGEON.entryGold} Gold to enter.`);
  const s = seed >>> 0;
  const run: DungeonRun = { id: `dungeon_${now}_${s}`, seed: s, startedAt: now, faction, deck: startingDeck(faction, rngFor({ seed: s }, 'start')), treasures: [], wins: 0, pending: 'CARDS', free };
  const gold = free ? save.profile.gold : save.profile.gold - DUNGEON.entryGold;
  return ok({ ...save, profile: { ...save.profile, gold }, dungeon: { ...d, run, freeEntryDay: free ? dayKey(trustedNow(save, now)) : d.freeEntryDay } });
}

/** The run's deck as a normal deck object (never stored in the deck list). */
export function dungeonDeck(run: DungeonRun): Deck {
  const cards: Record<string, number> = {};
  for (const id of run.deck) cards[id] = (cards[id] ?? 0) + 1;
  return { id: run.id, name: 'Dungeon deck', heroFaction: run.faction, cards, talents: defaultBuild(run.faction), favorite: false, createdAt: run.startedAt, updatedAt: run.startedAt };
}

/** What the treasures add to the player's side of every match. */
export function dungeonPlayerMods(run: DungeonRun): BrawlSideMods {
  const out: BrawlSideMods = {};
  for (const id of run.treasures) {
    const m = getTreasure(id)?.mods;
    if (!m) continue;
    if (m.heroHealth !== undefined) out.heroHealth = Math.max(out.heroHealth ?? 0, m.heroHealth);
    if (m.bonusStartingEnergy) out.bonusStartingEnergy = (out.bonusStartingEnergy ?? 0) + m.bonusStartingEnergy;
    if (m.startingArmor) out.startingArmor = (out.startingArmor ?? 0) + m.startingArmor;
    if (m.rules) out.rules = [...(out.rules ?? []), ...m.rules];
    if (m.startingBoard) out.startingBoard = [...(out.startingBoard ?? []), ...m.startingBoard];
  }
  return out;
}

/** The next opponent: harder with every win; the third of each floor is a campaign boss. */
export function dungeonOpponent(run: DungeonRun): OpponentDef {
  const i = run.wins;
  const rng = rngFor(run, `opp${i}`);
  const difficulty = DUNGEON.difficultyByMatch[Math.min(i, DUNGEON.difficultyByMatch.length - 1)];
  if (isBossMatch(i)) {
    const ids = DUNGEON.bossesByFloor[dungeonFloor(i)];
    const id = ids[Math.floor(nextFloat(rng) * ids.length) % ids.length];
    const boss = CAMPAIGN.flatMap((c) => c.encounters).find((e) => e.id === id);
    if (boss) return { ...boss, id: `${run.id}_boss${i}`, difficulty, rarities: DIFFICULTY_POOLS[difficulty], boss: true, firstWinReward: undefined };
  }
  const faction = PLAYABLE_FACTIONS[Math.floor(nextFloat(rng) * PLAYABLE_FACTIONS.length) % PLAYABLE_FACTIONS.length];
  const base = PRACTICE_OPPONENTS[faction];
  return { ...base, id: `${run.id}_opp${i}`, difficulty, rarities: DIFFICULTY_POOLS[difficulty] };
}

function copiesLeft(run: DungeonRun, card: CardDefinition, extra: string[] = []): boolean {
  const n = [...run.deck, ...extra].filter((id) => id === card.id).length;
  return n < maxCopiesFor(card);
}

const RARITY_WEIGHT: Record<Rarity, number> = { COMMON: 6, RARE: 4, EPIC: 2, LEGENDARY: 0 };

/** Three card offers after a normal win: two themed bundles of three cards and one strong card. */
export function dungeonOffers(run: DungeonRun): DungeonOffer[] {
  if (run.pending !== 'CARDS') return [];
  const rng = rngFor(run, `offer${run.wins}:${run.deck.length}`);
  const pool = poolFor(run.faction);
  const archetypes = shuffleInPlace(rng, [...new Set(pool.filter((c) => c.faction === run.faction).flatMap((c) => c.archetypes ?? []))]);
  const offers: DungeonOffer[] = [];
  for (const label of archetypes) {
    if (offers.length >= 2) break;
    const cards: string[] = [];
    // Weighted random order (commons most likely); a card appears at most once per bundle.
    const candidates = pool
      .filter((c) => (c.archetypes ?? []).includes(label) && RARITY_WEIGHT[c.rarity] > 0)
      .map((c) => ({ c, key: Math.pow(nextFloat(rng), 1 / RARITY_WEIGHT[c.rarity]) }))
      .sort((a, b) => b.key - a.key)
      .map((x) => x.c);
    for (const c of candidates) {
      if (cards.length >= 3) break;
      if (!cards.includes(c.id) && copiesLeft(run, c, cards)) cards.push(c.id);
    }
    if (cards.length === 3) offers.push({ kind: 'BUNDLE', label, cards });
  }
  const strong = shuffleInPlace(rng, pool.filter((c) => (c.rarity === 'EPIC' || c.rarity === 'LEGENDARY') && copiesLeft(run, c)));
  if (strong[0]) offers.push({ kind: 'CARD', cards: [strong[0].id] });
  return offers;
}

/** Three treasures after a floor boss (none the run already has). */
export function dungeonTreasureOffers(run: DungeonRun): string[] {
  if (run.pending !== 'TREASURE') return [];
  const rng = rngFor(run, `treasure${run.wins}`);
  return shuffleInPlace(rng, DUNGEON_TREASURES.filter((t) => !run.treasures.includes(t.id)).map((t) => t.id)).slice(0, 3);
}

export function pickDungeonOffer(save: GameSave, index: number): Result<GameSave> {
  const run = dungeonOf(save).run;
  if (!run || run.pending !== 'CARDS') return err('There is nothing to choose right now.');
  const offer = dungeonOffers(run)[index];
  if (!offer) return err('That offer is not available.');
  return ok(withRun(save, { ...run, deck: [...run.deck, ...offer.cards], pending: null }));
}

export function pickDungeonTreasure(save: GameSave, treasureId: string): Result<GameSave> {
  const run = dungeonOf(save).run;
  if (!run || run.pending !== 'TREASURE') return err('There is no treasure to choose right now.');
  if (!dungeonTreasureOffers(run).includes(treasureId)) return err('That treasure is not on offer.');
  return ok(withRun(save, { ...run, treasures: [...run.treasures, treasureId], pending: null }));
}

export function dungeonRewards(wins: number): DungeonReward {
  const row = DUNGEON.rewards[Math.max(0, Math.min(wins, DUNGEON.rewards.length - 1))];
  return { gold: row.gold, packs: row.packs, essence: row.essence };
}

export function recordDungeonMatch(save: GameSave, result: 'WIN' | 'LOSS' | 'DRAW', now: number): Result<GameSave> {
  const run = dungeonOf(save).run;
  if (!run || run.pending) return err('There is no Dungeon match to record.');
  if (result !== 'WIN') return ok(finish(save, run, now));
  const wins = run.wins + 1;
  const next: DungeonRun = { ...run, wins, pending: wins >= DUNGEON_MATCHES ? null : wins % DUNGEON.perFloor === 0 ? 'TREASURE' : 'CARDS' };
  return ok(wins >= DUNGEON_MATCHES ? finish(save, next, now) : withRun(save, next));
}

export function retireDungeon(save: GameSave, now: number): Result<GameSave> {
  const d = dungeonOf(save);
  const run = d.run;
  if (!run) return err('There is no Dungeon run to retire.');
  // A free run given up before its first match pays nothing (otherwise it is a free daily reward).
  if (run.free && run.wins === 0) return ok({ ...save, dungeon: { ...d, run: null } });
  return ok(finish(save, run, now));
}

function finish(save: GameSave, run: DungeonRun, now: number): GameSave {
  const d = dungeonOf(save);
  const wins = run.wins;
  const cleared = wins >= DUNGEON_MATCHES;
  const reward = dungeonRewards(wins);
  const set = DUNGEON.packSet;
  let next: GameSave = {
    ...save,
    profile: { ...save.profile, gold: save.profile.gold + reward.gold, essence: save.profile.essence + reward.essence },
    economy: reward.packs ? { ...save.economy, packs: { ...save.economy.packs, [set]: (save.economy.packs[set] ?? 0) + reward.packs } } : save.economy,
    dungeon: {
      ...d,
      run: null,
      last: { wins, faction: run.faction, cleared, finishedAt: now, reward, seen: false },
      runsPlayed: d.runsPlayed + 1,
      bestWins: Math.max(d.bestWins, wins),
      clears: d.clears + (cleared ? 1 : 0),
      clearedFactions: cleared && !d.clearedFactions.includes(run.faction) ? [...d.clearedFactions, run.faction] : d.clearedFactions,
    },
  };
  next = pushReward(next, { source: `Dungeon: ${wins} win${wins === 1 ? '' : 's'}`, gold: reward.gold, essence: reward.essence || undefined, packs: reward.packs ? { setId: set, amount: reward.packs } : undefined }, now);
  return next;
}

/** Dismisses the end-of-run summary for good. */
export function acknowledgeDungeonResult(save: GameSave): GameSave {
  const d = dungeonOf(save);
  return d.last && !d.last.seen ? { ...save, dungeon: { ...d, last: { ...d.last, seen: true } } } : save;
}

function withRun(save: GameSave, run: DungeonRun): GameSave {
  return { ...save, dungeon: { ...dungeonOf(save), run } };
}

/** Load-time repair: keeps a run only when every part of it is still valid. */
export function repairDungeon(raw: unknown): DungeonState {
  const base = emptyDungeon();
  if (!raw || typeof raw !== 'object') return base;
  const a = raw as Record<string, unknown>;
  const isFaction = (f: unknown): f is PlayableFaction => (PLAYABLE_FACTIONS as readonly unknown[]).includes(f);
  const int = (v: unknown, max = Number.MAX_SAFE_INTEGER) => (Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v as number))) : 0);
  const l = a.last as DungeonSummary | null | undefined;
  const out: DungeonState = {
    run: null,
    last: l && typeof l === 'object' && Number.isFinite(l.wins) && isFaction(l.faction) ? { ...l, seen: l.seen !== false } : null,
    runsPlayed: int(a.runsPlayed),
    bestWins: int(a.bestWins, DUNGEON_MATCHES),
    clears: int(a.clears),
    clearedFactions: Array.isArray(a.clearedFactions) ? [...new Set(a.clearedFactions.filter(isFaction))] : [],
    freeEntryDay: typeof a.freeEntryDay === 'string' ? a.freeEntryDay : null,
  };
  const r = a.run as DungeonRun | null | undefined;
  if (
    r && typeof r === 'object' && typeof r.id === 'string' && Number.isFinite(r.seed) && isFaction(r.faction) &&
    Array.isArray(r.deck) && r.deck.length > 0 && r.deck.every((id) => typeof id === 'string' && getCard(id)) &&
    Array.isArray(r.treasures) && r.treasures.every((id) => typeof id === 'string' && getTreasure(id)) &&
    Number.isInteger(r.wins) && r.wins >= 0 && r.wins < DUNGEON_MATCHES &&
    (r.pending === null || r.pending === 'CARDS' || r.pending === 'TREASURE')
  ) {
    out.run = { ...r, startedAt: Number(r.startedAt) || 0, free: r.free === true };
  }
  return out;
}

