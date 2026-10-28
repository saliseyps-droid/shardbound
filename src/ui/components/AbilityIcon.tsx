import type { TriggerType } from '@/game/types';

/**
 * Round ability icons (as in the 3D table mockup): a dark disc with a gold rim and a coloured sign.
 * The 3D table shows them on the units instead of the plain keyword glyphs.
 */
export type AbilityIconKind = 'drain' | 'ward' | 'spell' | 'endturn' | 'guard' | 'swift' | 'rush' | 'venom' | 'frenzy' | 'regen' | 'lastbreath' | 'trigger';

const COLOR: Record<AbilityIconKind, string> = {
  drain: '#e2334a',
  ward: '#5fb8ff',
  spell: '#c58bff',
  endturn: '#ffc24a',
  guard: '#e8d8b0',
  swift: '#ffe08a',
  rush: '#ffb35a',
  venom: '#7ddc5a',
  frenzy: '#ff6b5a',
  regen: '#7ef29a',
  lastbreath: '#cfc4ff',
  trigger: '#ffd27a',
};

const KEYWORD_ICON: Record<string, AbilityIconKind> = {
  DRAIN: 'drain',
  WARD: 'ward',
  SWIFT: 'swift',
  RUSH: 'rush',
  VENOM: 'venom',
  FRENZY: 'frenzy',
  REGENERATE: 'regen',
  EMPOWER: 'spell',
  GUARD: 'guard',
  LAST_BREATH: 'lastbreath',
};

export const iconForKeyword = (keyword: string): AbilityIconKind | null => KEYWORD_ICON[keyword] ?? null;

/** The icon of a unit's triggered abilities: what they wait for (a spell, the end or start of a turn), or a plain bolt. */
export function iconForTriggers(triggers: TriggerType[]): AbilityIconKind {
  if (triggers.includes('FRIENDLY_SPELL_CAST')) return 'spell';
  if (triggers.includes('TURN_END') || triggers.includes('TURN_START')) return 'endturn';
  return 'trigger';
}

// Signs on a 20×20 box centred on 0 (the mockup's shapes, k = 5.5).
const star = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4 - Math.PI / 2;
  const r = i % 2 ? 2.1 : 5.5;
  return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
}).join(' ');

function Glyph({ kind, c }: { kind: AbilityIconKind; c: string }) {
  const line = { fill: 'none', stroke: c, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (kind) {
    case 'drain':
      return <path data-glyph d="M0,-6 C5,-0.5 4.4,5 0,5 C-4.4,5 -5,-0.5 0,-6Z" fill={c} />;
    case 'ward':
      return <path data-glyph d="M0,-5.5 L4.7,-3 L3.9,1.9 L0,5.5 L-3.9,1.9 L-4.7,-3Z M0,-2.5 L0,2.8" {...line} />;
    case 'spell':
      return <polygon data-glyph points={star} fill={c} />;
    case 'endturn':
      return (
        <g data-glyph>
          <path d="M-3.3,-5.5 L3.3,-5.5 L-3.3,5.5 L3.3,5.5Z" {...line} />
          <path d="M-1.4,3.3 L1.4,3.3 L0,1.1Z" fill={c} />
        </g>
      );
    case 'guard':
      return <path data-glyph d="M-4.4,-4.4 L4.4,-4.4 L4.4,0 Q3.3,4.4 0,5.5 Q-3.3,4.4 -4.4,0Z" fill={c} />;
    case 'swift':
      return <path data-glyph d="M1.1,-5.5 L-2.75,0.55 L0,0.55 L-1.1,5.5 L2.75,-0.55 L0,-0.55Z" fill={c} />;
    case 'rush':
      return <path data-glyph d="M-4.5,4.5 L4,-4 M4,-4 L-0.5,-4 M4,-4 L4,0.5" {...line} strokeWidth={1.8} />;
    case 'venom':
      return <path data-glyph d="M0,-5.5 Q4.6,0.6 0,5 Q-4.6,0.6 0,-5.5Z" fill={c} />;
    case 'frenzy':
      return <path data-glyph d="M-4.5,-4.5 L4.5,4.5 M4.5,-4.5 L-4.5,4.5 M-4.5,1.5 L-1.5,4.5 M4.5,1.5 L1.5,4.5" {...line} strokeWidth={1.6} />;
    case 'regen':
      return <path data-glyph d="M0,-4.8 L0,4.8 M-4.8,0 L4.8,0" {...line} strokeWidth={2.6} />;
    case 'lastbreath':
      return <path data-glyph d="M0,-5.5 L0,5.5 M-3.5,-2 L3.5,-2" {...line} strokeWidth={1.8} />;
    default:
      return <path data-glyph d="M2,-5.5 L-2,0 L1.6,0 L-2,5.5" {...line} strokeWidth={1.8} />;
  }
}

export function AbilityIcon({ kind, className = '' }: { kind: AbilityIconKind; className?: string }) {
  return (
    <svg className={`ability-icon ${className}`} viewBox="-10 -10 20 20" aria-hidden>
      <circle r={9} fill="rgba(14,10,24,.92)" stroke="#e8b04b" strokeWidth={1.3} />
      <Glyph kind={kind} c={COLOR[kind]} />
    </svg>
  );
}
