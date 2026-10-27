import { describe, expect, it } from 'vitest';
import { FACTIONS } from '@/data/factions';
import { CROWN_STAGE, crownColors, crownMaskSvg, crownMotion } from '@/ui/components/home/crownConfig';

describe('Sundered Crown on Home', () => {
  it('takes the colours of the favourite deck faction', () => {
    expect(crownColors(FACTIONS.EMBER)).toEqual({ crystal: FACTIONS.EMBER.colors.primary, band: FACTIONS.EMBER.colors.secondary });
  });

  it('is pale Aether blue with a gold band without a deck', () => {
    expect(crownColors(null)).toEqual({ crystal: '#9ff3ff', band: '#e8b04b' });
  });

  it('hides everything behind the Play hexagon (a hexagonal hole in the mask, centred on the button)', () => {
    const svg = crownMaskSvg();
    expect(svg).toContain(`viewBox="0 0 ${CROWN_STAGE.width} ${CROWN_STAGE.height}"`);
    expect(svg).toContain('fill-rule="evenodd"');
    // The hexagon's top point sits at the button's top point (50,2), shifted by the stage margin.
    expect(svg).toContain(`${50 + CROWN_STAGE.offsetX},${2 + CROWN_STAGE.offsetY}`);
  });

  it('stands still in performance mode and with reduced motion', () => {
    expect(crownMotion({ performanceMode: false, reducedMotion: false })).toBe('live');
    expect(crownMotion({ performanceMode: true, reducedMotion: false })).toBe('still');
    expect(crownMotion({ performanceMode: false, reducedMotion: true })).toBe('still');
  });
});
