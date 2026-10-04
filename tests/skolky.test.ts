import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { act, giveCard, newGame, setEnergy, unitAt } from './helpers';

describe('Skolky', () => {
  it('is a Rimetide Court Legendary 6-mana 5/5', () => {
    const c = getCard('tid_skolky')!;
    expect([c.faction, c.rarity, c.cardType, c.manaCost, c.attack, c.health]).toEqual(['TIDE', 'LEGENDARY', 'UNIT', 6, 5, 5]);
  });

  it('freezes every enemy unit on deploy', () => {
    let s = newGame({ board1: ['token_golem', 'token_wolf'] });
    setEnergy(s, 0, 6);
    const card = giveCard(s, 0, 'tid_skolky');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    expect([unitAt(s, 1, 0).frozen, unitAt(s, 1, 1).frozen]).toEqual([true, true]);
  });
});
