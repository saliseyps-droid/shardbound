import { describe, expect, it } from 'vitest';
import { applyAction, createGame } from '@/engine';
import type { GameState, PlayerId, SideSetup } from '@/engine';
import { attackTargets, validTargets } from '@/engine/queries';
import { enemiesOf, nextInTurn, wonBy } from '@/engine/teams';
import { chooseAction, makeAiConfig } from '@/ai';
import { filler } from './helpers';

const side = (name: string, extra: Partial<SideSetup> = {}): SideSetup => ({ name, avatar: 'a', deck: filler(), keepDeckOrder: true, ...extra });
const coop = (extra: { boss?: Partial<SideSetup>; a?: Partial<SideSetup>; b?: Partial<SideSetup> } = {}): GameState =>
  createGame({ seed: 3, skipMulligan: true, players: [side('A', extra.a), side('Boss', { heroHealth: 60, ...extra.boss }), side('B', extra.b)] }).state;
const act = (s: GameState, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(s, a);
  if (r.error) throw new Error(r.error);
  return r.state;
};

describe('Co-op (2 v 1)', () => {
  it('plays the two players first, then the boss, and every seat draws an opening hand', () => {
    let s = coop();
    expect(s.players).toHaveLength(3);
    expect(s.activePlayer).toBe(0);
    expect(s.players.every((p) => p.hand.length >= 3)).toBe(true);
    const order: PlayerId[] = [];
    for (let i = 0; i < 6; i++) {
      order.push(s.activePlayer);
      s = act(s, { type: 'END_TURN', player: s.activePlayer });
    }
    expect(order).toEqual([0, 2, 1, 0, 2, 1]);
  });

  it('teammates are allies, the boss faces both of them', () => {
    const s = coop({ a: { startingBoard: ['neu_stonehide_ox'] }, b: { startingBoard: ['neu_stonehide_ox'] }, boss: { startingBoard: ['token_recruit'] } });
    expect(enemiesOf(s, 0)).toEqual([1]);
    expect(enemiesOf(s, 1)).toEqual([0, 2]);
    // Seat 0's attacker can hit the boss's unit and the boss, never its teammate.
    const atk = attackTargets(s, s.players[0].board[0]);
    expect(atk.every((t) => (t.type === 'hero' ? t.player === 1 : s.players[1].board.some((u) => u.uid === t.uid)))).toBe(true);
    // A friendly spell may target the teammate's unit and Warden.
    const allies = validTargets(s, 0, { kind: 'ALLY' }, { spellLike: true });
    expect(allies).toContainEqual({ type: 'hero', player: 2 });
    expect(allies).toContainEqual({ type: 'unit', uid: s.players[2].board[0].uid });
    // The boss's area damage hits both players' boards.
    const enemyUnits = validTargets(s, 1, { kind: 'ENEMY_UNIT' }, { spellLike: true });
    expect(enemyUnits).toHaveLength(2);
  });

  it('a fallen player leaves the table and is skipped; the boss wins only when both fall', () => {
    let s = coop({ b: { startingBoard: ['neu_stonehide_ox'] } });
    s.players[2].hero.health = 1;
    s.players[2].hero.health = 0;
    // Any action runs the game-over check.
    s = act(s, { type: 'END_TURN', player: 0 });
    expect(s.phase).toBe('MAIN');
    expect(s.players[2].board).toEqual([]);
    expect(s.activePlayer).toBe(1);
    expect(nextInTurn(s, 1)).toBe(0);
    expect(enemiesOf(s, 1)).toEqual([0]);
    s.players[0].hero.health = 0;
    s = act(s, { type: 'END_TURN', player: 1 });
    expect(s.phase).toBe('ENDED');
    expect(wonBy(s, 1)).toBe(true);
    expect(wonBy(s, 2)).toBe(false);
  });

  it('beating the boss wins for both players', () => {
    let s = coop();
    s.players[1].hero.health = 0;
    s = act(s, { type: 'END_TURN', player: 0 });
    expect(s.phase).toBe('ENDED');
    expect(wonBy(s, 0) && wonBy(s, 2)).toBe(true);
  });

  it('three AIs play a whole co-op match to the end', () => {
    const decks = ['neu_stonehide_ox', 'neu_caravan_sellsword', 'token_recruit'];
    let s = createGame({
      seed: 11,
      players: [side('A', { deck: filler(decks[0], 30) }), side('Boss', { deck: filler(decks[1], 30), heroHealth: 50 }), side('B', { deck: filler(decks[2], 30) })],
    }).state;
    for (const p of s.players) s = act(s, { type: 'MULLIGAN', player: p.id, replaceUids: [] });
    const cfg = makeAiConfig('NORMAL');
    let per = 0;
    let turn = s.turn;
    for (let i = 0; i < 3000 && s.phase === 'MAIN'; i++) {
      if (s.turn !== turn) [per, turn] = [0, s.turn];
      const me = s.activePlayer;
      const d = chooseAction(s, me, cfg, i, per++);
      const r = applyAction(s, d.action);
      s = r.error ? applyAction(s, { type: 'END_TURN', player: me }).state : r.state;
    }
    expect(s.phase).toBe('ENDED');
  }, 60_000);
});
