import { describe, expect, it } from 'vitest';
import { BOARD_FX } from '@/ui/match/boardFx';
import { BOARD_MATS, INN_BOARDS, pickBoardBackground } from '@/ui/match/boardBackgrounds';

describe('animated boards', () => {
  it('every mat has its animation', () => {
    expect(Object.keys(BOARD_MATS).sort()).toEqual(Object.keys(BOARD_FX).sort());
  });

  it('a picked board carries the name of its mat', () => {
    for (let i = 0; i < 10; i++) {
      const b = pickBoardBackground()!;
      expect(BOARD_MATS[b.key]).toBe(b.url);
    }
    expect(pickBoardBackground({ campaign: 'inn' })!.key).toMatch(/^inn-board-/);
    expect(INN_BOARDS).toContain(pickBoardBackground({ campaign: 'inn' })!.url);
  });
});
