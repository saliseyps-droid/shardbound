import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CAMPAIGN, CAMPAIGNS, INFERNO_CAMPAIGN, INN_CAMPAIGN, LAMP_CAMPAIGN, VOID_CAMPAIGN, allEncounters, campaignOf, findEncounter } from '@/data/opponents';
import { hasCard } from '@/data/cards';
import { getPortrait } from '@/data/portraits';
import { getTalent } from '@/data/wardenTalents';
import { opponentSide } from '@/domain/matchSetup';
import { createNewSave } from '@/domain/newAccount';
import { campaignProgress, isUnlocked, nextEncounter } from '@/ui/components/meta/campaign';
import cs from '@/i18n/cs/data/opponents';

const flat = VOID_CAMPAIGN.flatMap((c) => c.encounters);

describe('The Black Sun (Void Reckoning campaign)', () => {
  it('has three chapters of five fights and ends with Sali', () => {
    expect(VOID_CAMPAIGN.map((c) => c.id)).toEqual(['vr1', 'vr2', 'vr3']);
    for (const ch of VOID_CAMPAIGN) expect(ch.encounters).toHaveLength(5);
    expect(flat.at(-1)!.id).toBe('v3_final');
    expect(flat.at(-1)!.special?.extraCards).toContain('neu_sali_the_creator');
  });

  it('is its own campaign: listed after the main one and found by encounter id', () => {
    expect(CAMPAIGNS.map((c) => c.id).slice(0, 2)).toEqual(['main', 'void']);
    expect(campaignOf('v2_b1').id).toBe('void');
    expect(campaignOf('c1_e1').id).toBe('main');
    expect(findEncounter('v3_final')?.chapter.id).toBe('vr3');
    expect(allEncounters()).toHaveLength(CAMPAIGN.flatMap((c) => c.encounters).length + flat.length + LAMP_CAMPAIGN.flatMap((c) => c.encounters).length + INN_CAMPAIGN.flatMap((c) => c.encounters).length + INFERNO_CAMPAIGN.flatMap((c) => c.encounters).length);
  });

  it('opens from the start and unlocks fight by fight, apart from the main campaign', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    expect(isUnlocked(save, 'v1_e1')).toBe(true);
    expect(isUnlocked(save, 'v1_e2')).toBe(false);
    save.pve.completed.v1_e1 = { firstClearAt: 1, wins: 1 };
    expect(isUnlocked(save, 'v1_e2')).toBe(true);
    // The last fight of a chapter opens the next chapter.
    for (const e of VOID_CAMPAIGN[0].encounters) save.pve.completed[e.id] = { firstClearAt: 1, wins: 1 };
    expect(isUnlocked(save, 'v2_e1')).toBe(true);
    expect(nextEncounter(save, VOID_CAMPAIGN)?.encounter.id).toBe('v2_e1');
    expect(campaignProgress(save, VOID_CAMPAIGN)).toEqual({ cleared: 5, total: 15 });
    // The main campaign is untouched.
    expect(campaignProgress(save)).toEqual({ cleared: 0, total: CAMPAIGN.flatMap((c) => c.encounters).length });
    expect(nextEncounter(save)?.encounter.id).toBe('c1_e1');
  });

  it('only adds real cards, pays Void Reckoning packs and is translated', () => {
    for (const ch of VOID_CAMPAIGN) {
      expect(cs.chapters?.[ch.id]?.name, ch.id).toBeTruthy();
      for (const e of ch.encounters) {
        for (const id of e.special?.extraCards ?? []) expect(hasCard(id), `${e.id} ${id}`).toBe(true);
        const o = cs.opponents?.[e.id];
        expect(o?.name, e.id).toBeTruthy();
        expect(o?.special?.length ?? 0, e.id).toBe(e.special?.description.length ?? 0);
        if (e.firstWinReward?.packs) expect(e.firstWinReward.packs.setId, e.id).toBe('RECKONING');
      }
    }
  });

  it('gives every Warden with fixed abilities two known ones', () => {
    for (const e of flat) {
      const side = opponentSide(e);
      expect(side.talents, e.id).toHaveLength(2);
      for (const t of side.talents!) expect(getTalent(t.abilityId)?.levels[t.level], `${e.id} ${t.abilityId}`).toBeTruthy();
    }
  });

  it('gives every Warden a portrait of their faction, and Sali her own', () => {
    flat.forEach((e, i) => {
      expect(e.portrait, e.id).toBeTruthy();
      if (e.id === 'v3_final') expect(existsSync(`src/assets/portraits/${e.portrait}.webp`)).toBe(true);
      else expect(getPortrait(e.portrait)?.faction, e.id).toBe(e.faction);
      if (i > 0 && flat[i - 1].faction === e.faction) expect(e.portrait, e.id).not.toBe(flat[i - 1].portrait);
      expect(opponentSide(e).portrait ?? null, e.id).toBe(e.portrait);
    });
  });
});
