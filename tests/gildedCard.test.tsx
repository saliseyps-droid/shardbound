// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { CardView } from '@/ui/components/CardView';

describe('CardView for a Gilded copy (black-and-gold window)', () => {
  it('uses the Gilded look with a faint glare and no pulsing light', () => {
    const { container } = render(<CardView card="neu_trail_hound" width={220} variant="GILDED" />);
    const card = container.querySelector('.card')!;
    expect(card.classList.contains('card-gilded')).toBe(true);
    expect(card.querySelector('.card-gild-glare')).not.toBeNull();
    expect(card.querySelector('.card-gild-light')).toBeNull();
    expect(card.querySelector('.card-prism-frame')).toBeNull();
  });

  it('follows the pointer: the picture shifts towards where the pointer is', () => {
    const { container } = render(<CardView card="neu_trail_hound" width={220} variant="GILDED" />);
    const card = container.querySelector('.card') as HTMLElement;
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 280, right: 200, bottom: 280, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.pointerMove(card, { clientX: 200, clientY: 0 });
    expect(card.classList.contains('is-pointing')).toBe(true);
    expect(card.style.getPropertyValue('--tx')).toBe('1');
    expect(card.style.getPropertyValue('--ty')).toBe('-1');
    fireEvent.pointerLeave(card);
    expect(card.classList.contains('is-pointing')).toBe(false);
  });

  it('leaves a Prismatic copy alone when the pointer moves over it', () => {
    const { container } = render(<CardView card="neu_trail_hound" width={220} variant="PRISMATIC" />);
    const card = container.querySelector('.card') as HTMLElement;
    fireEvent.pointerMove(card, { clientX: 10, clientY: 10 });
    expect(card.classList.contains('card-gilded')).toBe(false);
    expect(card.style.getPropertyValue('--tx')).toBe('');
  });
});
