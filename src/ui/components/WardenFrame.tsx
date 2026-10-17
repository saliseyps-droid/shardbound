import { useId, type CSSProperties, type ReactNode } from 'react';
import type { PlayableFaction } from '@/game/types';
import '@/ui/styles/wardenFrame.css';
import { SHOP_FRAME_DESIGNS } from './frames/ShopFrames';
import { Band, d, delay, edgePoints, Gems, HEX, scaled, sparkle, taper, VERTS, VIEW } from './frames/frameKit';

/**
 * Faction frames around the hexagonal Warden portrait (earned with 100 wins for that faction).
 * Drawn in SVG on a 200 × 228 hexagon (the portrait's own box), in two layers: what sits behind
 * the portrait (gears, rune circles, auras) and what sits in front of it (the band itself, flames,
 * branches, ice). Every motion is CSS or SMIL and stops with reduced motion.
 */

// ---------------------------------------------------------------- Cinder Legion: blackened iron with a molten seam, crowned by living fire
/** A band of flame tongues rising from the line a → b (tongue heights vary along it). */
function flameBand(a: [number, number], b: [number, number], tongues: number, base: number, peak: number, seed: number): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = dy / len;
  const ny = -dx / len;
  const pts: string[] = [`M${d(a[0])} ${d(a[1])}`];
  for (let i = 0; i < tongues; i++) {
    const t0 = i / tongues;
    const tm = (i + 0.5) / tongues;
    const t1 = (i + 1) / tongues;
    const h = base + peak * (0.45 + 0.55 * Math.abs(Math.sin((i + seed) * 1.7)));
    const lean = Math.sin((i + seed) * 2.3) * 4;
    const px = a[0] + dx * tm + nx * h + (dx / len) * lean;
    const py = a[1] + dy * tm + ny * h + (dy / len) * lean;
    const vx = a[0] + dx * t1 + nx * base * 0.35;
    const vy = a[1] + dy * t1 + ny * base * 0.35;
    const sx = a[0] + dx * t0 + nx * base * 0.35;
    const sy = a[1] + dy * t0 + ny * base * 0.35;
    pts.push(`Q${d(sx + nx * h * 0.55)} ${d(sy + ny * h * 0.55)} ${d(px)} ${d(py)}`, `Q${d(vx + nx * h * 0.45)} ${d(vy + ny * h * 0.45)} ${d(vx)} ${d(vy)}`);
  }
  pts.push(`L${d(b[0])} ${d(b[1])} Z`);
  return pts.join(' ');
}
function Ember({ u }: { u: string }) {
  // Outer fire (tall, red to gold) and a hotter inner fire (short, gold to white) along both upper edges.
  const outerL = flameBand([-6, 62], [100, -3], 9, 6, 30, 1);
  const outerR = flameBand([100, -3], [206, 62], 9, 6, 30, 5);
  const innerL = flameBand([2, 57], [100, 1], 8, 3, 15, 3);
  const innerR = flameBand([100, 1], [198, 57], 8, 3, 15, 7);
  const plume = 'M82 6 C 76 -12 88 -22 85 -40 C 94 -32 97 -44 94 -60 C 108 -46 113 -32 107 -20 C 114 -27 117 -36 114 -46 C 127 -30 125 -8 118 6 Z';
  const core = 'M90 4 C 88 -8 95 -14 94 -26 C 101 -18 104 -24 103 -34 C 111 -24 112 -10 108 4 Z';
  return {
    back: <ellipse cx="100" cy="96" rx="134" ry="150" fill={`url(#${u}-aura)`} className="wf-pulse" />,
    front: (
      <>
        <defs>
          <linearGradient id={`${u}-iron`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5a463a" />
            <stop offset="0.45" stopColor="#2a1c15" />
            <stop offset="1" stopColor="#0d0705" />
          </linearGradient>
          <radialGradient id={`${u}-aura`}>
            <stop offset="0.58" stopColor="#ff5a00" stopOpacity="0" />
            <stop offset="0.84" stopColor="#ff4000" stopOpacity="0.36" />
            <stop offset="1" stopColor="#ff2000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${u}-fire`} gradientUnits="userSpaceOnUse" x1="0" y1="64" x2="0" y2="-62">
            <stop offset="0" stopColor="#4a0802" />
            <stop offset="0.25" stopColor="#b42204" />
            <stop offset="0.5" stopColor="#f26010" />
            <stop offset="0.78" stopColor="#ffb22e" />
            <stop offset="1" stopColor="#fff0b8" />
          </linearGradient>
          <linearGradient id={`${u}-hot`} gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="-36">
            <stop offset="0" stopColor="#ff8a1a" />
            <stop offset="0.5" stopColor="#ffd25a" />
            <stop offset="1" stopColor="#fffbe6" />
          </linearGradient>
          <linearGradient id={`${u}-gem`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb08a" />
            <stop offset="0.5" stopColor="#d4200c" />
            <stop offset="1" stopColor="#4a0400" />
          </linearGradient>
          {/* Fire: the shapes are churned by animated turbulence (two different churns for the two layers). */}
          <filter id={`${u}-burn`} filterUnits="userSpaceOnUse" x="-60" y="-90" width="320" height="200">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.09" numOctaves="2" seed="3" result="noise">
              <animate attributeName="baseFrequency" dur="2.4s" values="0.03 0.09;0.036 0.12;0.03 0.09" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`${u}-burn2`} filterUnits="userSpaceOnUse" x="-60" y="-90" width="320" height="200">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.14" numOctaves="2" seed="9" result="noise">
              <animate attributeName="baseFrequency" dur="1.7s" values="0.05 0.14;0.06 0.18;0.05 0.14" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`${u}-glow`} filterUnits="userSpaceOnUse" x="-60" y="-90" width="320" height="200">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <g filter={`url(#${u}-glow)`} opacity="0.9">
          <path d={outerL} fill="#ff4a08" />
          <path d={outerR} fill="#ff4a08" />
          <path d={plume} fill="#ff6a10" />
        </g>
        <g filter={`url(#${u}-burn)`} className="wf-fire">
          <path d={outerL} fill={`url(#${u}-fire)`} />
          <path d={outerR} fill={`url(#${u}-fire)`} />
          <path d={plume} fill={`url(#${u}-fire)`} />
        </g>
        <g filter={`url(#${u}-burn2)`} className="wf-fire wf-fire-b" opacity="0.95">
          <path d={innerL} fill={`url(#${u}-hot)`} />
          <path d={innerR} fill={`url(#${u}-hot)`} />
          <path d={core} fill={`url(#${u}-hot)`} />
        </g>
        <Band grad={`${u}-iron`} width={11} edge="#050202" hi="#8a6a52" inner="#140a06" />
        {/* Lava showing through cracks in the iron, and the molten seam inside it. */}
        <path d="M14 49 L24 44 L30 48 M58 25 L66 20 M150 22 L158 27 L166 24 M196 92 L201 100 L197 108 M3 128 L-1 136 L3 142 M60 206 L68 211 M140 210 L150 205 L156 209" fill="none" stroke="#ff8a2a" strokeWidth="1.3" strokeLinecap="round" className="wf-seam" />
        <path d={HEX} fill="none" stroke="#ff7a1a" strokeWidth="1.4" className="wf-seam" transform={scaled(0.985)} />
        <Gems grad={`${u}-gem`} at={[2, 3, 4]} />
        {Array.from({ length: 14 }, (_, i) => (
          // The position lives on the group: the animation's CSS transform would replace it on the path itself.
          <g key={i} transform={`translate(${6 + ((i * 37) % 188)} ${44 - ((i * 23) % 44)})`}>
            <path d="M0 0 L0.8 -5" stroke="#ffd27a" strokeWidth="1.3" strokeLinecap="round" className="wf-spark" style={{ ...delay(i * 0.27), animationDuration: `${1.8 + (i % 4) * 0.35}s` }} />
          </g>
        ))}
      </>
    ),
  };
}

