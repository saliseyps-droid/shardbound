/** Pure rules for the 3D table's camera input (no Three.js). */

/** Whether a wheel turn over `target` zooms the table: over the table itself or the match's bare background, not over other panels. */
export const zoomsTable = (target: Element, match: Element) => target === match || !!target.closest('.table3d');

/** The zoom after a pinch that spread the fingers from `startDist` to `dist` px, starting at `startZoom`; within 1–3×. */
export const pinchZoom = (startDist: number, dist: number, startZoom: number) => Math.max(1, Math.min(3, (startZoom * dist) / Math.max(1, startDist)));

/** Things on the table you act on: pressing them plays, attacks or opens, never looks around. */
const ACTIVE = '[data-entity], .unit, .hand-card, .hand, button, a, input, select, [role="button"], .hero-power, .permanent, .unit-badge, .draw-pile, .match-sidebar, .modal-backdrop, .match-overlay, .table3d-slow';

/** Whether a press on `target` is on bare table (or the match background): a drag from there looks around. */
export const isEmptyTable = (target: Element, match: Element) => zoomsTable(target, match) && !target.closest(ACTIVE);

/** The view after dragging dx, dy px from `start`: sideways turns around the table, up/down tilts; limited so the table stays in view. */
export function orbitTo(start: { yaw: number; tilt: number }, dx: number, dy: number) {
  return {
    yaw: Math.max(-1.2, Math.min(1.2, start.yaw - dx * 0.005)),
    tilt: Math.max(0.12, Math.min(1.1, start.tilt + dy * 0.004)),
  };
}
