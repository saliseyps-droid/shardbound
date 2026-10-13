import { describe, expect, it } from 'vitest';
import { collectibleCards } from '@/data/cards';
import { DEFAULT_FILTERS, filterCards } from '@/ui/components/collection/cardFilters';

const all = collectibleCards();
const owned = () => 1;

describe('Collection: campaign rewards as their own set', () => {
  it('the Campaign filter shows exactly the campaign-only cards', () => {
    const shown = filterCards(all, { ...DEFAULT_FILTERS, set: 'CAMPAIGN' }, owned);
    expect(shown.length).toBe(all.filter((c) => c.rewardOnly).length);
    expect(shown.map((c) => c.id)).toContain('irn_the_hollow_host');
    expect(shown.map((c) => c.id)).toContain('neu_nyx_lantern_of_nul');
  });

  it('real sets no longer list campaign cards', () => {
    expect(filterCards(all, { ...DEFAULT_FILTERS, set: 'CORE' }, owned).some((c) => c.rewardOnly)).toBe(false);
  });

  it('sorting by set puts campaign rewards last', () => {
    const sorted = filterCards(all, { ...DEFAULT_FILTERS, sort: 'set' }, owned);
    const firstReward = sorted.findIndex((c) => c.rewardOnly);
    expect(sorted.slice(firstReward).every((c) => c.rewardOnly)).toBe(true);
    expect(sorted[0].set).toBe('CORE');
  });
});
