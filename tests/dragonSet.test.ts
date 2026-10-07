import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cardsBy, getCard } from '@/data/cards';
import { BUNDLES, SET_INFO, SHOP_BONUS_PACKS, SHOP_OFFERS } from '@/config/economy';
import { ARENA } from '@/config/arena';
import { LEVELS } from '@/config/progression';
import { TOURNAMENT_PACK_SET } from '@/domain/tournament';
import { generatePack } from '@/domain/packs';
import { createRng } from '@/core/rng';
import { CARD_ART_FOCUS } from '@/ui/components/cardArtFocus';
import { effectiveCost, unitAttack, hasKeyword } from '@/engine/queries';
import csDragon from '@/i18n/cs/cards/dragon';
import { act, giveCard, newGame, setEnergy, unitRef } from './helpers';

const root = resolve(__dirname, '..');
const cards = cardsBy({ set: 'DRAGON' });
const tagged = (tag: string) => cards.filter((c) => c.tags?.includes(tag));

describe('Dragon Realm set', () => {
  it('has 71 cards: Dragons, Dragon Knights and Fae across every faction, plus spells, relics and locations', () => {
    expect(cards).toHaveLength(71);
    expect(new Set(cards.map((c) => c.id)).size).toBe(71);
    expect(new Set(cards.map((c) => c.faction))).toEqual(new Set(['EMBER', 'VERDANT', 'IRON', 'ASTRAL', 'VOID', 'TIDE', 'NEUTRAL']));
    expect(tagged('Dragon')).toHaveLength(25);
    expect(tagged('Knight')).toHaveLength(11);
    expect(tagged('Fae')).toHaveLength(12);
    expect(cards.filter((c) => c.cardType === 'SPELL')).toHaveLength(16);
    expect(cards.filter((c) => c.cardType === 'RELIC').every((c) => (c.charges ?? 0) > 0)).toBe(true);
    expect(cards.filter((c) => c.cardType === 'RELIC')).toHaveLength(3);
    expect(cards.filter((c) => c.cardType === 'LOCATION').every((c) => (c.duration ?? 0) > 0)).toBe(true);
    expect(cards.filter((c) => c.cardType === 'LOCATION')).toHaveLength(3);
  });

  it('has a rarity spread like the other sets (commons most, 7 legendaries)', () => {
    const count = (r: string) => cards.filter((c) => c.rarity === r).length;
    expect(count('COMMON')).toBe(30);
    expect(count('RARE')).toBe(22);
    expect(count('EPIC')).toBe(12);
    expect(count('LEGENDARY')).toBe(7);
  });

  it('every card has painted art, an art focus and Czech text', () => {
    for (const c of cards) {
      expect(existsSync(resolve(root, `src/assets/cards/${c.id}.webp`)), c.id).toBe(true);
      expect(CARD_ART_FOCUS[c.id], c.id).toBeTypeOf('number');
      const cs = csDragon[c.id];
      expect(cs?.name, c.id).toBeTruthy();
      expect(cs?.flavorText, c.id).toBeTruthy();
      if (c.description) expect(cs?.description, c.id).toBeTruthy();
    }
  });

  it('is sold in the shop as the newest set, with a bundle, and opens packs of its own cards', () => {
    expect(SET_INFO.DRAGON.name).toBe('Dragon Realm');
    expect(Math.max(...Object.values(SET_INFO).map((s) => s.releaseOrder))).toBe(SET_INFO.DRAGON.releaseOrder);
    expect(SHOP_OFFERS.filter((o) => o.setId === 'DRAGON').map((o) => o.packs)).toEqual([1, 5, 10]);
    expect(SHOP_BONUS_PACKS.dragon_10).toBe(2);
    const bundle = BUNDLES.find((b) => b.setId === 'DRAGON');
    expect(bundle?.cardBack).toBeTruthy();
    expect(bundle?.portrait).toBeTruthy();
    const pack = generatePack('DRAGON', { EPIC: 0, LEGENDARY: 0 }, () => 0, createRng(11));
    expect(pack.cards.every((c) => getCard(c.cardId)?.set === 'DRAGON')).toBe(true);
  });

  it('has its pack art wired and shows up in Arena, level rewards and tournament prizes', () => {
    expect(existsSync(resolve(root, 'src/assets/packs/dragon_realm.webp'))).toBe(true);
    const booster = readFileSync(resolve(root, 'src/ui/components/packs/BoosterPack.tsx'), 'utf8');
    expect(booster).toContain("@/assets/packs/dragon_realm.webp");
    expect(booster).toMatch(/DRAGON: dragonRealm/);
    expect(ARENA.packSets).toContain('DRAGON');
    expect(LEVELS.flatMap((l) => l.rewards).some((r) => r.kind === 'PACK' && r.setId === 'DRAGON')).toBe(true);
    expect(TOURNAMENT_PACK_SET).toBe('DRAGON');
  });
});

