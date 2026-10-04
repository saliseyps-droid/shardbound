import { describe, expect, it } from 'vitest';
import { CAMPAIGN } from '@/data/opponents';
import { hasCard } from '@/data/cards';
import cs from '@/i18n/cs/data/opponents';

describe('campaign chapters IV and V', () => {
  it('follow the first three chapters and end with Rendoslav', () => {
    expect(CAMPAIGN.map((c) => c.id)).toEqual(['ch1', 'ch2', 'ch3', 'ch4', 'ch5']);
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