// ---------------------------------------------------------------- Thornweald Circle: an old living wood, gnarled branches and real leaves
const LEAF = 'M0 0 C 5 -6 15 -8 24 -1 C 16 6 6 6 0 0 Z';
function Leaf({ x, y, r, s = 1, tone, u, k }: { x: number; y: number; r: number; s?: number; tone: number; u: string; k: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <g className="wf-leaf" style={delay(k * 0.37)}>
        <path d={LEAF} fill={`url(#${u}-leaf${tone})`} stroke="#1c3214" strokeWidth="0.7" />
        <path d="M1 0 C 8 -1 16 -2 23 -1" fill="none" stroke="#1c3214" strokeWidth="0.6" opacity="0.8" />
        <path d="M7 -0.6 L10 -4 M12 -1 L15 -5 M8 -0.4 L11 3 M13 -0.8 L16 2.6" stroke="#1c3214" strokeWidth="0.4" opacity="0.7" />
      </g>
    </g>
  );
}
/** A point and its direction along a cubic Bezier. */
function bez(p: [number, number][], t: number): [number, number, number] {
  const u = 1 - t;
  const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0];
  const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1];
  const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]);
  const dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]);
  return [x, y, (Math.atan2(dy, dx) * 180) / Math.PI];
}
function Verdant({ u }: { u: string }) {
  // Boughs hugging the frame: two from the crown down the upper edges, two climbing the sides from the lower corners, two under the base.
  const curves: { p: [number, number][]; w: [number, number]; leaves: number }[] = [
    { p: [[100, -8], [64, -6], [28, 18], [-12, 62]], w: [11, 3], leaves: 9 },
    { p: [[100, -8], [136, -6], [172, 18], [212, 62]], w: [11, 3], leaves: 9 },
    { p: [[2, 186], [-16, 160], [-16, 118], [-10, 74]], w: [9, 2.5], leaves: 7 },
    { p: [[198, 186], [216, 160], [216, 118], [210, 74]], w: [9, 2.5], leaves: 7 },
    { p: [[100, 236], [76, 246], [40, 232], [14, 204]], w: [8, 2], leaves: 6 },
    { p: [[100, 236], [124, 246], [160, 232], [186, 204]], w: [8, 2], leaves: 6 },
  ];
  const boughs = curves.map((c) => taper(c.p, c.w[0], c.w[1]));
  const leaves: [number, number, number, number, number][] = [];
  curves.forEach((c, ci) => {
    for (let i = 0; i < c.leaves; i++) {
      const t = 0.12 + (0.86 * i) / (c.leaves - 1);
      const [x, y, ang] = bez(c.p, t);
      // Alternate sides, but always lean away from the portrait.
      const outward = (Math.atan2(y - 114, x - 100) * 180) / Math.PI;
      const side = i % 2 ? 1 : -1;
      let r = ang + side * 55;
      const diff = ((r - outward + 540) % 360) - 180;
      if (Math.abs(diff) > 100) r = ang - side * 55;
      leaves.push([x, y, r, 1.25 + ((i + ci) % 3) * 0.2, (i + ci) % 4]);
    }
  });
  // A crown of leaves on the top point.
  for (const [r, sc, tone] of [[-120, 1.7, 0], [-60, 1.7, 1], [-150, 1.4, 2], [-30, 1.4, 2], [-90, 1.9, 1], [-105, 1.3, 3], [-75, 1.3, 0]] as const) leaves.push([100, -12, r, sc, tone]);
  return {
    back: <ellipse cx="100" cy="114" rx="126" ry="138" fill={`url(#${u}-aura)`} className="wf-pulse" />,
    front: (
      <>
        <defs>
          <linearGradient id={`${u}-wood`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8a6a44" />
            <stop offset="0.5" stopColor="#4a321a" />
            <stop offset="1" stopColor="#21150a" />
          </linearGradient>
          <linearGradient id={`${u}-bark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6e5232" />
            <stop offset="1" stopColor="#2c1d0e" />
          </linearGradient>
          <radialGradient id={`${u}-aura`}>
            <stop offset="0.6" stopColor="#6fd07a" stopOpacity="0" />
            <stop offset="0.85" stopColor="#4fae5a" stopOpacity="0.26" />
            <stop offset="1" stopColor="#4fae5a" stopOpacity="0" />
          </radialGradient>
          {[
            ['#3f6e2c', '#1f3d16'],
            ['#5a8a34', '#2b4a1a'],
            ['#7aa040', '#3a5a1e'],
            ['#a08a34', '#5a4416'],
          ].map(([a, b], i) => (
            <linearGradient key={i} id={`${u}-leaf${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={b} />
              <stop offset="1" stopColor={a} />
            </linearGradient>
          ))}
          <linearGradient id={`${u}-gem`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c8f0a0" />
            <stop offset="0.5" stopColor="#3f8a2c" />
            <stop offset="1" stopColor="#10300c" />
          </linearGradient>
        </defs>
        <Band grad={`${u}-wood`} width={10} edge="#120a04" hi="#a88a5e" inner="#1a1006" />
        {/* Grain carved into the wood. */}
        <path d={HEX} fill="none" stroke="#1a1006" strokeWidth="0.7" strokeDasharray="14 5 3 7" opacity="0.8" />
        {boughs.map((p, i) => (
          <path key={i} d={p} fill={`url(#${u}-bark)`} stroke="#1a1006" strokeWidth="0.6" />
        ))}
        {/* Ridges along the bark. */}
        {curves.map((c, i) => (
          <path key={i} d={`M${c.p[0][0]} ${c.p[0][1]} C ${c.p[1][0]} ${c.p[1][1]} ${c.p[2][0]} ${c.p[2][1]} ${c.p[3][0]} ${c.p[3][1]}`} fill="none" stroke="#a88a5e" strokeWidth="0.6" strokeDasharray="7 4 2 5" opacity="0.55" />
        ))}
        <Gems grad={`${u}-gem`} at={[2, 4]} />
        {leaves.map(([x, y, r, s, tone], i) => (
          <Leaf key={i} x={x} y={y} r={r} s={s} tone={tone} u={u} k={i} />
        ))}
        {/* Now and then a leaf lets go and drifts down. */}
        {[
          [30, 30, 0],
          [176, 50, 3.4],
          [12, 150, 6.1],
        ].map(([x, y, t], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <g className="wf-fall" style={delay(t)}>
              <path d={LEAF} fill={`url(#${u}-leaf3)`} stroke="#1c3214" strokeWidth="0.6" transform="scale(1.1)" />
            </g>
          </g>
        ))}
        {/* Pollen drifting in the light. */}
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={-6 + ((i * 43) % 212)} cy={40 + ((i * 61) % 160)} r="1.1" fill="#e8f5a0" className="wf-firefly" style={delay(i * 0.7)} />
        ))}
      </>
    ),
  };
}

