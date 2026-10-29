import * as THREE from 'three';

/**
 * A free camera for walking around a room (the Lounge): it stands somewhere and looks any way, up to
 * the ceiling too. As at the 3D table: drag to move, the right button (or Shift + drag) to look around,
 * the wheel to step forward and back; WASD or the arrows walk, Q / E go down and up. On touch one
 * finger moves, two fingers look around, a pinch steps forward and back.
 */

export interface LookBounds {
  x: number;
  y: number;
  zMin: number;
  zMax: number;
}

const LOOK = 0.0028; // radians per pixel
const PITCH = 1.45; // almost straight up or down
const WALK = 22; // units per second with the keys

/** The way the camera looks for a yaw (0 = towards +y, the far side of the table) and a pitch. */
const dirOf = (yaw: number, pitch: number, out = new THREE.Vector3()) => out.set(Math.cos(pitch) * Math.sin(yaw), Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch));

/** The shortest turn from one angle to another. */
const angleTo = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

export function createLookControls(el: HTMLElement, camera: THREE.PerspectiveCamera, bounds: LookBounds) {
  const pos = camera.position.clone();
  let yaw = 0;
  let pitch = 0;
  // Easing towards a view (a picked slot, the home view); the player taking over stops it.
  let goal: { pos: THREE.Vector3; yaw: number; pitch: number } | null = null;
  const keys = new Set<string>();

  const viewFrom = (from: THREE.Vector3, at: THREE.Vector3) => {
    const d = at.clone().sub(from);
    return { pos: from.clone(), yaw: Math.atan2(d.x, d.y), pitch: Math.atan2(d.z, Math.hypot(d.x, d.y)) };
  };

  const clamp = () => {
    pos.set(THREE.MathUtils.clamp(pos.x, -bounds.x, bounds.x), THREE.MathUtils.clamp(pos.y, -bounds.y, bounds.y), THREE.MathUtils.clamp(pos.z, bounds.zMin, bounds.zMax));
    pitch = THREE.MathUtils.clamp(pitch, -PITCH, PITCH);
  };

  /** Moves along the floor: right and forward in the way the camera faces. */
  const walk = (right: number, forward: number, up = 0) => {
    pos.x += Math.cos(yaw) * right + Math.sin(yaw) * forward;
    pos.y += -Math.sin(yaw) * right + Math.cos(yaw) * forward;
    pos.z += up;
  };
  /** Steps along the view, up or down with it. */
  const step = (d: number) => pos.addScaledVector(dirOf(yaw, pitch), d);

  // ---- Mouse and touch ----
  const pointers = new Map<number, { x: number; y: number }>();
  let mode: 'move' | 'look' | null = null;
  let pinch = 0;
  const grabScale = () => 0.04 + (pos.z - bounds.zMin) * 0.002;

  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    goal = null;
    if (e.pointerType === 'mouse') mode = e.button === 2 || e.shiftKey ? 'look' : 'move';
    else mode = pointers.size >= 2 ? 'look' : 'move';
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const move = (e: PointerEvent) => {
    const p = pointers.get(e.pointerId);
    if (!p || !mode) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (pointers.size >= 2) {
      // Two fingers: their midpoint looks around (half each), their spread steps forward and back.
      const [a, b] = [...pointers.values()];
      const spread = Math.hypot(a.x - b.x, a.y - b.y);
      step((spread - pinch) * 0.06);
      pinch = spread;
      yaw -= (dx / 2) * LOOK;
      pitch += (dy / 2) * LOOK;
    } else if (mode === 'look') {
      yaw -= dx * LOOK;
      pitch += dy * LOOK;
    } else {
      // Grab the floor: drag it towards you to go forward.
      const k = grabScale();
      walk(-dx * k, dy * k);
    }
    clamp();
  };
  const up = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (!pointers.size) mode = null;
    else if (pointers.size === 1) mode = 'move';
  };
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    goal = null;
    step(-Math.sign(e.deltaY) * Math.min(6, Math.abs(e.deltaY) * 0.02));
    clamp();
  };
  const menu = (e: Event) => e.preventDefault();
  const keyDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      keys.add(k);
      goal = null;
      if (k.startsWith('arrow')) e.preventDefault();
    }
  };
  const keyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const blur = () => keys.clear();

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', wheel, { passive: false });
  el.addEventListener('contextmenu', menu);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  window.addEventListener('blur', blur);

  const look = new THREE.Vector3();
  return {
    /** Looks at `at` from `from` (jumps there, or eases when `ease`). */
    view(from: THREE.Vector3, at: THREE.Vector3, ease = false) {
      const v = viewFrom(from, at);
      if (ease) goal = v;
      else {
        goal = null;
        pos.copy(v.pos);
        yaw = v.yaw;
        pitch = v.pitch;
      }
    },
    update(dt: number) {
      if (keys.size) {
        const s = WALK * dt;
        const f = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0);
        const r = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0);
        const turn = (keys.has('arrowleft') ? 1 : 0) - (keys.has('arrowright') ? 1 : 0);
        const u = (keys.has('e') ? 1 : 0) - (keys.has('q') ? 1 : 0);
        walk(r * s, f * s, u * s * 0.6);
        yaw -= turn * dt * 1.6;
        clamp();
      }
      if (goal) {
        const k = Math.min(1, dt * 3.5);
        pos.lerp(goal.pos, k);
        yaw += angleTo(yaw, goal.yaw) * k;
        pitch += (goal.pitch - pitch) * k;
        if (pos.distanceTo(goal.pos) < 0.02 && Math.abs(angleTo(yaw, goal.yaw)) < 0.002 && Math.abs(goal.pitch - pitch) < 0.002) goal = null;
      }
      camera.position.copy(pos);
      camera.lookAt(look.copy(pos).add(dirOf(yaw, pitch)));
    },
    dispose() {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('contextmenu', menu);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', blur);
    },
  };
}
