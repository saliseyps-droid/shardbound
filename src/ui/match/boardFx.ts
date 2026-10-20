/**
 * How each play-mat comes alive (src/ui/match/AnimatedBoard.tsx): the glow that breathes over it
 * (src/assets/boards/fx/<mat>-glow.webp, made by tools/board_glow.py), its lights, the particles
 * drifting over it and the colour of the medallion that lights up on your turn. Positions are in %
 * of the mat as painted.
 */

export type ParticleKind = 'embers' | 'motes' | 'snow' | 'leaves' | 'stars' | 'dust' | 'steam';

export interface BoardLamp {
  x: number;
  y: number;
  /** Width in % of the mat. */
  size: number;
  /** flame: flickers like a fire; pulse: a slow magic throb; twinkle: a star that flashes; candle: a wide, soft pool of candlelight that wavers. */
  kind: 'flame' | 'pulse' | 'twinkle' | 'candle';
}

export interface BoardFx {
  /** Light colour as "r, g, b": lamps, medallion and bursts. */
  color: string;
  glow?: { strength?: number; period?: number; min?: number; max?: number };
  particles: { kind: ParticleKind; count: number; color: string; alt?: string; from?: { x: number; y: number } };
  lamps?: BoardLamp[];
  /** Sunbeams slanting across the mat, slowly swaying. */
  rays?: boolean;
  /** Soft mist ("r, g, b") drifting over the middle of the mat. */
  mist?: string;
  /** Painted smoke that churns (its layer is <mat>-smoke.webp) and wisps ("r, g, b") rising from where it lies, as [x, y] in %. */
  smoke?: { color: string; at: [number, number][] };
  medallion?: { x: number; y: number; size: number };
}

const corners = (x: number, y: number, size: number, kind: BoardLamp['kind']): BoardLamp[] => [
  { x, y, size, kind },
  { x: 100 - x, y, size, kind },
  { x, y: 100 - y, size, kind },
  { x: 100 - x, y: 100 - y, size, kind },
];
const CENTRE = { x: 50, y: 50, size: 14 };

