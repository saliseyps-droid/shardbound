import { describe, expect, it } from 'vitest';
import { applyAction } from '@/engine';
import type { GameAction, GameState } from '@/engine';
import { getLegalActions } from '@/engine/legal';
import { PUZZLES } from '@/data/puzzles';
import { getCard } from '@/data/cards';
import { createPuzzleGame, currentStreak, puzzleForDay, solvePuzzle } from '@/domain/puzzles';

const side = { name: 'P', avatar: 'a' };

function key(s: GameState): string {
  return JSON.stringify(s.players.map((p) => [p.hero.health, p.hero.armor, p.energy, p.hand.map((c) => c.cardId + ':' + c.costMod), p.board.map((u) => [u.cardId, u.damage, u.attackBuff, u.healthBuff, u.tempAttack, u.attacksThisTurn, u.frozen, u.barrier, u.silenced, u.keywords.join('')])]));
}

interface Result { best: number; sets: Set<string>; leaves: number; wins: number; minLen: number }

/** Max enemy-Warden damage this turn, and which sets of cards reach it. */
function analyse(start: GameState, budget: { n: number }): Result | null {
  const hp0 = start.players[1].hero.health + start.players[1].hero.armor;
  const memo = new Map<string, number>();
  const bestOf = (s: GameState): number => {
    if (--budget.n < 0) throw new Error('budget');
    if (s.winner === 0) return 1e6;
    const k = key(s);
    const m = memo.get(k);
    if (m !== undefined) return m;
    let best = hp0 - (s.players[1].hero.health + s.players[1].hero.armor);
    for (const a of getLegalActions(s, 0)) {
      if (a.type === 'END_TURN' || a.type === 'CONCEDE') continue;
      const r = applyAction(s, a);
      if (r.error) continue;
      best = Math.max(best, bestOf(r.state));
    }
    memo.set(k, best);
    return best;
  };
  let best: number;
  try { best = bestOf(start); } catch { return null; }
  if (best >= 1e6) return null;
  // Second pass: with Health = best, collect winning card sets.
  const sets = new Set<string>();
  let minLen = 99;
  const seen = new Map<string, boolean>();
  const walk = (s: GameState, played: string[], depth: number): boolean => {
    if (--budget.n < 0) throw new Error('budget');
    const dmg = hp0 - (s.players[1].hero.health + s.players[1].hero.armor);
    if (dmg >= best || s.winner === 0) { sets.add([...played].sort().join('+')); minLen = Math.min(minLen, depth); return true; }
    const k = key(s) + '|' + [...played].sort().join('+');
    if (seen.has(k)) return seen.get(k)!;
    let any = false;
    for (const a of getLegalActions(s, 0)) {
      if (a.type === 'END_TURN' || a.type === 'CONCEDE') continue;
      const r = applyAction(s, a);
      if (r.error) continue;
      const card = a.type === 'PLAY_CARD' ? s.players[0].hand.find((c) => c.uid === a.cardUid)?.cardId : undefined;
      if (walk(r.state, card ? [...played, card] : played, depth + 1)) any = true;
    }
    seen.set(k, any);
    return any;
  };
  try { walk(start, [], 0); } catch { return null; }
  return { best, sets, leaves: 0, wins: 0, minLen };
}

/** Naive plan: play every affordable card (enemy hero as target when allowed), then attack the hero with everything. */
function naive(s: GameState): number {
  const hp0 = s.players[1].hero.health;
  for (let guard = 0; guard < 30; guard++) {
    const acts = getLegalActions(s, 0).filter((a) => a.type === 'PLAY_CARD');
    if (!acts.length) break;
    const a = acts.find((x) => x.type === 'PLAY_CARD' && x.target && 'type' in x.target && x.target.type === 'hero' && x.target.player === 1) ?? acts[0];
    const r = applyAction(s, a); if (r.error) break; s = r.state;
  }
  for (const u of [...s.players[0].board]) {
    for (let k = 0; k < 2; k++) {
      const r = applyAction(s, { type: 'ATTACK', player: 0, attackerUid: u.uid, target: { type: 'hero', player: 1 } } as GameAction);
      if (!r.error) s = r.state;
    }
  }
  return hp0 - s.players[1].hero.health;
}

