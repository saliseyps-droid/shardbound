import { useMemo, type ReactElement } from 'react';

/**
 * Faint ink marks behind a Codex page, drawn in the page's own brown ink at low opacity: a rune
 * inscription, tattoo-like linework or an arcane sigil, each in five versions. Pages take the
 * styles in turn, so two neighbouring pages never share a style; every new page of a style takes
 * its next version, so a version never comes twice in a row. The two pages of a spread draw from
 * two separate halves of the runes, so no rune shows on both. Everything follows from the spread
 * number, so the book looks the same on every visit.
 */
export type CodexMarkStyle = 'runes' | 'tattoo' | 'sigil';
const STYLES: CodexMarkStyle[] = ['runes', 'tattoo', 'sigil'];
export const MARK_VERSIONS = 5;

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
type Side = 'left' | 'right';
const rune = (pool: Pool, r: () => number) => pool[Math.floor(r() * pool.length)];

/** Pages in reading order: left of spread 0, right of spread 0, left of spread 1... */
const pageStyle = (page: number) => STYLES[page % 3];

/** How many earlier pages had this page's style (its version is that count, mod 5). */
function versionOf(page: number): number {
  return Math.floor(page / 3) % MARK_VERSIONS;
}

export interface PageMarks {
  style: CodexMarkStyle;
  version: number;
  pool: Pool;
}

/** The marks of a spread's two pages. */
export function spreadMarks(spread: number): Record<Side, PageMarks> {
  const r = rng(spread * 7919 + 13);
  const order = RUNES.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const half = order.length / 2;
  const page = (side: Side) => spread * 2 + (side === 'left' ? 0 : 1);
  const make = (side: Side, pool: number[]): PageMarks => ({ style: pageStyle(page(side)), version: versionOf(page(side)), pool: pool.map((i) => RUNES[i]) });
  return { left: make('left', order.slice(0, half)), right: make('right', order.slice(half)) };
}

// ---------------------------------------------------------------- shared pieces
function RuneRing({ cx, cy, r, n, rand, pool, size = 1 }: { cx: number; cy: number; r: number; n: number; rand: () => number; pool: Pool; size?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 9 * size} strokeWidth={0.8} />
      <circle cx={cx} cy={cy} r={r - 9 * size} strokeWidth={0.5} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={rune(pool, rand)} transform={`rotate(${(i / n) * 360} ${cx} ${cy}) translate(${cx - 5 * size} ${cy - r - 7 * size}) scale(${size})`} />
      ))}
    </g>
  );
}

/** A seal: double ring, a dotted ring, a ring of runes and a bind-rune in a diamond. */
function Seal({ cx, cy, s, rand, pool }: { cx: number; cy: number; s: number; rand: () => number; pool: Pool }) {
  const core = [rune(pool, rand), rune(pool, rand)];
  return (
    <g>
      <circle cx={cx} cy={cy} r={48 * s} strokeWidth={0.9} />
      <circle cx={cx} cy={cy} r={44 * s} strokeWidth={0.4} />
      <circle cx={cx} cy={cy} r={25 * s} strokeWidth={1.4} strokeDasharray="0.1 3.4" />
      <RuneRing cx={cx} cy={cy} r={35 * s} n={Math.round(14 * s)} rand={rand} pool={pool} size={0.8 * s} />
      <path d={`M${cx} ${cy - 18 * s}L${cx + 14 * s} ${cy}L${cx} ${cy + 18 * s}L${cx - 14 * s} ${cy}Z`} strokeWidth={0.8} />
      <path d={core[0]} transform={`translate(${cx - 6 * s} ${cy - 8.4 * s}) scale(${1.2 * s})`} strokeWidth={1.3} />
      <path d={core[1]} transform={`translate(${cx - 6 * s} ${cy - 8.4 * s}) scale(${1.2 * s})`} strokeWidth={0.8} opacity={0.7} />
    </g>
  );
}

