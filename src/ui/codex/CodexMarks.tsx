import { useMemo, type ReactElement } from 'react';

/**
 * Faint ink marks behind a Codex page, drawn in the page's own brown ink at low opacity: a rune
 * inscription, tattoo-like linework or an arcane sigil. Every spread mixes two different styles,
 * and its two pages draw from two separate halves of the runes, so nothing on the left page
 * repeats on the right. The layout comes from the spread number, so it stays put between visits.
 */
export type CodexMarkStyle = 'runes' | 'tattoo' | 'sigil';
const STYLES: CodexMarkStyle[] = ['runes', 'tattoo', 'sigil'];

// Elder-Futhark-like runes in a 10 x 14 box.
export const RUNES = [
  'M3 0L3 14M3 3L8 0M3 7L8 4',
  'M2 14L2 0L8 4L8 14',
  'M3 0L3 14M3 4L7 7L3 10',
  'M3 0L3 14M3 2L8 5M3 6L8 9',
  'M3 14L3 0L7 3L3 7L8 14',
  'M7 0L3 7L7 14',
  'M2 0L8 14M8 0L2 14',
  'M3 0L3 14M3 0L7 3L3 6',
  'M2 0L2 14M8 0L8 14M2 5L8 9',
  'M5 0L5 14M2 5L8 9',
  'M4 2L1 6L4 10M6 4L9 8L6 12',
  'M5 0L5 14M5 0L8 3M5 14L2 11',
  'M5 0L5 14M1 2L5 6L9 2',
  'M7 0L3 6L7 8L3 14',
  'M5 0L5 14M1 4L5 0L9 4',
  'M3 0L3 14M3 0L7 3.5L3 7L7 10.5L3 14',
  'M2 0L2 14M8 0L8 14M2 0L8 7M8 0L2 7',
  'M2 0L2 14M8 0L8 14M2 0L8 14M8 0L2 14',
  'M5 0L9 5L5 10L1 5ZM1 10L5 14M9 10L5 14',
  'M5 0L5 14M2 3L8 3M2 11L8 11',
  'M1 0L5 7L9 0M5 7L5 14',
  'M2 0L8 0L2 7L8 14L2 14',
  'M5 0L1 14M5 0L9 14M3 8L7 8',
  'M5 0L9 4L5 8L1 4ZM5 8L5 14',
];

function rng(seed: number) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pool = string[];
const rune = (pool: Pool, r: () => number) => pool[Math.floor(r() * pool.length)];

/** The spread's two styles (always different) and its runes split in two halves, one per page. */
export function spreadMarks(spread: number): Record<'left' | 'right', { style: CodexMarkStyle; pool: Pool }> {
  const r = rng(spread * 7919 + 13);
  const order = RUNES.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const half = order.length / 2;
  const l = Math.floor(r() * 3);
  const rs = (l + 1 + Math.floor(r() * 2)) % 3;
  return {
    left: { style: STYLES[l], pool: order.slice(0, half).map((i) => RUNES[i]) },
    right: { style: STYLES[rs], pool: order.slice(half).map((i) => RUNES[i]) },
  };
}

/** A ring of runes (r = radius) around (cx, cy). */
function RuneRing({ cx, cy, r, n, rand, pool, size = 1 }: { cx: number; cy: number; r: number; n: number; rand: () => number; pool: Pool; size?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 9 * size} strokeWidth={0.8} />
      <circle cx={cx} cy={cy} r={r - 9 * size} strokeWidth={0.5} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * 360;
        return <path key={i} d={rune(pool, rand)} transform={`rotate(${a} ${cx} ${cy}) translate(${cx - 5 * size} ${cy - r - 7 * size}) scale(${size})`} />;
      })}
    </g>
  );
}

function spiral(cx: number, cy: number, turns: number, r: number, dir: 1 | -1) {
  const pts: string[] = [];
  const steps = Math.round(turns * 28);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = dir * t * turns * Math.PI * 2;
    pts.push(`${(cx + Math.cos(a) * r * t).toFixed(1)} ${(cy + Math.sin(a) * r * t).toFixed(1)}`);
  }
  return `M${pts.join('L')}`;
}

