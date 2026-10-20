/**
 * How each play-mat comes alive (src/ui/match/AnimatedBoard.tsx): the glow that breathes over it
 * (src/assets/boards/fx/<mat>-glow.webp, made by tools/board_glow.py), its lights, the particles
 * drifting over it. Positions are in %
 * of the mat as painted.
 */

export type ParticleKind = 'embers' | 'motes' | 'snow' | 'leaves' | 'fireflies' | 'stars' | 'dust' | 'steam';

export interface BoardLamp {
  x: number;
  y: number;
  /** Width in % of the mat. */
  size: number;
  /** flame: flickers like a fire; pulse: a slow magic throb; twinkle: a star that flashes; candle: a wide, soft pool of candlelight that wavers. */
  kind: 'flame' | 'pulse' | 'twinkle' | 'candle';
}

/** strength: how much brighter than usual the particles are (1); from: where steam rises; at: where star glints flash (else anywhere), in %. */
export interface BoardParticles {
  kind: ParticleKind;
  count: number;
  color: string;
  alt?: string;
  from?: { x: number; y: number };
  at?: [number, number][];
  strength?: number;
}

export interface BoardFx {
  /** Light colour as "r, g, b": its lamps and glows. */
  color: string;
  /** The mat's height in px when it is not 1823 (all are 3200 wide). */
  height?: number;
  glow?: { strength?: number; period?: number; min?: number; max?: number };
  particles: BoardParticles;
  /** A second kind of particle drifting over the same mat. */
  more?: BoardParticles;
  lamps?: BoardLamp[];
  /** Sunbeams slanting across the mat, slowly swaying. */
  rays?: boolean;
  /** Soft mist ("r, g, b") drifting over the middle of the mat. */
  mist?: string;
  /** Painted smoke that churns (its layer is <mat>-smoke.webp) and wisps ("r, g, b") rising from where it lies, as [x, y] in %. */
  smoke?: { color: string; at: [number, number][] };
}

const corners = (x: number, y: number, size: number, kind: BoardLamp['kind']): BoardLamp[] => [
  { x, y, size, kind },
  { x: 100 - x, y, size, kind },
  { x, y: 100 - y, size, kind },
  { x: 100 - x, y: 100 - y, size, kind },
];