/** A vertical inscription band: runes between two rules, now and then a diamond. Fits [y0, y1]. */
function Band({ x, y0, y1, rand, pool }: { x: number; y0: number; y1: number; rand: () => number; pool: Pool }) {
  const out: ReactElement[] = [];
  let y = y0 + 8;
  let i = 0;
  while (y + 18 <= y1) {
    out.push(<path key={`r${i}`} d={rune(pool, rand)} transform={`translate(${x - 6.3} ${y}) scale(1.26)`} />);
    y += 22;
    if (y + 28 <= y1 && rand() < 0.3) {
      out.push(<path key={`d${i}`} d={`M${x} ${y - 2}l2.4 3l-2.4 3l-2.4 -3Z`} className="cx-mark-fill" />);
      y += 10;
    }
    i++;
  }
  const end = y - 2;
  return (
    <g>
      <path d={`M${x - 10} ${y0}L${x - 10} ${end}M${x + 10} ${y0}L${x + 10} ${end}`} strokeWidth={0.5} />
      <path d={`M${x - 10} ${y0}L${x + 10} ${y0}M${x - 10} ${end}L${x + 10} ${end}`} strokeWidth={0.8} />
      {out}
    </g>
  );
}

/** A horizontal line of rune words between rules, starting at x, `words` long. */
function Line({ x, y, words, rand, pool }: { x: number; y: number; words: number; rand: () => number; pool: Pool }) {
  const w = words * 12.6;
  return (
    <g>
      <path d={`M${x} ${y - 9}L${x + w} ${y - 9}M${x} ${y + 9}L${x + w} ${y + 9}`} strokeWidth={0.45} />
      {Array.from({ length: words }, (_, i) => (
        <g key={i}>
          <path d={rune(pool, rand)} transform={`translate(${x + 2 + i * 12.6} ${y - 5.6}) scale(0.8)`} strokeWidth={1} />
          {i < words - 1 && <circle cx={x + 12 + i * 12.6} cy={y} r={0.8} className="cx-mark-fill" />}
        </g>
      ))}
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
function Tendril({ x, y, dx, dy, rand, curl = true }: { x: number; y: number; dx: number; dy: number; rand: () => number; curl?: boolean }) {
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
      {curl && <path d={spiral(e[0], e[1], 1.6, 9, dx > 0 ? 1 : -1)} strokeWidth={1.4} />}
      <path d={thorns.join('')} className="cx-mark-fill" />
    </g>
  );
}

function Triskelion({ x, y, r, rot }: { x: number; y: number; r: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 24})`}>
      {[0, 120, 240].map((a) => (
        <path key={a} d={spiral(0, -14, 1.3, 13, 1)} transform={`rotate(${a})`} strokeWidth={2} />
      ))}
      <circle r={24} strokeWidth={0.7} strokeDasharray="2 3" />
    </g>
  );
}

const Dots = ({ pts }: { pts: [number, number, number][] }) => (
  <>
    {pts.map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} className="cx-mark-fill" />
    ))}
  </>
);

// ---------------------------------------------------------------- runes, five versions
// Each version keeps its pieces apart: no band runs into a seal or a line.
function Runes({ v, side, rand, pool }: { v: number; side: Side; rand: () => number; pool: Pool }) {
  const outer = side === 'left' ? 0 : 200;
  const inn = 200 - outer;
  const k = side === 'left' ? 1 : -1;
  const lineX = (w: number, fromOuter: boolean) => (fromOuter === (side === 'left') ? 30 : 170 - w * 12.6);
  switch (v) {
    case 0: // seal in the top outer corner, band below it, line along the bottom
      return (
        <g>
          <Seal cx={outer + k * 22} cy={34} s={1} rand={rand} pool={pool} />
          <Band x={outer + k * 15} y0={96} y1={250} rand={rand} pool={pool} />
          <Line x={lineX(7, false)} y={262} words={7} rand={rand} pool={pool} />
        </g>
      );
    case 1: // band from the top, seal in the bottom outer corner, line along the top
      return (
        <g>
          <Band x={outer + k * 15} y0={22} y1={186} rand={rand} pool={pool} />
          <Seal cx={outer + k * 22} cy={248} s={1} rand={rand} pool={pool} />
          <Line x={lineX(7, false)} y={20} words={7} rand={rand} pool={pool} />
        </g>
      );
    case 2: // lines across the top and the bottom, a half seal in the middle of the outer edge
      return (
        <g>
          <Line x={lineX(10, true)} y={18} words={10} rand={rand} pool={pool} />
          <Line x={lineX(10, false)} y={264} words={10} rand={rand} pool={pool} />
          <Seal cx={outer} cy={140} s={0.8} rand={rand} pool={pool} />
        </g>
      );
    case 3: // band down the gutter, a great rune in a ring in the top outer corner
      return (
        <g>
          <Band x={inn - k * 16} y0={30} y1={262} rand={rand} pool={pool} />
          <circle cx={outer + k * 42} cy={46} r={26} strokeWidth={1} />
          <circle cx={outer + k * 42} cy={46} r={22} strokeWidth={0.4} />
          <path d={rune(pool, rand)} transform={`translate(${outer + k * 42 - 12} ${46 - 16.8}) scale(2.4)`} strokeWidth={1.4} />
          <Line x={lineX(6, true)} y={264} words={6} rand={rand} pool={pool} />
        </g>
      );
    default: // three short staves in the bottom outer corner, a small seal in the top gutter corner
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <Band key={i} x={outer + k * (16 + i * 26)} y0={170 + i * 14} y1={262} rand={rand} pool={pool} />
          ))}
          <Seal cx={inn - k * 34} cy={36} s={0.62} rand={rand} pool={pool} />
          <path d={`M${outer + k * 10} 30Q${outer + k * 60} 20 ${inn - k * 70} 36`} strokeWidth={0.5} strokeDasharray="1 4" />
        </g>
      );
  }
}

// ---------------------------------------------------------------- tattoo, five versions
function Tattoo({ v, side, rand }: { v: number; side: Side; rand: () => number }) {
  const outer = side === 'left' ? 0 : 200;
  const inn = 200 - outer;
  const k = side === 'left' ? 1 : -1;
  const rot = Math.floor(rand() * 120);
  switch (v) {
    case 0: // triskelion top outer, a tendril below it, vines from the bottom gutter corner
      return (
        <g>
          <Triskelion x={outer + k * 40} y={42} r={24} rot={rot} />
          <Tendril x={outer + k * 6} y={78} dx={k * 46} dy={58} rand={rand} />
          <Tendril x={inn - k * 4} y={262} dx={-k * 58} dy={-46} rand={rand} />
          <Tendril x={inn - k * 4} y={262} dx={-k * 20} dy={-80} rand={rand} />
          <Dots pts={Array.from({ length: 9 }, (_, i) => [outer + k * (22 + i * 9), 270 - (i % 2) * 4, 1 + (i % 3) * 0.5])} />
        </g>
      );
    case 1: // the other way up: triskelion bottom outer, vines from the top gutter corner
      return (
        <g>
          <Triskelion x={outer + k * 40} y={238} r={24} rot={rot} />
          <Tendril x={outer + k * 6} y={202} dx={k * 46} dy={-58} rand={rand} />
          <Tendril x={inn - k * 4} y={18} dx={-k * 58} dy={46} rand={rand} />
          <Tendril x={inn - k * 4} y={18} dx={-k * 20} dy={80} rand={rand} />
          <Dots pts={Array.from({ length: 9 }, (_, i) => [outer + k * (22 + i * 9), 12 + (i % 2) * 4, 1 + (i % 3) * 0.5])} />
        </g>
      );
    case 2: {
      // a triquetra knot in the top outer corner with a ring through it, an arc of dots, a small triskelion at the bottom gutter
      const cx = outer + k * 44;
      const cy = 50;
      return (
        <g>
          {[0, 120, 240].map((a) => (
            <path key={a} d="M0 4Q17 -16 0 -38Q-17 -16 0 4Z" transform={`translate(${cx} ${cy}) rotate(${a + rot})`} strokeWidth={1.6} />
          ))}
          <circle cx={cx} cy={cy} r={15} strokeWidth={1.2} />
          <circle cx={cx} cy={cy} r={42} strokeWidth={0.6} strokeDasharray="2 3" />
          <Dots pts={Array.from({ length: 9 }, (_, i) => [outer + k * 12, 104 + i * 15, 1 + (i % 3) * 0.4])} />
          <Triskelion x={inn - k * 34} y={246} r={16} rot={rot} />
        </g>
      );
    }
    case 3: {
      // a running wave of spirals along the bottom edge, a small triskelion in the top outer corner
      const n = 6;
      const w = 26;
      const x0 = side === 'left' ? 26 : 200 - 26 - (n - 1) * w;
      const y = 252;
      const wave = Array.from({ length: n * 8 + 1 }, (_, i) => {
        const x = x0 - 13 + (i / 8) * w;
        return `${x.toFixed(1)} ${(y + 14 + Math.sin((i / 8) * Math.PI * 2) * 3).toFixed(1)}`;
      });
      return (
        <g>
          {Array.from({ length: n }, (_, i) => (
            <path key={i} d={spiral(x0 + i * w, y, 1.5, 10, 1)} strokeWidth={1.5} />
          ))}
          <path d={`M${wave.join('L')}`} strokeWidth={1.2} />
          <Triskelion x={outer + k * 36} y={38} r={18} rot={rot} />
        </g>
      );
    }
    default: // a flower of spirals in the top gutter corner, two tendrils from the bottom outer corner
      return (
        <g>
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={spiral(0, -16, 1.2, 11, 1)} transform={`translate(${inn - k * 44} 46) rotate(${i * 60 + rot})`} strokeWidth={1.5} />
          ))}
          <circle cx={inn - k * 44} cy={46} r={6} strokeWidth={1} />
          <Tendril x={outer + k * 4} y={268} dx={k * 52} dy={-60} rand={rand} />
          <Tendril x={outer + k * 4} y={268} dx={k * 14} dy={-92} rand={rand} />
          <Dots pts={Array.from({ length: 8 }, (_, i) => [inn - k * (44 + Math.cos((i / 7) * Math.PI) * 40), 96 + Math.sin((i / 7) * Math.PI) * 10, 1.1])} />
        </g>
      );
  }
}

// ---------------------------------------------------------------- sigil, five versions
const poly = (cx: number, cy: number, r: number, n: number, rot: number, step = 1) => {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = ((rot + ((i * step) % n) * (360 / n) - 90) * Math.PI) / 180;
    return `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  });
  return `M${pts.join('L')}Z`;
};
const ticks = (cx: number, cy: number, r0: number, r1: number, n: number, w = 1.2) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return <path key={i} d={`M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0}L${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}`} strokeWidth={w} />;
  });

