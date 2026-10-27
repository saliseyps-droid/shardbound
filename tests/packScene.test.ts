import { describe, expect, it } from 'vitest';
import { rectToWorld, SCENE_CAMERA } from '@/ui/components/packs/packScene';

const view = { width: 1000, height: 800 };

describe('3D pack opening: placing 3D objects on the page layout', () => {
  it('puts a rect centred on the screen at the middle of the view', () => {
    const p = rectToWorld({ left: 450, top: 330, width: 100, height: 140 }, view, 0.6);
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeCloseTo(SCENE_CAMERA.y, 5);
  });

  it('gives the width in world units that the rect covers at that depth', () => {
    const p = rectToWorld({ left: 0, top: 0, width: 100, height: 140 }, view, 0.6);
    const d = SCENE_CAMERA.z - 0.6;
    const worldPerPixel = (2 * d * Math.tan((SCENE_CAMERA.fov * Math.PI) / 360)) / view.height;
    expect(p.width).toBeCloseTo(100 * worldPerPixel, 5);
    expect(p.height).toBeCloseTo(140 * worldPerPixel, 5);
  });

  it('maps right and down on the screen to +x and -y in the scene', () => {
    const a = rectToWorld({ left: 100, top: 100, width: 10, height: 10 }, view, 0.6);
    const b = rectToWorld({ left: 800, top: 600, width: 10, height: 10 }, view, 0.6);
    expect(b.x).toBeGreaterThan(a.x);
    expect(b.y).toBeLessThan(a.y);
  });
});
