import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INN_CAMPAIGN, campaignOf, findEncounter, rewardCampaign } from '@/data/opponents';
import { getCard, hasCard, poolCards } from '@/data/cards';
import { getTalent } from '@/data/wardenTalents';
import { CINEMATICS } from '@/data/cinematics';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { opponentSide } from '@/domain/matchSetup';
import { craftCost } from '@/domain/economy';
import cs from '@/i18n/cs/data/opponents';
import csCards from '@/i18n/cs/cards/wraithwood';
import { unitAttack } from '@/engine/queries';
import { act, giveCard, newGame, setEnergy, unitRef } from './helpers';

const flat = INN_CAMPAIGN.flatMap((c) => c.encounters);
const rewards = flat.map((e) => e.firstWinReward?.cardId ?? '');

describe('The Wraithwood Inn', () => {
  it('is four chapters of three fights, each sold for 1000 Gold, and opens with its cinematic', () => {
    expect(INN_CAMPAIGN).toHaveLength(4);
    for (const ch of INN_CAMPAIGN) {
      expect(ch.encounters).toHaveLength(3);
      expect(ch.price).toBe(1000);
      expect(ch.encounters.at(-1)!.boss).toBe(true);
      expect(cs.chapters?.[ch.id]?.name, ch.id).toBeTruthy();
    }
    expect(campaignOf('w2_e1').id).toBe('inn');
    expect(findEncounter('w4_boss')?.chapter.id).toBe('wi4');
    expect(CINEMATICS[campaignOf('w1_e1').intro!].shots).toHaveLength(5);
    expect(CINEMATICS[campaignOf('w1_e1').outro!].shots).toHaveLength(3);
  });

  it('every guest plays its own card and gives it up when beaten', () => {
    for (const e of flat) {
      const id = e.firstWinReward?.cardId;
      expect(id, e.id).toBeTruthy();
      expect(e.special?.extraCards, e.id).toContain(id);
      for (const x of e.special?.extraCards ?? []) expect(hasCard(x), `${e.id} ${x}`).toBe(true);
      for (const t of e.special?.talents ?? []) expect(getTalent(t.abilityId)?.levels[t.level], `${e.id} ${t.abilityId}`).toBeTruthy();
      expect(cs.opponents?.[e.id]?.special?.length ?? 0, e.id).toBe(e.special?.description.length ?? 0);
      expect(existsSync(`src/assets/portraits/${e.portrait}.webp`), e.id).toBe(true);
      expect(opponentSide(e).portrait ?? null, e.id).toBe(e.portrait);
      expect(rewardCampaign(id!)?.id).toBe('inn');
    }
    expect(new Set(flat.map((e) => e.portrait)).size).toBe(12);
    expect(new Set(rewards).size).toBe(12);
  });

  it('has two cards per faction, the chapter hosts Legendary, all campaign-only', () => {
    for (const f of PLAYABLE_FACTIONS) expect(rewards.filter((id) => getCard(id)!.faction === f), f).toHaveLength(2);
    INN_CAMPAIGN.forEach((ch) => ch.encounters.forEach((e, i) => expect(getCard(e.firstWinReward!.cardId!)!.rarity, e.id).toBe(i === 2 ? 'LEGENDARY' : 'EPIC')));
    for (const id of rewards) {
      const c = getCard(id)!;
      expect(c.collectible && c.rewardOnly, id).toBe(true);
      expect(existsSync(`src/assets/cards/${id}.webp`), id).toBe(true);
      expect(csCards[id]?.name, id).toBeTruthy();
      expect(poolCards().some((p) => p.id === id), id).toBe(false);
      expect(craftCost(id)).toBe(Infinity);
    }
  });

  it('The Pale Lodger comes back to your hand when it dies', () => {
    let s = newGame({ board0: ['ast_the_pale_lodger'] });
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'vod_feed_the_void');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: unitRef(s.players[0].board[0]) });
    expect(s.players[0].board).toHaveLength(0);
    expect(s.players[0].hand.filter((c) => c.cardId === 'ast_the_pale_lodger')).toHaveLength(1);
  });

  it('The Widow in White freezes every enemy unit', () => {
    let s = newGame({ board1: ['neu_stonehide_ox', 'token_recruit'] });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'tid_the_widow_in_white') });
    expect(s.players[1].board.every((u) => u.frozen)).toBe(true);
  });

  it('The Hollow Host brings two Risen Bones and lifts the whole table', () => {
    let s = newGame({ board0: ['token_recruit'] });
    setEnergy(s, 0, 10);
    const before = unitAttack(s, s.players[0].board[0]);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'irn_the_hollow_host') });
    const bones = s.players[0].board.filter((u) => u.cardId === 'token_skeleton');
    expect(bones).toHaveLength(2);
    expect(bones.every((u) => unitAttack(s, u) === 3)).toBe(true);
    expect(unitAttack(s, s.players[0].board.find((u) => u.cardId === 'token_recruit')!)).toBe(before + 1);
    expect(unitAttack(s, s.players[0].board.find((u) => u.cardId === 'irn_the_hollow_host')!)).toBe(6);
  });

  it('The Drowned Guest freezes its target and draws a card', () => {
    let s = newGame({ board1: ['neu_stonehide_ox'] });
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'tid_the_drowned_guest');
    const hand = s.players[0].hand.length;
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid, target: unitRef(s.players[1].board[0]) });
    expect(s.players[1].board[0].frozen).toBe(true);
    expect(s.players[0].hand.length).toBe(hand);
  });
});
