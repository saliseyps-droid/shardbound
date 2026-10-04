import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { act, giveCard, newGame, setEnergy, unitAt } from './helpers';

describe('Qvido', () => {
  it('is a Cinder Legion Legendary 5-mana 3/4', () => {
    const c = getCard('emb_qvido')!;
    expect([c.faction, c.rarity, c.cardType, c.manaCost, c.attack, c.health]).toEqual(['EMBER', 'LEGENDARY', 'UNIT', 5, 3, 4]);
  });

  it('burns the enemy side on deploy', () => {
    let s = newGame({ board1: ['token_golem'] });
    setEnergy(s, 0, 5);
    const hero = s.players[1].hero.health;
    const card = giveCard(s, 0, 'emb_qvido');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    expect(unitAt(s, 1, 0).damage).toBe(1);
    expect(unitAt(s, 1, 0).burn).toBe(2);
    expect(s.players[1].hero.health).toBe(hero - 1);
  });
});