// ---------------------------------------------------------------- Brass Dominion: riveted brass, two meshing gears on top, gauges on the shoulders
const gearPath = (r: number, teeth: number, depth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r - depth;
    const a2 = a + Math.PI / (teeth * 2);
    pts.push(`${d(Math.cos(a) * rr)} ${d(Math.sin(a) * rr)}`, `${d(Math.cos(a2) * rr)} ${d(Math.sin(a2) * rr)}`);
  }
  return `M${pts.join(' L')} Z`;
};
function Iron({ u }: { u: string }) {
  const rivets = edgePoints(4);
  return {
    back: (
      <>
        {/* The big gear left of the top point, the small one meshing with it on the right. */}
        <g transform="translate(80 -10)">
          <g className="wf-spin">
            <path d={gearPath(38, 14, 7)} fill={`url(#${u}-brass)`} stroke="#4a3010" strokeWidth="1.5" />
            <circle r="24" fill="none" stroke="#5a3a12" strokeWidth="1.5" />
            <circle r="12" fill="#3a2508" stroke="#c8902f" strokeWidth="2" />
          </g>
        </g>
        <g transform="translate(130 -22)">
          <g className="wf-spin wf-spin-rev">
            <path d={gearPath(22, 9, 6)} fill={`url(#${u}-brass)`} stroke="#4a3010" strokeWidth="1.5" />
            <circle r="7" fill="#3a2508" stroke="#c8902f" strokeWidth="2" />
          </g>
        </g>
      </>
    ),
    front: (
      <>
        <defs>
          <linearGradient id={`${u}-brass`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0b8" />
            <stop offset="0.3" stopColor="#e3b04f" />
            <stop offset="0.65" stopColor="#a8701f" />
            <stop offset="1" stopColor="#4a3010" />
          </linearGradient>
        </defs>
        <path d={HEX} fill="none" stroke={`url(#${u}-brass)`} strokeWidth="13" strokeLinejoin="round" />
        <path d={HEX} fill="none" stroke="#fff3c4" strokeWidth="1" opacity="0.6" transform={scaled(1.05)} />
        <path d={HEX} fill="none" stroke="#2a1a05" strokeWidth="1.6" transform={scaled(0.945)} />
        {rivets.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="#6b4512" />
            <circle cx={x - 0.8} cy={y - 0.8} r="1.6" fill="#ffe7a0" />
          </g>
        ))}
        {/* Pressure gauges on the upper corners, steam puffing beside them. */}
        {[
          [200, 57],
          [0, 57],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r="14" fill="#2a1a05" stroke={`url(#${u}-brass)`} strokeWidth="4" />
            <circle r="10" fill="#f3e7c4" />
            <path d="M-7 3 A 8 8 0 0 1 7 3" fill="none" stroke="#8a6a3a" strokeWidth="0.8" strokeDasharray="1 2" />
            <path d="M0 0 L0 -8" stroke="#8a1a0a" strokeWidth="1.6" strokeLinecap="round" className="wf-needle" style={delay(i * 0.7)} />
            <circle r="1.8" fill="#2a1a05" />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={i ? -14 : 14} cy="-12" r="5" fill="#ffffff" className="wf-steam" style={delay(k * 0.8 + i * 0.4)} />
            ))}
          </g>
        ))}
      </>
    ),
  };
}

