import { nextFloat, nextInt, type RngState } from '@/core/rng';
import type { CardDefinition } from '@/game/types';

/**
 * Character silhouettes for unit artwork (200×140 art space, figure standing at
 * the bottom centre). They make units instantly distinguishable from spells,
 * which keep an emblem. All shapes are original, hand-authored paths.
 */

export type FigureKind =
  | 'warrior'
  | 'mage'
  | 'druid'
  | 'cultist'
  | 'artificer'
  | 'construct'
  | 'beast'
  | 'wraith'
  | 'undead'
  | 'elemental'
  | 'treant'
  | 'leviathan'
  | 'spirit'
  | 'drake';

const TAG_FIGURE: Record<string, FigureKind> = {
  Mage: 'mage',
  Druid: 'druid',
  Cultist: 'cultist',
  Artificer: 'artificer',
  Construct: 'construct',
  Beast: 'beast',
  Wraith: 'wraith',
  Undead: 'undead',
  Elemental: 'elemental',
  Treant: 'treant',
  Leviathan: 'leviathan',
  Spirit: 'spirit',
  Drake: 'drake',
  Dragon: 'drake',
  Fae: 'spirit',
};

export function figureKind(card: CardDefinition): FigureKind {
  for (const t of card.tags ?? []) if (TAG_FIGURE[t]) return TAG_FIGURE[t];
  return 'warrior';
}

interface Palette {
  body: string; // silhouette fill (gradient id reference)
  rim: string; // faction glow
  accent: string; // faction secondary
  eye: string;
}

const eyes = (p: Palette, pts: [number, number][], r = 2.2) =>
  pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${p.eye}" opacity="0.35"/><circle cx="${x}" cy="${y}" r="${r}" fill="${p.eye}"/>`).join('');

const shape = (p: Palette, d: string, opts: { fill?: string; width?: number } = {}) =>
  `<path d="${d}" fill="${opts.fill ?? p.body}" stroke="${p.rim}" stroke-width="${opts.width ?? 1.6}" stroke-opacity="0.85" stroke-linejoin="round" stroke-linecap="round"/>`;

/** Shoulders + chest shared by humanoids. */
const TORSO = 'M46 140 C48 114 62 97 82 91 L91 87 L109 87 L118 91 C138 97 152 114 154 140 Z';

function warrior(p: Palette, rng: RngState): string {
  const crest = nextInt(rng, 0, 2);
  const weapon = nextInt(rng, 0, 2);
  const parts: string[] = [];
  if (weapon === 0) parts.push(shape(p, 'M150 140 L150 60 L147 60 L153 38 L159 60 L156 60 L156 140 Z')); // spear
  else if (weapon === 1) parts.push(shape(p, 'M140 124 L168 44 L173 46 L146 126 Z M136 118 L150 126 L147 131 L133 123 Z')); // sword
  else parts.push(shape(p, 'M30 104 C30 90 44 84 58 86 C62 100 60 120 48 134 C38 128 30 118 30 104 Z')); // shield
  parts.push(shape(p, TORSO));
  parts.push(shape(p, 'M60 104 C60 90 70 84 82 88 C86 96 84 106 76 112 C68 114 60 110 60 104 Z M140 104 C140 90 130 84 118 88 C114 96 116 106 124 112 C132 114 140 110 140 104 Z')); // pauldrons
  parts.push(shape(p, 'M92 76 L108 76 L110 90 L90 90 Z')); // neck
  parts.push(shape(p, 'M83 72 C82 50 90 40 100 40 C110 40 118 50 117 72 L112 80 L88 80 Z')); // helmet
  if (crest === 0) parts.push(shape(p, 'M100 40 C104 26 116 20 126 22 C114 28 108 34 106 42 Z'));
  else if (crest === 1) parts.push(shape(p, 'M84 52 L70 36 L86 46 Z M116 52 L130 36 L114 46 Z'));
  parts.push(`<rect x="88" y="58" width="24" height="3.4" rx="1.7" fill="${p.eye}"/><rect x="86" y="56" width="28" height="7" rx="3.5" fill="${p.eye}" opacity="0.3"/>`);
  return parts.join('');
}

