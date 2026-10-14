// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { BOARD_BACKGROUNDS, INN_BOARDS, pickBoardBackground } from '@/ui/match/boardBackgrounds';

describe('board backgrounds', () => {
  beforeEach(() => localStorage.clear());

  it('Wraithwood Inn fights alternate the two tavern tables and use nothing else', () => {
    expect(INN_BOARDS).toHaveLength(2);
    const picks = Array.from({ length: 6 }, () => pickBoardBackground({ inn: true })!.url);
    expect(new Set(picks)).toEqual(new Set(INN_BOARDS));
    for (let i = 1; i < picks.length; i++) expect(picks[i]).not.toBe(picks[i - 1]);
  });

  it('other matches never get a tavern table, and the fire and ice mats are veiled less', () => {
    for (let i = 0; i < 40; i++) expect(INN_BOARDS).not.toContain(pickBoardBackground()!.url);
    expect(BOARD_BACKGROUNDS).toHaveLength(10);
    const seen = new Map<string, number>();
    for (let i = 0; i < 200; i++) {
      const b = pickBoardBackground()!;
      seen.set(b.url, b.dim);
    }
    const dims = [...seen.values()];
    expect(dims.filter((d) => d < 0.5)).toHaveLength(2);
  });
});
