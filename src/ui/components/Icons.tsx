import type { CSSProperties } from 'react';

/** Hand-authored glyph paths on a 24×24 grid. Original artwork. */
export const GLYPHS: Record<string, string> = {
  flame: 'M12 2c1 3.5 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3.5-.5-6 1-9Zm0 11c1 1.3 2 2.2 2 3.6a2 2 0 0 1-4 0c0-1.3 1-2.2 2-3.6Z',
  leaf: 'M20 4C10 4 4 9 4 16c0 1.3.3 2.6.8 3.7L3 21.5 4.5 23l1.8-1.8A8 8 0 0 0 10 22c7 0 11-7 10-18ZM8 18c2-4 5-7 9-9-3 3-6 6-9 9Z',
  gear: 'M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8L10.3 2ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
  star: 'M12 1.5 14.6 9H22l-6 4.5 2.3 7.5L12 16.5 5.7 21 8 13.5 2 9h7.4L12 1.5Z',
  eye: 'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  wave: 'M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2v3c-2.5 0-2.5-2-5-2s-2.5 2-5 2-2.5-2-5-2-2.5 2-5 2v-3Zm0-6c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2v3c-2.5 0-2.5-2-5-2s-2.5 2-5 2-2.5-2-5-2-2.5 2-5 2V9Z',
  compass: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.5 5.5-6 3-3 6 6-3 3-6ZM12 10.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z',
  crown: 'M3 7l4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Zm2 13h14v2H5v-2Z',
  sword: 'M19 2h3v3L11 16l1.5 1.5-1.5 1.5-1.8-1.8-3.4 3.4-2.4-2.4 3.4-3.4L5 13l1.5-1.5L8 13 19 2Z',
  scroll: 'M6 3h11a3 3 0 0 1 3 3v1h-3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-1h3V5a2 2 0 0 1 1-2Zm2 4v2h7V7H8Zm0 4v2h7v-2H8Zm0 4v2h5v-2H8Z',
  chalice: 'M5 2h14v5a7 7 0 0 1-6 6.9V18h4v2H7v-2h4v-4.1A7 7 0 0 1 5 7V2Zm2 2v3a5 5 0 0 0 10 0V4H7Z',
  tower: 'M6 2h3v2h2V2h2v2h2V2h3v6l-2 2v10h2v2H4v-2h2V10L4 8V2h2Zm5 11v7h2v-7h-2Z',
  shield: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z',
  heart: 'M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11Z',
  skull: 'M12 2a9 9 0 0 0-9 9c0 3 1.5 5 3 6v3h3v-2h2v2h2v-2h2v2h3v-3c1.5-1 3-3 3-6a9 9 0 0 0-9-9ZM8.5 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z',
  paw: 'M7 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM4 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm16 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-8-2c3 0 6 4 6 7a3 3 0 0 1-3 3c-1.2 0-2-.6-3-.6s-1.8.6-3 .6a3 3 0 0 1-3-3c0-3 3-7 6-7Z',
  wing: 'M2 18C5 8 12 3 22 2c-2 3-2 6-5 8 2 0 3-1 4-1-1 3-4 5-7 5 1 1 2 1 3 1-3 3-8 4-15 3Z',
  crystal: 'M12 1 18 7l-6 16L6 7l6-6Zm0 3.2L9 7.3h6l-3-3.1Z',
  bolt: 'M13 2 4 14h6l-2 8 10-13h-6l1-7Z',
  snow: 'M11 2h2v4.3l2.5-2.5 1.4 1.4L13 9.1V11h1.9l3.9-3.9 1.4 1.4-2.5 2.5H22v2h-4.3l2.5 2.5-1.4 1.4-3.9-3.9H13v1.9l3.9 3.9-1.4 1.4-2.5-2.5V22h-2v-4.3l-2.5 2.5-1.4-1.4 3.9-3.9V13H9.1l-3.9 3.9-1.4-1.4L6.3 13H2v-2h4.3L3.8 8.5l1.4-1.4L9.1 11H11V9.1L7.1 5.2l1.4-1.4L11 6.3V2Z',
  tentacle: 'M5 21c0-6 3-8 6-8s4-2 4-4-1-3-3-3-2 2-1 3c-3 0-4-3-2-5s6-2 8 1 1 8-3 10-5 3-5 6H5Z',
  hand: 'M8 11V4a1.5 1.5 0 0 1 3 0v6h1V2.5a1.5 1.5 0 0 1 3 0V10h1V4a1.5 1.5 0 0 1 3 0v10c0 5-3 8-7 8-3 0-5-1.5-6.5-4L3 13.5a1.5 1.5 0 0 1 2.4-1.8L8 14v-3Z',
  essence: 'M12 2c3 4 7 7 7 12a7 7 0 0 1-14 0c0-5 4-8 7-12Zm0 7c-1.5 2-3 3.2-3 5.2a3 3 0 0 0 6 0C15 12.2 13.5 11 12 9Z',
  coin: 'M12 3c5 0 9 2 9 4.5v9C21 19 17 21 12 21S3 19 3 16.5v-9C3 5 7 3 12 3Zm0 2C8 5 5 6.3 5 7.5S8 10 12 10s7-1.3 7-2.5S16 5 12 5Z',
  pack: 'M5 3h14l1 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l1-4Zm7 5-3 4 3 4 3-4-3-4Z',
  deck: 'M7 2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm-4 4v15a1 1 0 0 0 1 1h13v2H4a3 3 0 0 1-3-3V6h2Z',
  cog: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-1.5-6h3l.6 2.6 2 .9 2.3-1.4 2.1 2.1-1.4 2.3.9 2 2.6.6v3l-2.6.6-.9 2 1.4 2.3-2.1 2.1-2.3-1.4-2 .9-.6 2.6h-3l-.6-2.6-2-.9-2.3 1.4-2.1-2.1 1.4-2.3-.9-2L2 13.5v-3l2.6-.6.9-2-1.4-2.3 2.1-2.1 2.3 1.4 2-.9.6-2.6Z',
  scroll2: 'M4 4h13l3 3v13H4V4Zm3 5v2h10V9H7Zm0 4v2h10v-2H7Z',
  trophy: 'M7 2h10v2h4v3a5 5 0 0 1-5 5 5 5 0 0 1-3 2.8V18h3v2H8v-2h3v-3.2A5 5 0 0 1 8 12a5 5 0 0 1-5-5V4h4V2Zm0 4H5v1a3 3 0 0 0 2 2.8V6Zm12 0h-2v3.8A3 3 0 0 0 19 7V6Z',
  map: 'M9 3 3 5.5v15.5l6-2.5 6 2.5 6-2.5V3l-6 2.5L9 3Zm0 2.2 6 2.5v11.1l-6-2.5V5.2Z',
  person: 'M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 12c5 0 9 2.5 9 6v2H3v-2c0-3.5 4-6 9-6Z',
  home: 'M12 3 2 12h3v9h6v-6h2v6h6v-9h3L12 3Z',
  play: 'M7 3v18l14-9L7 3Z',
  clock: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm1 5h-2v6l5 3 1-1.7-4-2.3V7Z',
  history: 'M13 3a9 9 0 1 1-8.5 12h2.2A7 7 0 1 0 6 9.5L8.5 12H2V5.5l2.6 2.6A9 9 0 0 1 13 3Zm-1 4h2v5l4 2.4-1 1.7-5-3V7Z',
  hammer: 'M13 3h6l2 2-3 3-1.5-1.5L7 16l-3 5-2-2 5-3 9.5-9.5L15 5l-2-2Z',
};

export type GlyphName = keyof typeof GLYPHS;

export function Glyph({ name, size = 18, className, style, title }: { name: string; size?: number; className?: string; style?: CSSProperties; title?: string }) {
  const d = GLYPHS[name] ?? GLYPHS.crystal;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export function GoldIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="icon">
      <defs>
        <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset="1" stopColor="#c98b25" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9.5" fill="url(#gi)" stroke="#7a4f10" strokeWidth="1.2" />
      <path d="M12 6.5 15.5 12 12 17.5 8.5 12Z" fill="#9a6a1c" opacity="0.8" />
    </svg>
  );
}

export function EssenceIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="icon">
      <defs>
        <linearGradient id="ei" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0dcff" />
          <stop offset="1" stopColor="#8e4fe0" />
        </linearGradient>
      </defs>
      <path d={GLYPHS.essence} fill="url(#ei)" stroke="#4c2385" strokeWidth="0.8" />
    </svg>
  );
}

export function PackIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="icon">
      <path d={GLYPHS.pack} fill="var(--cyan)" />
    </svg>
  );
}
