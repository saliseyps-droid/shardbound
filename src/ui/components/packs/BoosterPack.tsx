import type { CSSProperties } from 'react';
import { SET_INFO } from '@/config/economy';
import type { SetId } from '@/game/types';

/** Per-set wrapper palette. Original artwork: foil wrapper with a crystal emblem. */
export const PACK_THEME: Record<SetId, { a: string; b: string; c: string; glow: string; emblem: string }> = {
  CORE: { a: '#f6cf7a', b: '#b77d22', c: '#2a1f48', glow: '#72dfe6', emblem: '#72dfe6' },
  DEEP: { a: '#6fe0d4', b: '#1f6f7a', c: '#231640', glow: '#b565ff', emblem: '#c59bff' },
};

export function BoosterPack({ setId, width = 180, className = '', style }: { setId: SetId; width?: number; className?: string; style?: CSSProperties }) {
  const t = PACK_THEME[setId];
  const id = `bp-${setId}`;
  const name = SET_INFO[setId].name;
  return (
    <div className={`booster ${className}`} style={{ width, ...style }} role="img" aria-label={`${name} booster pack`}>
      <svg viewBox="0 0 200 300" width="100%" height="100%" aria-hidden>
        <defs>
          <linearGradient id={`${id}-wrap`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={t.a} />
            <stop offset="0.45" stopColor={t.b} />
            <stop offset="1" stopColor={t.c} />
          </linearGradient>
          <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="0.5" cy="0.45" r="0.5">
            <stop offset="0" stopColor={t.glow} stopOpacity="0.9" />
            <stop offset="1" stopColor={t.glow} stopOpacity="0" />
          </radialGradient>
          {/* user-space coordinates: the trident's straight strokes have a zero-width bounding box */}
          <linearGradient id={`${id}-metal`} gradientUnits="userSpaceOnUse" x1="-40" y1="-95" x2="40" y2="75">
            <stop offset="0" stopColor="#f4fdff" />
            <stop offset="0.4" stopColor={t.a} />
            <stop offset="1" stopColor={t.b} />
          </linearGradient>
          <clipPath id={`${id}-clip`}>
            <path d="M14 0 H186 L200 14 V286 L186 300 H14 L0 286 V14 Z" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-clip)`}>
          <rect width="200" height="300" fill={`url(#${id}-wrap)`} />
          {/* diagonal facets */}
          <path d="M0 60 L200 20 L200 120 L0 170 Z" fill="#fff" opacity="0.06" />
          <path d="M0 210 L200 160 L200 230 L0 280 Z" fill="#000" opacity="0.12" />
          <circle cx="100" cy="135" r="80" fill={`url(#${id}-glow)`} opacity="0.55" />
          {setId === 'DEEP' ? (
            /* trident rising from the waves */
            <g transform="translate(100 140)">
              {/* scalloped waves behind the shaft */}
              <g fill="none" strokeLinecap="round">
                <path d="M-66 30 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0" stroke={t.emblem} strokeWidth="2.6" opacity="0.55" />
                <path d="M-55 44 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0" stroke={t.a} strokeWidth="2.2" opacity="0.45" />
                <path d="M-44 57 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0 a11 11 0 0 1 22 0" stroke={t.emblem} strokeWidth="1.8" opacity="0.3" />
              </g>
              {/* dark contour, then polished metal on top */}
              {[{ stroke: t.c, w: 9 }, { stroke: `url(#${id}-metal)`, w: 4.6 }].map(({ stroke, w }, k) => (
                <g key={k} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M0 -8 V62" />
                  <path d="M-29 -20 Q0 -6 29 -20" />
                  <path d="M0 -14 V-64" />
                  <path d="M-27 -19 C-33 -34 -33 -48 -27 -60" />
                  <path d="M27 -19 C33 -34 33 -48 27 -60" />
                </g>
              ))}
              {/* blade tips */}
              <g fill={`url(#${id}-metal)`} stroke={t.c} strokeWidth="2" strokeLinejoin="round">
                <path d="M0 -92 C8 -80 9 -70 0 -62 C-9 -70 -8 -80 0 -92 Z" />
                <path d="M-26 -80 C-19 -71 -19 -64 -25 -58 C-32 -62 -33 -70 -26 -80 Z" />
                <path d="M26 -80 C19 -71 19 -64 25 -58 C32 -62 33 -70 26 -80 Z" />
                <path d="M-33 -52 L-41 -58 L-33 -44 Z" />
                <path d="M33 -52 L41 -58 L33 -44 Z" />
                <path d="M0 58 L6 66 L0 76 L-6 66 Z" />
              </g>
              {/* grip bands */}
              {[14, 22, 30].map((y) => (
                <rect key={y} x="-5" y={y} width="10" height="3.2" rx="1.2" fill={t.c} opacity="0.85" />
              ))}
              <path d="M0 -88 C3 -80 4 -74 0 -68" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
              <circle cy="-12" r="6.5" fill={t.c} />
              <circle cy="-12" r="4.6" fill={t.glow} />
              <circle cx="-1.6" cy="-13.8" r="1.6" fill="#fff" opacity="0.9" />
              {[[-40, 6, 2.2], [-46, -8, 1.4], [44, 2, 2], [38, -14, 1.3], [-36, -30, 1]].map(([x, y, r], k) => (
                <circle key={k} cx={x} cy={y} r={r} fill="none" stroke={t.emblem} strokeWidth="0.9" opacity="0.7" />
              ))}
            </g>
          ) : (
            /* crystal emblem */
            <g transform="translate(100 135)">
              <path d="M0 -62 L34 -20 L14 58 L-14 58 L-34 -20 Z" fill={t.c} stroke={t.emblem} strokeWidth="3" />
              <path d="M0 -62 L12 -20 L0 58 L-12 -20 Z" fill={t.emblem} opacity="0.75" />
              <path d="M-34 -20 H34" stroke={t.emblem} strokeWidth="2" opacity="0.7" />
            </g>
          )}
          {/* crimp strips */}
          <rect y="0" width="200" height="16" fill="#000" opacity="0.28" />
          <rect y="284" width="200" height="16" fill="#000" opacity="0.28" />
          {Array.from({ length: 20 }, (_, i) => (
            <rect key={i} x={i * 10 + 2} y="3" width="5" height="10" fill="#fff" opacity="0.12" />
          ))}
          {/* name banner */}
          <path d="M16 222 H184 L176 256 H24 Z" fill={t.c} opacity="0.88" />
          <text x="100" y="244" textAnchor="middle" fontFamily="Almendra, Georgia, serif" fontWeight="700" fontSize={name.length > 12 ? 13 : 20} fill="#fff4d6">
            {name}
          </text>
          <text x="100" y="274" textAnchor="middle" fontFamily="Alegreya Sans, sans-serif" fontSize="11" fill="#fff4d6" opacity="0.8">
            Five cards inside
          </text>
          <rect className="booster-sheen" x="-200" y="0" width="160" height="300" fill={`url(#${id}-foil)`} transform="skewX(-18)" />
        </g>
        <path d="M14 0 H186 L200 14 V286 L186 300 H14 L0 286 V14 Z" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
      </svg>
    </div>
  );
}
