/** Pure rules for the 3D table's camera input (no Three.js). */

/** Whether a wheel turn over `target` zooms the table: over the table itself or the match's bare background, not over other panels. */
export const zoomsTable = (target: Element, match: Element) => target === match || !!target.closest('.table3d');

/** The zoom after a pinch that spread the fingers from `startDist` to `dist` px, starting at `startZoom`; within 1–3×. */
export const pinchZoom = (startDist: number, dist: number, startZoom: number) => Math.max(1, Math.min(3, (startZoom * dist) / Math.max(1, startDist)));
