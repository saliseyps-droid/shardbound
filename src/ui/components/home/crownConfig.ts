import type { FactionInfo } from '@/data/factions';

/**
 * The Sundered Crown floats behind the Play hexagon on Home. Its canvas is larger than the button
 * (the crown's points stick out above and to the sides); everything inside the hexagon is masked
 * away, so the button covers the crown. Units are the hexagon's own viewBox (100 x 115.5).
 */
const HEX_W = 100;
const HEX_H = 115.5;
export const CROWN_STAGE = { width: 267, height: 179, offsetX: (267 - HEX_W) / 2, offsetY: (179 - HEX_H) / 2 };

/** The Play button's outer hexagon (same points as the SVG in HomeScreen). */
const HEX = [[50, 2], [98, 29.5], [98, 86], [50, 113.5], [2, 86], [2, 29.5]];

export const AETHER = { crystal: '#9ff3ff', band: '#e8b04b' };

/** Crystal and band colours: the favourite deck's faction, or pale Aether blue with a gold band. */
export function crownColors(faction: FactionInfo | null | undefined): { crystal: string; band: string } {
  return faction ? { crystal: faction.colors.primary, band: faction.colors.secondary } : AETHER;
}

/** An SVG mask (as markup): everything visible except a hexagonal hole where the Play button is. */
export function crownMaskSvg(): string {
  const { width, height, offsetX, offsetY } = CROWN_STAGE;
  const hole = HEX.map(([x, y]) => `${x + offsetX},${y + offsetY}`).join(' L');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><path fill-rule="evenodd" fill="#000" d="M0,0 H${width} V${height} H0 Z M${hole} Z"/></svg>`;
}

/** The crown turns and sheds shards unless the player asked for less motion. */
export function crownMotion(s: { performanceMode: boolean; reducedMotion: boolean }): 'live' | 'still' {
  return s.performanceMode || s.reducedMotion ? 'still' : 'live';
}
