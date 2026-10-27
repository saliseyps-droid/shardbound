import * as THREE from 'three';

/**
 * The 3D table: a WebGL scene behind the match and the match's on-table DOM laid onto the mat with a
 * CSS matrix3d from the same camera (the CSS3DRenderer formula applied to React-owned elements).
 * World units: the mat is MAT.w × MAT.h, centred on the origin in the XY plane, its top at z = MAT.top;
 * +y runs away from the player. The DOM plane is PLANE.w × PLANE.h px (the mat's aspect).
 */
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
}

/**
 * Places the camera so the mat fills the view at zoom 1 (the near edge reaching the sides or the
 * bottom), leaning back by `tilt` radians; zoom moves it in, pan shifts what it looks at.
 */
export function placeCamera(camera: THREE.PerspectiveCamera, view: { width: number; height: number }, s: CameraState): void {
  camera.fov = FOV;
  camera.aspect = view.width / view.height;
  camera.up.set(0, 1, 0);
  // A free strip at the bottom: render the lower part of a taller image, so the view's centre (and the
  // table) moves up into the rest of the screen.
  const b = s.bottom ?? 0;
  if (b > 0) camera.setViewOffset(view.width, view.height * (1 + b), 0, view.height * b, view.width, view.height);
  else camera.clearViewOffset();
  const lookY = 0.35 * Math.sin(s.tilt);
  const put = (d: number, panX: number, panY: number) => {
    camera.position.set(panX, panY + lookY - Math.sin(s.tilt) * d, Math.cos(s.tilt) * d);
    camera.lookAt(panX, panY + lookY, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };
  const corners = [[-MAT.w / 2, -MAT.h / 2], [MAT.w / 2, -MAT.h / 2], [-MAT.w / 2, MAT.h / 2], [MAT.w / 2, MAT.h / 2]];
  const fits = (d: number) => {
    put(d, 0, 0);
    return corners.every(([x, y]) => {
      const p = new THREE.Vector3(x, y, MAT.top).project(camera);
      return Math.abs(p.x) <= 1 && p.y <= 1 && p.y >= -1 + 2 * (s.bottom ?? 0);
    });
  };
  // The nearest distance at which the whole mat fits (it only fits better further away).
  let lo = 1;
  let hi = 400;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) hi = mid;
    else lo = mid;
  }
  put(hi / Math.max(1, s.zoom), s.panX, s.panY);
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
