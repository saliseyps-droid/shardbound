// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { BOARD_BACKGROUNDS, HEAVEN_BOARDS, INFERNO_BOARDS, INN_BOARDS, pickBoardBackground } from '@/ui/match/boardBackgrounds';

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

  it('every fight of the Twin Oath is on its starry table of the Host', () => {
    expect(HEAVEN_BOARDS).toHaveLength(1);
    for (let i = 0; i < 4; i++) expect(pickBoardBackground({ campaign: 'heaven' })!.url).toBe(HEAVEN_BOARDS[0]);
  });

  it('other campaigns never get a campaign table; other matches can get any', () => {
    const special = [...INN_BOARDS, ...INFERNO_BOARDS, ...HEAVEN_BOARDS];
    for (let i = 0; i < 60; i++) expect(special).not.toContain(pickBoardBackground({ campaign: 'main' })!.url);
    const seen = new Set<string>();
    for (let i = 0; i < 600; i++) seen.add(pickBoardBackground()!.url);
    expect(seen).toEqual(new Set([...BOARD_BACKGROUNDS, ...special]));
  });

  it('the fire, ice and pirate mats, the hellish tables and the heavenly one are veiled less', () => {
    expect(BOARD_BACKGROUNDS).toHaveLength(8);
    const dims = new Map<string, number>();
    for (let i = 0; i < 600; i++) {
      const b = pickBoardBackground()!;
      dims.set(b.url, b.dim);
    }
    expect([...dims.values()].filter((d) => d < 0.5)).toHaveLength(7);
  });
});
