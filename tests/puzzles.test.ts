import { describe, expect, it } from 'vitest';
import { applyAction } from '@/engine';
import type { GameAction, GameState } from '@/engine';
import { getLegalActions } from '@/engine/legal';
import { PUZZLES } from '@/data/puzzles';
import { getCard } from '@/data/cards';
import { createPuzzleGame, currentStreak, puzzleForDay, solvePuzzle } from '@/domain/puzzles';

const side = { name: 'P', avatar: 'a' };

/** Every winning line of up to `depth` actions (no END_TURN), found by brute force. */
function solve(state: GameState, depth: number, seen = new Map<string, boolean>()): GameAction[] | null {
  if (state.winner === 0) return [];
  if (state.phase === 'ENDED' || depth === 0) return null;
  const key = JSON.stringify([state.players.map((p) => [p.hero.health, p.hero.armor, p.energy, p.hand.map((c) => c.cardId), p.board.map((u) => [u.cardId, u.damage, u.attackBuff, u.tempAttack, u.attacksThisTurn, u.frozen])])]);
  if (seen.get(key) === false) return null;
  for (const a of getLegalActions(state, 0)) {
    if (a.type === 'END_TURN' || a.type === 'CONCEDE') continue;
    const r = applyAction(state, a);
    if (r.error) continue;
    const rest = solve(r.state, depth - 1, seen);
    if (rest) return [a, ...rest];
  }
  seen.set(key, false);
  return null;
}

describe('daily puzzles', () => {
  it('every puzzle uses known cards and can be won this turn', () => {
    for (const p of PUZZLES) {
      for (const id of [...p.hand, ...p.board, ...p.enemy.board].map((u) => (typeof u === 'string' ? u : u.cardId))) expect(getCard(id), `${p.id}: ${id}`).toBeDefined();
      const g = createPuzzleGame(p, side, side);
      expect(g.activePlayer, p.id).toBe(0);
      expect(g.phase, p.id).toBe('MAIN');
      expect(g.winner ?? null, p.id).toBeNull();
      expect(g.players[0].hand.map((c) => c.cardId), p.id).toEqual(p.hand);
      expect(g.players[1].hero.health, p.id).toBe(p.enemy.health);
      const line = solve(g, 8);
      expect(line, p.id).not.toBeNull();
      expect(line!.length, p.id).toBeGreaterThanOrEqual(2);
      // The line really wins when replayed.
      let s = g;
      for (const a of line!) s = applyAction(s, a).state;
      expect(s.winner, p.id).toBe(0);
    }
  });

  it('is not won by just attacking the Warden with everything', () => {
    for (const p of PUZZLES) {
      let g = createPuzzleGame(p, side, side);
      for (const u of [...g.players[0].board]) {
        const r = applyAction(g, { type: 'ATTACK', player: 0, attackerUid: u.uid, target: { type: 'hero', player: 1 } });
        if (!r.error) g = r.state;
      }
      expect(g.winner, p.id).not.toBe(0);
    }
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
