import { ARENA } from '@/config/arena';
import { DIFFICULTY_POOLS, PRACTICE_OPPONENTS, type OpponentDef } from '@/data/opponents';
import { collectibleCards, getCard } from '@/data/cards';
import { CARD_BACKS } from '@/data/cardBacks';
import { validateBuild, type TalentPick } from '@/data/wardenTalents';
import { createRng, hashString, nextFloat, pickWeighted, shuffleInPlace } from '@/core/rng';
import { dayKey, err, ok, type Result } from '@/core/utils';
import { PLAYABLE_FACTIONS, RARITIES, type PlayableFaction, type Rarity, type SetId } from '@/game/types';
import { maxCopiesFor, type Deck } from './decks';
import { pushReward, type GameSave } from './save';

export interface ArenaRun {
  id: string;
  seed: number;
  startedAt: number;
  factionChoices: [PlayableFaction, PlayableFaction];
  faction: PlayableFaction | null;
  /** Drafted card ids, in pick order. */
  picks: string[];
  talents: TalentPick[] | null;
  /** Match results so far. */
  results: ('WIN' | 'LOSS')[];
}

export interface ArenaReward {
  gold: number;
  packs: { setId: SetId; amount: number }[];
  cardBack?: string;
}

export interface ArenaSummary {
  wins: number;
  faction: PlayableFaction | null;
  finishedAt: number;
  reward: ArenaReward;
  /** The player has seen the end-of-run summary. */
  seen: boolean;
}

export interface ArenaState {
  run: ArenaRun | null;
  last: ArenaSummary | null;
  runsPlayed: number;
  bestWins: number;
  /** dayKey of the last free entry (one free run per day). */
  freeEntryDay: string | null;
}

export type ArenaPhase = 'FACTION' | 'DRAFT' | 'TALENTS' | 'PLAYING';

export function emptyArena(): ArenaState {
  return { run: null, last: null, runsPlayed: 0, bestWins: 0, freeEntryDay: null };
}

export function arenaPhase(run: ArenaRun): ArenaPhase {
  if (!run.faction) return 'FACTION';
  if (run.picks.length < ARENA.deckSize) return 'DRAFT';
  if (!run.talents) return 'TALENTS';
  return 'PLAYING';
}

export const arenaWins = (run: ArenaRun) => run.results.filter((r) => r === 'WIN').length;

/** Deterministic random numbers for one step of a run (reloading never re-rolls). */
const rngFor = (run: ArenaRun, step: string) => createRng(hashString(`${run.seed}:${step}`));

/** The first Arena run of each day is free. */
export function hasFreeArenaEntry(save: GameSave, now: number): boolean {
  return save.arena.freeEntryDay !== dayKey(now);
}

export function startArena(save: GameSave, now: number, seed: number): Result<GameSave> {
  if (save.arena.run) return err('You already have an Arena run in progress.');
  const free = hasFreeArenaEntry(save, now);
  if (!free && save.profile.gold < ARENA.entryGold) return err(`The Arena costs ${ARENA.entryGold} Gold to enter.`);
  const rng = createRng(seed);
  const factions = shuffleInPlace(rng, [...PLAYABLE_FACTIONS]);
  const run: ArenaRun = { id: `arena_${now}_${seed >>> 0}`, seed: seed >>> 0, startedAt: now, factionChoices: [factions[0], factions[1]], faction: null, picks: [], talents: null, results: [] };
  const gold = free ? save.profile.gold : save.profile.gold - ARENA.entryGold;
  return ok({ ...save, profile: { ...save.profile, gold }, arena: { ...save.arena, run, freeEntryDay: free ? dayKey(now) : save.arena.freeEntryDay } });
}

export function chooseArenaFaction(save: GameSave, faction: PlayableFaction): Result<GameSave> {
  const run = save.arena.run;
  if (!run || arenaPhase(run) !== 'FACTION') return err('There is no faction to choose right now.');
  if (!run.factionChoices.includes(faction)) return err('Choose one of the two offered factions.');
  return ok(withRun(save, { ...run, faction }));
}

