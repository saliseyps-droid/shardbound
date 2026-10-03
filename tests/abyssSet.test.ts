import { describe, expect, it } from 'vitest';
import { cardsBy, getCard } from '@/data/cards';
import { SET_INFO, SHOP_OFFERS } from '@/config/economy';
import { generatePack } from '@/domain/packs';
import { createRng } from '@/core/rng';
import { act, giveCard, hero, newGame, setEnergy } from './helpers';

describe('Curse of the Abyss set', () => {
  it('has 15 collectible Knights across every faction', () => {
    const cards = cardsBy({ set: 'ABYSS' }).filter((c) => c.collectible);
    expect(cards).toHaveLength(15);
    expect(cards.every((c) => c.cardType === 'UNIT' && c.tags?.includes('Knight'))).toBe(true);
    expect(new Set(cards.map((c) => c.faction))).toEqual(new Set(['EMBER', 'VERDANT', 'IRON', 'ASTRAL', 'VOID', 'TIDE', 'NEUTRAL']));
    expect(cards.filter((c) => c.rarity === 'LEGENDARY')).toHaveLength(4);
  });

  it('is sold in the shop and opens packs of its own cards', () => {
    expect(SET_INFO.ABYSS.name).toBe('Curse of the Abyss');
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