/** A thorned tendril from (x, y) curling along (dx, dy). */
function Tendril({ x, y, dx, dy, rand }: { x: number; y: number; dx: number; dy: number; rand: () => number }) {
  const c1 = [x + dx * 0.4 - dy * 0.3, y + dy * 0.4 + dx * 0.3];
  const c2 = [x + dx * 0.7 + dy * 0.3, y + dy * 0.7 - dx * 0.3];
  const e = [x + dx, y + dy];
  const thorns = Array.from({ length: 5 }, (_, i) => {
    const t = 0.15 + i * 0.16;
    const px = (1 - t) ** 3 * x + 3 * (1 - t) ** 2 * t * c1[0] + 3 * (1 - t) * t * t * c2[0] + t ** 3 * e[0];
    const py = (1 - t) ** 3 * y + 3 * (1 - t) ** 2 * t * c1[1] + 3 * (1 - t) * t * t * c2[1] + t ** 3 * e[1];
    const s = i % 2 ? 1 : -1;
    const len = 5 + rand() * 4;
    return `M${px.toFixed(1)} ${py.toFixed(1)}l${(s * len * 0.6).toFixed(1)} ${(-len).toFixed(1)}l${(s * -1.5).toFixed(1)} ${(len * 0.7).toFixed(1)}Z`;
  });
  return (
    <g>
      <path d={`M${x} ${y}C${c1.join(' ')} ${c2.join(' ')} ${e.join(' ')}`} strokeWidth={2.2} />
      <path d={spiral(e[0], e[1], 1.6, 9, dx > 0 ? 1 : -1)} strokeWidth={1.4} />
      <path d={thorns.join('')} className="cx-mark-fill" />
    </g>
  );
}

function Runes({ seed, side, pool }: { seed: number; side: 'left' | 'right'; pool: Pool }) {
  const rand = rng(seed * 31 + (side === 'left' ? 11 : 37));
  const outer = side === 'left' ? 0 : 200;
  const inward = side === 'left' ? 1 : -1;
  // An inscription band down the outer margin: runes between two rules, now and then a diamond.
  const x = outer + inward * 15;
  const top = 26 + Math.floor(rand() * 30);
  const count = 6 + Math.floor(rand() * 4);
  const band: ReactElement[] = [];
  let y = top;
  for (let i = 0; i < count; i++) {
    band.push(<path key={`r${i}`} d={rune(pool, rand)} transform={`translate(${x - 6.3} ${y}) scale(1.26)`} />);
    y += 22;
    if (i < count - 1 && rand() < 0.35) {
      band.push(<path key={`d${i}`} d={`M${x} ${y - 2}l2.4 3l-2.4 3l-2.4 -3Z`} className="cx-mark-fill" />);
      y += 10;
    }
  }
  const bottom = y;
  // A seal half off the page in a corner: double ring, dotted ring, runes, a bind-rune in a diamond.
  const sealTop = rand() > 0.5;
  const sx = outer + inward * 22;
  const sy = sealTop ? 34 : 250;
  const core = [rune(pool, rand), rune(pool, rand)];
  // A short inscription along the opposite edge, between rules, words parted by dots.
  const ly = sealTop ? 262 : 22;
  const lx = side === 'left' ? 64 : 34;
  const words = 8;
  return (
    <g>
      <path d={`M${x - 10} ${top - 8}L${x - 10} ${bottom + 2}M${x + 10} ${top - 8}L${x + 10} ${bottom + 2}`} strokeWidth={0.5} />
      <path d={`M${x - 10} ${top - 8}L${x + 10} ${top - 8}M${x - 10} ${bottom + 2}L${x + 10} ${bottom + 2}`} strokeWidth={0.8} />
      {band}
      <circle cx={sx} cy={sy} r={48} strokeWidth={0.9} />
      <circle cx={sx} cy={sy} r={44} strokeWidth={0.4} />
      <circle cx={sx} cy={sy} r={25} strokeWidth={1.4} strokeDasharray="0.1 3.4" />
      <RuneRing cx={sx} cy={sy} r={35} n={14} rand={rand} pool={pool} size={0.8} />
      <path d={`M${sx} ${sy - 18}L${sx + 14} ${sy}L${sx} ${sy + 18}L${sx - 14} ${sy}Z`} strokeWidth={0.8} />
      <path d={core[0]} transform={`translate(${sx - 6} ${sy - 8.4}) scale(1.2)`} strokeWidth={1.3} />
      <path d={core[1]} transform={`translate(${sx - 6} ${sy - 8.4}) scale(1.2)`} strokeWidth={0.8} opacity={0.7} />
      <path d={`M${lx} ${ly - 9}L${lx + 102} ${ly - 9}M${lx} ${ly + 9}L${lx + 102} ${ly + 9}`} strokeWidth={0.45} />
      {Array.from({ length: words }, (_, i) => (
        <g key={i}>
          <path d={rune(pool, rand)} transform={`translate(${lx + 3 + i * 12.6} ${ly - 5.6}) scale(0.8)`} strokeWidth={1} />
          {i < words - 1 && <circle cx={lx + 13 + i * 12.6} cy={ly} r={0.8} className="cx-mark-fill" />}
        </g>
      ))}
    </g>
  );
}

