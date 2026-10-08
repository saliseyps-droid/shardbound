import type { CSSProperties } from 'react';
import { FACTIONS } from '@/data/factions';
import type { Faction } from '@/game/types';
import { Glyph } from './Icons';

/** One portrait per playable faction: src/assets/wardens/<faction>.webp */
const modules = import.meta.glob('../../assets/wardens/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const BY_FACTION: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const name = path.split('/').pop()!.replace('.webp', '').toUpperCase();
  BY_FACTION[name] = url;
}

/** Alternative portraits: src/assets/portraits/<id>.webp */
const altModules = import.meta.glob('../../assets/portraits/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const BY_ID: Record<string, string> = {};
for (const [path, url] of Object.entries(altModules)) BY_ID[path.split('/').pop()!.replace('.webp', '')] = url;

/** Large versions for the portrait viewer (the whole oval at source resolution): src/assets/portraits/full/<id>.webp */
const fullModules = import.meta.glob('../../assets/portraits/full/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const FULL_BY_ID: Record<string, string> = {};
for (const [path, url] of Object.entries(fullModules)) FULL_BY_ID[path.split('/').pop()!.replace('.webp', '')] = url;

/** The large oval version of an alternative portrait, when there is one. */
export function fullPortraitUrl(portrait: string | null | undefined): string | undefined {
  return portrait ? FULL_BY_ID[portrait] : undefined;
}

/** The faction's default portrait, or a chosen alternative when given and known. */
export function portraitUrl(faction: Faction | null | undefined, portrait?: string | null): string | undefined {
  if (portrait && BY_ID[portrait]) return BY_ID[portrait];
  return faction ? BY_FACTION[faction] : undefined;
}

interface Props {
  faction: Faction | null | undefined;
  /** Alternative portrait id (src/data/portraits.ts); null/undefined = the faction default. */
  portrait?: string | null;
  /** Width in px for the standalone hexagon (height follows the hexagon ratio). */
  size?: number;
  /** Fill a parent that already draws a hexagon frame (the image is clipped inside it). */
  fill?: boolean;
  /** Frame inset in px when filling a parent. */
  inset?: number;
  className?: string;
  /** Glyph shown when there is no portrait (e.g. Neutral). */
  fallbackGlyph?: string;
}

/** A Warden portrait clipped to the game's hexagon, never exceeding its edges. */
export function WardenPortrait({ faction, portrait, size = 64, fill, inset = 3, className = '', fallbackGlyph }: Props) {
  const url = portraitUrl(faction, portrait);
  const info = faction ? FACTIONS[faction] : undefined;
  if (!url) {
    const glyph = fallbackGlyph ?? info?.sigil ?? 'crystal';
    return <Glyph name={glyph} size={fill ? 40 : Math.round(size * 0.5)} className={className} />;
  }
  if (fill) {
    return <img className={`warden-portrait-fill ${className}`} src={url} alt="" draggable={false} style={{ '--wp-inset': `${inset}px` } as CSSProperties} />;
  }
  return (
    <span className={`warden-portrait ${className}`} style={{ width: size, height: Math.round(size * 1.14), '--wp-ring': info?.colors.primary } as CSSProperties} aria-hidden>
      <img src={url} alt="" draggable={false} />
    </span>
  );
}