export const BOARD_FX: Record<string, BoardFx> = {
  // Sapphire court: the copper trim shimmers, gold dust.
  'board-3': { color: '255, 190, 110', glow: { strength: 2.2, period: 6, min: 0.25, max: 0.8 }, particles: { kind: 'motes', count: 14, color: '255, 200, 120', alt: '140, 190, 255' } },
  // Candlelit mosaic: ten candles flicker, the heart of the mosaic glows.
  'board-5': {
    color: '255, 190, 110',
    glow: { period: 5.5, min: 0.15, max: 0.5 },
    particles: { kind: 'dust', count: 16, color: '255, 210, 150' },
    lamps: [...corners(9.7, 12.1, 3.6, 'flame'), { x: 9.5, y: 49, size: 3.6, kind: 'flame' }, { x: 90.1, y: 49, size: 3.6, kind: 'flame' }, ...corners(18.7, 24.7, 3, 'flame')],
  },
  // Deep grove: sunbeams through the canopy, slow mist over the clearing, fireflies.
  'board-6': { color: '215, 235, 120', rays: true, mist: '120, 200, 130', particles: { kind: 'fireflies', count: 55, color: '215, 255, 120' } },
  // Butterfly garden: leaves drifting down.
  'board-7': { color: '255, 200, 120', particles: { kind: 'leaves', count: 12, color: '232, 120, 40', alt: '70, 140, 70' } },
  // Lava rift: the cracks seethe, embers rise.
  'board-9': { color: '255, 120, 40', glow: { period: 4, min: 0.3, max: 0.9 }, particles: { kind: 'embers', count: 26, color: '255, 150, 60' } },
  // Frozen lake: the frost glimmers, snow falls.
  'board-10': { color: '190, 235, 255', glow: { period: 6, min: 0.15, max: 0.5 }, particles: { kind: 'snow', count: 34, color: '235, 248, 255' } },
  // The Wraithwood Inn: warm candlelight falls on the table from beyond its top corner, dust drifts in it.
  'inn-board-1': { color: '255, 190, 110', particles: { kind: 'dust', count: 38, color: '255, 215, 150', strength: 1.6 }, lamps: [{ x: 4, y: 4, size: 85, kind: 'candle' }] },
  // The other inn table: steam from the cup, tiny dust motes.
  'inn-board-2': { color: '255, 210, 150', particles: { kind: 'steam', count: 12, color: '240, 235, 225', from: { x: 8.6, y: 13.5 } }, more: { kind: 'dust', count: 38, color: '255, 215, 150', strength: 1.6 } },
  // The Burning Throne: the red rim breathes, four lamps, embers.
  'inferno-board-1': {
    color: '255, 190, 90',
    glow: { period: 6, min: 0.22, max: 0.62 },
    particles: { kind: 'embers', count: 24, color: '255, 150, 60' },
    lamps: [{ x: 15.7, y: 20.1, size: 7, kind: 'flame' }, { x: 84.9, y: 20.4, size: 7, kind: 'flame' }, { x: 15.6, y: 78.9, size: 7, kind: 'flame' }, { x: 84.8, y: 78.9, size: 7, kind: 'flame' }],
  },
  // Infernal altar: the sigil smoulders, the red smoke around it churns and drifts, embers.
  'inferno-board-2': {
    color: '255, 140, 60',
    glow: { period: 5, min: 0.2, max: 0.65 },
    particles: { kind: 'embers', count: 18, color: '255, 140, 50' },
    smoke: { color: '200, 20, 20', at: [[0, 78.1], [0.5, 53.9], [2.8, 52.6], [3, 52.6], [4, 51.3], [5.2, 7.5], [7.2, 6.1], [7.5, 81.6], [8.8, 84.6], [9.5, 10.5], [9.8, 10.5], [9.8, 14], [10.5, 45.2], [10.5, 86.8], [10.8, 18.4], [11.5, 1.3], [11.5, 2.6], [11.8, 90.8], [12.8, 93.4], [14.8, 8.3], [25.8, 2.6], [28.2, 0], [28.5, 95.6], [34, 3.1], [35.5, 3.5], [36, 5.3], [36.8, 0.9], [54.5, 99.1], [67.2, 5.7], [72.2, 85.5], [81.5, 2.6], [81.5, 98.2], [81.8, 98.2], [82.5, 14.9], [83.2, 14.9], [83.5, 99.6], [83.8, 14.9], [83.8, 15.4], [84.2, 6.6], [84.2, 13.6], [85, 7.5], [86.5, 4.8], [86.5, 17.1], [86.8, 40.4], [87.2, 8.3], [87.8, 0.4], [87.8, 69.7], [88, 12.3], [88, 71.5], [89.8, 91.2], [90, 13.6], [90, 17.5], [90.8, 19.3], [90.8, 69.3], [91.2, 19.3], [92.8, 61.8], [93.2, 89.5], [94.2, 57.9], [94.8, 59.6], [95.2, 25.9], [96.8, 67.1], [97, 71.9], [97, 73.7], [98.8, 80.3]] },
  },
  // Pirate flags (shown whole): the lantern and the candle flicker, the coins glint, dust in the lamplight.
  'board-11': {
    color: '255, 190, 110',
    height: 1798,
    particles: { kind: 'dust', count: 24, color: '255, 215, 150', strength: 1.4 },
    more: { kind: 'stars', count: 5, color: '255, 225, 140', at: [[13.3, 2.5], [20.8, 2.2], [30.2, 4], [33.2, 4.7], [7.1, 70.5], [8.3, 73.4], [15.8, 91.7], [20.8, 93.8], [75.4, 2.2], [79.6, 2.2], [96.2, 69]] },
    lamps: [{ x: 93.4, y: 6.7, size: 7, kind: 'flame' }, { x: 6, y: 88.3, size: 3.2, kind: 'flame' }],
  },
  // Pirate deck (shown whole): the sea churns slowly around the ship, the lantern flickers, the treasure and the coins glint.
  'board-12': {
    color: '255, 190, 110',
    height: 1798,
    particles: { kind: 'dust', count: 22, color: '255, 215, 150', strength: 1.4 },
    more: { kind: 'stars', count: 6, color: '255, 225, 140', at: [[24.2, 5.6], [26.8, 5.6], [35.8, 6.2], [73.3, 8.6], [87.5, 25.2], [89.6, 27.4], [92.5, 43], [93.3, 51.2], [85.8, 66.8], [87.5, 85.3], [89.6, 89], [91.7, 87.5], [75, 86.8], [77.1, 89], [17.9, 89], [6.7, 60.8]] },
    lamps: [{ x: 7.1, y: 30.4, size: 7, kind: 'flame' }],
  },
  // The Host's firmament: the stars of the medallions flash, stars twinkle across the sky.
  'heaven-board-1': {
    color: '255, 240, 200',
    height: 1798,
    glow: { period: 6, min: 0.25, max: 0.75 },
    particles: { kind: 'stars', count: 26, color: '255, 245, 220', alt: '170, 200, 255' },
    lamps: [{ x: 50, y: 12.7, size: 6, kind: 'twinkle' }, { x: 50, y: 87.5, size: 6, kind: 'twinkle' }, { x: 10.9, y: 47.9, size: 6, kind: 'twinkle' }, { x: 89, y: 47.9, size: 6, kind: 'twinkle' }],
  },
};
