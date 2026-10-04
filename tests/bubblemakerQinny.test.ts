import { describe, expect, it } from 'vitest';
import { getCard, hasCard } from '@/data/cards';
import { createNewSave } from '@/domain/newAccount';
import { migrateSave } from '@/persistence/migrations';
import { act, endTurn, giveCard, newGame, setEnergy, unitAt } from './helpers';

describe('Bubblemaker Qinny', () => {
  it('is a Lumen Conclave Legendary 6-mana 4/5', () => {
    const c = getCard('ast_bubblemaker_qinny')!;
    expect([c.faction, c.rarity, c.cardType, c.manaCost, c.attack, c.health]).toEqual(['ASTRAL', 'LEGENDARY', 'UNIT', 6, 4, 5]);
    expect(hasCard('ver_bubblemaker_qinny')).toBe(false);
  });

  it('bubbles your other units on deploy, but not again at the end of your turn', () => {
    let s = newGame({ board0: ['token_golem'] });
    setEnergy(s, 0, 6);
    const card = giveCard(s, 0, 'ast_bubblemaker_qinny');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    expect(unitAt(s, 0, 0).barrier).toBe(true);
    unitAt(s, 0, 0).barrier = false;
    s = endTurn(s);
    expect(unitAt(s, 0, 0).barrier).toBe(false);
  });

  it('players who already own the old Thornweald copy keep it', () => {
    const save = createNewSave('T', 'flame', 0, 'p');
    const raw = JSON.parse(JSON.stringify(save));
    raw.collection.cards.ver_bubblemaker_qinny = { NORMAL: 1 };
    raw.collection.unseen = ['ver_bubblemaker_qinny'];
    const { save: s } = migrateSave(raw);
    expect(s.collection.cards.ast_bubblemaker_qinny?.NORMAL).toBe(1);
    expect(s.collection.unseen).toContain('ast_bubblemaker_qinny');
  });
});
