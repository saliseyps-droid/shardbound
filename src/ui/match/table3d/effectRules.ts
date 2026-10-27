import type { Fx } from '@/state/matchStore';

/** Pure rules for the 3D table's effects (no Three.js, so they test without WebGL). */

export type BurstMotion = 'burst' | 'rise' | 'ring';
export interface Burst {
  motion: BurstMotion;
  color: string;
  /** A second colour mixed in (hot core, glints). */
  accent: string;
  count: number;
  /** Camera shake strength (0 = none). */
  shake: number;
}

const STYLE: Record<Fx['kind'], [BurstMotion, string, string, number]> = {
  damage: ['burst', '#ff7a3a', '#ffd27a', 18],
  heal: ['rise', '#7ef29a', '#d8ffe0', 18],
  buff: ['rise', '#ffd36a', '#fff2c0', 16],
  armor: ['rise', '#cfd8e6', '#ffffff', 16],
  shield: ['burst', '#ffe6a0', '#ffffff', 30],
  freeze: ['burst', '#bfe9ff', '#ffffff', 24],
  burn: ['rise', '#ff8a2a', '#ffd06a', 20],
  summon: ['ring', '#e8d2a0', '#fff4d8', 28],
  silence: ['rise', '#b0b0b0', '#e0e0e0', 12],
  corrupt: ['rise', '#b46cff', '#e2c4ff', 20],
};

/** The particle burst for one effect; heavy hits (5+) and any hit on a Warden shake the camera. */
export function fxBurst(kind: Fx['kind'], amount: number | undefined, onHero: boolean): Burst {
  const [motion, color, accent, base] = STYLE[kind];
  const hit = kind === 'damage';
  const count = Math.min(60, base + (hit ? (amount ?? 0) * 4 : 0));
  const shake = hit && (onHero || (amount ?? 0) >= 5) ? Math.min(1, 0.35 + (amount ?? 0) * 0.08) : 0;
  return { motion, color, accent, count, shake };
}

/** The floating text of an effect, as the 2D board shows it. */
export function fxLabel(kind: Fx['kind'], amount: number | undefined): string {
  switch (kind) {
    case 'damage':
      return `−${amount}`;
    case 'heal':
    case 'armor':
      return `+${amount}`;
    case 'buff':
      return '▲';
    case 'shield':
      return '◈';
    case 'freeze':
      return '❄';
    case 'corrupt':
      return '◉';
    case 'burn':
      return '🔥';
    case 'silence':
      return '∅';
    default:
      return '';
  }
}

/** Height (world units) of an attacking card at progress p of its lunge: up and back down onto the table. */
export const arcHeight = (p: number) => Math.sin(Math.min(1, Math.max(0, p)) * Math.PI) * 0.45;
