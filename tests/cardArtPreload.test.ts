// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { getCard } from '@/data/cards';
import { paintedArtUrl, preloadCardArt, whenCardArtLoaded } from '@/ui/components/cardArt';

describe('preloading card art for a match', () => {
  it('fetches each painted picture once, skipping cards without one and unknown ids', () => {
    const painted = ['ast_amethyst_spark', 'ast_archive_unbound'].filter((id) => paintedArtUrl(getCard(id)!));
    expect(painted.length).toBe(2);
    const first = preloadCardArt([...painted, painted[0], 'no_such_card']);
    expect(first).toBe(2);
    // Already on its way: a second call starts nothing new.
    expect(preloadCardArt(painted)).toBe(0);
  });

  it('waits for the pictures to arrive, but no longer than the time it is given', async () => {
    vi.useFakeTimers();
    try {
      let done = false;
      void whenCardArtLoaded(['ast_amethyst_spark'], 4000).then(() => (done = true));
      await vi.advanceTimersByTimeAsync(3000);
      expect(done).toBe(false);
      await vi.advanceTimersByTimeAsync(1500);
      expect(done).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('is ready at once when none of the cards has a picture to wait for', async () => {
    await expect(whenCardArtLoaded(['no_such_card'], 60_000)).resolves.toBeUndefined();
  });
});
