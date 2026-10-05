import { describe, expect, it } from 'vitest';
import { PEEK_CLICK_GUARD_MS, TAP_SLOP_PX, isActingTap, peekClickAllowed } from '@/ui/match/touchGuards';

describe('touch guards on the match board', () => {
  it('ignores the click of the tap that opened the peek', () => {
    // The opening tap's synthesized click lands on the peek a few ms after it opened.
    expect(peekClickAllowed(1000, 1000 + 30, false)).toBe(false);
    expect(peekClickAllowed(1000, 1000 + PEEK_CLICK_GUARD_MS - 1, false)).toBe(false);
  });

  it('plays the peek card on a deliberate second tap', () => {
    // A new press on the peek counts even when it comes quickly...
    expect(peekClickAllowed(1000, 1100, true)).toBe(true);
    // ...and any click after the guard window does too.
    expect(peekClickAllowed(1000, 1000 + PEEK_CLICK_GUARD_MS, false)).toBe(true);
  });

  it('a long press or a moved finger is not an acting tap', () => {
    expect(isActingTap(100, 100, 102, 103, false)).toBe(true);
    expect(isActingTap(100, 100, 100, 100, true)).toBe(false);
    expect(isActingTap(100, 100, 100 + TAP_SLOP_PX + 1, 100, false)).toBe(false);
  });
});