function mage(p: Palette): string {
  return [
    shape(p, 'M152 140 L152 52 L158 52 L158 140 Z'),
    `<circle cx="155" cy="46" r="9" fill="${p.eye}" opacity="0.35"/><circle cx="155" cy="46" r="5" fill="${p.eye}"/>`,
    shape(p, 'M50 140 C52 116 64 98 84 92 L100 88 L116 92 C136 98 148 116 150 140 Z'),
    shape(p, 'M84 92 C84 74 90 62 100 62 C110 62 116 74 116 92 Z'),
    shape(p, 'M74 60 C84 56 94 54 100 54 C106 54 116 56 126 60 C116 64 84 64 74 60 Z M84 58 L102 14 L116 58 Z'),
    eyes(p, [[94, 76], [106, 76]], 1.8),
  ].join('');
}

function druid(p: Palette): string {
  return [
    shape(p, 'M48 140 C50 114 64 96 84 90 L100 86 L116 90 C136 96 150 114 152 140 Z'),
    shape(p, 'M80 92 C78 64 88 48 100 48 C112 48 122 64 120 92 Z'),
    shape(p, 'M86 54 C80 44 70 38 62 26 M72 36 L64 38 M84 50 C78 36 80 26 76 16 M114 54 C120 44 130 38 138 26 M128 36 L136 38 M116 50 C122 36 120 26 124 16', { fill: 'none', width: 3.2 }),
    eyes(p, [[94, 74], [106, 74]], 1.8),
  ].join('');
}

function cultist(p: Palette): string {
  return [
    shape(p, 'M44 140 C48 112 62 96 80 90 L100 84 L120 90 C138 96 152 112 156 140 Z'),
    shape(p, 'M76 96 C74 62 88 34 100 20 C112 34 126 62 124 96 Z'),
    `<ellipse cx="100" cy="70" rx="13" ry="17" fill="#05040c"/>`,
    eyes(p, [[95, 68], [105, 68]], 2),
  ].join('');
}

function artificer(p: Palette): string {
  return [
    shape(p, 'M30 118 L58 90 L66 98 L38 126 Z M54 84 C60 78 70 80 72 88 L64 96 C56 94 52 90 54 84 Z'),
    shape(p, TORSO),
    shape(p, 'M92 76 L108 76 L110 90 L90 90 Z'),
    shape(p, 'M84 70 C84 52 91 42 100 42 C109 42 116 52 116 70 C116 80 110 86 100 86 C90 86 84 80 84 70 Z'),
    shape(p, 'M80 58 L120 58 L120 64 L80 64 Z'),
    `<circle cx="92" cy="61" r="6" fill="${p.eye}" opacity="0.9"/><circle cx="108" cy="61" r="6" fill="${p.eye}" opacity="0.9"/><circle cx="92" cy="61" r="3" fill="#fff" opacity="0.6"/><circle cx="108" cy="61" r="3" fill="#fff" opacity="0.6"/>`,
  ].join('');
}

function construct(p: Palette, rng: RngState): string {
  const antenna = nextFloat(rng) < 0.6;
  return [
    shape(p, 'M40 140 L46 104 C50 96 60 92 72 92 L128 92 C140 92 150 96 154 104 L160 140 Z'),
    shape(p, 'M52 100 A14 14 0 1 1 52.1 100 Z M148 100 A14 14 0 1 1 148.1 100 Z'),
    shape(p, 'M92 82 L108 82 L108 94 L92 94 Z'),
    shape(p, 'M76 46 L124 46 L128 84 L72 84 Z'),
    antenna ? shape(p, 'M99 46 L99 30 L101 30 L101 46 Z') + `<circle cx="100" cy="28" r="4" fill="${p.eye}"/>` : '',
    `<rect x="84" y="60" width="11" height="6" rx="1" fill="${p.eye}"/><rect x="105" y="60" width="11" height="6" rx="1" fill="${p.eye}"/><rect x="82" y="58" width="36" height="10" rx="3" fill="${p.eye}" opacity="0.25"/>`,
    `<g fill="${p.rim}" opacity="0.7"><circle cx="70" cy="112" r="1.8"/><circle cx="130" cy="112" r="1.8"/><circle cx="84" cy="124" r="1.8"/><circle cx="116" cy="124" r="1.8"/></g>`,
  ].join('');
}