// ---------------------------------------------------------------- Lumen Conclave: silver and gold filigree, an astrolabe crown, constellations
/** A long, thin north star (the vertical ray longer than the horizontal one). */
const northStar = (v: number, h: number) => `M0 ${-v} L${h * 0.12} ${-h * 0.12} L${h} 0 L${h * 0.12} ${h * 0.12} L0 ${v} L${-h * 0.12} ${h * 0.12} L${-h} 0 L${-h * 0.12} ${-h * 0.12} Z`;
function Astral({ u }: { u: string }) {
  return {
    back: (
      <>
        <ellipse cx="100" cy="114" rx="130" ry="142" fill={`url(#${u}-aura)`} className="wf-pulse" />
        {/* An armillary sphere behind the portrait: three gold rings, each with its own little world. */}
        <g transform="translate(100 114)">
          {[
            [-24, 138, 40, 26],
            [58, 132, 34, 40],
            [8, 146, 22, 18],
          ].map(([rot, rx, ry, dur], i) => (
            <g key={i} transform={`rotate(${rot})`}>
              <ellipse rx={rx} ry={ry} fill="none" stroke="#d8b25a" strokeWidth={i === 2 ? 0.6 : 0.9} opacity="0.75" />
              <g className="wf-orbit" style={{ animationDuration: `${dur}s`, ...(i === 1 ? { animationDirection: 'reverse' } : {}) } as CSSProperties}>
                <circle cx={rx} cy="0" r={i === 2 ? 2 : 3} fill={i === 1 ? '#bcd8ff' : '#f2d68a'} transform={`scale(1 ${ry / rx})`} />
              </g>
            </g>
          ))}
        </g>
      </>
    ),
    front: (
      <>
        <defs>
          <linearGradient id={`${u}-silver`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#d6e0f4" />
            <stop offset="0.65" stopColor="#7d8cc0" />
            <stop offset="1" stopColor="#262e62" />
          </linearGradient>
          <linearGradient id={`${u}-gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff4c8" />
            <stop offset="0.45" stopColor="#e2b85a" />
            <stop offset="1" stopColor="#7a5418" />
          </linearGradient>
          <radialGradient id={`${u}-aura`}>
            <stop offset="0.6" stopColor="#a8c4ff" stopOpacity="0" />
            <stop offset="0.85" stopColor="#8fb2ff" stopOpacity="0.3" />
            <stop offset="1" stopColor="#8fb2ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${u}-dot`}>
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="0.25" stopColor="#e6eeff" stopOpacity="0.8" />
            <stop offset="0.6" stopColor="#a8c4ff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#a8c4ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${u}-star`}>
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#dfe8ff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#dfe8ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${u}-gem`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d8e6ff" />
            <stop offset="0.5" stopColor="#3a5ad6" />
            <stop offset="1" stopColor="#0c1450" />
          </linearGradient>
        </defs>
        <Band grad={`${u}-silver`} width={8} edge="#0a0e24" hi="#ffffff" inner="#e2b85a" />
        <path d={HEX} fill="none" stroke={`url(#${u}-gold)`} strokeWidth="1.6" transform={scaled(1.07)} />
        {/* Small gold fleurons on the side corners. */}
        {[1, 2, 4, 5].map((i) => {
          const [x, y] = VERTS[i];
          const m = x > 100 ? 1 : -1;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${m} 1)`} fill="none" stroke={`url(#${u}-gold)`} strokeLinecap="round">
              <path d="M4 0 C 12 -2 16 -8 14 -13 C 12 -17 7 -15 9 -11" strokeWidth="1.4" />
              <path d="M4 0 C 12 2 16 8 14 13 C 12 17 7 15 9 11" strokeWidth="1.4" />
              <path d="M5 0 L18 0" strokeWidth="1" />
            </g>
          );
        })}
        <Gems grad={`${u}-gem`} at={[1, 2, 4, 5]} size={5} />
        {/* On the top point: a silver crescent moon cradling a long north star. */}
        <g transform="translate(100 -6)">
          <circle cy="-14" r="34" fill={`url(#${u}-star)`} className="wf-pulse" />
          <path d="M-26 -6 A 27 27 0 0 0 26 -6 A 22 20 0 0 1 -26 -6 Z" fill={`url(#${u}-silver)`} stroke={`url(#${u}-gold)`} strokeWidth="1.2" />
          <path d="M-20 -1 A 22 20 0 0 0 20 -1" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.7" />
          <g transform="translate(0 -16)">
            <path d={northStar(30, 12)} fill="#ffffff" className="wf-shimmer" />
            <path d={northStar(16, 7)} fill="#e8eeff" transform="rotate(45)" opacity="0.8" />
            <circle r="2.4" fill="#ffffff" />
          </g>
        </g>
        {/* Constellations: stars joined by fine white lines on all four sides. */}
        <g stroke="#ffffff" strokeWidth="0.7" fill="none" opacity="0.7">
          <polyline points="-26,48 -12,30 6,38 22,14 40,-4" />
          <polyline points="226,48 212,30 194,38 178,14 160,-4" />
          <polyline points="-28,186 -14,204 4,198 18,220" />
          <polyline points="228,186 214,204 196,198 182,220" />
          <polyline points="-16,112 -28,128 -14,146" />
          <polyline points="216,112 228,128 214,146" />
        </g>
        {[
          [-26, 48, 2.6], [-12, 30, 2], [6, 38, 2.4], [22, 14, 2], [40, -4, 2.8],
          [226, 48, 2.6], [212, 30, 2], [194, 38, 2.4], [178, 14, 2], [160, -4, 2.8],
          [-28, 186, 2.4], [-14, 204, 2.8], [4, 198, 2], [18, 220, 2.4],
          [228, 186, 2.4], [214, 204, 2.8], [196, 198, 2], [182, 220, 2.4],
          [-16, 112, 2.2], [-28, 128, 2.6], [-14, 146, 2], [216, 112, 2.2], [228, 128, 2.6], [214, 146, 2],
        ].map(([x, y, r], i) => (
          <g key={`c${i}`} transform={`translate(${x} ${y})`}>
            {/* A glowing star: soft halo, bright round core. */}
            <circle r={r * 2.6} fill={`url(#${u}-dot)`} className="wf-twinkle" style={delay(i * 0.23)} />
            <circle r={r * 0.75} fill="#ffffff" />
          </g>
        ))}
        {/* A scatter of stars around the frame. */}
        {[
          [-24, 30, 3], [-12, 92, 2], [-26, 150, 2.6], [-6, 214, 2], [224, 30, 3], [212, 92, 2], [226, 150, 2.6], [206, 214, 2], [40, -18, 2.2], [160, -18, 2.2], [100, 250, 2.6],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d={sparkle(r)} fill="#ffffff" className="wf-twinkle" style={delay(i * 0.31)} />
          </g>
        ))}
      </>
    ),
  };
}

