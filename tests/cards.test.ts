import { describe, expect, it } from 'vitest';
import { DEFAULT_BUILD } from '@/data/wardenTalents';
import { CARD_LOAD_ERRORS, allCards, collectibleCards } from '@/data/cards';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { describeCard } from '@/game/describe';
import { createGame, applyAction } from '@/engine';
import { getLegalActions } from '@/engine/legal';

describe('card database', () => {
  it('loads without validation errors', () => {
    expect(CARD_LOAD_ERRORS).toEqual([]);
  });

  it('has unique ids and descriptions for every card', () => {
    const ids = allCards().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of allCards()) expect(typeof describeCard(c)).toBe('string');
  });

  it('has enough collectible content per faction', () => {
    for (const f of PLAYABLE_FACTIONS) {
      const n = collectibleCards().filter((c) => c.faction === f).length;
      if (n > 0) expect(n, f).toBeGreaterThanOrEqual(20);
    }
  });

  it('every collectible card can be played in a live game without engine errors', () => {
    for (const card of collectibleCards()) {
      const deck = Array.from({ length: 30 }, () => card.id);
      let { state } = createGame({
        seed: 7,
        firstPlayer: 0,
        skipMulligan: true,
        players: [
          { name: 'A', avatar: 'a', deck, talents: DEFAULT_BUILD.EMBER, startingBoard: ['emb_kindling_imp', 'ver_thornmail_knight'] }, // a Knight for Knight-targeting spells
          { name: 'B', avatar: 'b', deck: Array.from({ length: 30 }, () => 'emb_kindling_imp'), startingBoard: ['emb_kindling_imp', 'emb_kindling_imp'] },
        ],
      });
      // Give plenty of energy and play the card with every legal option.
      state.players[0].maxEnergy = 10;
      state.players[0].energy = 10;
      const plays = getLegalActions(state, 0).filter((a) => a.type === 'PLAY_CARD');
      expect(plays.length, `${card.id} should be playable`).toBeGreaterThan(0);
      for (const action of plays.slice(0, 4)) {
        const res = applyAction(state, action);
        expect(res.error, `${card.id}: ${res.error}`).toBeUndefined();
      }
      // Play out a few turns to exercise triggers.
      for (let i = 0; i < 6 && state.phase === 'MAIN'; i++) {
        const actions = getLegalActions(state, state.activePlayer);
        const pick = actions.find((a) => a.type === 'PLAY_CARD') ?? actions.find((a) => a.type === 'ATTACK') ?? actions[actions.length - 1];
        const res = applyAction(state, pick);
        expect(res.error, `${card.id}: ${res.error}`).toBeUndefined();
        state = res.state;
      }
    }
  });
});