function Tattoo({ seed, side }: { seed: number; side: 'left' | 'right' }) {
  const rand = rng(seed * 31 + (side === 'left' ? 5 : 71));
  const outer = side === 'left' ? 0 : 200;
  const inward = side === 'left' ? 1 : -1;
  return (
    <g>
      {/* A triskelion knot in the top outer corner. */}
      <g transform={`translate(${outer + inward * 40} 42) rotate(${Math.floor(rand() * 120)})`}>
        {[0, 120, 240].map((a) => (
          <path key={a} d={spiral(0, -14, 1.3, 13, 1)} transform={`rotate(${a})`} strokeWidth={2} />
        ))}
        <circle r={24} strokeWidth={0.7} strokeDasharray="2 3" />
      </g>
      <Tendril x={outer + inward * 6} y={78} dx={inward * 46} dy={58} rand={rand} />
      {/* Thorned vines climbing from the bottom inner corner. */}
      <Tendril x={200 - outer - inward * 4} y={262} dx={-inward * 58} dy={-46} rand={rand} />
      <Tendril x={200 - outer - inward * 4} y={262} dx={-inward * 20} dy={-80} rand={rand} />
      {/* Dot-work along the bottom. */}
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={side === 'left' ? 22 + i * 9 : 178 - i * 9} cy={270 - (i % 2) * 4} r={1 + (i % 3) * 0.5} className="cx-mark-fill" />
      ))}
    </g>
  );
}

function Sigil({ seed, side, pool }: { seed: number; side: 'left' | 'right'; pool: Pool }) {
  const rand = rng(seed * 31 + (side === 'left' ? 3 : 29));
  const cx = 100;
  const cy = 140;
  const tri = (r: number, rot: number) =>
    [0, 1, 2].map((i) => {
      const a = ((rot + i * 120 - 90) * Math.PI) / 180;
      return `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
    });
  return (
    <g>
      <RuneRing cx={cx} cy={cy} r={74} n={20} rand={rand} pool={pool} size={1.1} />
      <circle cx={cx} cy={cy} r={58} strokeWidth={0.6} />
      <path d={`M${tri(58, 0).join('L')}Z M${tri(58, 60).join('L')}Z`} strokeWidth={0.9} />
      <circle cx={cx} cy={cy} r={22} strokeWidth={0.8} />
      {/* A crescent at the heart. */}
      <path d={`M${cx + 6} ${cy - 14}A14 14 0 1 0 ${cx + 6} ${cy + 14}A11 11 0 1 1 ${cx + 6} ${cy - 14}Z`} className="cx-mark-fill" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <path key={i} d={`M${cx + Math.cos(a) * 88} ${cy + Math.sin(a) * 88}L${cx + Math.cos(a) * 96} ${cy + Math.sin(a) * 96}`} strokeWidth={1.2} />;
      })}
      {[0, 1, 2].map((i) => {
        const a = ((i * 120 + 30 + seed * 17) * Math.PI) / 180;
        return <circle key={i} cx={cx + Math.cos(a) * 40} cy={cy + Math.sin(a) * 40} r={4} strokeWidth={0.8} />;
      })}
    </g>
  );
}

export function CodexMarks({ spread, side }: { spread: number; side: 'left' | 'right' }) {
  const { style, pool } = spreadMarks(spread)[side];
  const body = useMemo(
    () => (style === 'runes' ? <Runes seed={spread} side={side} pool={pool} /> : style === 'tattoo' ? <Tattoo seed={spread} side={side} /> : <Sigil seed={spread} side={side} pool={pool} />),
    // The pool is derived from the spread, so the spread and side are the whole key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spread, side],
  );
  return (
    <svg className={`cx-marks cx-marks-${style}`} viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
        {body}
      </g>
    </svg>
  );
}