function beast(p: Palette): string {
  return [
    shape(p, 'M58 140 C60 122 76 112 100 112 C124 112 140 122 142 140 Z'),
    shape(p, 'M100 118 C80 118 68 104 66 86 L58 46 L80 64 C86 60 94 58 100 58 C106 58 114 60 120 64 L142 46 L134 86 C132 104 120 118 100 118 Z'),
    shape(p, 'M88 98 C92 108 96 118 100 124 C104 118 108 108 112 98 Z'),
    eyes(p, [[88, 82], [112, 82]], 2.4),
  ].join('');
}

function wraith(p: Palette): string {
  return [
    shape(p, 'M56 140 L64 118 L56 100 C60 68 78 42 100 38 C122 42 140 68 144 100 L136 118 L144 140 L128 128 L114 140 L100 126 L86 140 L72 128 Z'),
    shape(p, 'M60 96 C46 88 38 74 36 60 C48 72 58 78 70 82 Z M140 96 C154 88 162 74 164 60 C152 72 142 78 130 82 Z'),
    `<ellipse cx="100" cy="68" rx="14" ry="18" fill="#05040c"/>`,
    eyes(p, [[94, 66], [106, 66]], 2.2),
  ].join('');
}

function undead(p: Palette): string {
  return [
    shape(p, TORSO),
    `<g stroke="${p.rim}" stroke-opacity="0.55" stroke-width="2" fill="none"><path d="M100 96 L100 138"/><path d="M84 104 C92 100 108 100 116 104"/><path d="M80 114 C92 110 108 110 120 114"/><path d="M78 124 C92 120 108 120 122 124"/></g>`,
    shape(p, 'M92 78 L108 78 L108 90 L92 90 Z'),
    shape(p, 'M82 64 C82 46 90 38 100 38 C110 38 118 46 118 64 C118 72 114 76 112 78 L112 86 L88 86 L88 78 C86 76 82 72 82 64 Z'),
    `<path d="M88 58 C88 54 96 54 96 60 C96 64 88 64 88 58 Z M104 60 C104 54 112 54 112 58 C112 64 104 64 104 60 Z" fill="#05040c"/>`,
    eyes(p, [[92, 59], [108, 59]], 1.6),
    `<path d="M94 80 L94 86 M100 80 L100 86 M106 80 L106 86" stroke="#05040c" stroke-width="1.6"/>`,
  ].join('');
}

function elemental(p: Palette): string {
  return [
    shape(p, 'M100 22 C114 44 136 56 130 90 C142 100 148 120 146 140 L54 140 C52 120 58 100 70 90 C64 58 86 44 100 22 Z'),
    `<path d="M100 56 C108 70 120 80 116 104 C112 120 88 120 84 104 C80 86 94 74 100 56 Z" fill="${p.eye}" opacity="0.45"/>`,
    shape(p, 'M70 96 C54 90 44 80 40 64 C52 76 62 80 74 84 Z M130 96 C146 90 156 80 160 64 C148 76 138 80 126 84 Z'),
    eyes(p, [[92, 80], [108, 80]], 2.2),
  ].join('');
}

