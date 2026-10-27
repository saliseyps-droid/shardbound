import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// A hovered hand card rises (bottom moves up by 0.2 card widths and it scales from its bottom edge),
// so a pointer resting near the card's lower edge would leave it and the card would drop and rise
// again in a loop. A hover bridge below the lifted card keeps the pointer "on" it.
const css = readFileSync('src/ui/styles/board.css', 'utf8');

describe('hand card hover', () => {
  it('keeps a hover bridge under a lifted card, at least as tall as the lift', () => {
    const rule = css.split('}').find((r) => /\.hand-card:hover::after/.test(r.split('{')[0]));
    expect(rule, 'a .hand-card:hover::after rule').toBeDefined();
    expect(rule).toMatch(/top:\s*100%/);
    expect(rule).toMatch(/pointer-events:\s*auto/);
    // The lift is 0.2 card widths on screen; scaled by 1.45 the bridge needs >= 0.14 widths locally.
    const h = rule!.match(/height:\s*calc\(var\(--card-w\)\s*\*\s*([\d.]+)\)/);
    expect(Number(h?.[1])).toBeGreaterThanOrEqual(0.14);
  });
});
