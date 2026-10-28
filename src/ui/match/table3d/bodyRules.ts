/** Pure rules for the 3D bodies on the table (no Three.js here, so they test without WebGL). */

/** Texture repeat/offset that shows a picture like CSS `object-fit: cover` on a face of boxW×boxH; `focusX`/`focusY` are the object-position in % (from the left / top). */
export function coverUv(imgW: number, imgH: number, boxW: number, boxH: number, focusX = 50, focusY = 50) {
  const img = imgW / imgH;
  const box = boxW / boxH;
  const repeatX = img > box ? box / img : 1;
  const repeatY = img > box ? 1 : img / box;
  return { repeatX, repeatY, offsetX: (1 - repeatX) * (focusX / 100), offsetY: (1 - repeatY) * (1 - focusY / 100) };
}

/** Card backs drawn for a deck of `count` cards: one per ~2.4 cards, at least two while any are left. */
export const pileCards = (count: number) => (count <= 0 ? 0 : Math.max(2, Math.round(count / 2.4)));

/** Deep, saturated energy colours per faction (approved in the mockup): [tint, glow]. */
export const ENERGY_COLORS: Record<string, [string, string]> = {
  EMBER: ['#e62a00', '#c41800'],
  VOID: ['#7a12e6', '#5a00c8'],
  ASTRAL: ['#1f4dff', '#0a2ee0'],
  TIDE: ['#00b4d8', '#0088b8'],
  VERDANT: ['#10b82a', '#008a1a'],
  IRON: ['#f08a00', '#d06a00'],
};
export const energyColors = (faction: string | null | undefined): [string, string] => (faction && ENERGY_COLORS[faction]) || ['#e8b04b', '#b07f22'];

/**
 * How far (plane px) to move DOM that belongs on a raised object: from where the object stands on the
 * mat to the mat point its raised top appears over on screen (world units, 100 px per unit; +y is up
 * the mat, so down the plane's px).
 */
export function riseShift(at: { x: number; y: number }, seen: { x: number; y: number } | null) {
  if (!seen) return { dx: 0, dy: 0 };
  return { dx: (seen.x - at.x) * 100, dy: -(seen.y - at.y) * 100 };
}
