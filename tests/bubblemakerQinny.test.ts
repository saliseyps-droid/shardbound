import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { describeCard } from '@/game/describe';

describe('Bubblemaker Qinny', () => {
  it('is a legendary Verdant unit whose text matches its bubbles', () => {
    const c = getCard('ver_bubblemaker_qinny')!;
    expect([c.faction, c.rarity, c.cardType, c.manaCost, c.attack, c.health]).toEqual(['VERDANT', 'LEGENDARY', 'UNIT', 6, 4, 5]);
    const generated = describeCard({ ...c, description: undefined });
    expect(generated).toContain('Barrier');
    expect(c.description).toContain('another random friendly unit Barrier');
  });
});

import { act, endTurn, giveCard, newGame, setEnergy, unitAt } from './helpers';

describe('Bubblemaker Qinny in play', () => {
  it('bubbles your other units on deploy and one more at the end of your turn', () => {
    let s = newGame({ board0: ['token_golem'] });
    setEnergy(s, 0, 6);
    const card = giveCard(s, 0, 'ver_bubblemaker_qinny');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    expect(unitAt(s, 0, 0).barrier).toBe(true);
    const qinny = s.players[0].board.find((u) => u.cardId === 'ver_bubblemaker_qinny')!;
    expect(qinny.barrier).toBe(false);
    unitAt(s, 0, 0).barrier = false;
    s = endTurn(s);
    expect(unitAt(s, 0, 0).barrier).toBe(true);
  });
});
