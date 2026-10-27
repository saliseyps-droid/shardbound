import { describe, expect, it } from 'vitest';
import { coverUv, energyColors, pileCards } from '@/ui/match/table3d/bodyRules';

describe('3D table bodies', () => {
  it('crops a wide picture to a tall card around its centre (object-fit: cover)', () => {
    // 2:1 art on a 1:1 face: half the width shows, centred.
    expect(coverUv(200, 100, 1, 1)).toEqual({ repeatX: 0.5, repeatY: 1, offsetX: 0.25, offsetY: 0 });
    // 1:2 art on a 1:1 face: half the height shows, centred.
    expect(coverUv(100, 200, 1, 1)).toEqual({ repeatX: 1, repeatY: 0.5, offsetX: 0, offsetY: 0.25 });
    // Same aspect: the whole picture.
    expect(coverUv(150, 183, 150, 183)).toEqual({ repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 });
  });

  it('honours a horizontal focus (as cardArtPosition does for e.g. Thornpelt Packmother)', () => {
    expect(coverUv(200, 100, 1, 1, 100).offsetX).toBeCloseTo(0.5);
    expect(coverUv(200, 100, 1, 1, 0).offsetX).toBeCloseTo(0);
  });

  it('honours a vertical focus from the top (texture offsets count from the bottom)', () => {
    // 1:2 art on a 1:1 face, focus 40% from the top: the hidden half splits 40 above, 60 below.
    expect(coverUv(100, 200, 1, 1, 50, 40).offsetY).toBeCloseTo(0.3);
    expect(coverUv(100, 200, 1, 1, 50, 0).offsetY).toBeCloseTo(0.5);
  });

  it('stacks one card back per ~2.4 cards, at least two while the deck has any', () => {
    expect(pileCards(0)).toBe(0);
    expect(pileCards(1)).toBe(2);
    expect(pileCards(24)).toBe(10);
    expect(pileCards(30)).toBe(13);
  });

  it('colours energy crystals by faction (deep, saturated) with a gold fallback', () => {
    expect(energyColors('EMBER')).toEqual(['#e62a00', '#c41800']);
    expect(energyColors('TIDE')).toEqual(['#00b4d8', '#0088b8']);
    expect(energyColors(undefined)).toEqual(['#e8b04b', '#b07f22']);
  });
});
