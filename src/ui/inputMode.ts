/**
 * Whether the player is using touch or a mouse right now, as <html data-input="touch|mouse">.
 * `(hover: none)` alone is not enough: many Android phones report `hover: hover`, and there a
 * tapped card kept its :hover state (stuck enlarged) and a finger sliding over the hand made
 * cards grow and shrink under it (flicker). Hover effects are switched off for data-input=touch.
 */
export function installInputTracking() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const coarseOnly = typeof matchMedia !== 'undefined' && matchMedia('(any-pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;
  root.dataset.input = coarseOnly || (typeof matchMedia !== 'undefined' && matchMedia('(hover: none)').matches) ? 'touch' : 'mouse';
  window.addEventListener(
    'pointerdown',
    (e) => {
      root.dataset.input = e.pointerType === 'mouse' ? 'mouse' : 'touch';
    },
    { capture: true, passive: true },
  );
}

export const usingTouch = () => typeof document !== 'undefined' && document.documentElement.dataset.input === 'touch';
