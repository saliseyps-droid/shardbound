import { hasWebGL } from '@/ui/match/legendEntrance';

/** Whether the 3D table shows: turned on, WebGL available, not a phone, no performance mode or reduced motion. */
export function table3dAllowed(s: { table3d: boolean; performanceMode: boolean; reducedMotion: boolean }, env: { webgl: boolean; phone: boolean }): boolean {
  return s.table3d && env.webgl && !env.phone && !s.performanceMode && !s.reducedMotion;
}

/** Phones (a short screen, or touch only) start in 2D: the 3D table needs room and a strong GPU. */
export function isPhone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerHeight <= 520 || (matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches);
}

export const table3dEnv = () => ({ webgl: hasWebGL(), phone: isPhone() });

/** What keeps the 3D table from showing although it is on (for the Settings hint), or null. */
export function table3dBlocker(s: { performanceMode: boolean; reducedMotion: boolean }, env: { webgl: boolean; phone: boolean }): 'settings' | 'webgl' | 'phone' | null {
  if (s.performanceMode || s.reducedMotion) return 'settings';
  if (!env.webgl) return 'webgl';
  if (env.phone) return 'phone';
  return null;
}
