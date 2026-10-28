import * as THREE from 'three';

/**
 * The 3D table: a WebGL scene behind the match and the match's on-table DOM laid onto the mat with a
 * CSS matrix3d from the same camera (the CSS3DRenderer formula applied to React-owned elements).
 * World units: the mat is MAT.w × MAT.h, centred on the origin in the XY plane, its top at z = MAT.top;
 * +y runs away from the player. The DOM plane is PLANE.w × PLANE.h px (the mat's aspect).
 */
/** The top of the opponent's hand above the mat's far edge (world units: further out, higher up). */
export const FOE_TOP = { y: 1.08, z: 0.68 };
/** The camera's tilt from looking straight down (rad). */
export const TILT = 0.42;
export const PLANE = { w: 1600, h: 911 };
export const MAT = { w: 16, h: (16 * 1823) / 3200, top: 0.1 };
export const FOV = 32;

/** A plane pixel (from its top-left) on the mat, in world units. */
export function planeToWorld(px: number, py: number): { x: number; y: number } {
  return { x: (px / PLANE.w - 0.5) * MAT.w, y: (0.5 - py / PLANE.h) * MAT.h };
}

export interface CameraState {
  tilt: number;
  zoom: number;
  panX: number;
  panY: number;
  /** Share of the view's height kept free at the bottom (the hand lies there, in screen space). */
  bottom?: number;
  /** Turned around the table (rad, about its vertical axis): looking around. */
  yaw?: number;
}

/**
 * Places the camera so the mat fills the view at zoom 1 (the near edge reaching the sides or the
 * bottom), leaning back by `tilt` radians and turned by `yaw` around the table; zoom moves it in, pan
 * shifts what it looks at. The distance is fitted at the default tilt, so looking around turns the
 * camera about the same point instead of pulling it in and out.
 */
const fitCache = new Map<string, number>();

