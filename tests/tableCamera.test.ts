import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { MAT, PLANE, placeCamera, planeToWorld } from '@/ui/match/table3d/tableCamera';
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
