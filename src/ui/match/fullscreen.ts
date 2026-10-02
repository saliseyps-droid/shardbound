/**
 * Fullscreen for matches on phones. Browsers only allow it from a user gesture,
 * so the board asks on the first tap while the phone is held sideways.
 * (iPhone Safari has no page fullscreen; the home-screen app runs without browser bars instead.)
 */
let enteredByUs = false;
/** The player left fullscreen themselves: don't keep asking during this match. */
let declined = false;

export const fullscreenSupported = () => typeof document !== 'undefined' && !!document.documentElement.requestFullscreen && document.fullscreenEnabled;
const isTouch = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
const isLandscape = () => typeof matchMedia !== 'undefined' && matchMedia('(orientation: landscape)').matches;

export async function enterGameFullscreen(): Promise<void> {
  if (!fullscreenSupported()) return;
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      enteredByUs = true;
    }
    // Android rotates to landscape once the orientation is locked (only allowed in fullscreen).
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await orientation.lock?.('landscape');
  } catch {
    /* refused by the browser: keep playing in the page */
  }
}

/** Called on taps during a match. */
export function maybeAutoFullscreen() {
  if (declined || document.fullscreenElement || !isTouch() || !isLandscape()) return;
  void enterGameFullscreen();
}

export function startMatchFullscreen(): () => void {
  declined = false;
  const onChange = () => {
    if (!document.fullscreenElement && enteredByUs) {
      enteredByUs = false;
      declined = true;
    }
  };
  document.addEventListener('fullscreenchange', onChange);
  return () => {
    document.removeEventListener('fullscreenchange', onChange);
    if (document.fullscreenElement && enteredByUs) {
      enteredByUs = false;
      void document.exitFullscreen().catch(() => undefined);
    }
    try {
      screen.orientation?.unlock?.();
    } catch {
      /* not supported */
    }
  };
}
