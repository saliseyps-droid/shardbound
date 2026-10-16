import { describe, expect, it } from 'vitest';
import { act, giveCard, hero, newGame, ready, setEnergy, unitRef } from './helpers';

/** Cards reworked so they no longer copy another card (0.53.6). */
describe('Card reworks', () => {
  it('Scorched Dawn burns every enemy unit and hits the enemy Warden', () => {
    let s = newGame({ board1: ['neu_stonehide_ox', 'token_recruit'] });
    setEnergy(s, 0, 10);
    const hp = s.players[1].hero.health;
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'emb_scorched_dawn') });
    expect(s.players[1].hero.health).toBe(hp - 2);
    expect(s.players[1].board.every((u) => u.burn === 2)).toBe(true);
  });

  it('Umbral Acolyte heals your Warden when another friendly unit dies', () => {
    let s = newGame({ board0: ['vod_umbral_acolyte', 'token_recruit'] });
    setEnergy(s, 0, 10);
    s.players[0].hero.health = 20;
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'vod_feed_the_void'), target: unitRef(s.players[0].board[1]) });
    expect(s.players[0].hero.health).toBe(22);
  });

  it('Gravecloak Knight hits every enemy unit when it dies', () => {
    let s = newGame({ board0: ['vod_gravecloak_knight'], board1: ['neu_stonehide_ox', 'token_recruit', 'neu_caravan_sellsword'] });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'vod_feed_the_void'), target: unitRef(s.players[0].board[0]) });
    expect(s.players[1].board.map((u) => u.cardId)).toEqual(['neu_stonehide_ox']);
    expect(s.players[1].board[0].damage).toBe(2);
  });

  it('Abyssal Pyre burns the target and its neighbours', () => {
    let s = newGame({ board1: ['neu_stonehide_ox', 'neu_stonehide_ox', 'neu_stonehide_ox'] });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_abyssal_pyre'), target: unitRef(s.players[1].board[1]) });
    expect(s.players[1].board.map((u) => [u.damage, u.burn])).toEqual([[3, 2], [3, 2], [3, 2]]);
  });

  it('Second Dawn shields the whole board', () => {
    let s = newGame({ board0: ['token_recruit', 'neu_caravan_sellsword'] });
    setEnergy(s, 0, 10);
    const before = s.players[0].board.map((u) => u.healthBuff);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_second_dawn') });
    expect(s.players[0].board.map((u) => u.healthBuff)).toEqual(before.map((h) => h + 2));
  });

  it('Dune Cutpurse draws a card whenever it attacks', () => {
    let s = newGame({ board0: ['neu_dune_cutpurse'] });
    ready(s, 0);
    const hand = s.players[0].hand.length;
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: s.players[0].board[0].uid, target: hero(1) });
    expect(s.players[0].hand.length).toBe(hand + 1);
  });

  it('Redscarf Lancer gives a friendly Knight +1/+1', () => {
    let s = newGame({ board0: ['neu_redcloak_sentinel'] });
    setEnergy(s, 0, 10);
    const knight = s.players[0].board[0];
    const [a, h] = [knight.attackBuff, knight.healthBuff];
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_redscarf_lancer'), target: unitRef(knight) });
    const k = s.players[0].board.find((u) => u.uid === knight.uid)!;
    expect([k.attackBuff, k.healthBuff]).toEqual([a + 1, h + 1]);
  });
});