export const BOARD_FX: Record<string, BoardFx> = {
  // Arcane sigil: violet orbs in the corners, pink runes breathing, motes of magic.
  'board-1': { color: '255, 120, 220', glow: { period: 5, min: 0.2, max: 0.7 }, particles: { kind: 'motes', count: 22, color: '255, 140, 230', alt: '150, 140, 255' }, lamps: [{ x: 14.2, y: 16.8, size: 7, kind: 'pulse' }, { x: 86, y: 15.6, size: 7, kind: 'pulse' }, { x: 14, y: 81, size: 7, kind: 'pulse' }, { x: 86, y: 82, size: 7, kind: 'pulse' }], medallion: { x: 50, y: 48, size: 20 } },
  // Sapphire court: the copper trim shimmers, gold dust.
  'board-3': { color: '255, 190, 110', glow: { strength: 2.2, period: 6, min: 0.25, max: 0.8 }, particles: { kind: 'motes', count: 14, color: '255, 200, 120', alt: '140, 190, 255' }, medallion: CENTRE },
  // Emerald hall: the gold filigree catches the light.
  'board-4': { color: '255, 215, 120', glow: { strength: 1.6, period: 6.5, min: 0.2, max: 0.75 }, particles: { kind: 'motes', count: 14, color: '255, 220, 130' }, medallion: { x: 50, y: 50, size: 9 } },
  // Candlelit mosaic: ten candles flicker, the heart of the mosaic glows.
  'board-5': {
    color: '255, 190, 110',
    glow: { period: 5.5, min: 0.15, max: 0.5 },
    particles: { kind: 'dust', count: 16, color: '255, 210, 150' },
    lamps: [...corners(9.7, 12.1, 3.6, 'flame'), { x: 9.5, y: 49, size: 3.6, kind: 'flame' }, { x: 90.1, y: 49, size: 3.6, kind: 'flame' }, ...corners(18.7, 24.7, 3, 'flame')],
    medallion: { x: 50, y: 50, size: 16 },
  },
  // Deep grove: sunbeams through the canopy, slow mist over the clearing, a little pollen.
  'board-6': { color: '215, 235, 120', rays: true, mist: '120, 200, 130', particles: { kind: 'dust', count: 12, color: '235, 250, 180' }, medallion: { x: 50, y: 50, size: 22 } },
  // Butterfly garden: leaves drifting down.
  'board-7': { color: '255, 200, 120', particles: { kind: 'leaves', count: 12, color: '232, 120, 40', alt: '70, 140, 70' }, medallion: { x: 50, y: 50, size: 18 } },
  // Lava rift: the cracks seethe, embers rise.
  'board-9': { color: '255, 120, 40', glow: { period: 4, min: 0.3, max: 0.9 }, particles: { kind: 'embers', count: 26, color: '255, 150, 60' }, medallion: { x: 50, y: 50, size: 9 } },
  // Frozen lake: the frost glimmers, snow falls.
  'board-10': { color: '190, 235, 255', glow: { period: 6, min: 0.15, max: 0.5 }, particles: { kind: 'snow', count: 34, color: '235, 248, 255' }, medallion: { x: 50, y: 50, size: 18 } },
  // The Wraithwood Inn: warm candlelight falls on the table from beyond its top corner, dust drifts in it.
  'inn-board-1': { color: '255, 190, 110', particles: { kind: 'dust', count: 18, color: '255, 215, 150' }, lamps: [{ x: 4, y: 4, size: 85, kind: 'candle' }], medallion: { x: 50, y: 50, size: 16 } },
  // The other inn table: steam from the cup, dust.
  'inn-board-2': { color: '255, 210, 150', particles: { kind: 'steam', count: 12, color: '240, 235, 225', from: { x: 8.6, y: 13.5 } }, medallion: { x: 50, y: 50, size: 16 } },
  // The Burning Throne: the red rim breathes, four lamps, embers.
  'inferno-board-1': {
    color: '255, 190, 90',
    glow: { period: 6, min: 0.22, max: 0.62 },
    particles: { kind: 'embers', count: 24, color: '255, 150, 60' },
    lamps: [{ x: 15.7, y: 20.1, size: 7, kind: 'flame' }, { x: 84.9, y: 20.4, size: 7, kind: 'flame' }, { x: 15.6, y: 78.9, size: 7, kind: 'flame' }, { x: 84.8, y: 78.9, size: 7, kind: 'flame' }],
    medallion: CENTRE,
  },
  // Infernal altar: the sigil smoulders, the red smoke around it churns and drifts, embers.
  'inferno-board-2': {
    color: '255, 140, 60',
    glow: { period: 5, min: 0.2, max: 0.65 },
    particles: { kind: 'embers', count: 18, color: '255, 140, 50' },
    smoke: { color: '200, 20, 20', at: [[12.6, 4.7], [23.2, 1.5], [27.7, 2.5], [32.2, 3.9], [36.8, 3.8], [58.1, 2.7], [61.9, 2.6], [68.2, 4.1], [73.1, 4], [77.4, 1.2], [82.7, 2.5], [86.9, 5.8], [9, 10.8], [11.6, 11.8], [88.1, 11.7], [92, 20.9], [97.7, 23.8], [1.7, 53.5], [97.8, 54.7], [88.7, 64.6], [92.3, 62.2], [97.6, 61.8], [91.4, 68.2], [96.9, 70.6], [7.9, 81.3], [8.3, 87.6], [11.1, 88], [92.2, 88.4], [13.1, 93.6], [17.5, 94.6], [21.9, 93], [81.7, 97.6]] },
    medallion: { x: 50, y: 50, size: 26 },
  },
  // The Host's firmament: the stars of the medallions flash, stars twinkle across the sky.
  'heaven-board-1': {
    color: '255, 240, 200',
    glow: { period: 6, min: 0.25, max: 0.75 },
    particles: { kind: 'stars', count: 26, color: '255, 245, 220', alt: '170, 200, 255' },
    lamps: [{ x: 50, y: 12.7, size: 6, kind: 'twinkle' }, { x: 50, y: 87.5, size: 6, kind: 'twinkle' }, { x: 10.9, y: 47.9, size: 6, kind: 'twinkle' }, { x: 89, y: 47.9, size: 6, kind: 'twinkle' }],
    medallion: { x: 50, y: 48.5, size: 12 },
  },
};
