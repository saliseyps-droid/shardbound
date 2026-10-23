// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CardView } from '@/ui/components/CardView';
import { cardArtPosition } from '@/ui/components/cardArt';
import { getCard } from '@/data/cards';

describe('card stat gems', () => {
  it('sit outside the clipped card body, so its chamfered corners never cut them', () => {
    const { container } = render(<CardView card="neu_trail_hound" width={220} />);
    const stats = container.querySelectorAll('.card-stat');
    expect(stats.length).toBe(2);
    for (const s of stats) expect(s.closest('.card-inner')).toBeNull();
  });
});

describe('card art focus', () => {
  it('keeps the Thornpelt Packmother jaws (at the right edge of the art) in view', () => {
    expect(cardArtPosition(getCard('ver_thornpelt_packmother')!)).toMatch(/^100% /);
  });

  it('centres the art horizontally by default', () => {
    expect(cardArtPosition(getCard('neu_trail_hound')!)).toMatch(/^50% /);
  });
});