describe('daily puzzles', () => {
  /** First winning line found by depth-first search (fast; used by the regular test run). */
  const firstWin = (s: GameState, depth: number, dead = new Set<string>()): boolean => {
    if (s.winner === 0) return true;
    if (depth === 0 || s.phase === 'ENDED') return false;
    const k = key(s);
    if (dead.has(k)) return false;
    for (const a of getLegalActions(s, 0)) {
      if (a.type === 'END_TURN' || a.type === 'CONCEDE') continue;
      const r = applyAction(s, a);
      if (!r.error && firstWin(r.state, depth - 1, dead)) return true;
    }
    dead.add(k);
    return false;
  };

  it('every puzzle uses known cards, starts on your turn and can be won', () => {
    for (const p of PUZZLES) {
      for (const id of [...p.hand, ...p.board, ...p.enemy.board].map((u) => (typeof u === 'string' ? u : u.cardId))) expect(getCard(id), `${p.id}: ${id}`).toBeDefined();
      const g = createPuzzleGame(p, side, side);
      expect(g.activePlayer, p.id).toBe(0);
      expect(g.phase, p.id).toBe('MAIN');
      expect(firstWin(g, 12), p.id).toBe(true);
    }
  }, 60_000);

  // Full check (minutes): run with PUZZLE_FULL=1 after changing puzzles or card rules.
  it.skipIf(!process.env.PUZZLE_FULL)('every puzzle is won only by the one best line', () => {
    for (const p of PUZZLES) {
      for (const id of [...p.hand, ...p.board, ...p.enemy.board].map((u) => (typeof u === 'string' ? u : u.cardId))) expect(getCard(id), `${p.id}: ${id}`).toBeDefined();
      const g = createPuzzleGame({ ...p, enemy: { ...p.enemy, health: 999 } }, side, side);
      expect(g.activePlayer, p.id).toBe(0);
      expect(g.phase, p.id).toBe('MAIN');
      const res = analyse(g, { n: 2_000_000 });
      expect(res, p.id).not.toBeNull();
      // The best possible turn deals exactly the enemy Warden's Health.
      expect(res!.best, p.id).toBe(p.enemy.health);
      // One set of cards, at least three of them, and at least five actions.
      expect(res!.sets.size, p.id).toBe(1);
      expect([...res!.sets][0].split('+').length, p.id).toBeGreaterThanOrEqual(3);
      expect(res!.minLen, p.id).toBeGreaterThanOrEqual(5);
    }
  }, 1_800_000);

  it('is not won by playing everything and then attacking the Warden', () => {
    for (const p of PUZZLES) expect(naive(createPuzzleGame(p, side, side)), p.id).toBeLessThan(p.enemy.health);
  });

  it('the same puzzle all day, a different one the next day', () => {
    expect(puzzleForDay(20000).id).toBe(puzzleForDay(20000).id);
    expect(puzzleForDay(20001).id).not.toBe(puzzleForDay(20000).id);
  });

  it('pays once a day and counts the streak of days', () => {
    const a = solvePuzzle(undefined, 100)!;
    expect(a).toEqual({ lastSolvedDay: 100, streak: 1, solved: 1 });
    expect(solvePuzzle(a, 100)).toBeNull();
    const b = solvePuzzle(a, 101)!;
    expect(b.streak).toBe(2);
    expect(currentStreak(b, 102)).toBe(2);
    expect(currentStreak(b, 103)).toBe(0);
    expect(solvePuzzle(b, 105)!.streak).toBe(1);
  });
});

describe('recording a puzzle', () => {
  it('the first solve of the day pays and is not counted as a match win; a failed try costs nothing', async () => {
    const { applyMatchResult } = await import('@/domain/matchResults');
    const { createNewSave } = await import('@/domain/newAccount');
    const { PUZZLE_REWARD } = await import('@/domain/puzzles');
    const stats = { damageDealt: 0, heroDamageDealt: 0, cardsPlayed: 1, unitsPlayed: 0, spellsPlayed: 1, unitsDestroyed: 0, healingDone: 0, cardsDrawn: 0 };
    const sum = (result: 'WIN' | 'LOSS', day: number) => ({ mode: 'PUZZLE' as const, opponentId: 'x', opponentName: 'X', difficulty: 'EASY' as const, deckId: 'p', deckName: 'Puzzle', deckFaction: 'EMBER' as const, result, turns: 1, durationMs: 1, stats, conceded: result === 'LOSS', puzzleDay: day });
    const s0 = createNewSave('A', 'flame', 1, 'p');
    const lost = applyMatchResult(s0, sum('LOSS', 500), 1).save;
    expect(lost.profile.gold).toBe(s0.profile.gold);
    expect(lost.profile.losses).toBe(0);
    const { save: s1, rewards } = applyMatchResult(lost, sum('WIN', 500), 1);
    expect(rewards.gold).toBe(PUZZLE_REWARD.gold);
    expect(s1.profile.wins).toBe(0);
    expect(s1.profile.puzzle).toMatchObject({ lastSolvedDay: 500, streak: 1, solved: 1 });
    const again = applyMatchResult(s1, sum('WIN', 500), 1);
    expect(again.rewards.gold).toBe(0);
  });
});
