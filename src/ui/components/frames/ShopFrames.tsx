import type { ReactNode } from 'react';
import { RUNES } from '@/ui/codex/CodexMarks';
import { Band, d, delay, edgePoints, Gems, HEX, scaled, sparkle, taper, VERTS } from './frameKit';

/**
 * Shop frames: Warden frames for any faction, bought with Gold (src/data/shopFrames.ts). Same
 * two-layer build as the faction frames (WardenFrame.tsx): `back` behind the portrait, `front`
 * over it. The still ones have no motion at all; the animated ones stop with reduced motion.
 */
export type FrameDesign = (p: { u: string }) => { back: ReactNode; front: ReactNode };

const CX = 100;
const CY = 114;

/** The angle (degrees) pointing out of the frame at a vertex, with 0 = up. */
const outward = (x: number, y: number) => (Math.atan2(y - CY, x - CX) * 180) / Math.PI + 90;

function Stops({ s }: { s: [number, string, number?][] }) {
  return (
    <>
      {s.map(([o, c, op], i) => (
        <stop key={i} offset={o} stopColor={c} stopOpacity={op ?? 1} />
      ))}
    </>
  );
}

// ================================================================ shared: an embossing light for metal and stone
/** Lights a shape from the upper left, as if it were raised metal or carved stone. */
function Emboss({ id, depth = 4, shine = 1, exp = 20, color = '#fff4d8' }: { id: string; depth?: number; shine?: number; exp?: number; color?: string }) {
  return (
    <filter id={id} x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="blur" />
      <feSpecularLighting in="blur" surfaceScale={depth} specularConstant={shine} specularExponent={exp} lightingColor={color} result="spec">
        <feDistantLight azimuth="225" elevation="42" />
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="lit" />
      <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="0" k2="1" k3="0.9" k4="0" />
    </filter>
  );
}
const GOLD: [number, string][] = [[0, '#fff6c8'], [0.28, '#f2c860'], [0.62, '#b07a22'], [1, '#4a2e08']];

