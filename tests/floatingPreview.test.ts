import { describe, expect, it } from 'vitest';
import { previewPlace } from '@/ui/match/table3d/previewPlace';

const card = { w: 220, h: 308 };
const view = { w: 1600, h: 900 };

describe('the card preview beside a unit on the 3D table', () => {
  it('stands to the right of the unit, centred on it', () => {
    expect(previewPlace({ left: 500, top: 300, width: 100, height: 120 }, card, view)).toEqual({ left: 616, top: 206 });
  });
  it('goes to the left when there is no room on the right', () => {
    expect(previewPlace({ left: 1400, top: 300, width: 100, height: 120 }, card, view).left).toBe(1400 - 16 - 220);
  });
  it('stays inside the screen vertically', () => {
    expect(previewPlace({ left: 500, top: 10, width: 100, height: 60 }, card, view).top).toBe(8);
    expect(previewPlace({ left: 500, top: 860, width: 100, height: 40 }, card, view).top).toBe(900 - 308 - 8);
  });
});