/** The three cards offered for the next pick (empty when the draft is over). */
export function currentOffer(run: ArenaRun): string[] {
  if (arenaPhase(run) !== 'DRAFT') return [];
  const rng = rngFor(run, `pick${run.picks.length}`);
  const counts: Record<string, number> = {};
  for (const id of run.picks) counts[id] = (counts[id] ?? 0) + 1;
  const eligible = collectibleCards().filter((c) => (c.faction === run.faction || c.faction === 'NEUTRAL') && (counts[c.id] ?? 0) < maxCopiesFor(c));
  const rolled = pickWeighted(rng, ARENA.rarityWeights);
  // Fall back to lower rarities (then any) when the rolled one has too few cards left.
  const order: (Rarity | null)[] = [...RARITIES.slice(0, RARITIES.indexOf(rolled) + 1).reverse(), ...RARITIES.slice(RARITIES.indexOf(rolled) + 1), null];
  for (const rarity of order) {
    const pool = eligible.filter((c) => rarity === null || c.rarity === rarity);
    if (pool.length >= 3) return shuffleInPlace(rng, pool.map((c) => c.id)).slice(0, 3);
  }
  return shuffleInPlace(rng, eligible.map((c) => c.id)).slice(0, 3);
}

export function pickArenaCard(save: GameSave, cardId: string): Result<GameSave> {
  const run = save.arena.run;
  if (!run || arenaPhase(run) !== 'DRAFT') return err('The draft is over.');
  if (!currentOffer(run).includes(cardId)) return err('That card is not on offer.');
  return ok(withRun(save, { ...run, picks: [...run.picks, cardId] }));
}

export function setArenaTalents(save: GameSave, talents: TalentPick[]): Result<GameSave> {
  const run = save.arena.run;
  if (!run || !run.faction || run.picks.length < ARENA.deckSize) return err('Finish the draft first.');
  if (run.results.length > 0) return err('Talents are locked once the first match is played.');
  const problem = validateBuild(run.faction, talents);
  if (problem) return err(problem);
  return ok(withRun(save, { ...run, talents: talents.map((t) => ({ ...t })) }));
}

/** The drafted deck as a normal deck object (it is never stored in the deck list). */
export function arenaDeck(run: ArenaRun): Deck {
  const cards: Record<string, number> = {};
  for (const id of run.picks) cards[id] = (cards[id] ?? 0) + 1;
  return { id: run.id, name: 'Arena deck', heroFaction: run.faction ?? 'EMBER', cards, talents: run.talents ?? [], favorite: false, createdAt: run.startedAt, updatedAt: run.startedAt };
}

/** The next opponent: a random faction, harder with every win. */
export function arenaOpponent(run: ArenaRun): OpponentDef {
  const i = run.results.length;
  const rng = rngFor(run, `opp${i}`);
  const faction = PLAYABLE_FACTIONS[Math.floor(nextFloat(rng) * PLAYABLE_FACTIONS.length)];
  const difficulty = ARENA.difficultyByWins[Math.min(arenaWins(run), ARENA.difficultyByWins.length - 1)];
  const base = PRACTICE_OPPONENTS[faction];
  return { ...base, id: `${run.id}_opp${i}`, difficulty, rarities: DIFFICULTY_POOLS[difficulty], intro: base.intro };
}

/** Reward for a finished run. `random` picks pack sets and the card back. */
export function arenaRewards(wins: number, ownedBacks: string[], random: () => number): ArenaReward {
  const row = ARENA.rewards[Math.max(0, Math.min(wins, ARENA.rewards.length - 1))];
  const bySet: Partial<Record<SetId, number>> = {};
  for (let i = 0; i < row.packs; i++) {
    const set = ARENA.packSets[Math.floor(random() * ARENA.packSets.length) % ARENA.packSets.length];
    bySet[set] = (bySet[set] ?? 0) + 1;
  }
  const packs = Object.entries(bySet).map(([setId, amount]) => ({ setId: setId as SetId, amount: amount! }));
  let gold = row.gold;
  let cardBack: string | undefined;
  if (row.cardBack) {
    const missing = CARD_BACKS.filter((b) => !ownedBacks.includes(b.id));
    if (missing.length) cardBack = missing[Math.floor(random() * missing.length) % missing.length].id;
    else gold += ARENA.cardBackFallbackGold;
  }
  return { gold, packs, cardBack };
}

