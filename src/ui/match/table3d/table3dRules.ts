import { hasWebGL } from '@/ui/match/legendEntrance';

/**
 * Whether the 3D table shows: turned on, WebGL available, no performance mode or reduced motion.
 * Phones too: the setting starts off everywhere, so a phone plays 2D until the player switches.
 */
export function table3dAllowed(s: { table3d: boolean; performanceMode: boolean; reducedMotion: boolean }, env: { webgl: boolean; phone: boolean }): boolean {
  return s.table3d && env.webgl && !s.performanceMode && !s.reducedMotion;
}

/** Phones (a short screen, or touch only): the 3D table draws at a lower resolution there. */
export function isPhone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerHeight <= 520 || (matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches);
}

export const table3dEnv = () => ({ webgl: hasWebGL(), phone: isPhone() });

/** What keeps the 3D table from showing although it is on (for the Settings hint), or null. */
export function table3dBlocker(s: { performanceMode: boolean; reducedMotion: boolean }, env: { webgl: boolean; phone: boolean }): 'settings' | 'webgl' | null {
  if (s.performanceMode || s.reducedMotion) return 'settings';
  if (!env.webgl) return 'webgl';
  return null;
}
