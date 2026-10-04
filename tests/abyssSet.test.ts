import { describe, expect, it } from 'vitest';
import { cardsBy, getCard } from '@/data/cards';
import { SET_INFO, SHOP_OFFERS } from '@/config/economy';
import { generatePack } from '@/domain/packs';
import { createRng } from '@/core/rng';
import { act, giveCard, hero, newGame, setEnergy, unitRef } from './helpers';

describe('Legions of Shadow set', () => {
  it('has 45 Knights and 30 spells across every faction', () => {
    const cards = cardsBy({ set: 'ABYSS' }).filter((c) => c.collectible);
    expect(cards).toHaveLength(75);
    const units = cards.filter((c) => c.cardType === 'UNIT');
    const spells = cards.filter((c) => c.cardType === 'SPELL');
    expect(units).toHaveLength(45);
    expect(units.every((c) => c.tags?.includes('Knight'))).toBe(true);
    expect(spells).toHaveLength(30);
    expect(new Set(cards.map((c) => c.faction))).toEqual(new Set(['EMBER', 'VERDANT', 'IRON', 'ASTRAL', 'VOID', 'TIDE', 'NEUTRAL']));
    expect(cards.filter((c) => c.rarity === 'LEGENDARY')).toHaveLength(12);
  });

  it('is sold in the shop and opens packs of its own cards', () => {
    expect(SET_INFO.ABYSS.name).toBe('Legions of Shadow');
    expect(SHOP_OFFERS.some((o) => o.setId === 'ABYSS')).toBe(true);
    const pack = generatePack('ABYSS', { EPIC: 0, LEGENDARY: 0 }, () => 0, createRng(7));
    expect(pack.cards.every((c) => getCard(c.cardId)?.set === 'ABYSS')).toBe(true);
  });

  it('Duskwing Knight draws a Knight from the deck', () => {
    const deck = [...Array(25).fill('token_recruit'), 'irn_bastion_dreadknight', ...Array(4).fill('token_recruit')];
    let s = newGame({ deck0: deck });
    setEnergy(s, 0, 2);
    const uid = giveCard(s, 0, 'neu_duskwing_knight');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[0].hand.some((c) => c.cardId === 'irn_bastion_dreadknight')).toBe(true);
  });

  it('Vorgrath deals 2 damage to all enemies when deployed', () => {
    let s = newGame({ board1: ['token_treant'] });
    setEnergy(s, 0, 7);
    const before = s.players[1].hero.health;
    const uid = giveCard(s, 0, 'emb_vorgrath_the_burning_oath');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    expect(s.players[1].hero.health).toBe(before - 2);
    expect(s.players[1].board[0].damage).toBe(2);
  });
});

describe('Legions of Shadow: second wave', () => {
  it('Scarlet Oathbreaker gives each Knight you summon +1/+1', () => {
    let s = newGame({ board0: ['neu_scarlet_oathbreaker'] });
    setEnergy(s, 0, 2);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'ver_thornmail_knight') });
    const knight = s.players[0].board.find((u) => u.cardId === 'ver_thornmail_knight')!;
    expect([knight.attackBuff, knight.healthBuff]).toEqual([1, 1]);
  });

  it('Brannoch gains 2 Armor for each unit you control', () => {
    let s = newGame({ board0: ['token_treant', 'token_treant'] });
    setEnergy(s, 0, 7);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'irn_brannoch_bronze_bastion') });
    expect(s.players[0].hero.armor).toBe(6);
  });

  it('Ashroad Sellsword can attack at once next to another Knight', () => {
    let s = newGame({ board0: ['ver_thornmail_knight'], board1: ['token_treant'] });
    setEnergy(s, 0, 4);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_ashroad_sellsword') });
    const sell = s.players[0].board.find((u) => u.cardId === 'neu_ashroad_sellsword')!;
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: sell.uid, target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board[0]?.damage ?? 99).toBeGreaterThan(0);
  });
});

