import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { applyAction } from '@/engine';
import { effectiveCost } from '@/engine/queries';
import { act, endTurn, giveCard, hero, newGame, ready, setEnergy, unitRef } from './helpers';
import type { GameState } from '@/engine';

const isDragon = (id: string) => !!getCard(id)?.tags?.includes('Dragon');
const play = (s: GameState, p: 0 | 1, cardId: string, target?: Parameters<typeof unitRef>[0] | ReturnType<typeof hero>) =>
  act(s, {
    type: 'PLAY_CARD',
    player: p,
    cardUid: giveCard(s, p, cardId),
    target: target && 'uid' in target && !('type' in target) ? unitRef(target) : (target as ReturnType<typeof hero> | undefined),
  });
const deckWith = (...ids: string[]) => [...Array(20).fill('token_recruit'), ...ids, ...Array(10 - ids.length).fill('token_recruit')];

describe('Dragon Realm: "another Dragon" vs "a Dragon"', () => {
  it('a Dragon unit does not satisfy its own CONTROLS_TAG condition, but a Knight or spell sees any Dragon', () => {
    // Redcrag Drake alone: no buff. Next to another Dragon: buff.
    let s = newGame();
    setEnergy(s, 0, 3);
    s = play(s, 0, 'neu_redcrag_drake');
    expect(s.players[0].board[0].attackBuff).toBe(0);
    let t = newGame({ board0: ['token_drakeling'] });
    setEnergy(t, 0, 3);
    t = play(t, 0, 'neu_redcrag_drake');
    expect(t.players[0].board.find((u) => u.cardId === 'neu_redcrag_drake')!.attackBuff).toBe(1);

    // Goldwing Vanguard (Knight) counts any Dragon, including the Cinder Drakeling token.
    let k = newGame({ board0: ['token_drakeling'] });
    setEnergy(k, 0, 3);
    k = play(k, 0, 'irn_goldwing_vanguard');
    expect(k.players[0].board.find((u) => u.cardId === 'irn_goldwing_vanguard')!.attackBuff).toBe(1);

    // Spells: Amethyst Spark draws only with a Dragon on board.
    let a = newGame({ board0: ['emb_cinderbreath_drake'] });
    setEnergy(a, 0, 1);
    const hand = a.players[0].hand.length;
    a = play(a, 0, 'ast_amethyst_spark', hero(1));
    expect(a.players[0].hand.length).toBe(hand + 1);
  });

  it('Pyraxis hits the Warden only with another Dragon', () => {
    let s = newGame();
    setEnergy(s, 0, 8);
    s = play(s, 0, 'emb_pyraxis_ashen_sovereign');
    expect(s.players[1].hero.health).toBe(30);
    let t = newGame({ board0: ['neu_skyrift_wyrm'] });
    setEnergy(t, 0, 8);
    t = play(t, 0, 'emb_pyraxis_ashen_sovereign');
    expect(t.players[1].hero.health).toBe(27);
  });
});

describe('Dragon Realm: cost reduction', () => {
  it('Moonfire Circle makes Dragons cheaper, not other units, and stacks with Highspire-style hand discounts', () => {
    let s = newGame();
    setEnergy(s, 0, 1);
    s = play(s, 0, 'ast_the_moonfire_circle');
    const wyrm = giveCard(s, 0, 'neu_duskhorn_dragon');
    const knight = giveCard(s, 0, 'irn_goldwing_vanguard');
    const token = giveCard(s, 0, 'token_drakeling');
    const cost = (uid: number) => effectiveCost(s, 0, s.players[0].hand.find((c) => c.uid === uid)!);
    expect(cost(wyrm)).toBe(4);
    expect(cost(knight)).toBe(3);
    expect(cost(token)).toBe(1);
    // The opponent's Dragons are unaffected.
    const theirs = giveCard(s, 1, 'neu_duskhorn_dragon');
    expect(effectiveCost(s, 1, s.players[1].hand.find((c) => c.uid === theirs)!)).toBe(5);
  });

  it('Faerie Ring and Maelis stack on Fae and never push a cost below 0', () => {
    let s = newGame();
    setEnergy(s, 0, 6);
    s = play(s, 0, 'ver_the_faerie_ring');
    s = play(s, 0, 'ver_maelis_queen_of_the_glade');
    const pixie = giveCard(s, 0, 'emb_cinderwing_pixie');
    const fae = giveCard(s, 0, 'tid_tidewhisper_fae');
    const cost = (uid: number) => effectiveCost(s, 0, s.players[0].hand.find((c) => c.uid === uid)!);
    expect(cost(pixie)).toBe(0);
    expect(cost(fae)).toBe(1);
  });

  it('Sigil of the Wyrmlords discounts the priciest Dragon at turn start and keeps its charge when there is none', () => {
    let s = newGame();
    setEnergy(s, 0, 2);
    s = play(s, 0, 'neu_wyrmlord_sigil');
    s = endTurn(endTurn(s));
    // No Dragon in hand: charge kept.
    expect(s.players[0].relics[0].charges).toBe(3);
    const big = giveCard(s, 0, 'neu_aurumvex_the_hoardwyrm');
    const small = giveCard(s, 0, 'neu_redcrag_drake');
    s = endTurn(endTurn(s));
    const byUid = (uid: number) => s.players[0].hand.find((c) => c.uid === uid)!;
    expect(effectiveCost(s, 0, byUid(big))).toBe(7);
    expect(effectiveCost(s, 0, byUid(small))).toBe(3);
    expect(s.players[0].relics[0].charges).toBe(2);
  });
});

