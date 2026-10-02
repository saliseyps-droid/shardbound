import { describe, expect, it } from 'vitest';
import { applyAction, createGame } from '@/engine';
import type { GameState, PlayerId } from '@/engine';
import { chooseAction, makeAiConfig, runAiMulligan } from '@/ai';
import type { AiConfig } from '@/ai';
import { PLAYABLE_FACTIONS } from '@/game/types';
import type { PlayableFaction } from '@/game/types';
import { buildOpponentDeck } from '@/domain/matchSetup';
import { validateDeck, factionOfList } from '@/domain/decks';
import { DEFAULT_BUILD } from '@/data/wardenTalents';
import { PRACTICE_OPPONENTS, DIFFICULTY_POOLS, allEncounters } from '@/data/opponents';

function botDeck(f: PlayableFaction) {
  return buildOpponentDeck({ ...PRACTICE_OPPONENTS[f], difficulty: 'HARD', rarities: DIFFICULTY_POOLS.EXPERT });
}

function play(deck0: string[], deck1: string[], cfg: [AiConfig, AiConfig], seed: number) {
  let s: GameState = createGame({
    seed,
    players: [
      { name: 'A', avatar: 'a', deck: deck0, talents: DEFAULT_BUILD[factionOfList(deck0)] },
      { name: 'B', avatar: 'b', deck: deck1, talents: DEFAULT_BUILD[factionOfList(deck1)] },
    ],
  }).state;
  s = runAiMulligan(runAiMulligan(s, 0, cfg[0]), 1, cfg[1]);
  let perTurn = 0;
  let turn = s.turn;
  for (let i = 0; i < 4000 && s.phase === 'MAIN'; i++) {
    if (s.turn !== turn) [perTurn, turn] = [0, s.turn];
    const me = s.activePlayer as PlayerId;
    const d = chooseAction(s, me, cfg[me], seed * 31 + i, perTurn++);
    const res = applyAction(s, d.action);
    s = res.error ? applyAction(s, { type: 'END_TURN', player: me }).state : res.state;
  }
  return s;
}

describe('simulated AI games', () => {
  it('bot decks for every opponent are valid 30-card decks', () => {
    for (const enc of allEncounters()) {
      const list = buildOpponentDeck(enc);
      expect(list.length, enc.id).toBeGreaterThanOrEqual(30);
    }
    for (const f of PLAYABLE_FACTIONS) {
      const list = botDeck(f);
      const cards: Record<string, number> = {};
      list.forEach((id) => (cards[id] = (cards[id] ?? 0) + 1));
      expect(validateDeck({ cards, heroFaction: f, name: 'x' }), f).toEqual([]);
    }
  });

  it('every faction completes games against every other in reasonable length', () => {
    const cfg = makeAiConfig('NORMAL');
    const wins: Record<string, number> = {};
    const turns: number[] = [];
    let seed = 1;
    for (const a of PLAYABLE_FACTIONS) {
      for (const b of PLAYABLE_FACTIONS) {
        if (a === b) continue;
        const s = play(botDeck(a), botDeck(b), [cfg, cfg], seed++);
        expect(s.phase, `${a} vs ${b}`).toBe('ENDED');
        turns.push(s.turn);
        const w = s.winner === 0 ? a : s.winner === 1 ? b : 'DRAW';
        wins[w] = (wins[w] ?? 0) + 1;
      }
    }
    const avg = turns.reduce((x, y) => x + y, 0) / turns.length;
    console.log('[sim] faction wins', wins, 'avg turns', avg.toFixed(1));
    expect(avg).toBeGreaterThan(8);
    expect(avg).toBeLessThan(40);
    // No faction should be completely dominant or hopeless across 10 games each.
    for (const f of PLAYABLE_FACTIONS) expect(wins[f] ?? 0, f).toBeLessThanOrEqual(9);
  }, 300_000);

  it('expert decisions complete within a responsive time budget', () => {
    const cfg = makeAiConfig('EXPERT');
    let s = createGame({ seed: 4, skipMulligan: true, players: [
      { name: 'A', avatar: 'a', deck: botDeck('IRON'), talents: DEFAULT_BUILD.IRON },
      { name: 'B', avatar: 'b', deck: botDeck('VOID'), talents: DEFAULT_BUILD.VOID },
    ] }).state;
    let worst = 0;
    let perTurn = 0;
    let turn = s.turn;
    for (let i = 0; i < 400 && s.phase === 'MAIN'; i++) {
      if (s.turn !== turn) [perTurn, turn] = [0, s.turn];
      const me = s.activePlayer as PlayerId;
      const t0 = performance.now();
      const d = chooseAction(s, me, cfg, i, perTurn++);
      worst = Math.max(worst, performance.now() - t0);
      const res = applyAction(s, d.action);
      s = res.error ? applyAction(s, { type: 'END_TURN', player: me }).state : res.state;
    }
    console.log('[sim] expert worst decision ms', worst.toFixed(0), 'turns', s.turn);
    expect(s.phase).toBe('ENDED');
    expect(worst).toBeLessThan(3000);
  }, 300_000);
});
