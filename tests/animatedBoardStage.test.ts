import { describe, expect, it } from 'vitest';
import { stageFor } from '@/ui/match/AnimatedBoard';

describe('where the animated board lays its lights over the mat', () => {
  it('cover: crops the mat to fill the board (2D)', () => {
    expect(stageFor(1600, 1000, 1823, 'cover')).toEqual({ x: (1600 - 3200 * (1000 / 1823)) / 2, y: 0, w: 3200 * (1000 / 1823), h: 1000 });
  });
  it('contain: shows the whole mat (pirate boards in 2D)', () => {
    expect(stageFor(1600, 911, 1798, 'contain')).toEqual({ x: 0, y: (911 - 899) / 2, w: 1600, h: 899 });
  });
  it('fill: exactly the 3D table mat, which stretches every painting to its size', () => {
    expect(stageFor(1600, 911, 1798, 'fill')).toEqual({ x: 0, y: 0, w: 1600, h: 911 });
  });
});