describe('Dragon Realm: filtered draws', () => {
  it('drawing a Dragon / Fae with none in the deck does nothing (no fatigue, no stray draw)', () => {
    for (const id of ['neu_wyrmcall', 'emb_call_of_the_red_sun']) {
      let s = newGame();
      setEnergy(s, 0, 3);
      const before = s.players[0].hand.length;
      const deck = s.players[0].deck.length;
      s = play(s, 0, id);
      expect(s.players[0].hand.length, id).toBe(before);
      expect(s.players[0].deck.length, id).toBe(deck);
      expect(s.players[0].fatigue, id).toBe(0);
    }
    let m = newGame();
    setEnergy(m, 0, 5);
    const hand = m.players[0].hand.length;
    m = play(m, 0, 'ver_maelis_queen_of_the_glade');
    expect(m.players[0].hand.length).toBe(hand);
  });

  it("Grave-Dragon's Pact needs a friendly unit; with one it draws up to 2 Dragons", () => {
    const s = newGame({ deck0: deckWith('neu_redcrag_drake') });
    setEnergy(s, 0, 3);
    const uid = giveCard(s, 0, 'vod_grave_dragons_pact');
    expect(applyAction(s, { type: 'PLAY_CARD', player: 0, cardUid: uid }).error).toBeTruthy();
    let t = newGame({ deck0: deckWith('neu_redcrag_drake'), board0: ['token_recruit'] });
    setEnergy(t, 0, 3);
    const hand = t.players[0].hand.length;
    t = play(t, 0, 'vod_grave_dragons_pact', t.players[0].board[0]);
    expect(t.players[0].board).toHaveLength(0);
    // Only one Dragon in the deck: draws just that one.
    expect(t.players[0].hand.length).toBe(hand + 1);
    expect(t.players[0].hand.filter((c) => isDragon(c.cardId))).toHaveLength(1);
  });

  it('Wyrmsoul Rebirth with an empty graveyard just resolves', () => {
    let s = newGame();
    setEnergy(s, 0, 5);
    s = play(s, 0, 'vod_wyrmsoul_rebirth');
    expect(s.players[0].board).toHaveLength(0);
  });

  it('Glacivar draws one card per Frozen enemy, capped at 2', () => {
    for (const [enemies, draws] of [[0, 0], [1, 1], [3, 2]] as const) {
      let s = newGame({ board1: Array(enemies).fill('token_recruit') });
      setEnergy(s, 0, 8);
      const hand = s.players[0].hand.length;
      s = play(s, 0, 'tid_glacivar_rime_sovereign');
      expect(s.players[1].board.every((u) => u.frozen)).toBe(true);
      expect(s.players[0].hand.length, `${enemies} enemies`).toBe(hand + draws);
    }
  });
});

describe('Dragon Realm: relic triggers on summoned Dragons', () => {
  it('Dragonforge Star triggers per Dragon including Cinder Drakeling tokens and breaks after 3', () => {
    let s = newGame();
    setEnergy(s, 0, 8);
    s = play(s, 0, 'irn_dragonforge_star');
    s = play(s, 0, 'emb_ashwing_matriarch');
    // Matriarch + 2 Drakelings = 3 Dragons -> 9 Armor, relic used up.
    expect(s.players[0].hero.armor).toBe(9);
    expect(s.players[0].relics).toHaveLength(0);
  });

  it('Frostwyrm Lodestar freezes per Dragon, ignores non-Dragons, and keeps charges with no enemy to freeze', () => {
    let s = newGame();
    setEnergy(s, 0, 4);
    s = play(s, 0, 'tid_frostwyrm_lodestar');
    s = play(s, 0, 'irn_anvilwing_drake');
    expect(s.players[0].relics[0].charges).toBe(3);
    let t = newGame({ board1: ['token_golem'] });
    setEnergy(t, 0, 4);
    t = play(t, 0, 'tid_frostwyrm_lodestar');
    t = play(t, 0, 'token_recruit');
    expect(t.players[1].board[0].frozen).toBe(false);
    t = play(t, 0, 'irn_anvilwing_drake');
    expect(t.players[1].board[0].frozen).toBe(true);
    expect(t.players[0].relics[0].charges).toBe(2);
  });
});

