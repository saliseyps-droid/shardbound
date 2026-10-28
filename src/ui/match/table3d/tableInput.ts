/** Pure rules for the 3D table's camera input (no Three.js). */

/** Whether a wheel turn over `target` zooms the table: over the table itself or the match's bare background, not over other panels. */
export const zoomsTable = (target: Element, match: Element) => target === match || !!target.closest('.table3d');

/** Zoom range: out to see the room around the table (as in the mockup), in to read a card. */
export const ZOOM = { min: 0.4, max: 3 };

/** The zoom after a pinch that spread the fingers from `startDist` to `dist` px, starting at `startZoom`. */
export const pinchZoom = (startDist: number, dist: number, startZoom: number) => Math.max(ZOOM.min, Math.min(ZOOM.max, (startZoom * dist) / Math.max(1, startDist)));

/** Things on the table you act on: pressing them plays, attacks or opens, never looks around. */
const ACTIVE = '[data-entity], .unit, .hand-card, .hand, button, a, input, select, [role="button"], .hero-power, .permanent, .unit-badge, .draw-pile, .match-sidebar, .modal-backdrop, .match-overlay, .table3d-slow';

/** Whether a press on `target` is on bare table (or the match background): a drag from there looks around. */
export const isEmptyTable = (target: Element, match: Element) => zoomsTable(target, match) && !target.closest(ACTIVE);

/**
 * The view after dragging dx, dy px from `start`: sideways turns around the table, up/down tilts
 * (never under it). Half the mockup's speed, and only round the sides: as in the mockup, you never
 * get to look from the opponent's seat (±1.2 rad).
 */
export function orbitTo(start: { yaw: number; tilt: number }, dx: number, dy: number) {
  return {
    yaw: Math.max(-1.2, Math.min(1.2, start.yaw - dx * 0.0025)),
    tilt: Math.max(0.12, Math.min(1.25, start.tilt + dy * 0.002)),
  };
}

/** How far the view may move from the board's centre (world units): around the whole room, the board being 16 × 9. */
export const ROOM = { x: 14, y: 11 };

export const clampRoomPan = (x: number, y: number) => ({ x: Math.max(-ROOM.x, Math.min(ROOM.x, x)), y: Math.max(-ROOM.y, Math.min(ROOM.y, y)) });
