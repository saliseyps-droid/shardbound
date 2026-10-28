// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { AbilityIcon, iconForKeyword, iconForTriggers } from '@/ui/components/AbilityIcon';

describe('ability icons (the 3D table shows them on the cards)', () => {
  it('maps keywords to the icons of the mockup', () => {
    expect(iconForKeyword('DRAIN')).toBe('drain');
    expect(iconForKeyword('WARD')).toBe('ward');
    expect(iconForKeyword('SWIFT')).toBe('swift');
    expect(iconForKeyword('RUSH')).toBe('rush');
    expect(iconForKeyword('EMPOWER')).toBe('spell');
  });
  it('shows what a triggered ability waits for', () => {
    expect(iconForTriggers(['TURN_END'])).toBe('endturn');
    expect(iconForTriggers(['ON_DEPLOY', 'FRIENDLY_SPELL_CAST'])).toBe('spell');
    expect(iconForTriggers(['ALLY_DIED'])).toBe('trigger');
  });
  it('draws a gold-rimmed round icon', () => {
    const { container } = render(<AbilityIcon kind="drain" />);
    const svg = container.querySelector('svg.ability-icon')!;
    expect(svg).not.toBeNull();
    expect(svg.querySelector('circle')!.getAttribute('stroke')).toBe('#e8b04b');
    expect(svg.querySelector('[data-glyph]')).not.toBeNull();
  });
});
