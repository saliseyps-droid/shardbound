import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { act, giveCard, newGame, setEnergy, unitAt } from './helpers';

describe('Elinda', () => {
  it('is a Thornweald Legendary 5-mana 3/5', () => {
    const c = getCard('ver_elinda')!;
    expect([c.faction, c.rarity, c.cardType, c.manaCost, c.attack, c.health]).toEqual(['VERDANT', 'LEGENDARY', 'UNIT', 5, 3, 5]);
  });

  it('heals your side on deploy and every heal sharpens a friendly unit', () => {
    let s = newGame({ board0: ['token_golem'] });
    unitAt(s, 0, 0).damage = 3;
    s.players[0].hero.health -= 5;
    setEnergy(s, 0, 5);
    const before = s.players[0].hero.health;
    const card = giveCard(s, 0, 'ver_elinda');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    expect(unitAt(s, 0, 0).damage).toBe(0);
    expect(s.players[0].hero.health).toBe(before + 3);
    const bonus = s.players[0].board.reduce((n, u) => n + u.attackBuff, 0);
    expect(bonus).toBeGreaterThanOrEqual(2);
  });
});