describe('Dragon Realm: mechanics', () => {
  it('Cinderperch Drake gains Swift only next to another Dragon', () => {
    let s = newGame({ board0: ['irn_anvilwing_drake'] });
    setEnergy(s, 0, 3);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'emb_cinderperch_drake') });
    const drake = s.players[0].board.find((u) => u.cardId === 'emb_cinderperch_drake')!;
    expect(hasKeyword(s, drake, 'SWIFT')).toBe(true);
    let t = newGame();
    setEnergy(t, 0, 3);
    t = act(t, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(t, 0, 'emb_cinderperch_drake') });
    expect(hasKeyword(t, t.players[0].board[0], 'SWIFT')).toBe(false);
  });

  it('Wyrmfire Breath deals 1 more damage while you control a Dragon', () => {
    let s = newGame({ board0: ['irn_anvilwing_drake'], board1: ['token_golem'] });
    setEnergy(s, 0, 2);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'emb_wyrmfire_breath'), target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board[0].damage).toBe(4);
  });

  it('Tideglass Grasp freezes, and also hits when you control a Dragon', () => {
    let s = newGame({ board1: ['token_golem'] });
    setEnergy(s, 0, 1);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'tid_tideglass_grasp'), target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board[0].frozen).toBe(true);
    expect(s.players[1].board[0].damage).toBe(0);
    let t = newGame({ board0: ['tid_brinescale_drake'], board1: ['token_golem'] });
    setEnergy(t, 0, 1);
    t = act(t, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(t, 0, 'tid_tideglass_grasp'), target: unitRef(t.players[1].board[0]) });
    expect(t.players[1].board[0].damage).toBe(2);
  });

  it('Glowmoss Fae buffs each Fae you summon, and Maelis makes Fae cheaper and draws two', () => {
    let s = newGame({ board0: ['ver_glowmoss_fae'] });
    setEnergy(s, 0, 2);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_wanderwing_fae') });
    const fae = s.players[0].board.find((u) => u.cardId === 'neu_wanderwing_fae')!;
    expect([fae.attackBuff, fae.healthBuff]).toEqual([1, 1]);

    const deck = [...Array(20).fill('token_recruit'), 'vod_nightshade_fae', 'emb_cinderwing_pixie', ...Array(8).fill('token_recruit')];
    let m = newGame({ deck0: deck });
    setEnergy(m, 0, 5);
    m = act(m, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(m, 0, 'ver_maelis_queen_of_the_glade') });
    const shade = m.players[0].hand.find((c) => c.cardId === 'vod_nightshade_fae')!;
    expect(shade).toBeTruthy();
    expect(m.players[0].hand.some((c) => c.cardId === 'emb_cinderwing_pixie')).toBe(true);
    expect(effectiveCost(m, 0, shade)).toBe(1);
  });

  it('Valdrek gives your Dragons +1 Attack and draws two Dragons', () => {
    const deck = [...Array(20).fill('token_recruit'), 'neu_redcrag_drake', 'irn_silverscale_drake', ...Array(8).fill('token_recruit')];
    let s = newGame({ deck0: deck, board0: ['irn_anvilwing_drake', 'token_recruit'] });
    setEnergy(s, 0, 6);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'irn_valdrek_wingmarshal') });
    const [drake, recruit] = s.players[0].board;
    expect(unitAttack(s, drake)).toBe(4);
    expect(unitAttack(s, recruit)).toBe(1);
    expect(s.players[0].hand.filter((c) => getCard(c.cardId)?.tags?.includes('Dragon'))).toHaveLength(2);
  });

  it('Dragonforge Star gives Armor whenever you summon a Dragon and uses a charge', () => {
    let s = newGame();
    setEnergy(s, 0, 4);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'irn_dragonforge_star') });
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'irn_anvilwing_drake') });
    // 3 from the Star, 2 from the Drake itself.
    expect(s.players[0].hero.armor).toBe(5);
    expect(s.players[0].relics[0].charges).toBe(2);
  });

  it('Ironspine Dragon grows whenever you gain Armor', () => {
    let s = newGame();
    setEnergy(s, 0, 8);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'irn_ironspine_dragon') });
    const dragon = s.players[0].board[0];
    expect([dragon.attackBuff, dragon.healthBuff]).toEqual([1, 1]);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'irn_runeforged_scales') });
    expect(s.players[0].board[0].attackBuff).toBe(2);
  });
});
