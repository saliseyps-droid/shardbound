import type { CSSProperties } from 'react';

/**
 * Shared drawing kit for the Warden frames (faction frames in WardenFrame.tsx, shop frames in
 * ShopFrames.tsx): the portrait hexagon, the SVG box around it and a few pieces every frame uses.
 */
/** The portrait hexagon in frame units. */
export const HEX = 'M100 0 L200 57 L200 171 L100 228 L0 171 L0 57 Z';
export const VERTS: [number, number][] = [[100, 0], [200, 57], [200, 171], [100, 228], [0, 171], [0, 57]];
/** The SVG box: the portrait plus room for ornaments (18 % on the sides, 22 % above, 18 % below). */
export const VIEW = '-36 -50 272 319';
export const scaled = (s: number) => `translate(100 114) scale(${s}) translate(-100 -114)`;
export const d = (n: number) => n.toFixed(1);
export const delay = (s: number) => ({ animationDelay: `${s.toFixed(2)}s` }) as CSSProperties;

/** A bevelled band on the hexagon: dark outer edge, the metal, a fine highlight and an engraved inner line. */
export function Band({ grad, width, edge, hi, inner }: { grad: string; width: number; edge: string; hi: string; inner: string }) {
  return (
    <g>
      <path d={HEX} fill="none" stroke={edge} strokeWidth={width + 3.5} strokeLinejoin="round" />
      <path d={HEX} fill="none" stroke={`url(#${grad})`} strokeWidth={width} strokeLinejoin="round" />
      <path d={HEX} fill="none" stroke={hi} strokeWidth="0.8" strokeLinejoin="round" transform={scaled(1 + width / 230)} opacity="0.85" />
      <path d={HEX} fill="none" stroke={inner} strokeWidth="1" strokeLinejoin="round" transform={scaled(1 - width / 260)} opacity="0.9" />
    </g>
  );
}

/** Faceted gems on the given corners. */
export function Gems({ grad, at, size = 6 }: { grad: string; at: number[]; size?: number }) {
  return (
    <>
      {at.map((i) => {
        const [x, y] = VERTS[i];
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d={`M0 ${-size} L${size * 0.75} 0 L0 ${size} L${-size * 0.75} 0 Z`} fill={`url(#${grad})`} stroke="#0b0710" strokeWidth="1" />
            <path d={`M0 ${-size} L${size * 0.75} 0 L0 0 Z`} fill="#ffffff" opacity="0.35" />
          </g>
        );
      })}
    </>
  );
}

/** A filled, tapering branch along a cubic Bézier (width w0 at the start down to w1). */
export function taper(p: [number, number][], w0: number, w1: number, n = 18): string {
  const at = (t: number) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]) as [number, number];
  };
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const [x, y] = at(t);
    const [x2, y2] = at(Math.min(1, t + 0.01));
    const [x1, y1] = at(Math.max(0, t - 0.01));
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    const w = (w0 + (w1 - w0) * t) / 2;
    left.push(`${d(x + nx * w)} ${d(y + ny * w)}`);
    right.unshift(`${d(x - nx * w)} ${d(y - ny * w)}`);
  }
  return `M${left.join(' L')} L${right.join(' L')} Z`;
}


export function edgePoints(perEdge: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const [ax, ay] = VERTS[i];
    const [bx, by] = VERTS[(i + 1) % 6];
    for (let k = 0; k < perEdge; k++) {
      const t = (k + 0.5) / perEdge;
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
    }
  }
  return out;
}
export const sparkle = (r: number) => `M0 ${-r} L${r * 0.22} ${-r * 0.22} L${r} 0 L${r * 0.22} ${r * 0.22} L0 ${r} L${-r * 0.22} ${r * 0.22} L${-r} 0 L${-r * 0.22} ${-r * 0.22} Z`;