export function placeCamera(camera: THREE.PerspectiveCamera, view: { width: number; height: number }, s: CameraState): void {
  camera.fov = FOV;
  camera.aspect = view.width / view.height;
  // A free strip at the bottom: render the lower part of a taller image, so the view's centre (and the
  // table) moves up into the rest of the screen.
  const b = s.bottom ?? 0;
  if (b > 0) camera.setViewOffset(view.width, view.height * (1 + b), 0, view.height * b, view.width, view.height);
  else camera.clearViewOffset();
  const lookY = 0.35 * Math.sin(TILT);
  const put = (d: number, panX: number, panY: number, tilt: number, yaw: number) => {
    // Behind the look point by the tilt, then turned around the table's vertical axis.
    const back = Math.sin(tilt) * d;
    camera.position.set(panX + Math.sin(yaw) * back, panY + lookY - Math.cos(yaw) * back, Math.cos(tilt) * d);
    // Up is the table's normal (no roll); straight down it is the turned "far" direction instead.
    if (tilt < 0.02) camera.up.set(-Math.sin(yaw), Math.cos(yaw), 0);
    else camera.up.set(0, 0, 1);
    camera.lookAt(panX, panY + lookY, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };
  const corners = [[-MAT.w / 2, -MAT.h / 2], [MAT.w / 2, -MAT.h / 2], [-MAT.w / 2, MAT.h / 2], [MAT.w / 2, MAT.h / 2]];
  const fits = (d: number) => {
    put(d, 0, 0, TILT, 0);
    // The opponent's hand, held up over the far edge (FOE_TOP), must fit above the mat too.
    const foeTop = new THREE.Vector3(0, MAT.h / 2 + FOE_TOP.y, MAT.top + FOE_TOP.z).project(camera);
    return (
      foeTop.y <= 0.96 &&
      corners.every(([x, y]) => {
        const p = new THREE.Vector3(x, y, MAT.top).project(camera);
        return Math.abs(p.x) <= 1 && p.y <= 1 && p.y >= -1 + 2 * (s.bottom ?? 0);
      })
    );
  };
  // The nearest distance at which the whole mat fits (it only fits better further away); the search
  // runs only when the view, tilt or free strip change, not every frame.
  const key = `${view.width}x${view.height}|${b}`;
  let fit = fitCache.get(key);
  if (fit === undefined) {
    let lo = 1;
    let hi = 400;
    for (let i = 0; i < 40; i++) {
      const mid: number = (lo + hi) / 2;
      if (fits(mid)) hi = mid;
      else lo = mid;
    }
    if (fitCache.size > 32) fitCache.clear();
    fitCache.set(key, hi);
    fit = hi;
  }
  put(fit / Math.max(0.1, s.zoom), s.panX, s.panY, s.tilt, s.yaw ?? 0);
}

const eps = (v: number) => (Math.abs(v) < 1e-10 ? 0 : v);

/** The CSS for the camera wrapper: `perspective` on the view, `transform` on the 3D-preserving child. */
export function cameraCss(camera: THREE.PerspectiveCamera, view: { width: number; height: number }): { perspective: string; origin: string; transform: string } {
  const fovPx = camera.projectionMatrix.elements[5] * (view.height / 2);
  const e = camera.matrixWorldInverse.elements;
  const m = [e[0], -e[1], e[2], e[3], e[4], -e[5], e[6], e[7], e[8], -e[9], e[10], e[11], e[12], -e[13], e[14], e[15]].map(eps).join(',');
  // The image centre: shifted up when the camera renders with a view offset (see placeCamera).
  const cy = camera.view?.enabled ? camera.view.fullHeight / 2 - camera.view.offsetY : view.height / 2;
  return { perspective: `${fovPx}px`, origin: `${view.width / 2}px ${cy}px`, transform: `translateZ(${fovPx}px) matrix3d(${m}) translate(${view.width / 2}px,${cy}px)` };
}

/** The CSS transform of the plane element: PLANE px lying on the mat (scaled into world units). */
export function planeCss(): string {
  const o = new THREE.Object3D();
  o.position.set(0, 0, MAT.top + 0.002);
  o.scale.setScalar(MAT.w / PLANE.w);
  o.updateMatrixWorld();
  const e = o.matrixWorld.elements;
  const m = [e[0], e[1], e[2], e[3], -e[4], -e[5], -e[6], -e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]].map(eps).join(',');
  return `translate(-50%,-50%) matrix3d(${m})`;
}

/**
 * Your hand lies on its own plane at the near edge of the table, standing up towards you (as in the
 * mockup): HAND px wide and tall, `HAND.scale` world units per px, its centre at `HAND.at`, leaning
 * back from upright by `HAND.lean`. Its DOM (the hand's cards) is laid on it like the mat's plane.
 */
// Twice the px of its size on screen, so the browser draws the cards' text sharp before tilting them.
export const HAND = { w: 3200, h: 760, scale: 0.0046, at: new THREE.Vector3(0, -MAT.h / 2 - 1.8, MAT.top + 3.3), lean: 0.85 };

/** The hand plane's object (world) matrix. */
export function handMatrix(): THREE.Matrix4 {
  const o = new THREE.Object3D();
  o.position.copy(HAND.at);
  // Upright (facing −y, towards you) is a quarter turn about x; lean back by HAND.lean from it.
  o.rotation.x = Math.PI / 2 - HAND.lean;
  o.scale.setScalar(HAND.scale);
  o.updateMatrixWorld();
  return o.matrixWorld;
}

/** The CSS transform of the hand plane (like planeCss, for the hand's own plane). */
export function handCss(): string {
  const e = handMatrix().elements;
  const m = [e[0], e[1], e[2], e[3], -e[4], -e[5], -e[6], -e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]].map((v) => (Math.abs(v) < 1e-10 ? 0 : v)).join(',');
  return `translate(-50%,-50%) matrix3d(${m})`;
}
