import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CAMPAIGNS, HEAVEN_CAMPAIGN, campaignOf, findEncounter, rewardCampaign } from '@/data/opponents';
import { getCard, hasCard, poolCards } from '@/data/cards';
import { opponentSide } from '@/domain/matchSetup';
import { craftCost } from '@/domain/economy';
import { isCoopEncounter, readCoopMeta } from '@/domain/coop';
import { applyAction, createGame } from '@/engine';
import { validTargets } from '@/engine/queries';
import cs from '@/i18n/cs/data/opponents';
import csCards from '@/i18n/cs/cards/heaven';
import { act, filler, giveCard, newGame, setEnergy } from './helpers';

const flat = HEAVEN_CAMPAIGN.flatMap((c) => c.encounters);
const rewards = flat.map((e) => e.firstWinReward?.cardId ?? '');

describe('The Twin Oath (co-op campaign)', () => {
  it('is three chapters of three co-op fights for 1000 Gold each', () => {
    const camp = CAMPAIGNS.find((c) => c.id === 'heaven')!;
    expect(camp.coop).toBe(true);
    expect(HEAVEN_CAMPAIGN).toHaveLength(3);
    for (const ch of HEAVEN_CAMPAIGN) {
      expect(ch.encounters).toHaveLength(3);
      expect(ch.price).toBe(1000);
      expect(ch.encounters.at(-1)!.boss).toBe(true);
      expect(cs.chapters?.[ch.id]?.name, ch.id).toBeTruthy();
    }
    expect(campaignOf('hv2_e1').id).toBe('heaven');
    expect(isCoopEncounter('hv3_final')).toBe(true);
    expect(isCoopEncounter('c1_e1')).toBe(false);
  });

  it('every knight is a co-op boss that plays its own card and gives it up when beaten', () => {
    for (const e of flat) {
      const id = e.firstWinReward?.cardId;
      expect(id, e.id).toBeTruthy();
      expect(e.special?.extraCards, e.id).toContain(id);
      // Every co-op boss draws and gains Energy every turn, or it can never keep up with two Wardens.
      expect(e.special?.rules, e.id).toEqual(expect.arrayContaining(['coop_rule_draw', 'coop_rule_energy']));
      for (const r of e.special?.rules ?? []) expect(hasCard(r), `${e.id} ${r}`).toBe(true);
      expect(cs.opponents?.[e.id]?.special?.length ?? 0, e.id).toBe(e.special?.description.length ?? 0);
      expect(existsSync(`src/assets/portraits/${e.portrait}.webp`), e.id).toBe(true);
      expect(opponentSide(e).portrait ?? null, e.id).toBe(e.portrait);
      expect(rewardCampaign(id!)?.id).toBe('heaven');
    }
    expect(new Set(flat.map((e) => e.portrait)).size).toBe(9);
    expect(new Set(rewards).size).toBe(9);
  });

  it('pays nine campaign-only Angels, the chapter bosses Legendary', () => {
    HEAVEN_CAMPAIGN.forEach((ch) => ch.encounters.forEach((e, i) => expect(getCard(e.firstWinReward!.cardId!)!.rarity, e.id).toBe(i === 2 ? 'LEGENDARY' : 'EPIC')));
    for (const id of rewards) {
      const c = getCard(id)!;
      expect(c.collectible && c.rewardOnly, id).toBe(true);
      expect(c.tags, id).toContain('Angel');
      expect(existsSync(`src/assets/cards/${id}.webp`), id).toBe(true);
      expect(csCards[id]?.name, id).toBeTruthy();
      expect(poolCards().some((p) => p.id === id), id).toBe(false);
      expect(craftCost(id)).toBe(Infinity);
    }
  });

  it('a friend online joins a campaign fight by its id', () => {
    expect(readCoopMeta({ coop: { encounter: 'hv1_boss' } })).toEqual({ encounter: 'hv1_boss' });
    expect(readCoopMeta({ coop: { encounter: 'c1_boss' } })).toBeNull();
    expect(readCoopMeta({ coop: { encounter: 'nope' } })).toBeNull();
    expect(findEncounter('hv1_boss')?.encounter.name).toBe('Halcyon');
  });

  it('Ostiarius can shield a teammate’s unit', () => {
    const side = (name: string, board: string[] = []) => ({ name, avatar: 'a', deck: filler(), keepDeckOrder: true, startingBoard: board });
    const s = createGame({ seed: 4, skipMulligan: true, players: [side('A'), side('Boss'), side('B', ['neu_stonehide_ox'])] }).state;
    const card = getCard('ast_ostiarius_keeper_of_the_stair')!;
    const mate = s.players[2].board[0].uid;
    expect(validTargets(s, 0, card.target!, { spellLike: false })).toContainEqual({ type: 'unit', uid: mate });
    s.players[0].energy = 10;
    const uid = giveCard(s, 0, card.id);
    const r = applyAction(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: { type: 'unit', uid: mate } });
    expect(r.error).toBeUndefined();
    expect(r.state.players[2].board[0].keywords).toContain('BARRIER');
  });

  it('the Arbiter passes judgment on arrival', () => {
    let s = newGame({ board1: ['neu_stonehide_ox'] });
    setEnergy(s, 0, 10);
    s.players[0].hero.health = 20;
    const target = { type: 'unit' as const, uid: s.players[1].board[0].uid };
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'neu_the_arbiter'), target });
    expect(s.players[1].board).toHaveLength(0);
    expect(s.players[0].hero.health).toBe(25);
  });
});
