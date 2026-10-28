import { describe, expect, it } from 'vitest';
import { lampToWorld, particleMotion, rgb } from '@/ui/match/table3d/boardLifeRules';
import { MAT, MAT_ART } from '@/ui/match/table3d/tableCamera';

describe('3D table: animated boards', () => {
  it('places a lamp painted at x/y % of the mat on the same spot of the 3D mat (drawn MAT_ART bigger)', () => {
    expect(lampToWorld(50, 50)).toEqual({ x: 0, y: 0 });
    const c = lampToWorld(0, 0);
    expect(c.x).toBeCloseTo((-MAT.w / 2) * MAT_ART);
    expect(c.y).toBeCloseTo((MAT.h / 2) * MAT_ART); // the top of the painting is the far edge (+y)
    expect(lampToWorld(100, 100).y).toBeCloseTo((-MAT.h / 2) * MAT_ART);
  });

  it('lets embers and steam rise, snow and leaves fall, the rest hover', () => {
    expect(particleMotion('embers')).toBe('rise');
    expect(particleMotion('steam')).toBe('rise');
    expect(particleMotion('snow')).toBe('fall');
    expect(particleMotion('leaves')).toBe('fall');
    expect(particleMotion('fireflies')).toBe('hover');
    expect(particleMotion('dust')).toBe('hover');
    expect(particleMotion('motes')).toBe('hover');
    expect(particleMotion('stars')).toBe('glint');
  });

  it('reads the "r, g, b" colours of the board config', () => {
    expect(rgb('255, 128, 0')).toEqual([1, 128 / 255, 0]);
  });
});
