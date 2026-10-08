import { createRng, hashString, nextFloat, nextInt } from '@/core/rng';
import { FACTIONS } from '@/data/factions';
import type { CardDefinition } from '@/game/types';
import { GLYPHS } from './Icons';
import { CARD_ART_FOCUS } from './cardArtFocus';
import { figureSvg } from './unitFigures';

/** Painted artwork, one per card id: src/assets/cards/<id>.webp (4:5 portrait). */
const PAINTED = import.meta.glob('../../assets/cards/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export function paintedArtUrl(card: CardDefinition): string | undefined {
  return PAINTED[`../../assets/cards/${card.id}.webp`];
}

/** object-position for painted art shown in a frame wider than the 4:5 source. */
export function cardArtPosition(card: CardDefinition): string {
  return `50% ${CARD_ART_FOCUS[card.id] ?? 40}%`;
}

/**
 * Procedural, deterministic card artwork. Each faction has a distinct palette,
 * landscape and sigil vocabulary; the card id seeds composition details.
 * Output is cached as a data URI so <img> can decode lazily.
 */

const TAG_GLYPH: Record<string, string> = {
  Drake: 'wing',
  Dragon: 'wing',
  Fae: 'crystal',
  Beast: 'paw',
  Construct: 'gear',
  Elemental: 'flame',
  Mage: 'star',
  Undead: 'skull',
  Wraith: 'eye',
  Spirit: 'crystal',
  Leviathan: 'tentacle',
  Treant: 'leaf',
  Knight: 'shield',
  Soldier: 'sword',
};

const TYPE_GLYPH: Record<string, string> = { SPELL: 'bolt', RELIC: 'chalice', LOCATION: 'tower' };

const FACTION_LANDSCAPE: Record<string, 'peaks' | 'hills' | 'city' | 'clouds' | 'chasm' | 'waves' | 'road'> = {
  EMBER: 'peaks',
  VERDANT: 'hills',
  IRON: 'city',
  ASTRAL: 'clouds',
  VOID: 'chasm',
  TIDE: 'waves',
  NEUTRAL: 'road',
};

export function glyphFor(card: CardDefinition): string {
  for (const t of card.tags ?? []) if (TAG_GLYPH[t]) return TAG_GLYPH[t];
  if (TYPE_GLYPH[card.cardType]) return TYPE_GLYPH[card.cardType];
  return FACTIONS[card.faction]?.sigil ?? 'crystal';
}

function landscape(kind: string, rng: ReturnType<typeof createRng>, fill: string, fill2: string): string {
  const w = 200;
  const h = 140;
  const parts: string[] = [];
  switch (kind) {
    case 'peaks': {
      let d = `M0 ${h} L0 ${h - 40}`;
      for (let x = 0; x <= w; x += 25) d += ` L${x + 12} ${h - 55 - nextInt(rng, 0, 40)} L${x + 25} ${h - 35 - nextInt(rng, 0, 15)}`;
      parts.push(`<path d="${d} L${w} ${h} Z" fill="${fill}" opacity="0.9"/>`);
      parts.push(`<path d="M0 ${h} L0 ${h - 18} Q50 ${h - 35} 100 ${h - 20} T200 ${h - 22} L200 ${h} Z" fill="${fill2}"/>`);
      break;
    }
    case 'hills':
      parts.push(`<path d="M0 ${h} L0 ${h - 45} Q40 ${h - 80} 90 ${h - 55} T200 ${h - 60} L200 ${h} Z" fill="${fill}" opacity="0.85"/>`);
      parts.push(`<path d="M0 ${h} L0 ${h - 22} Q60 ${h - 50} 120 ${h - 28} T200 ${h - 30} L200 ${h} Z" fill="${fill2}"/>`);
      for (let i = 0; i < 5; i++) {
        const x = nextInt(rng, 5, 195);
        const y = h - 30 - nextInt(rng, 0, 20);
        parts.push(`<path d="M${x} ${y} l-7 16 h14 Z" fill="${fill2}" opacity="0.9"/>`);
      }
      break;
    case 'city': {
      let x = 0;
      while (x < w) {
        const bw = nextInt(rng, 12, 26);
        const bh = nextInt(rng, 25, 70);
        parts.push(`<rect x="${x}" y="${h - bh}" width="${bw - 2}" height="${bh}" fill="${fill}" opacity="0.85"/>`);
        if (nextFloat(rng) < 0.4) parts.push(`<rect x="${x + bw / 2 - 2}" y="${h - bh - 14}" width="4" height="14" fill="${fill}"/>`);
        x += bw;
      }
      parts.push(`<rect x="0" y="${h - 14}" width="${w}" height="14" fill="${fill2}"/>`);
      break;
    }
    case 'clouds':
      for (let i = 0; i < 6; i++) {
        const cx = nextInt(rng, 0, w);
        const cy = h - nextInt(rng, 5, 40);
        parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${nextInt(rng, 30, 60)}" ry="${nextInt(rng, 10, 18)}" fill="${i % 2 ? fill : fill2}" opacity="0.8"/>`);
      }
      break;
    case 'chasm':
      parts.push(`<path d="M0 ${h} L0 ${h - 50} L70 ${h - 30} L85 ${h} Z" fill="${fill}"/>`);
      parts.push(`<path d="M200 ${h} L200 ${h - 55} L125 ${h - 32} L112 ${h} Z" fill="${fill}"/>`);
      parts.push(`<ellipse cx="100" cy="${h - 4}" rx="22" ry="8" fill="${fill2}" opacity="0.9"/>`);
      break;
    case 'waves':
      for (let i = 0; i < 3; i++) {
        const y = h - 45 + i * 16;
        parts.push(`<path d="M0 ${y} Q25 ${y - 10} 50 ${y} T100 ${y} T150 ${y} T200 ${y} L200 ${h} L0 ${h} Z" fill="${i === 2 ? fill2 : fill}" opacity="${0.55 + i * 0.2}"/>`);
      }
      break;
    default:
      parts.push(`<path d="M0 ${h} L0 ${h - 30} Q100 ${h - 50} 200 ${h - 30} L200 ${h} Z" fill="${fill}"/>`);
      parts.push(`<path d="M80 ${h} L96 ${h - 38} L104 ${h - 38} L120 ${h} Z" fill="${fill2}" opacity="0.8"/>`);
  }
  return parts.join('');
}

