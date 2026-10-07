import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { unitAttack } from '@/engine/queries';
import { act, endTurn, giveCard, newGame, setEnergy, unitAt } from './helpers';

describe('Meowchick', () => {
  it('is a 3-cost neutral Legendary 1/1 with Swift', () => {
    const c = getCard('neu_meowchick')!;
    expect(c).toMatchObject({ faction: 'NEUTRAL', rarity: 'LEGENDARY', manaCost: 3, attack: 1, health: 1, collectible: true });
    expect(c.keywords).toEqual(['SWIFT']);
  });

  it('gives all your units, itself included, +2 Attack for good when it arrives', () => {
    let s = newGame({ board0: ['token_recruit', 'token_recruit'] });
    setEnergy(s, 0, 3);
    const card = giveCard(s, 0, 'neu_meowchick');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    const meow = s.players[0].board.find((u) => u.cardId === 'neu_meowchick')!;
    expect(unitAttack(s, meow)).toBe(3);
    expect(unitAttack(s, unitAt(s, 0, 0))).toBe(3);
    s = endTurn(s);
    expect(unitAttack(s, unitAt(s, 0, 0))).toBe(3);
  });
});
