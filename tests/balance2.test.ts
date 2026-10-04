import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { act, giveCard, newGame, setEnergy } from './helpers';

const stats = (id: string) => {
  const c = getCard(id)!;
  return { cost: c.manaCost, atk: c.attack, hp: c.health, dur: c.duration, ch: c.charges };
};

describe('balance pass 2', () => {
  it('pins the new card numbers', () => {
    expect(stats('tid_skolky')).toMatchObject({ cost: 7, atk: 5, hp: 5 });
    expect(stats('vod_tallys_the_menace')).toMatchObject({ cost: 6, atk: 4, hp: 5 });
    expect(stats('vod_grave_whisperer')).toMatchObject({ cost: 1, atk: 1, hp: 2 });
    expect(stats('vod_cryptcrawler')).toMatchObject({ cost: 3, atk: 2, hp: 3 });
    expect(stats('vod_open_grave').cost).toBe(1);
    expect(stats('irn_dominion_forge')).toMatchObject({ cost: 2, ch: 3 });
    expect(stats('irn_cogspire_foundry')).toMatchObject({ cost: 4, dur: 4 });
    expect(stats('irn_steelwatch_knight')).toMatchObject({ cost: 2, atk: 2, hp: 3 });
    expect(stats('emb_kharzul_caldera')).toMatchObject({ cost: 2, dur: 3 });
    expect(getCard('vod_kaelthar_pyre_of_souls')!.description).toContain('(up to 4)');
  });

  it('Kaelthar caps its damage at 4', () => {
    let s = newGame({ board1: ['token_golem'] });
    s.players[0].allyDeathsThisGame = 7;
    setEnergy(s, 0, 6);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'vod_kaelthar_pyre_of_souls') });
    expect(s.players[1].board[0]?.damage ?? 99).toBe(4);
  });
});