// ================================================================ Aurora (animated)
/** A wavy band round the top of the frame, r out from the centre, from angle a0 to a1. */
function auroraBand(r: number, a0: number, a1: number, phase: number, amp: number, n = 40): string {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = a0 + (a1 - a0) * t;
    const rr = r + Math.sin(t * 7 + phase) * amp + Math.sin(t * 15 + phase * 1.7) * amp * 0.35;
    pts.push(`${d(CX + Math.cos(a) * rr * 1.08)} ${d(CY + Math.sin(a) * rr)}`);
  }
  return `M${pts.join(' L')}`;
}
const AURORA_BANDS = [
  { r: 130, a0: -3.1, a1: -0.05, w: 22, g: 'a', amp: 7, dur: 11 },
  { r: 142, a0: -2.85, a1: -0.3, w: 16, g: 'b', amp: 9, dur: 14 },
  { r: 120, a0: -2.5, a1: -0.65, w: 12, g: 'a', amp: 5, dur: 8 },
];
const Aurora: FrameDesign = ({ u }) => ({
  back: (
    <>
      <defs>
        <linearGradient id={`${u}-ga`} gradientUnits="userSpaceOnUse" x1="-36" y1="0" x2="236" y2="0"><Stops s={[[0, '#3cf0a0', 0], [0.12, '#3cf0a0', 0.95], [0.32, '#6affc8', 1], [0.5, '#9ef8ff', 1], [0.68, '#6affc8', 1], [0.88, '#3cf0a0', 0.95], [1, '#3cf0a0', 0]]} /></linearGradient>
        <linearGradient id={`${u}-gb`} gradientUnits="userSpaceOnUse" x1="-36" y1="0" x2="236" y2="0"><Stops s={[[0, '#ff8ae0', 0], [0.2, '#ff8ae0', 0.8], [0.5, '#c890ff', 0.9], [0.8, '#ff8ae0', 0.8], [1, '#ff8ae0', 0]]} /></linearGradient>
        <filter id={`${u}-haze`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={`${u}-glow`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>
      {/* The wide haze of each band, and a brighter core inside it. */}
      {AURORA_BANDS.map((b, i) => {
        const v = [0, 2.1, 4.3, 0].map((ph) => auroraBand(b.r, b.a0, b.a1, i + ph, b.amp)).join(';');
        return (
          <g key={i}>
            <path d={auroraBand(b.r, b.a0, b.a1, i, b.amp)} fill="none" stroke={`url(#${u}-g${b.g})`} strokeWidth={b.w * 2} strokeLinecap="round" opacity="0.5" filter={`url(#${u}-haze)`}>
              <animate attributeName="d" dur={`${b.dur}s`} repeatCount="indefinite" values={v} />
            </path>
            <path d={auroraBand(b.r, b.a0, b.a1, i, b.amp)} fill="none" stroke={`url(#${u}-g${b.g})`} strokeWidth={b.w * 0.45} strokeLinecap="round" opacity="0.85" filter={`url(#${u}-glow)`}>
              <animate attributeName="d" dur={`${b.dur}s`} repeatCount="indefinite" values={v} />
            </path>
          </g>
        );
      })}
      {/* Faint rays rising out of the light, shimmering one by one. */}
      {Array.from({ length: 34 }, (_, i) => {
        const a = -3.0 + (i / 33) * 2.9;
        const r0 = 118 + Math.sin(i * 1.7) * 6;
        const len = 22 + Math.abs(Math.sin(i * 2.3)) * 26;
        return (
          <path key={i} d={`M${d(CX + Math.cos(a) * r0 * 1.08)} ${d(CY + Math.sin(a) * r0)} L${d(CX + Math.cos(a) * (r0 + len) * 1.08)} ${d(CY + Math.sin(a) * (r0 + len))}`} stroke="#c8ffe8" strokeWidth="1.6" strokeLinecap="round" filter={`url(#${u}-glow)`} className="wf-glimmer" style={delay((i * 0.41) % 4.5)} />
        );
      })}
    </>
  ),
  front: (
    <>
      <defs>
        <linearGradient id={`${u}-silver`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#ffffff'], [0.4, '#cfe0ec'], [0.75, '#6a8494'], [1, '#1a2a34']]} /></linearGradient>
        <linearGradient id={`${u}-night`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#2a4a7a'], [0.5, '#0e1a3a'], [1, '#040814']]} /></linearGradient>
        <linearGradient id={`${u}-gem`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#e8fff4'], [0.5, '#2ad8a0'], [1, '#06402c']]} /></linearGradient>
        <Emboss id={`${u}-emb`} depth={3} shine={1} exp={26} color="#e8f6ff" />
      </defs>
      <g filter={`url(#${u}-emb)`}>
        <path d={HEX} fill="none" stroke="#020610" strokeWidth="14" strokeLinejoin="round" />
        <path d={HEX} fill="none" stroke={`url(#${u}-silver)`} strokeWidth="12" strokeLinejoin="round" />
        <path d={HEX} fill="none" stroke={`url(#${u}-night)`} strokeWidth="7" strokeLinejoin="round" />
        <path d="M106 -16 A 15 15 0 1 0 106 14 A 11.5 11.5 0 1 1 106 -16 Z" fill={`url(#${u}-silver)`} stroke="#1a2a34" strokeWidth="0.8" />
      </g>
      {edgePoints(3).map(([x, y], i) => (
        <path key={i} d={sparkle(2.2)} transform={`translate(${d(x)} ${d(y)})`} fill="#e8f6ff" className="wf-twinkle" style={delay(i * 0.23)} />
      ))}
      <path d={HEX} fill="none" stroke="#6af8c0" strokeWidth="1.4" opacity="0.8" transform={scaled(0.955)} className="wf-pulse" />
      <path d={HEX} fill="none" stroke="#ffffff" strokeWidth="2.4" strokeDasharray="30 610" className="wf-shine" />
      <Gems grad={`${u}-gem`} at={[2, 4]} size={5.5} />
      {Array.from({ length: 14 }, (_, i) => {
        const x = -26 + ((i * 47) % 252);
        const y = 150 + ((i * 71) % 110);
        return <path key={i} d={sparkle(i % 4 ? 1.8 : 3)} transform={`translate(${x} ${y})`} fill="#ffffff" className="wf-twinkle" style={delay(i * 0.37)} />;
      })}
    </>
  ),
});

// ================================================================ Silver Obsidian (still)
function Filigree({ x, y, big, u }: { x: number; y: number; big?: boolean; u: string }) {
  const s = big ? 1.35 : 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${d(outward(x, y))}) scale(${s})`}>
      {[-1, 1].map((k) => (
        <path key={k} d="M0 -3 C -5 -11 -17 -12 -18 -4 C -18.5 1 -12 2.5 -10.5 -1.5 C -9.5 -4 -12.5 -5.5 -14 -3.6" transform={`scale(${k} 1)`} fill="none" stroke={`url(#${u}-silver)`} strokeWidth="2.2" strokeLinecap="round" />
      ))}
      <path d="M0 -4 L3.4 -13 L0 -24 L-3.4 -13 Z" fill={`url(#${u}-silver)`} stroke="#14161c" strokeWidth="0.7" />
      <circle cy="-2" r="2.2" fill="#e8ecf4" stroke="#14161c" strokeWidth="0.5" />
    </g>
  );
}
const Obsidian: FrameDesign = ({ u }) => {
  const runes: ReactNode[] = [];
  VERTS.forEach(([ax, ay], e) => {
    const [bx, by] = VERTS[(e + 1) % 6];
    const a = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    for (let k = 0; k < 5; k++) {
      const t = 0.22 + k * 0.14;
      runes.push(
        <path key={`${e}-${k}`} d={RUNES[(e * 5 + k * 7) % RUNES.length]} transform={`translate(${d(ax + (bx - ax) * t)} ${d(ay + (by - ay) * t)}) rotate(${d(a)}) rotate(90) scale(0.42) translate(-5 -7)`} fill="none" stroke="#dfe4ee" strokeWidth="2" strokeLinecap="round" opacity="0.75" />,
      );
    }
  });
  return {
    back: <ellipse cx={CX} cy={CY} rx="126" ry="140" fill={`url(#${u}-aura)`} />,
    front: (
      <>
        <defs>
          <linearGradient id={`${u}-obs`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#5a5a6a'], [0.18, '#1c1c24'], [0.55, '#08080c'], [0.8, '#26262e'], [1, '#000000']]} /></linearGradient>
          <linearGradient id={`${u}-silver`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#ffffff'], [0.35, '#c8ccd8'], [0.7, '#727888'], [1, '#2a2e38']]} /></linearGradient>
          <linearGradient id={`${u}-moon`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#ffffff'], [0.45, '#b8dcff'], [1, '#3a5a8a']]} /></linearGradient>
          <radialGradient id={`${u}-aura`}><Stops s={[[0.6, '#c8d8ff', 0], [0.86, '#c8d8ff', 0.2], [1, '#c8d8ff', 0]]} /></radialGradient>
        </defs>
        <Band grad={`${u}-obs`} width={13} edge="#000000" hi="#eef2fa" inner="#9aa0b0" />
        {/* A gloss on the upper-left edges, as on polished stone. */}
        <path d="M2 150 L2 60 L100 4" fill="none" stroke="#ffffff" strokeWidth="2.2" opacity="0.22" transform={scaled(1.0)} />
        <path d={HEX} fill="none" stroke={`url(#${u}-silver)`} strokeWidth="1.4" transform={scaled(1.07)} />
        <path d={HEX} fill="none" stroke={`url(#${u}-silver)`} strokeWidth="1" transform={scaled(0.935)} />
        {runes}
        {VERTS.map(([x, y], i) => (
          <Filigree key={i} x={x} y={y} big={i === 0} u={u} />
        ))}
        <Gems grad={`${u}-moon`} at={[0]} size={7.5} />
      </>
    ),
  };
};

// ================================================================ Royal Purple (still)
function Banner({ x, u }: { x: number; u: string }) {
  return (
    <g transform={`translate(${x} 62)`}>
      <path d="M-15 0 L15 0" stroke={`url(#${u}-gold)`} strokeWidth="3" strokeLinecap="round" />
      <circle cx="-16" r="2.6" fill={`url(#${u}-gold)`} stroke="#3a2508" strokeWidth="0.6" />
      <circle cx="16" r="2.6" fill={`url(#${u}-gold)`} stroke="#3a2508" strokeWidth="0.6" />
      <path d="M-12 2 L12 2 L12 76 L0 66 L-12 76 Z" fill={`url(#${u}-velvet)`} stroke={`url(#${u}-gold)`} strokeWidth="1.6" />
      <path d="M-9 5 L9 5 L9 70 L0 62 L-9 70 Z" fill="none" stroke="#e8c070" strokeWidth="0.5" opacity="0.7" />
      <path d={sparkle(7)} transform="translate(0 30)" fill={`url(#${u}-gold)`} stroke="#3a2508" strokeWidth="0.5" />
      <circle cy="30" r="2" fill="#ffffff" opacity="0.6" />
      {[-16, 16].map((tx) => (
        <g key={tx}>
          <path d={`M${tx} 2 L${tx} 14`} stroke="#e8c070" strokeWidth="0.8" />
          <path d={`M${tx - 2.5} 14 L${tx + 2.5} 14 L${tx + 1.5} 24 L${tx - 1.5} 24 Z`} fill={`url(#${u}-gold)`} stroke="#3a2508" strokeWidth="0.4" />
        </g>
      ))}
    </g>
  );
}
const Royal: FrameDesign = ({ u }) => ({
  back: <ellipse cx={CX} cy={CY} rx="128" ry="142" fill={`url(#${u}-aura)`} />,
  front: (
    <>
      <defs>
        <linearGradient id={`${u}-gold`} x1="0" y1="0" x2="1" y2="1"><Stops s={GOLD} /></linearGradient>
        <linearGradient id={`${u}-velvet`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#c070f0'], [0.35, '#7a24b0'], [0.75, '#4a0c78'], [1, '#22043a']]} /></linearGradient>
        <linearGradient id={`${u}-ruby`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#ffd8d8'], [0.45, '#d81830'], [1, '#3a0008']]} /></linearGradient>
        <linearGradient id={`${u}-sapph`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#d8e8ff'], [0.45, '#2a5ad8'], [1, '#08143a']]} /></linearGradient>
        <radialGradient id={`${u}-aura`}><Stops s={[[0.6, '#b060ff', 0], [0.86, '#b060ff', 0.24], [1, '#b060ff', 0]]} /></radialGradient>
      </defs>
      <Banner x={218} u={u} />
      <Banner x={-18} u={u} />
      <Band grad={`${u}-velvet`} width={13} edge="#14031f" hi="#f0d8ff" inner="#22043a" />
      <path d={HEX} fill="none" stroke={`url(#${u}-gold)`} strokeWidth="2" transform={scaled(1.064)} />
      <path d={HEX} fill="none" stroke={`url(#${u}-gold)`} strokeWidth="1.6" transform={scaled(0.94)} />
      {edgePoints(2).map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.4" fill={`url(#${u}-gold)`} stroke="#3a2508" strokeWidth="0.6" />
          <circle cx={x - 1} cy={y - 1} r="1.2" fill="#fffbe0" />
        </g>
      ))}
      {/* The crown on the top point. */}
      <g transform="translate(100 -3)">
        <path d="M-24 4 L-26 -14 L-15 -6 L-8 -24 L0 -10 L8 -24 L15 -6 L26 -14 L24 4 Z" fill={`url(#${u}-gold)`} stroke="#3a2508" strokeWidth="1" />
        <path d="M-24 4 L24 4 L23 9 L-23 9 Z" fill={`url(#${u}-gold)`} stroke="#3a2508" strokeWidth="1" />
        <path d="M-20 -2 L20 -2" stroke="#fff3c0" strokeWidth="0.6" opacity="0.7" />
        {[-26, -8, 8, 26].map((x, i) => (
          <circle key={i} cx={x} cy={i === 0 || i === 3 ? -15 : -25} r="2.3" fill="#fbf4e8" stroke="#8a7a5a" strokeWidth="0.5" />
        ))}
        <circle cx="0" cy="-12" r="2.6" fill="#fbf4e8" stroke="#8a7a5a" strokeWidth="0.5" />
        <path d="M0 -2 L4 3 L0 8 L-4 3 Z" transform="translate(0 -1)" fill={`url(#${u}-ruby)`} stroke="#1a0004" strokeWidth="0.6" />
        <path d="M-13 1 L-10 4.5 L-13 8 L-16 4.5 Z" fill={`url(#${u}-sapph)`} stroke="#04081a" strokeWidth="0.5" />
        <path d="M13 1 L16 4.5 L13 8 L10 4.5 Z" fill={`url(#${u}-sapph)`} stroke="#04081a" strokeWidth="0.5" />
      </g>
      {/* A small gold fleuron under the bottom point. */}
      <g transform="translate(100 230)">
        <path d="M0 -2 L4 4 L0 12 L-4 4 Z" fill={`url(#${u}-gold)`} stroke="#3a2508" strokeWidth="0.7" />
        {[-1, 1].map((k) => (
          <path key={k} d="M2 4 C 8 2 13 6 11 10 C 9 13 6 11 7 9" transform={`scale(${k} 1)`} fill="none" stroke={`url(#${u}-gold)`} strokeWidth="1.8" strokeLinecap="round" />
        ))}
      </g>
      <Gems grad={`${u}-ruby`} at={[2, 4]} size={5} />
    </>
  ),
});

// ================================================================ Shadow Wings (animated)
function Wing({ u, flip }: { u: string; flip: boolean }) {
  // Drawn for the left wing (shoulder at 26, 70); the right one is its mirror.
  const sx = 26;
  const sy = 70;
  const feather = (a: number, len: number, w: number, key: string, tone: string, bend = 6) => {
    const r = (a * Math.PI) / 180;
    const ex = sx + Math.cos(r) * len;
    const ey = sy + Math.sin(r) * len;
    const px = -Math.sin(r) * bend;
    const py = Math.cos(r) * bend;
    const p: [number, number][] = [
      [sx, sy],
      [sx + Math.cos(r) * len * 0.35 + px, sy + Math.sin(r) * len * 0.35 + py],
      [sx + Math.cos(r) * len * 0.75 + px, sy + Math.sin(r) * len * 0.75 + py],
      [ex, ey],
    ];
    return (
      <g key={key}>
        <path d={taper(p, w, 1.2, 20)} fill={`url(#${u}-${tone})`} stroke="#a898d8" strokeWidth="0.5" strokeOpacity="0.6" />
        <path d={`M${d(p[1][0])} ${d(p[1][1])} Q ${d(p[2][0])} ${d(p[2][1])} ${d(ex)} ${d(ey)}`} fill="none" stroke="#7a62b8" strokeWidth="0.6" opacity="0.7" />
      </g>
    );
  };
  const primaries = Array.from({ length: 10 }, (_, i) => feather(188 + i * 8.2, 74 + Math.sin((i / 9) * Math.PI) * 26 + i * 1.5, 11, `p${i}`, 'f1'));
  const secondaries = Array.from({ length: 8 }, (_, i) => feather(184 + i * 9.5, 46 + Math.sin((i / 7) * Math.PI) * 12, 12, `s${i}`, 'f2', 4));
  const coverts = Array.from({ length: 7 }, (_, i) => feather(190 + i * 10, 26, 11, `c${i}`, 'f3', 2));
  return (
    <g transform={flip ? 'translate(200 0) scale(-1 1)' : undefined}>
      <g>
        <animateTransform attributeName="transform" type="rotate" values={`0 ${sx} ${sy};8 ${sx} ${sy};0 ${sx} ${sy}`} keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="4.6s" repeatCount="indefinite" />
        {primaries}
        {secondaries}
        {coverts}
      </g>
    </g>
  );
}
const Wings: FrameDesign = ({ u }) => ({
  back: (
    <>
      <defs>
        <linearGradient id={`${u}-f1`} x1="0" y1="0" x2="1" y2="0"><Stops s={[[0, '#1a1426'], [0.6, '#2c2240'], [1, '#4a3a6e']]} /></linearGradient>
        <linearGradient id={`${u}-f2`} x1="0" y1="0" x2="1" y2="0"><Stops s={[[0, '#120e1c'], [0.7, '#241c36'], [1, '#3a2e58']]} /></linearGradient>
        <linearGradient id={`${u}-f3`} x1="0" y1="0" x2="1" y2="0"><Stops s={[[0, '#0c0a14'], [1, '#2a2240']]} /></linearGradient>
        <radialGradient id={`${u}-aura`}><Stops s={[[0.55, '#8a5aff', 0], [0.85, '#7a4aef', 0.32], [1, '#7a4aef', 0]]} /></radialGradient>
      </defs>
      <ellipse cx={CX} cy={CY} rx="132" ry="146" fill={`url(#${u}-aura)`} className="wf-pulse" />
      <Wing u={u} flip={false} />
      <Wing u={u} flip />
    </>
  ),
  front: (
    <>
      <defs>
        <linearGradient id={`${u}-band`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#9a8ab8'], [0.3, '#4a3e62'], [0.7, '#1c1628'], [1, '#06040a']]} /></linearGradient>
        <linearGradient id={`${u}-gem`} x1="0" y1="0" x2="1" y2="1"><Stops s={[[0, '#f0d8ff'], [0.5, '#8a3ae0'], [1, '#1a0438']]} /></linearGradient>
      </defs>
      <Band grad={`${u}-band`} width={10} edge="#030206" hi="#d8c8ff" inner="#2a2040" />
      {/* Feather marks engraved along the band. */}
      {edgePoints(4).map(([x, y], i) => (
        <path key={i} d="M0 -4 Q 2 0 0 4 Q -2 0 0 -4 Z" transform={`translate(${d(x)} ${d(y)}) rotate(${d(outward(x, y) + 90)})`} fill="#b8a8e8" opacity="0.55" />
      ))}
      <path d={HEX} fill="none" stroke="#c8a8ff" strokeWidth="2.2" strokeDasharray="26 620" className="wf-shine" />
      <Gems grad={`${u}-gem`} at={[0]} size={8} />
      <Gems grad={`${u}-gem`} at={[2, 4]} size={5} />
      {[
        [-14, 40, 0], [214, 46, 1.6], [-26, 110, 3.1], [222, 120, 4.4],
      ].map(([x, y, at], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0 C 3 -4 3 -10 0 -16 C -3 -10 -3 -4 0 0 Z M0 0 L0 4" fill="#2c2240" stroke="#a898d8" strokeWidth="0.5" className="wf-fall" style={delay(at)} />
        </g>
      ))}
    </>
  ),
});


export const SHOP_FRAME_DESIGNS: Record<string, FrameDesign> = {
  obsidian: Obsidian,
  royal: Royal,
  aurora: Aurora,
  wings: Wings,
};
