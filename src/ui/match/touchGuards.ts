/** Small timing rules for touch input on the match board (kept pure so they can be unit-tested). */

/** A tap opens the enlarged card (peek); its own synthesized click must not also play the card. */
export const PEEK_CLICK_GUARD_MS = 350;
/** Press and hold this long to inspect instead of acting. */
export const LONG_PRESS_MS = 500;
/** After a long press, the click the browser may still send on release is swallowed for this long. */
export const LONG_PRESS_CLICK_GUARD_MS = 400;
/** A finger moving further than this is a drag, not a tap. */
export const TAP_SLOP_PX = 10;

/**
 * Whether a click on the peek card is a deliberate second tap: either a fresh press started on the
 * peek itself, or enough time has passed since the peek opened that it can't be the opening tap's click.
 */
export function peekClickAllowed(openedAt: number, now: number, freshPress: boolean): boolean {
  return freshPress || now - openedAt >= PEEK_CLICK_GUARD_MS;
}

/** Whether a press released at (x1, y1) counts as a tap that should act (not moved, not a long press). */
export function isActingTap(x0: number, y0: number, x1: number, y1: number, longPressFired: boolean): boolean {
  return !longPressFired && Math.hypot(x1 - x0, y1 - y0) <= TAP_SLOP_PX;
}