// ---------------------------------------------------------------- Hollow Choir: black candles burning violet on a wrought-iron candelabrum, wax running over obsidian
function Candle({ x, y, h, w = 8, u, k }: { x: number; y: number; h: number; w?: number; u: string; k: number }) {
  // A wax candle standing on (x, y), its flame, a halo of light and a thread of smoke.
  const top = y - h;
  return (
    <g>
      <circle cx={x} cy={top - 9} r={h > 24 ? 17 : 13} fill={`url(#${u}-halo)`} className="wf-pulse" style={delay(k * 0.4)} />
      <path d={`M${x - w / 2} ${y} L${x - w / 2} ${top + 1.5} C ${x - w / 4} ${top - 0.8} ${x + w / 4} ${top + 1.6} ${x + w / 2} ${top} L${x + w / 2} ${y} Z`} fill={`url(#${u}-wax)`} stroke="#05020a" strokeWidth="0.7" />
      {/* Wax running down the side. */}
      <path d={`M${x + w / 2 - 0.3} ${top + 0.5} C ${x + w / 2 + 1.2} ${top + 4} ${x + w / 2 + 0.6} ${top + h * 0.35} ${x + w / 2 - 0.6} ${top + h * 0.45} C ${x + w / 2 - 1.6} ${top + h * 0.38} ${x + w / 2 - 1.4} ${top + 4} ${x + w / 2 - 1.8} ${top + 1}`} fill="#2e1c44" />
      <path d={`M${x - w / 2 + 1.2} ${top + 1.5} L${x - w / 2 + 1.2} ${y - 1}`} stroke="#6a4a90" strokeWidth="0.8" opacity="0.6" />
      <path d={`M${x} ${top + 0.5} L${x} ${top - 3}`} stroke="#120818" strokeWidth="0.9" />
      <g className="wf-flicker" style={delay(k * 0.27)} filter={`url(#${u}-burn)`}>
        <path d={`M${x} ${top - 2} C ${x - 4.6} ${top - 6} ${x - 2.8} ${top - 13} ${x} ${top - 19} C ${x + 2.8} ${top - 13} ${x + 4.6} ${top - 6} ${x} ${top - 2} Z`} fill={`url(#${u}-flame)`} />
        <path d={`M${x} ${top - 3} C ${x - 1.8} ${top - 5.5} ${x - 1.2} ${top - 9} ${x} ${top - 11} C ${x + 1.2} ${top - 9} ${x + 1.8} ${top - 5.5} ${x} ${top - 3} Z`} fill="#ffffff" opacity="0.92" />
      </g>
      <path d={`M${x} ${top - 21} C ${x - 4} ${top - 28} ${x + 4} ${top - 34} ${x - 1} ${top - 42}`} fill="none" stroke="#b896d8" strokeWidth="0.8" strokeLinecap="round" className="wf-smoke-thread" style={delay(k * 0.9)} />
    </g>
  );
}
function VoidFrame({ u }: { u: string }) {
  // Five candles on the candelabrum over the top point (tallest in the middle), one on each upper corner.
  const row = [-30, -15, 0, 15, 30].map((dx, i) => ({ x: 100 + dx, y: -10 + Math.abs(dx) * 0.28, h: [16, 23, 31, 23, 16][i] }));
  return {
    back: (
      <>
        <ellipse cx="100" cy="108" rx="134" ry="148" fill={`url(#${u}-aura)`} className="wf-pulse" />
        <g transform="translate(100 114)">
          <g className="wf-spin-slow">
            <circle r="132" fill="none" stroke="#7a3cd6" strokeWidth="0.8" strokeDasharray="2 5 10 5" opacity="0.5" />
          </g>
          <g className="wf-spin-slow wf-spin-rev">
            <circle r="140" fill="none" stroke="#4a1e8a" strokeWidth="0.6" strokeDasharray="18 9 3 9" opacity="0.5" />
          </g>
        </g>
      </>
    ),
    front: (
      <>
        <defs>
          <linearGradient id={`${u}-obsidian`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4a3a62" />
            <stop offset="0.4" stopColor="#1a0e28" />
            <stop offset="1" stopColor="#040108" />
          </linearGradient>
          <radialGradient id={`${u}-aura`}>
            <stop offset="0.58" stopColor="#8a3cff" stopOpacity="0" />
            <stop offset="0.84" stopColor="#7a30e8" stopOpacity="0.38" />
            <stop offset="1" stopColor="#7a30e8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${u}-wax`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4a3466" />
            <stop offset="0.35" stopColor="#24163a" />
            <stop offset="1" stopColor="#0a0512" />
          </linearGradient>
          <linearGradient id={`${u}-iron`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a4a6e" />
            <stop offset="1" stopColor="#120a1c" />
          </linearGradient>
          <linearGradient id={`${u}-flame`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#5a1aa8" />
            <stop offset="0.35" stopColor="#9a4cff" />
            <stop offset="0.75" stopColor="#d8b0ff" />
            <stop offset="1" stopColor="#f6eaff" />
          </linearGradient>
          <radialGradient id={`${u}-halo`}>
            <stop offset="0" stopColor="#c8a0ff" stopOpacity="0.6" />
            <stop offset="0.5" stopColor="#8a3cff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#8a3cff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${u}-gem`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0d8ff" />
            <stop offset="0.5" stopColor="#7a28d0" />
            <stop offset="1" stopColor="#1a0438" />
          </linearGradient>
          <filter id={`${u}-burn`} x="-80%" y="-40%" width="260%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08 0.16" numOctaves="1" seed="4" result="noise">
              <animate attributeName="baseFrequency" dur="1.9s" values="0.08 0.16;0.1 0.21;0.08 0.16" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <Band grad={`${u}-obsidian`} width={12} edge="#020005" hi="#9a7ac8" inner="#b070ff" />
        {/* Tracery engraved along the band, pulsing faintly. */}
        <path d={HEX} fill="none" stroke="#c48cff" strokeWidth="1.1" strokeDasharray="1 4 9 4" className="wf-seam" />
        {/* Black wax that has run over the band from the candles and hardened. */}
        <g fill="#160c22" stroke="#4a3466" strokeWidth="0.5">
          <path d="M84 6 C 84 12 82 18 83 22 C 84 25 87 25 87 21 C 87 16 88 12 90 8 Z" />
          <path d="M112 6 C 113 12 116 16 115 24 C 115 28 119 28 119 24 C 119 18 117 12 116 6 Z" />
          <path d="M196 62 C 196 70 193 76 194 82 C 195 86 198 86 198 81 C 198 75 199 69 200 64 Z" />
          <path d="M4 62 C 4 70 7 76 6 82 C 5 86 2 86 2 81 C 2 75 1 69 0 64 Z" />
        </g>
        {/* A spiked wrought-iron railing along both upper edges: spear-headed pickets with barbs, joined by a rail. */}
        {[0, 1].map((side) => {
          const [ax, ay] = side ? [200, 57] : [0, 57];
          const ts = [0.1, 0.18, 0.26, 0.34, 0.42, 0.5];
          const pts = ts.map((t) => [ax + (100 - ax) * t, ay - 57 * t] as const);
          return (
            <g key={side}>
              {pts.map(([x, y], i) => {
                const h = 15 + ((i + side) % 3) * 4;
                return (
                  <g key={i}>
                    <rect x={x - 1.2} y={y - h} width="2.4" height={h} fill={`url(#${u}-iron)`} stroke="#05020a" strokeWidth="0.4" />
                    <path d={`M${x} ${y - h - 8} L${x + 3} ${y - h - 1.5} L${x + 1.2} ${y - h} L${x - 1.2} ${y - h} L${x - 3} ${y - h - 1.5} Z`} fill={`url(#${u}-iron)`} stroke="#c48cff" strokeWidth="0.5" />
                    <path d={`M${x - 1.2} ${y - h * 0.55} L${x - 4} ${y - h * 0.55 - 3} M${x + 1.2} ${y - h * 0.55} L${x + 4} ${y - h * 0.55 - 3}`} stroke="#6a4a90" strokeWidth="0.9" strokeLinecap="round" />
                    <circle cx={x} cy={y - h - 4} r="0.9" fill="#e2c0ff" className="wf-twinkle" style={delay(i * 0.4 + side)} />
                  </g>
                );
              })}
              {/* The rails, following the edge. */}
              <path d={`M${pts[0][0]} ${pts[0][1] - 6} L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1] - 6}`} stroke={`url(#${u}-iron)`} strokeWidth="2" />
              <path d={`M${pts[0][0]} ${pts[0][1] - 11} L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1] - 11}`} stroke="#3a2a52" strokeWidth="1.2" />
              <path d={`M${pts[0][0]} ${pts[0][1] - 6.8} L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1] - 6.8}`} stroke="#b47cf0" strokeWidth="0.5" opacity="0.7" />
            </g>
          );
        })}
        {/* The wrought-iron candelabrum: an arched bar with a cup for each candle and a scroll at each end. */}
        <g fill="none" stroke={`url(#${u}-iron)`} strokeLinecap="round">
          <path d="M64 2 C 78 -14 122 -14 136 2" strokeWidth="3" />
          <path d="M64 2 C 58 -4 60 -12 66 -12 C 70 -12 70 -7 67 -7" strokeWidth="2" />
          <path d="M136 2 C 142 -4 140 -12 134 -12 C 130 -12 130 -7 133 -7" strokeWidth="2" />
          <path d="M100 -9 L100 4" strokeWidth="2.4" />
        </g>
        {row.map((c, i) => (
          <g key={i}>
            <path d={`M${c.x - 6} ${c.y} L${c.x + 6} ${c.y} L${c.x + 4} ${c.y + 4} L${c.x - 4} ${c.y + 4} Z`} fill={`url(#${u}-iron)`} stroke="#05020a" strokeWidth="0.6" />
            <Candle x={c.x} y={c.y} h={c.h} u={u} k={i} />
          </g>
        ))}
        {/* A candle in a sconce on each upper corner. */}
        {[
          [206, 50],
          [-6, 50],
        ].map(([x, y], i) => (
          <g key={i}>
            <path d={`M${x} ${y + 4} C ${x + (i ? 8 : -8)} ${y + 8} ${x + (i ? 6 : -6)} ${y + 16} ${x + (i ? -2 : 2)} ${y + 14}`} fill="none" stroke={`url(#${u}-iron)`} strokeWidth="2.2" strokeLinecap="round" />
            <path d={`M${x - 6} ${y} L${x + 6} ${y} L${x + 4} ${y + 4} L${x - 4} ${y + 4} Z`} fill={`url(#${u}-iron)`} stroke="#05020a" strokeWidth="0.6" />
            <Candle x={x} y={y} h={19} w={7} u={u} k={5 + i} />
          </g>
        ))}
        <Gems grad={`${u}-gem`} at={[2, 3, 4]} size={5.5} />
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={8 + ((i * 29) % 184)} cy={214 - ((i * 47) % 40)} r={0.9 + (i % 3) * 0.5} fill="#d8b0ff" className="wf-mote" style={{ ...delay(i * 0.45), animationDuration: `${3.6 + (i % 3) * 0.6}s` }} />
        ))}
      </>
    ),
  };
}