const cache = new Map<string, string>();

export function cardArtUri(card: CardDefinition): string {
  return paintedArtUrl(card) ?? proceduralArtUri(card);
}

/** The generated artwork (used when no painted art exists, or the painted art fails to load). */
export function proceduralArtUri(card: CardDefinition): string {
  const cached = cache.get(card.id);
  if (cached) return cached;
  const f = FACTIONS[card.faction] ?? FACTIONS.NEUTRAL;
  const rng = createRng(hashString(card.artwork ?? card.id));
  const { primary, secondary, glow, dark } = f.colors;
  const id = 'a';
  const shards: string[] = [];
  const shardCount = nextInt(rng, 3, 6);
  for (let i = 0; i < shardCount; i++) {
    const x = nextInt(rng, 5, 195);
    const top = nextInt(rng, 8, 60);
    const wHalf = nextInt(rng, 5, 14);
    const tilt = nextInt(rng, -8, 8);
    shards.push(`<path d="M${x + tilt} ${top} L${x + wHalf} ${top + 40} L${x} ${top + 95} L${x - wHalf} ${top + 40} Z" fill="${secondary}" opacity="${(0.08 + nextFloat(rng) * 0.14).toFixed(2)}"/>`);
  }
  const stars: string[] = [];
  for (let i = 0; i < 14; i++) {
    stars.push(`<circle cx="${nextInt(rng, 0, 200)}" cy="${nextInt(rng, 0, 90)}" r="${(0.4 + nextFloat(rng) * 1.3).toFixed(1)}" fill="${glow}" opacity="${(0.3 + nextFloat(rng) * 0.6).toFixed(2)}"/>`);
  }
  const glyph = GLYPHS[glyphFor(card)] ?? GLYPHS.crystal;
  // Units show a character figure; other types keep the central emblem.
  const figure = card.cardType === 'UNIT' ? figureSvg(card, rng, { dark, glow, secondary }, id) : null;
  const gx = figure ? 100 : 100 + nextInt(rng, -14, 14);
  const gy = figure ? figure.headY : 58 + nextInt(rng, -6, 6);
  const scale = card.rarity === 'LEGENDARY' ? 3.3 : card.cardType === 'UNIT' ? 2.9 : 2.6;
  const rot = nextInt(rng, -10, 10);
  const ringR = 30 + nextInt(rng, 0, 8);
  const legendaryRays =
    card.rarity === 'LEGENDARY' || card.rarity === 'EPIC'
      ? Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x2 = gx + Math.cos(a) * 110;
          const y2 = gy + Math.sin(a) * 110;
          return `<line x1="${gx}" y1="${gy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${glow}" stroke-width="${i % 2 ? 1 : 3}" opacity="0.14"/>`;
        }).join('')
      : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="0.65" stop-color="${primary}" stop-opacity="0.55"/><stop offset="1" stop-color="${dark}"/></linearGradient>
<radialGradient id="${id}g" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${glow}" stop-opacity="0.85"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
<filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
${figure?.defs ?? ''}
</defs>
<rect width="200" height="140" fill="url(#${id}s)"/>
${stars.join('')}
${legendaryRays}
${shards.join('')}
<circle cx="${gx}" cy="${gy}" r="${ringR + 16}" fill="url(#${id}g)" opacity="0.55"/>
<circle cx="${gx}" cy="${gy}" r="${ringR}" fill="none" stroke="${secondary}" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="${nextInt(rng, 2, 8)} ${nextInt(rng, 2, 6)}"/>
${landscape(FACTION_LANDSCAPE[card.faction] ?? 'road', rng, dark, '#07060f')}
${
    figure
      ? figure.body
      : `<g transform="translate(${gx - 12 * scale} ${gy - 12 * scale}) scale(${scale}) rotate(${rot} 12 12)">
<path d="${glyph}" fill="${glow}" filter="url(#${id}b)" opacity="0.9"/>
<path d="${glyph}" fill="${secondary}" stroke="${dark}" stroke-width="0.35"/>
</g>`
  }
</svg>`;
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  cache.set(card.id, uri);
  return uri;
}
