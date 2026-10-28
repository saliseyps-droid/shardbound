import { describe, expect, it } from 'vitest';
import { createFpsWatch } from '@/ui/match/table3d/fpsWatch';

const run = (watch: ReturnType<typeof createFpsWatch>, fps: number, seconds: number) => {
  const out: string[] = [];
  for (let t = 0; t < seconds * fps; t++) {
    const r = watch.frame(1 / fps);
    if (r !== 'ok') out.push(r);
  }
  return out;
};

describe('3D table frame-rate watch', () => {
  it('stays quiet at a smooth frame rate', () => {
    expect(run(createFpsWatch(), 60, 30)).toEqual([]);
  });

  it('first lowers the quality after a few slow seconds, then offers 2D if it stays slow', () => {
    const w = createFpsWatch();
    expect(run(w, 20, 7)).toEqual(['degrade']);
    expect(run(w, 20, 7)).toEqual(['offer2d']);
    // Only once each.
    expect(run(w, 20, 20)).toEqual([]);
  });

  it('does not offer 2D when lowering the quality helped', () => {
    const w = createFpsWatch();
    expect(run(w, 20, 7)).toEqual(['degrade']);
    expect(run(w, 50, 20)).toEqual([]);
  });

  it('ignores a single long hitch (a tab switch, a loading frame)', () => {
    const w = createFpsWatch();
    w.frame(3);
    expect(run(w, 60, 10)).toEqual([]);
  });
});