describe('Dragon Realm: other cards', () => {
  it('Nyxarath can only target an enemy with 4 or more Attack', () => {
    const s = newGame({ board1: ['token_wolf'] });
    setEnergy(s, 0, 7);
    const uid = giveCard(s, 0, 'vod_nyxarath_hollow_wyrm');
    expect(applyAction(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: unitRef(s.players[1].board[0]) }).error).toBeTruthy();
    let t = newGame({ board1: ['token_golem'] });
    setEnergy(t, 0, 7);
    t = play(t, 0, 'vod_nyxarath_hollow_wyrm', t.players[1].board[0]);
    expect(t.players[1].board).toHaveLength(0);
  });

  it('Aurumvex and Highspire only create collectible Dragons; Highspire discounts by 2', () => {
    for (let seed = 1; seed <= 40; seed++) {
      let s = newGame({ seed });
      setEnergy(s, 0, 8);
      s = play(s, 0, 'neu_aurumvex_the_hoardwyrm');
      const made = s.players[0].hand.slice(-2);
      for (const c of made) {
        const def = getCard(c.cardId)!;
        expect(def.collectible, c.cardId).not.toBe(false);
        expect(def.tags, c.cardId).toContain('Dragon');
      }
    }
    let h = newGame();
    setEnergy(h, 0, 5);
    h = play(h, 0, 'ast_highspire_dragonkin');
    const card = h.players[0].hand[h.players[0].hand.length - 1];
    expect(isDragon(card.cardId)).toBe(true);
    expect(effectiveCost(h, 0, card)).toBe(Math.max(0, getCard(card.cardId)!.manaCost - 2));
  });

  it('Frostblade Dragonknight freezes the unit it attacks and attacking a Warden is harmless', () => {
    let s = newGame({ board0: ['tid_frostblade_dragonknight'], board1: ['token_golem'] });
    ready(s, 0);
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: s.players[0].board[0].uid, target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board[0].frozen).toBe(true);
    let t = newGame({ board0: ['tid_frostblade_dragonknight'] });
    ready(t, 0);
    t = act(t, { type: 'ATTACK', player: 0, attackerUid: t.players[0].board[0].uid, target: hero(1) });
    expect(t.players[1].hero.health).toBe(26);
  });

  it('Glacivar + Tidewhisper Fae + Lodestar freeze lock resolves without hitting the trigger limit', () => {
    let s = newGame({ board0: ['tid_tidewhisper_fae'], board1: ['token_golem', 'token_recruit', 'irn_silverscale_drake'] });
    setEnergy(s, 0, 10);
    s = play(s, 0, 'tid_frostwyrm_lodestar');
    const res = applyAction(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'tid_glacivar_rime_sovereign') });
    expect(res.error).toBeUndefined();
    expect(res.events.some((e) => e.type === 'TRIGGER_LIMIT_REACHED')).toBe(false);
    s = res.state;
    for (let i = 0; i < 6; i++) {
      const r = applyAction(s, { type: 'END_TURN', player: s.activePlayer });
      expect(r.error).toBeUndefined();
      expect(r.events.some((e) => e.type === 'TRIGGER_LIMIT_REACHED')).toBe(false);
      s = r.state;
    }
    expect(s.phase).toBe('MAIN');
  });

  it('Wyrmbone Sanctum draws at turn start only while you control a Dragon', () => {
    let s = newGame();
    setEnergy(s, 0, 2);
    s = play(s, 0, 'vod_wyrmbone_sanctum');
    s = endTurn(endTurn(s));
    const noDragon = s.players[0].hand.length;
    let t = newGame({ board0: ['irn_anvilwing_drake'] });
    setEnergy(t, 0, 2);
    t = play(t, 0, 'vod_wyrmbone_sanctum');
    t = endTurn(endTurn(t));
    expect(t.players[0].hand.length).toBe(noDragon + 1);
  });
});
