import { describe, expect, it } from 'vitest';
import { createGame } from '@/engine';
import type { GameState } from '@/engine';
import { effectiveCost } from '@/engine/queries';
import { act, filler, giveCard } from './helpers';

function rulesGame(rules0: string[], rules1: string[] = [], extra: { armor0?: number } = {}): GameState {
  return createGame({
    seed: 3,
    firstPlayer: 0,
    skipMulligan: true,
    players: [
      { name: 'P0', avatar: 'a', deck: filler(), keepDeckOrder: true, rules: rules0, startingArmor: extra.armor0 },
      { name: 'P1', avatar: 'b', deck: filler(), keepDeckOrder: true, rules: rules1, startingBoard: ['token_treant'] },
    ],
  }).state;
}

describe('Match rules (Brawl)', () => {
  it('rules do not take relic slots', () => {
    const s = rulesGame(['brawl_rule_munitions', 'brawl_rule_treasury']);
    expect(s.players[0].relics).toHaveLength(0);
    expect(s.players[0].rules?.map((r) => r.cardId)).toEqual(['brawl_rule_munitions', 'brawl_rule_treasury']);
  });

  it('a TURN_START rule fires for its owner every turn', () => {
    let s = rulesGame([], ['brawl_rule_munitions']);
    const before = s.players[0].hero.health + s.players[0].board.length;
    s = act(s, { type: 'END_TURN', player: 0 });
    // P1's turn started: 1 damage to a random enemy (P0 has no units, so it hits P0's Warden).
    expect(s.players[0].hero.health).toBe(before - 1);
  });

  it('a cost rule makes cards cost 1 less, but never below 1', () => {
    const s = rulesGame(['brawl_rule_treasury']);
    const recruit = giveCard(s, 0, 'token_recruit');
    const big = giveCard(s, 0, 'tid_azhrel_drowned_champion');
    const p = s.players[0];
    expect(effectiveCost(s, 0, p.hand.find((c) => c.uid === big)!)).toBe(5);
    expect(effectiveCost(s, 0, p.hand.find((c) => c.uid === recruit)!)).toBe(1);
  });

  it('an ALLY_SUMMONED rule buffs every unit its owner summons', () => {
    let s = rulesGame(['brawl_rule_blood_arena']);
    s.players[0].energy = 10;
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'token_recruit') });
    const u = s.players[0].board[0];
    expect([u.attackBuff, u.healthBuff]).toEqual([1, 1]);
    // The opponent's starting board is not buffed by P0's rule.
    expect(s.players[1].board[0].attackBuff).toBe(0);
  });

  it('starting Armor', () => {
    expect(rulesGame([], [], { armor0: 10 }).players[0].hero.armor).toBe(10);
  });
});