describe('Legions of Shadow: third wave', () => {
  it('Rendoslav draws 2 Knights and gives your other units +1/+1', () => {
    const deck = [...Array(20).fill('token_recruit'), 'ver_thornmail_knight', 'tid_tidewrack_knight', ...Array(8).fill('token_recruit')];
    let s = newGame({ deck0: deck, board0: ['token_treant'] });
    setEnergy(s, 0, 7);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_rendoslav') });
    const hand = s.players[0].hand.map((c) => c.cardId);
    expect(hand).toContain('ver_thornmail_knight');
    expect(hand).toContain('tid_tidewrack_knight');
    expect(s.players[0].board.find((u) => u.cardId === 'token_treant')!.attackBuff).toBe(1);
  });

  it('Kaelthar hits every enemy unit once per friendly death this game', () => {
    let s = newGame({ board1: ['token_golem'] });
    s.players[0].allyDeathsThisGame = 3;
    setEnergy(s, 0, 6);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'vod_kaelthar_pyre_of_souls') });
    expect(s.players[1].board[0].damage).toBe(3);
  });

  it('Undertow Halberdier returns a cheap enemy unit to its hand', () => {
    let s = newGame({ board1: ['token_recruit'] });
    setEnergy(s, 0, 3);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'tid_undertow_halberdier'), target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board).toHaveLength(0);
  });
});

describe('Legions of Shadow: spells', () => {
  it('Abyssal Flare hits harder while you control a Knight', () => {
    let s = newGame({ board0: ['ver_thornmail_knight'], board1: ['token_golem', 'token_golem'] });
    setEnergy(s, 0, 5);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'emb_abyssal_flare'), target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board[0].damage).toBe(3);
    let t = newGame({ board1: ['token_golem'] });
    setEnergy(t, 0, 5);
    t = act(t, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(t, 0, 'emb_abyssal_flare'), target: unitRef(t.players[1].board[0]) });
    expect(t.players[1].board[0].damage).toBe(2);
  });

  it('Undertow Surge only damages a unit that is already Frozen, then Freezes it', () => {
    let s = newGame({ board1: ['token_golem'] });
    setEnergy(s, 0, 5);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'tid_undertow_surge'), target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board[0].damage).toBe(0);
    expect(s.players[1].board[0].frozen).toBe(true);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'tid_undertow_surge'), target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board[0].damage).toBe(3);
  });

  it('Crown of the Abyss draws 2 Knights and makes Knights in hand cheaper', () => {
    const deck = [...Array(20).fill('token_recruit'), 'ver_thornmail_knight', 'irn_bastion_dreadknight', ...Array(8).fill('token_recruit')];
    let s = newGame({ deck0: deck });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_crown_of_the_abyss') });
    const bastion = s.players[0].hand.find((c) => c.cardId === 'irn_bastion_dreadknight')!;
    expect(bastion).toBeTruthy();
    expect(s.players[0].hand.some((c) => c.cardId === 'ver_thornmail_knight')).toBe(true);
    expect(bastion.costMod).toBe(-1);
  });
});

describe('Legions of Shadow: second spell wave', () => {
  it('Sigil of the Abyss Lord takes an enemy unit that costs 5 or less', () => {
    let s = newGame({ board1: ['token_treant'] });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_sigil_of_the_abyss_lord'), target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board).toHaveLength(0);
    expect(s.players[0].board.some((u) => u.cardId === 'token_treant')).toBe(true);
  });

  it('Pentacle of Souls destroys an enemy unit and hurts your Warden', () => {
    let s = newGame({ board1: ['token_golem'] });
    setEnergy(s, 0, 10);
    const hp = s.players[0].hero.health;
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'vod_pentacle_of_souls'), target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board).toHaveLength(0);
    expect(s.players[0].hero.health).toBe(hp - 3);
  });
});

describe('Liu Kano', () => {
  it('is a 6-cost Lumen Legendary 5/5 with Ward', () => {
    const c = getCard('ast_liu_kano')!;
    expect(c).toMatchObject({ faction: 'ASTRAL', rarity: 'LEGENDARY', manaCost: 6, attack: 5, health: 5, collectible: true });
    expect(c.keywords).toContain('WARD');
  });

  it('deals 2 damage to a random enemy whenever you cast a spell', () => {
    let s = newGame();
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'ast_liu_kano') });
    const before = s.players[1].hero.health;
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'ast_starlit_spark'), target: hero(1) });
    // 1 from the Spark, 2 from Liu Kano (the enemy board is empty, so the Warden is the only enemy).
    expect(s.players[1].hero.health).toBe(before - 3);
  });
});
