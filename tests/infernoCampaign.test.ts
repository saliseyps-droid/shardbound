import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CAMPAIGNS, INFERNO_CAMPAIGN, campaignOf, findEncounter, rewardCampaign } from '@/data/opponents';
import { getCard, hasCard, poolCards } from '@/data/cards';
import { getTalent } from '@/data/wardenTalents';
import { CINEMATICS } from '@/data/cinematics';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { opponentSide } from '@/domain/matchSetup';
import { craftCost } from '@/domain/economy';
import cs from '@/i18n/cs/data/opponents';
import csCards from '@/i18n/cs/cards/inferno';
import { act, giveCard, newGame, setEnergy } from './helpers';

const flat = INFERNO_CAMPAIGN.flatMap((c) => c.encounters);
const rewards = flat.map((e) => e.firstWinReward?.cardId ?? '');

describe('The Underflame', () => {
  it('is four chapters of three fights for 1000 Gold each, with an intro, an ending and a cinematic before Azgaroth', () => {
    expect(CAMPAIGNS.find((c) => c.id === 'inferno')).toBeTruthy();
    expect(INFERNO_CAMPAIGN).toHaveLength(4);
    for (const ch of INFERNO_CAMPAIGN) {
      expect(ch.encounters).toHaveLength(3);
      expect(ch.price).toBe(1000);
      expect(ch.encounters.at(-1)!.boss).toBe(true);
      expect(cs.chapters?.[ch.id]?.name, ch.id).toBeTruthy();
    }
    expect(campaignOf('u2_e1').id).toBe('inferno');
    expect(findEncounter('u4_boss')?.encounter.preCinematic).toBe('inferno_throne');
    const camp = campaignOf('u1_e1');
    const shots = [camp.intro!, 'inferno_throne', camp.outro!].flatMap((id) => CINEMATICS[id].shots.map((s) => s.image));
    // No picture comes twice in the three cinematics; the ending shows the dead Sovereign.
    expect(new Set(shots).size).toBe(shots.length);
    expect(CINEMATICS[camp.outro!].shots.map((s) => s.image)).toContain('inf_dead_king');
    for (const img of shots) expect(existsSync(`src/assets/cinematics/${img}.webp`), img).toBe(true);
  });

  it('every demon plays its own card and gives it up when beaten', () => {
    for (const e of flat) {
      const id = e.firstWinReward?.cardId;
      expect(id, e.id).toBeTruthy();
      expect(e.special?.extraCards, e.id).toContain(id);
      for (const x of e.special?.extraCards ?? []) expect(hasCard(x), `${e.id} ${x}`).toBe(true);
      for (const t of e.special?.talents ?? []) expect(getTalent(t.abilityId)?.levels[t.level], `${e.id} ${t.abilityId}`).toBeTruthy();
      expect(cs.opponents?.[e.id]?.special?.length ?? 0, e.id).toBe(e.special?.description.length ?? 0);
      expect(existsSync(`src/assets/portraits/${e.portrait}.webp`), e.id).toBe(true);
      expect(opponentSide(e).portrait ?? null, e.id).toBe(e.portrait);
      expect(rewardCampaign(id!)?.id).toBe('inferno');
    }
    expect(new Set(flat.map((e) => e.portrait)).size).toBe(12);
    expect(new Set(rewards).size).toBe(12);
  });

  it('has two cards per faction, the four lords Legendary, all campaign-only', () => {
    for (const f of PLAYABLE_FACTIONS) expect(rewards.filter((id) => getCard(id)!.faction === f), f).toHaveLength(2);
    INFERNO_CAMPAIGN.forEach((ch) => ch.encounters.forEach((e, i) => expect(getCard(e.firstWinReward!.cardId!)!.rarity, e.id).toBe(i === 2 ? 'LEGENDARY' : 'EPIC')));
    for (const id of rewards) {
      const c = getCard(id)!;
      expect(c.collectible && c.rewardOnly, id).toBe(true);
      expect(existsSync(`src/assets/cards/${id}.webp`), id).toBe(true);
      expect(csCards[id]?.name, id).toBeTruthy();
      expect(poolCards().some((p) => p.id === id), id).toBe(false);
      expect(craftCost(id)).toBe(Infinity);
    }
  });

  it('Rimegrave freezes the board and then hurts what stays frozen', () => {
    let s = newGame({ board1: ['neu_stonehide_ox', 'token_recruit'] });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'tid_rimegrave_lord_of_the_frozen_lake') });
    expect(s.players[1].board.every((u) => u.frozen)).toBe(true);
    s = act(s, { type: 'END_TURN', player: 0 });
    expect(s.players[1].board.map((u) => u.cardId)).toEqual(['neu_stonehide_ox']);
    expect(s.players[1].board[0].damage).toBe(2);
  });

  it('Azgaroth burns everything on arrival', () => {
    let s = newGame({ board1: ['neu_stonehide_ox'] });
    setEnergy(s, 0, 10);
    const hp = s.players[1].hero.health;
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: giveCard(s, 0, 'emb_azgaroth_the_ninth_sovereign') });
    expect(s.players[1].hero.health).toBe(hp - 3);
    expect(s.players[1].board[0]).toMatchObject({ damage: 3, burn: 2 });
  });
});