function treant(p: Palette): string {
  return [
    shape(p, 'M74 140 C78 118 80 98 78 78 C66 72 54 60 48 44 C60 54 72 60 82 62 C80 50 82 40 88 30 C90 42 92 52 96 58 L104 58 C108 48 112 38 120 30 C118 44 116 54 118 62 C128 60 140 52 150 40 C146 58 134 70 122 78 C120 98 122 118 126 140 Z'),
    `<g stroke="${p.rim}" stroke-opacity="0.45" stroke-width="1.4" fill="none"><path d="M90 136 C92 120 88 108 92 96"/><path d="M110 136 C108 122 112 110 108 100"/></g>`,
    eyes(p, [[92, 84], [108, 84]], 2),
    `<path d="M92 98 C96 102 104 102 108 98" stroke="#05040c" stroke-width="2" fill="none"/>`,
  ].join('');
}

function leviathan(p: Palette): string {
  return [
    shape(p, 'M84 140 C80 116 88 96 102 84 C112 74 114 62 104 54 C96 48 84 52 78 60 L66 54 C76 38 100 32 116 40 C134 50 132 78 120 92 C110 104 112 122 118 140 Z'),
    shape(p, 'M118 70 L140 58 L132 74 L146 72 L128 88 Z M104 40 L108 24 L114 38 Z'),
    shape(p, 'M40 140 C44 128 56 124 66 128 C62 132 60 136 60 140 Z M160 140 C156 128 144 124 134 128 C138 132 140 136 140 140 Z'),
    eyes(p, [[92, 52]], 2.4),
  ].join('');
}

function spirit(p: Palette): string {
  return [
    `<circle cx="100" cy="70" r="34" fill="${p.eye}" opacity="0.18"/>`,
    shape(p, 'M100 40 C118 40 128 54 128 70 C128 88 116 98 112 110 C110 118 116 126 110 136 C106 128 100 126 96 130 C92 124 88 122 84 124 C88 114 80 106 76 96 C70 84 72 70 76 60 C82 48 90 40 100 40 Z'),
    `<circle cx="100" cy="70" r="12" fill="${p.eye}" opacity="0.55"/>`,
    eyes(p, [[94, 68], [106, 68]], 2),
  ].join('');
}

function drake(p: Palette): string {
  return [
    shape(p, 'M96 100 L26 40 L40 74 L14 70 L46 100 L28 110 L70 116 Z'),
    shape(p, 'M104 100 L174 40 L160 74 L186 70 L154 100 L172 110 L130 116 Z'),
    shape(p, 'M70 140 C72 118 84 104 100 100 C116 104 128 118 130 140 Z'),
    shape(p, 'M86 110 C82 88 88 70 102 62 L128 56 L152 64 L130 72 C124 78 118 90 116 110 Z'),
    shape(p, 'M104 62 L96 44 L110 58 Z M114 58 L112 40 L122 56 Z'),
    eyes(p, [[122, 64]], 2.2),
  ].join('');
}

const DRAW: Record<FigureKind, (p: Palette, rng: RngState) => string> = {
  warrior,
  mage,
  druid,
  cultist,
  artificer,
  construct,
  beast,
  wraith,
  undead,
  elemental,
  treant,
  leviathan,
  spirit,
  drake,
};

/** Figure markup plus the gradient it uses. `id` prefixes SVG ids. */
export function figureSvg(card: CardDefinition, rng: RngState, colors: { dark: string; glow: string; secondary: string }, id: string): { defs: string; body: string; headY: number } {
  const kind = figureKind(card);
  const grad = `${id}f`;
  const p: Palette = { body: `url(#${grad})`, rim: colors.glow, accent: colors.secondary, eye: colors.glow };
  const defs = `<linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors.dark}" stop-opacity="0.95"/><stop offset="1" stop-color="#05040c"/></linearGradient>`;
  // Slight random offset/scale so cards of the same type still differ.
  const dx = nextInt(rng, -8, 8);
  const s = 0.92 + nextFloat(rng) * 0.14;
  const body = `<g transform="translate(${100 + dx} 140) scale(${s.toFixed(3)}) translate(-100 -140)">${DRAW[kind](p, rng)}</g>`;
  const headY = kind === 'beast' ? 84 : kind === 'drake' ? 70 : 62;
  return { defs, body, headY };
}
