import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { act, giveCard, newGame, setEnergy } from './helpers';

describe('Tallys the Menace', () => {
  it('is a 6-cost Hollow Choir Legendary 5/5 with Guard', () => {
    const c = getCard('vod_tallys_the_menace')!;
    expect(c).toMatchObject({ faction: 'VOID', rarity: 'LEGENDARY', manaCost: 6, attack: 5, health: 5, collectible: true });
    expect(c.keywords).toContain('GUARD');
  });

  it('destroys a random enemy unit when deployed', () => {
    let s = newGame({ board1: ['token_treant', 'token_treant'] });
    setEnergy(s, 0, 6);
    const uid = giveCard(s, 0, 'vod_tallys_the_menace');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[1].board).toHaveLength(1);
    expect(s.players[0].board.some((u) => u.cardId === 'vod_tallys_the_menace')).toBe(true);
  });
});