function Sigil({ v, rand, pool }: { v: number; rand: () => number; pool: Pool }) {
  const cx = 100;
  const cy = 140;
  switch (v) {
    case 0: // hexagram, crescent at the heart
      return (
        <g>
          <RuneRing cx={cx} cy={cy} r={74} n={20} rand={rand} pool={pool} size={1.1} />
          <circle cx={cx} cy={cy} r={58} strokeWidth={0.6} />
          <path d={`${poly(cx, cy, 58, 3, 0)} ${poly(cx, cy, 58, 3, 60)}`} strokeWidth={0.9} />
          <circle cx={cx} cy={cy} r={22} strokeWidth={0.8} />
          <path d={`M${cx + 3} ${cy - 14}A14 14 0 1 0 ${cx + 3} ${cy + 14}A9 14 0 1 1 ${cx + 3} ${cy - 14}Z`} className="cx-mark-fill" />
          {ticks(cx, cy, 88, 96, 12)}
        </g>
      );
    case 1: // pentagram, a small circle at each point
      return (
        <g>
          <RuneRing cx={cx} cy={cy} r={70} n={18} rand={rand} pool={pool} size={1.05} />
          <circle cx={cx} cy={cy} r={56} strokeWidth={0.7} />
          <path d={poly(cx, cy, 56, 5, 0, 2)} strokeWidth={0.9} />
          {Array.from({ length: 5 }, (_, i) => {
            const a = ((i * 72 - 90) * Math.PI) / 180;
            return <circle key={i} cx={cx + Math.cos(a) * 56} cy={cy + Math.sin(a) * 56} r={5} strokeWidth={0.8} />;
          })}
          <circle cx={cx} cy={cy} r={6} className="cx-mark-fill" />
        </g>
      );
    case 2: // octagram of two squares, an eye at the heart
      return (
        <g>
          <circle cx={cx} cy={cy} r={84} strokeWidth={0.8} />
          <circle cx={cx} cy={cy} r={80} strokeWidth={0.4} strokeDasharray="0.1 3" />
          <path d={`${poly(cx, cy, 72, 4, 0)} ${poly(cx, cy, 72, 4, 45)}`} strokeWidth={0.9} />
          <circle cx={cx} cy={cy} r={34} strokeWidth={0.6} />
          <path d={`M${cx - 22} ${cy}Q${cx} ${cy - 16} ${cx + 22} ${cy}Q${cx} ${cy + 16} ${cx - 22} ${cy}Z`} strokeWidth={1} />
          <circle cx={cx} cy={cy} r={5} className="cx-mark-fill" />
          {ticks(cx, cy, 84, 92, 8, 1.6)}
        </g>
      );
    case 3: // the moon's phases on an arc over a ring of runes and a triangle
      return (
        <g>
          {Array.from({ length: 5 }, (_, i) => {
            const a = ((200 + i * 35) * Math.PI) / 180;
            const x = cx + Math.cos(a) * 82;
            const y = cy - 6 + Math.sin(a) * 82;
            const f = [-1, -0.5, 0, 0.5, 1][i];
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={8} strokeWidth={0.8} />
                {f !== 0 && <path d={`M${x} ${y - 8}A8 8 0 0 ${f > 0 ? 1 : 0} ${x} ${y + 8}A${8 * Math.abs(1 - Math.abs(f))} 8 0 0 ${f > 0 ? 0 : 1} ${x} ${y - 8}Z`} className="cx-mark-fill" />}
                {f === 0 && <circle cx={x} cy={y} r={8} className="cx-mark-fill" />}
              </g>
            );
          })}
          <RuneRing cx={cx} cy={cy + 14} r={50} n={14} rand={rand} pool={pool} size={0.95} />
          <path d={poly(cx, cy + 14, 38, 3, 180)} strokeWidth={0.9} />
          <circle cx={cx} cy={cy + 14} r={4} className="cx-mark-fill" />
        </g>
      );
    default: // a sun: rays of two lengths, a ring of runes and a downward triangle
      return (
        <g>
          <RuneRing cx={cx} cy={cy} r={78} n={20} rand={rand} pool={pool} size={1.05} />
          <circle cx={cx} cy={cy} r={30} strokeWidth={1} />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r1 = i % 2 ? 46 : 60;
            return <path key={i} d={`M${cx + Math.cos(a) * 34} ${cy + Math.sin(a) * 34}L${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}`} strokeWidth={1.1} />;
          })}
          <path d={poly(cx, cy, 22, 3, 180)} strokeWidth={0.9} />
          <circle cx={cx} cy={cy} r={3} className="cx-mark-fill" />
        </g>
      );
  }
}

export function CodexMarks({ spread, side }: { spread: number; side: Side }) {
  const { style, version, pool } = spreadMarks(spread)[side];
  const body = useMemo(() => {
    const rand = rng(spread * 31 + (side === 'left' ? 11 : 37));
    return style === 'runes' ? <Runes v={version} side={side} rand={rand} pool={pool} /> : style === 'tattoo' ? <Tattoo v={version} side={side} rand={rand} /> : <Sigil v={version} rand={rand} pool={pool} />;
    // The style, version and pool all follow from the spread and side.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread, side]);
  return (
    <svg className={`cx-marks cx-marks-${style}`} viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
        {body}
      </g>
    </svg>
  );
}
