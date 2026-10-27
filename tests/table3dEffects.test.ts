import { describe, expect, it } from 'vitest';
import { arcHeight, fxBurst, fxLabel } from '@/ui/match/table3d/effectRules';

describe('3D table effects', () => {
  it('bursts sparks for damage and rising motes for healing', () => {
    expect(fxBurst('damage', 2, false)).toMatchObject({ motion: 'burst', color: '#ff7a3a' });
    expect(fxBurst('heal', 3, false)).toMatchObject({ motion: 'rise', color: '#7ef29a' });
    expect(fxBurst('summon', undefined, false).motion).toBe('ring');
  });

  it('shakes the camera only for heavy hits or hits on a Warden', () => {
    expect(fxBurst('damage', 2, false).shake).toBe(0);
    expect(fxBurst('damage', 5, false).shake).toBeGreaterThan(0);
    expect(fxBurst('damage', 1, true).shake).toBeGreaterThan(0);
    expect(fxBurst('heal', 9, true).shake).toBe(0);
  });

  it('gives bigger hits more sparks, within a cap', () => {
    expect(fxBurst('damage', 6, false).count).toBeGreaterThan(fxBurst('damage', 1, false).count);
    expect(fxBurst('damage', 99, false).count).toBeLessThanOrEqual(60);
  });

  it('labels floating numbers like the 2D board', () => {
    expect(fxLabel('damage', 3)).toBe('−3');
    expect(fxLabel('heal', 2)).toBe('+2');
    expect(fxLabel('armor', 4)).toBe('+4');
    expect(fxLabel('freeze', undefined)).toBe('❄');
    expect(fxLabel('summon', undefined)).toBe('');
  });

  it('lifts an attacking card in an arc that lands back on the table', () => {
    expect(arcHeight(0)).toBeCloseTo(0);
    expect(arcHeight(1)).toBeCloseTo(0);
    expect(arcHeight(0.45)).toBeGreaterThan(0.4);
  });
});
