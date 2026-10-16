// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { BOARD_BACKGROUNDS, INFERNO_BOARDS, INN_BOARDS, pickBoardBackground } from '@/ui/match/boardBackgrounds';

describe('board backgrounds', () => {
  beforeEach(() => localStorage.clear());

  it('the Wraithwood Inn and the Underflame take turns on their own two tables and use nothing else', () => {
    for (const [campaign, own] of [['inn', INN_BOARDS], ['inferno', INFERNO_BOARDS]] as const) {
      expect(own).toHaveLength(2);
      const picks = Array.from({ length: 6 }, () => pickBoardBackground({ campaign })!.url);
      expect(new Set(picks)).toEqual(new Set(own));
      for (let i = 1; i < picks.length; i++) expect(picks[i]).not.toBe(picks[i - 1]);
    }
  });

  it('other campaigns never get a campaign table; other matches can get any', () => {
    const special = [...INN_BOARDS, ...INFERNO_BOARDS];
    for (let i = 0; i < 60; i++) expect(special).not.toContain(pickBoardBackground({ campaign: 'main' })!.url);
    const seen = new Set<string>();
    for (let i = 0; i < 400; i++) seen.add(pickBoardBackground()!.url);
    expect(seen).toEqual(new Set([...BOARD_BACKGROUNDS, ...special]));
  });

  it('the fire and ice mats and the hellish tables are veiled less', () => {
    expect(BOARD_BACKGROUNDS).toHaveLength(10);
    const dims = new Map<string, number>();
    for (let i = 0; i < 400; i++) {
      const b = pickBoardBackground()!;
      dims.set(b.url, b.dim);
    }
    expect([...dims.values()].filter((d) => d < 0.5)).toHaveLength(4);
  });
});