export function recordArenaMatch(save: GameSave, result: 'WIN' | 'LOSS' | 'DRAW', now: number): Result<GameSave> {
  const run = save.arena.run;
  if (!run || arenaPhase(run) !== 'PLAYING') return err('There is no Arena match to record.');
  const next: ArenaRun = { ...run, results: [...run.results, result === 'WIN' ? 'WIN' : 'LOSS'] };
  const over = result !== 'WIN' || arenaWins(next) >= ARENA.maxWins;
  return ok(over ? finish(withRun(save, next), next, now) : withRun(save, next));
}

export function retireArena(save: GameSave, now: number): Result<GameSave> {
  const run = save.arena.run;
  if (!run) return err('There is no Arena run to retire.');
  return ok(finish(save, run, now));
}

function finish(save: GameSave, run: ArenaRun, now: number): GameSave {
  const wins = arenaWins(run);
  const rng = rngFor(run, 'reward');
  const reward = arenaRewards(wins, save.profile.cardBacks, () => nextFloat(rng));
  const packs = { ...save.economy.packs };
  for (const p of reward.packs) packs[p.setId] = (packs[p.setId] ?? 0) + p.amount;
  let next: GameSave = {
    ...save,
    profile: {
      ...save.profile,
      gold: save.profile.gold + reward.gold,
      cardBacks: reward.cardBack ? [...save.profile.cardBacks, reward.cardBack] : save.profile.cardBacks,
    },
    economy: { ...save.economy, packs },
    arena: {
      ...save.arena,
      run: null,
      last: { wins, faction: run.faction, finishedAt: now, reward, seen: false },
      runsPlayed: save.arena.runsPlayed + 1,
      bestWins: Math.max(save.arena.bestWins, wins),
    },
  };
  const total = reward.packs.reduce((a, p) => a + p.amount, 0);
  next = pushReward(next, { source: `Arena: ${wins} win${wins === 1 ? '' : 's'}`, gold: reward.gold, packs: reward.packs[0] ? { setId: reward.packs[0].setId, amount: total } : undefined }, now);
  return next;
}

/** Dismisses the end-of-run summary for good. */
export function acknowledgeArenaResult(save: GameSave): GameSave {
  const last = save.arena.last;
  return last && !last.seen ? { ...save, arena: { ...save.arena, last: { ...last, seen: true } } } : save;
}

function withRun(save: GameSave, run: ArenaRun): GameSave {
  return { ...save, arena: { ...save.arena, run } };
}

/** Load-time repair: keeps a run only when every part of it is still valid. */
export function repairArena(raw: unknown): ArenaState {
  const base = emptyArena();
  if (!raw || typeof raw !== 'object') return base;
  const a = raw as Partial<ArenaState> & Record<string, unknown>;
  const out: ArenaState = {
    run: null,
    last: a.last && typeof a.last === 'object' && typeof (a.last as ArenaSummary).wins === 'number' ? { ...(a.last as ArenaSummary), seen: (a.last as ArenaSummary).seen !== false } : null,
    runsPlayed: Number.isFinite(a.runsPlayed) ? Math.max(0, Math.floor(a.runsPlayed as number)) : 0,
    bestWins: Number.isFinite(a.bestWins) ? Math.max(0, Math.min(ARENA.maxWins, Math.floor(a.bestWins as number))) : 0,
    freeEntryDay: typeof a.freeEntryDay === 'string' ? a.freeEntryDay : null,
  };
  const r = a.run as ArenaRun | null | undefined;
  const isFaction = (f: unknown): f is PlayableFaction => (PLAYABLE_FACTIONS as readonly unknown[]).includes(f);
  if (
    r && typeof r === 'object' && typeof r.id === 'string' && Number.isFinite(r.seed) &&
    Array.isArray(r.factionChoices) && r.factionChoices.length === 2 && r.factionChoices.every(isFaction) &&
    (r.faction === null || isFaction(r.faction)) &&
    Array.isArray(r.picks) && r.picks.length <= ARENA.deckSize && r.picks.every((id) => typeof id === 'string' && getCard(id)) &&
    Array.isArray(r.results) && r.results.every((x) => x === 'WIN' || x === 'LOSS') &&
    (r.talents === null || (r.faction !== null && validateBuild(r.faction, r.talents) === null))
  ) {
    out.run = { ...r, startedAt: Number(r.startedAt) || 0 };
  }
  return out;
}
