import { describe, expect, it } from 'vitest';
import { packCardWidth, packHeroWidth } from '@/ui/components/packs/packLayout';

/** Height of the reveal: card + label rows (+ the summary on phones held upright). */
const PORTRAIT_SUMMARY = 200;
const META = 44;

describe('pack opening layout on phones', () => {
  it('upright phones: three cards fit across the screen', () => {
    for (const [vw, vh] of [[360, 780], [375, 667], [390, 844], [430, 932]]) {
      const w = packCardWidth(vw, vh);
      expect(3 * w + 2 * 8 + 24).toBeLessThanOrEqual(vw);
      expect(w).toBeGreaterThanOrEqual(90);
    }
  });

  it('upright phones: two rows of cards, their labels and the summary fit the height', () => {
    for (const [vw, vh] of [[360, 780], [375, 667], [390, 844], [430, 932]]) {
      const w = packCardWidth(vw, vh);
      expect(2 * (w * 1.4 + META + 8) + PORTRAIT_SUMMARY + 32).toBeLessThanOrEqual(vh);
    }
  });

  it('phones held sideways: one row of five fits and leaves room for the summary', () => {
    for (const [vw, vh] of [[844, 390], [667, 375], [932, 430]]) {
      const w = packCardWidth(vw, vh);
      expect(5 * w + 4 * 12 + 32).toBeLessThanOrEqual(vw);
      expect(w * 1.4 + META + 100 + 24).toBeLessThanOrEqual(vh);
    }
  });

  it('desktop sizing is unchanged', () => {
    expect(packCardWidth(1920, 1080)).toBe(250);
    expect(packCardWidth(1280, 720)).toBe(Math.round(Math.min((1280 - 160) / 5.8, (720 - 330) / 1.4)));
  });

  it('the sealed pack never pushes the hint and Back button off a short screen', () => {
    expect(packHeroWidth(packCardWidth(844, 390), 390) * 1.8 + 170).toBeLessThanOrEqual(390 + 1);
    expect(packHeroWidth(200, 1000)).toBe(230);
  });
});
