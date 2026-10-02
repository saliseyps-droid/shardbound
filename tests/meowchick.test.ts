import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { unitAttack } from '@/engine/queries';
import { act, endTurn, hero, newGame, ready, unitAt } from './helpers';

describe('Meowchick', () => {
  it('is a 4-cost neutral Legendary 3/4 with Barrier', () => {
    const c = getCard('neu_meowchick')!;
    expect(c).toMatchObject({ faction: 'NEUTRAL', rarity: 'LEGENDARY', manaCost: 4, attack: 3, health: 4, collectible: true });
    expect(c.keywords).toContain('BARRIER');
  });

  it('gives your other units +1 Attack this turn when it attacks', () => {
    let s = newGame({ board0: ['neu_meowchick', 'token_recruit', 'token_recruit'] });
    ready(s, 0);
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: hero(1) });
    expect(s.players[1].hero.health).toBe(27);
    expect(unitAttack(s, unitAt(s, 0, 1))).toBe(2);
    expect(unitAttack(s, unitAt(s, 0, 0))).toBe(3);
    s = endTurn(s);
    expect(unitAttack(s, unitAt(s, 0, 1))).toBe(1);
  });
});
