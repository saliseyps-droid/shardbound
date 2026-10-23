// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CardView } from '@/ui/components/CardView';

describe('CardView for a Gilded copy', () => {
  it('uses the Gilded full-art look with a sheen and a living light', () => {
    const { container } = render(<CardView card="neu_trail_hound" width={220} variant="GILDED" />);
    const card = container.querySelector('.card')!;
    expect(card.classList.contains('card-gilded')).toBe(true);
    expect(card.querySelector('.card-shine')).not.toBeNull();
    expect(card.querySelector('.card-gild-light')).not.toBeNull();
    expect(card.querySelector('.card-prism-frame')).toBeNull();
  });

  it('leaves a Prismatic copy as it was', () => {
    const { container } = render(<CardView card="neu_trail_hound" width={220} variant="PRISMATIC" />);
    const card = container.querySelector('.card')!;
    expect(card.classList.contains('card-gilded')).toBe(false);
    expect(card.querySelector('.card-gild-light')).toBeNull();
  });
});
