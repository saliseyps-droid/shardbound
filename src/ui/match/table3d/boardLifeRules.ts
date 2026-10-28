import type { ParticleKind } from '../boardFx';
import { MAT_ART, PLANE, planeToWorld } from './tableCamera';

/** Pure rules for the animated board on the 3D table (no Three.js, so they test without WebGL). */

/** A point painted at x/y % of the mat, on the 3D mat (world units; the painting's top is the far edge). */
export const lampToWorld = (x: number, y: number) => {
  const p = planeToWorld((x / 100) * PLANE.w, (y / 100) * PLANE.h);
  return { x: p.x * MAT_ART, y: p.y * MAT_ART };
};

export type ParticleMotion = 'rise' | 'fall' | 'hover' | 'glint';

/** How a board's particles move in 3D: embers and steam rise off the mat, snow and leaves fall onto it, glints flash on it. */
export function particleMotion(kind: ParticleKind): ParticleMotion {
  if (kind === 'embers' || kind === 'steam') return 'rise';
  if (kind === 'snow' || kind === 'leaves') return 'fall';
  if (kind === 'stars') return 'glint';
  return 'hover';
}

/** "r, g, b" (0–255) as 0–1 floats. */
export const rgb = (s: string): [number, number, number] => {
  const [r, g, b] = s.split(',').map((v) => Number(v.trim()) / 255);
  return [r, g, b];
};