// ---------------------------------------------------------------- Rimetide Court: glacier ice, a crown of shards, icicles and frost
function Tide({ u }: { u: string }) {
  // Shards rise from inside the frame (their roots hidden behind the band), icicles hang from behind it.
  const crown = [-30, -20, -11, -3.5, 3.5, 11, 20, 30];
  return {
    back: (
      <>
        <ellipse cx="100" cy="114" rx="126" ry="138" fill={`url(#${u}-aura)`} className="wf-pulse" />
        {/* A snowflake behind the top point, peeking over the frame and turning slowly. */}
        <g transform="translate(100 -8) scale(1.15)" style={{ filter: 'drop-shadow(0 0 2px #bff0ff)' }}>
          <g className="wf-spin-slow">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <g key={a} transform={`rotate(${a})`} stroke="#ffffff" strokeLinecap="round" fill="none">
                <path d="M0 0 L0 -13" strokeWidth="1.6" />
                <path d="M0 -5 L-3.5 -8.5 M0 -5 L3.5 -8.5 M0 -9 L-2.6 -11.6 M0 -9 L2.6 -11.6" strokeWidth="1.1" />
                <path d="M0 -13 L-1.4 -14.6 L0 -16 L1.4 -14.6 Z" fill="#dff8ff" strokeWidth="0.6" />
              </g>
            ))}
            <path d="M0 -3.2 L2.8 -1.6 L2.8 1.6 L0 3.2 L-2.8 1.6 L-2.8 -1.6 Z" fill="#bff0ff" stroke="#ffffff" strokeWidth="0.6" />
          </g>
        </g>
        <g transform="translate(100 12)">
          {crown.map((dx, i) => {
            const h = 50 - Math.abs(dx) * 0.9;
            const w = 5 - Math.abs(dx) * 0.05;
            return <path key={i} d={`M${dx - w} 4 L${dx * 1.08} ${-h} L${dx + w} 4 Z`} fill={`url(#${u}-shard)`} stroke="#ffffff" strokeWidth="0.6" />;
          })}
        </g>
        {[
          [200, 57, 32],
          [0, 57, -32],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
            {[-8, 0, 8].map((dx, k) => (
              <path key={k} d={`M${dx - 3.5} 10 L${dx * 1.1} ${-(k === 1 ? 28 : 18)} L${dx + 3.5} 10 Z`} fill={`url(#${u}-shard)`} stroke="#ffffff" strokeWidth="0.5" />
            ))}
          </g>
        ))}
        {/* Icicles hanging from behind the lower edges. */}
        {[
          [22, 182, 22], [38, 192, 30], [54, 201, 18], [70, 210, 34], [86, 219, 24], [114, 219, 26], [130, 210, 34], [146, 201, 18], [162, 192, 30], [178, 182, 22],
        ].map(([x, y, h], i) => (
          <path key={i} d={`M${x - 4} ${y - 6} L${x} ${y + h} L${x + 4} ${y - 6} Z`} fill={`url(#${u}-shard)`} stroke="#ffffff" strokeWidth="0.4" className="wf-drip" style={delay(i * 0.45)} />
        ))}
      </>
    ),
    front: (
      <>
        <defs>
          <linearGradient id={`${u}-ice`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#bff0ff" />
            <stop offset="0.7" stopColor="#4fb3e6" />
            <stop offset="1" stopColor="#14466e" />
          </linearGradient>
          <radialGradient id={`${u}-aura`}>
            <stop offset="0.55" stopColor="#7fe0ff" stopOpacity="0" />
            <stop offset="0.82" stopColor="#7fe0ff" stopOpacity="0.34" />
            <stop offset="1" stopColor="#7fe0ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${u}-shard`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#3a9ad0" />
            <stop offset="0.55" stopColor="#c8f2ff" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id={`${u}-gem`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#3aa8e0" />
            <stop offset="1" stopColor="#0a3050" />
          </linearGradient>
        </defs>
        <path d={HEX} fill="none" stroke="#0a2a44" strokeWidth="13" strokeLinejoin="round" />
        <path d={HEX} fill="none" stroke={`url(#${u}-ice)`} strokeWidth="10" strokeLinejoin="round" />
        {/* Frost etched along the inside of the ice, and a sheen sliding around it. */}
        <path d={HEX} fill="none" stroke="#e8fbff" strokeWidth="0.7" strokeDasharray="3 2 1 4" transform={scaled(0.955)} opacity="0.85" />
        <path d={HEX} fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="40 600" className="wf-shine" />
        <path d={HEX} fill="none" stroke="#e8fbff" strokeWidth="0.8" transform={scaled(1.055)} opacity="0.8" />
        {/* Frost feathers creeping over the band at the corners. */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const [x, y] = VERTS[i];
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i * 60})`} stroke="#ffffff" strokeWidth="0.7" fill="none" opacity="0.85">
              <path d="M0 0 L0 -9 M0 -4 L-3 -7 M0 -4 L3 -7 M0 -7 L-2 -9 M0 -7 L2 -9" />
            </g>
          );
        })}
        <Gems grad={`${u}-gem`} at={[2, 4]} size={5.5} />
        {[0, 1].map((i) => (
          <path key={i} d={i ? 'M206 96 C 226 86 236 104 224 114 C 214 122 204 112 212 106 M206 130 C 228 122 238 142 222 150' : 'M-6 96 C -26 86 -36 104 -24 114 C -14 122 -4 112 -12 106 M-6 130 C -28 122 -38 142 -22 150'} fill="none" stroke="#9fe6ff" strokeWidth="2.4" strokeLinecap="round" className="wf-wave" style={delay(i * 0.9)} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={-20 + ((i * 31) % 240)} cy={-30} r={1 + (i % 3) * 0.45} fill="#ffffff" className="wf-snow" style={{ ...delay(i * 0.5), animationDuration: `${4 + (i % 4) * 0.7}s` }} />
        ))}
      </>
    ),
  };
}

const FACTION_DESIGNS: Record<PlayableFaction, (p: { u: string }) => { back: ReactNode; front: ReactNode }> = {
  EMBER: Ember,
  VERDANT: Verdant,
  IRON: Iron,
  ASTRAL: Astral,
  VOID: VoidFrame,
  TIDE: Tide,
};
/** Every frame by id: the six faction frames and the shop frames (src/ui/components/frames/ShopFrames.tsx). */
const DESIGNS: Record<string, (p: { u: string }) => { back: ReactNode; front: ReactNode }> = { ...FACTION_DESIGNS, ...SHOP_FRAME_DESIGNS };

/**
 * Wraps an existing hexagonal portrait element (a match hero, the Home or Profile sigil) in the
 * faction's frame, stretched to that element's box. Without a frame the child is returned as is.
 */
/** `over`: shown above the frame too (a hero's health and armor), in the same box as the child. */
export function FramedSlot({ frame, children, over, className = '' }: { frame: string | null | undefined; children: ReactNode; over?: ReactNode; className?: string }) {
  const u = `wf${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const f = frame && frame in DESIGNS ? frame : null;
  if (!f) return <>{children}</>;
  // (Without a frame the caller keeps `over` inside its own element.)
  const design = DESIGNS[f]({ u });
  return (
    <span className={`framed-slot wf-f-${f.toLowerCase()} ${className}`}>
      <svg className="wf-layer wf-back" viewBox={VIEW} preserveAspectRatio="none" aria-hidden>
        {design.back}
      </svg>
      {children}
      <svg className="wf-layer wf-front" viewBox={VIEW} preserveAspectRatio="none" aria-hidden>
        {design.front}
      </svg>
      {over && <span className="framed-over">{over}</span>}
    </span>
  );
}

/** A Warden portrait (children, sized `size` wide) inside the faction's frame. */
export function WardenFrame({ faction, size, children, className = '' }: { faction: string; size: number; children: ReactNode; className?: string }) {
  const u = `wf${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const design = DESIGNS[faction]({ u });
  return (
    <span className={`warden-frame wf-f-${faction.toLowerCase()} ${className}`} style={{ width: size, height: Math.round(size * 1.14) } as CSSProperties}>
      <svg className="wf-layer wf-back" viewBox={VIEW} aria-hidden>
        {design.back}
      </svg>
      <span className="wf-portrait">{children}</span>
      <svg className="wf-layer wf-front" viewBox={VIEW} aria-hidden>
        {design.front}
      </svg>
    </span>
  );
}
