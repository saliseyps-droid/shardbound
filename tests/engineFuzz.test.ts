import { describe, expect, it } from 'vitest';
import { collectibleCards } from '@/data/cards';
import { GAME_RULES } from '@/config/gameRules';
import { createRng, nextInt } from '@/core/rng';
import { applyAction, createGame } from '@/engine';
import type { GameState } from '@/engine';
import { getLegalActions } from '@/engine/legal';
import { currentHealth } from '@/engine/queries';

/** Random legal play with fixed seeds: the engine must never throw or break its invariants. */
describe('engine fuzz', () => {
  const pool = collectibleCards().map((c) => c.id);
  const GAMES = 60;
  const MAX_STEPS = 600;

  function invariantErrors(state: GameState): string[] {
    const errors: string[] = [];
    for (const p of state.players) {
      if (p.board.length > GAME_RULES.maxBoardSize) errors.push(`P${p.id} board ${p.board.length}`);
      if (p.hand.length > GAME_RULES.maxHandSize) errors.push(`P${p.id} hand ${p.hand.length}`);
      if (p.energy < 0) errors.push(`P${p.id} energy ${p.energy}`);
      if (p.relics.length > GAME_RULES.maxRelics) errors.push(`P${p.id} relics ${p.relics.length}`);
      for (const u of p.board) {
        if (u.pendingDestroy || currentHealth(u) <= 0) errors.push(`P${p.id} dead unit on board: ${u.cardId}`);
        if (u.owner !== p.id) errors.push(`P${p.id} owner mismatch: ${u.cardId}`);
      }
    }
    return errors;
  }

  const BATCH = 10;
  const batches = Array.from({ length: GAMES / BATCH }, (_, i) => i * BATCH + 1);

  it.each(batches)('plays random games from seed %i without errors', (first) => {
    const problems: string[] = [];
    let finished = 0;
    for (let seed = first; seed < first + BATCH; seed++) {
      const rng = createRng(seed * 7919);
      const deck = () => Array.from({ length: 30 }, () => pool[nextInt(rng, 0, pool.length - 1)]);
      let { state } = createGame({
        seed,
        skipMulligan: true,
        players: [
          { name: 'A', avatar: 'a', deck: deck() },
          { name: 'B', avatar: 'b', deck: deck() },
        ],
      });
      for (let step = 0; step < MAX_STEPS && state.phase === 'MAIN'; step++) {
        const p = state.activePlayer;
        const legal = getLegalActions(state, p);
        const nonEnd = legal.filter((a) => a.type !== 'END_TURN');
        // Mostly act, sometimes pass, so games progress to late turns.
        const action = nonEnd.length > 0 && nextInt(rng, 0, 9) < 8 ? nonEnd[nextInt(rng, 0, nonEnd.length - 1)] : legal[legal.length - 1];
        const res = applyAction(state, action);
        if (res.error) {
          problems.push(`seed ${seed} step ${step}: ${res.error} for ${JSON.stringify(action)}`);
          break;
        }
        if (res.events.some((e) => e.type === 'TRIGGER_LIMIT_REACHED')) problems.push(`seed ${seed} step ${step}: trigger limit`);
        for (const e of invariantErrors(res.state)) problems.push(`seed ${seed} step ${step}: ${e}`);
        state = res.state;
      }
      if (state.phase === 'ENDED') finished++;
    }
    expect(problems).toEqual([]);
    expect(finished).toBeGreaterThan(BATCH / 2);
  }, 20_000);
});
