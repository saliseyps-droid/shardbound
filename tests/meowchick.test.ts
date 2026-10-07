import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { unitAttack } from '@/engine/queries';
import { act, endTurn, giveCard, hero, newGame, ready, setEnergy, unitAt } from './helpers';

describe('Meowchick', () => {
  it('is a 4-cost neutral Legendary 1/1 without keywords', () => {
    const c = getCard('neu_meowchick')!;
    expect(c).toMatchObject({ faction: 'NEUTRAL', rarity: 'LEGENDARY', manaCost: 4, attack: 1, health: 1, collectible: true });
    expect(c.keywords ?? []).toEqual([]);
  });

  it('gives all your units, itself included, +2 Attack for good when it arrives', () => {
    let s = newGame({ board0: ['token_recruit', 'token_recruit'] });
    setEnergy(s, 0, 4);
    const card = giveCard(s, 0, 'neu_meowchick');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    const meow = s.players[0].board.find((u) => u.cardId === 'neu_meowchick')!;
    expect(unitAttack(s, meow)).toBe(3);
    expect(unitAttack(s, unitAt(s, 0, 0))).toBe(3);
    s = endTurn(s);
    expect(unitAttack(s, unitAt(s, 0, 0))).toBe(3);
  });

  it('gains +1 Attack before each attack and hits a random enemy for 3 at the end of your turn', () => {
    let s = newGame({ board0: ['neu_meowchick'] });
    ready(s, 0);
    const meow = () => s.players[0].board.find((u) => u.cardId === 'neu_meowchick')!;
    const hp = s.players[1].hero.health;
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: meow().uid, target: hero(1) });
    expect(s.players[1].hero.health).toBe(hp - 2);
    expect(unitAttack(s, meow())).toBe(2);
    s = endTurn(s);
    expect(s.players[1].hero.health).toBe(hp - 5);
  });
});
