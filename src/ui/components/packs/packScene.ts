import type { Rarity } from '@/game/types';

/**
 * The 3D pack opening draws behind the page and lines its objects up with the real layout: the
 * floating pack sits where the pack button is, and the cards land exactly on the card slots.
 * The camera looks straight down -z from (0, y, z).
 */
export const SCENE_CAMERA = { fov: 35, y: 0.3, z: 12.5 };
/** The depth the card row lives at. */
export const CARD_PLANE_Z = 0.6;

export interface ScreenRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Where a screen rectangle lies on the plane at depth `z`, and how big it is there. */
export function rectToWorld(rect: ScreenRect, view: { width: number; height: number }, z: number, cameraZ = SCENE_CAMERA.z) {
  const d = cameraZ - z;
  const perPixel = (2 * d * Math.tan((SCENE_CAMERA.fov * Math.PI) / 360)) / view.height;
  return {
    x: (rect.left + rect.width / 2 - view.width / 2) * perPixel,
    y: SCENE_CAMERA.y - (rect.top + rect.height / 2 - view.height / 2) * perPixel,
    width: rect.width * perPixel,
    height: rect.height * perPixel,
  };
}

/** Rarity colours (the --rarity-* tokens). */
export const RARITY_COLOR: Record<Rarity, string> = { COMMON: '#c9c3b6', RARE: '#58a8ff', EPIC: '#b565ff', LEGENDARY: '#ffa931' };
