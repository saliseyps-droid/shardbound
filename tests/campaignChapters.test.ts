import { describe, expect, it } from 'vitest';
import { CAMPAIGN } from '@/data/opponents';
import { hasCard } from '@/data/cards';
import { getPortrait } from '@/data/portraits';
import { opponentSide } from '@/domain/matchSetup';
import cs from '@/i18n/cs/data/opponents';

describe('campaign chapters IV and V', () => {
  it('follow the first three chapters and end with Rendoslav', () => {
    expect(CAMPAIGN.map((c) => c.id)).toEqual(['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9']);
    expect(CAMPAIGN[4].encounters.at(-1)!.name).toBe('Rendoslav');
  });

  it('only add cards that exist and every encounter is translated', () => {
    for (const ch of CAMPAIGN) {
      expect(cs.chapters?.[ch.id]?.name).toBeTruthy();
      for (const e of ch.encounters) {
        for (const id of e.special?.extraCards ?? []) expect(hasCard(id), id).toBe(true);
        const o = cs.opponents?.[e.id];
        expect(o?.name, e.id).toBeTruthy();
        expect(o?.special?.length ?? 0, e.id).toBe(e.special?.description.length ?? 0);
      }
    }
  });
});

describe('campaign chapters VI to IX', () => {
  it('end with the Sundered Crown and every starting location is a real location', () => {
    expect(CAMPAIGN.at(-1)!.encounters.at(-1)!.id).toBe('c9_final');
    for (const e of CAMPAIGN.flatMap((c) => c.encounters)) if (e.special?.startingLocation) expect(hasCard(e.special.startingLocation), e.id).toBe(true);
  });
});

describe('campaign portraits', () => {
  it('every Warden has a fixed portrait of their faction, never the same as the rival before', () => {
    const flat = CAMPAIGN.flatMap((c) => c.encounters);
    flat.forEach((e, i) => {
      expect(e.portrait, e.id).not.toBeUndefined();
      if (e.portrait) expect(getPortrait(e.portrait)?.faction, e.id).toBe(e.faction);
      if (i > 0 && flat[i - 1].faction === e.faction) expect(e.portrait, e.id).not.toBe(flat[i - 1].portrait);
      expect(opponentSide(e).portrait ?? null, e.id).toBe(e.portrait);
    });
  });
});
