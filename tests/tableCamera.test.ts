import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { MAT, PLANE, cameraCss, placeCamera, planeCss, planeToWorld } from '@/ui/match/table3d/tableCamera';
import { table3dAllowed } from '@/ui/match/table3d/table3dRules';

const ok = { table3d: true, performanceMode: false, reducedMotion: false };
const env = { webgl: true, phone: false };

describe('when the 3D table may show', () => {
  it('only when turned on, with WebGL, not on phones, not in performance mode or with reduced motion', () => {
    expect(table3dAllowed(ok, env)).toBe(true);
    expect(table3dAllowed({ ...ok, table3d: false }, env)).toBe(false);
    expect(table3dAllowed(ok, { ...env, webgl: false })).toBe(false);
    expect(table3dAllowed(ok, { ...env, phone: true })).toBe(false);
    expect(table3dAllowed({ ...ok, performanceMode: true }, env)).toBe(false);
    expect(table3dAllowed({ ...ok, reducedMotion: true }, env)).toBe(false);
  });
});

describe('the table camera', () => {
  const project = (cam: THREE.PerspectiveCamera, x: number, y: number) => new THREE.Vector3(x, y, MAT.top).project(cam);

  for (const [w, h] of [[1600, 900], [1000, 800]]) {
    it(`frames the whole mat, filling the view (${w}×${h})`, () => {
      const cam = new THREE.PerspectiveCamera(32, w / h, 0.1, 600);
      placeCamera(cam, { width: w, height: h }, { tilt: 0.62, zoom: 1, panX: 0, panY: 0 });
      const corners = [[-MAT.w / 2, -MAT.h / 2], [MAT.w / 2, -MAT.h / 2], [-MAT.w / 2, MAT.h / 2], [MAT.w / 2, MAT.h / 2]].map(([x, y]) => project(cam, x, y));
      for (const c of corners) {
        expect(Math.abs(c.x)).toBeLessThanOrEqual(1.02);
        expect(Math.abs(c.y)).toBeLessThanOrEqual(1.02);
      }
      // The near edge (wider on screen) touches the sides or the bottom: the board fills the view.
      const fill = Math.max(Math.abs(corners[0].x), Math.abs(corners[0].y));
      expect(fill).toBeGreaterThan(0.85);
    });
  }

  it('zooms in towards the board: the mat grows on screen', () => {
    const cam = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 600);
    placeCamera(cam, { width: 1600, height: 900 }, { tilt: 0.62, zoom: 1, panX: 0, panY: 0 });
    const a = project(cam, MAT.w / 2, 0).x;
    placeCamera(cam, { width: 1600, height: 900 }, { tilt: 0.62, zoom: 2, panX: 0, panY: 0 });
    expect(project(cam, MAT.w / 2, 0).x).toBeGreaterThan(a * 1.5);
  });

  it('maps plane pixels onto the mat: corners to corners, y down to the near edge', () => {
    expect(planeToWorld(0, 0)).toEqual({ x: -MAT.w / 2, y: MAT.h / 2 });
    expect(planeToWorld(PLANE.w, PLANE.h)).toEqual({ x: MAT.w / 2, y: -MAT.h / 2 });
    const c = planeToWorld(PLANE.w / 2, PLANE.h / 2);
    expect(c.x).toBeCloseTo(0, 9);
    expect(c.y).toBeCloseTo(0, 9);
  });
});

// The CSS pipeline the browser applies to a point of the plane: the plane's own transform about its
// centre, the camera wrapper's transform about the perspective origin, then the perspective.
type M = number[]; // 4×4, column-major like CSS matrix3d and three's elements
const mul = (a: M, b: M): M => {
  const r = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) r[c * 4 + row] += a[k * 4 + row] * b[c * 4 + k];
  return r;
};
const translate = (x: number, y: number, z = 0): M => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const parse = (css: string, size: { w: number; h: number }): M => {
  let m: M = translate(0, 0);
  for (const [, fn, args] of css.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const v = args.split(',').map((s) => s.trim());
    const px = (s: string, of: number) => (s.endsWith('%') ? (parseFloat(s) / 100) * of : parseFloat(s));
    if (fn === 'matrix3d') m = mul(m, v.map(Number));
    else if (fn === 'translateZ') m = mul(m, translate(0, 0, px(v[0], 0)));
    else if (fn === 'translate') m = mul(m, translate(px(v[0], size.w), px(v[1], size.h)));
    else throw new Error(fn);
  }
  return m;
};
const about = (m: M, ox: number, oy: number) => mul(mul(translate(ox, oy), m), translate(-ox, -oy));

describe('the plane registers with the WebGL mat', () => {
  for (const [w, h] of [[1600, 900], [1100, 768]]) {
    it(`a point of the plane lands where the camera draws it, within 1 px (${w}×${h}, hand strip kept free)`, () => {
      const cam = new THREE.PerspectiveCamera(32, w / h, 0.1, 600);
      const view = { width: w, height: h };
      placeCamera(cam, view, { tilt: 0.62, zoom: 1.4, panX: 1, panY: -0.5, bottom: 0.2 });
      const css = cameraCss(cam, view);
      const [ox, oy] = css.origin.split(' ').map(parseFloat);
      const d = parseFloat(css.perspective);
      const persp: M = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1 / d, 0, 0, 0, 1];
      const plane = about(parse(planeCss(), { w: PLANE.w, h: PLANE.h }), PLANE.w / 2, PLANE.h / 2);
      const camM = about(parse(css.transform, { w, h }), ox, oy);
      const all = mul(about(persp, ox, oy), mul(camM, plane));
      for (const [px, py] of [[PLANE.w / 2, PLANE.h / 2], [0, 0], [PLANE.w, PLANE.h], [300, 700]]) {
        const v = [px, py, 0, 1];
        const out = [0, 1, 2, 3].map((row) => v.reduce((s, x, k) => s + all[k * 4 + row] * x, 0));
        const sx = out[0] / out[3];
        const sy = out[1] / out[3];
        const wp = planeToWorld(px, py);
        const ndc = new THREE.Vector3(wp.x, wp.y, MAT.top + 0.002).project(cam);
        expect(sx).toBeCloseTo(((ndc.x + 1) / 2) * w, -0.3);
        expect(sy).toBeCloseTo(((1 - ndc.y) / 2) * h, -0.3);
      }
    });
  }
});
