/**
 * Watches the 3D table's frame rate: after WINDOW seconds averaging under SLOW fps it first asks for
 * lower quality ('degrade': no shadows, a lower resolution); if the next window is still slow it
 * offers the 2D board ('offer2d'). Each happens once. Frames longer than half a second (a tab
 * switch, a loading hitch) are left out.
 */
export type FpsVerdict = 'ok' | 'degrade' | 'offer2d';

const WINDOW = 6;
const SLOW = 28;

export function createFpsWatch() {
  let time = 0;
  let frames = 0;
  let stage: 0 | 1 | 2 = 0;
  return {
    frame(dt: number): FpsVerdict {
      if (stage === 2 || dt > 0.5) return 'ok';
      time += dt;
      frames++;
      if (time < WINDOW) return 'ok';
      const fps = frames / time;
      time = 0;
      frames = 0;
      if (fps >= SLOW) return 'ok';
      stage++;
      return stage === 1 ? 'degrade' : 'offer2d';
    },
  };
}
