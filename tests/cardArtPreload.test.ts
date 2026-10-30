// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { paintedArtUrl, preloadCardArt } from '@/ui/components/cardArt';

describe('preloading card art for a match', () => {
  it('fetches each painted picture once, skipping cards without one and unknown ids', () => {
    const painted = ['ast_amethyst_spark', 'ast_archive_unbound'].filter((id) => paintedArtUrl(getCard(id)!));
    expect(painted.length).toBe(2);
    const first = preloadCardArt([...painted, painted[0], 'no_such_card']);
    expect(first).toBe(2);
    // Already on its way: a second call starts nothing new.
    expect(preloadCardArt(painted)).toBe(0);
  });
});
