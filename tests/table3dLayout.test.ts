import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/ui/styles/table3d.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = css.split('}').map((r) => {
  const [sel, body = ''] = r.split('{');
  return { sel: sel.split(',').map((s) => s.trim()), body };
});
const decl = (selector: string, prop: string) => {
  const re = new RegExp(`(?:^|;|\\s)${prop}\\s*:\\s*([^;]+)`);
  const r = rules.find((x) => x.sel.includes(selector) && re.test(x.body));
  return r?.body.match(re)?.[1].trim();
};

describe('3D table layout', () => {
  it('lets clicks through the screen-space hand band to your Warden and row on the table', () => {
    expect(decl('.match.is-3d > .self-screen', 'pointer-events')).toBe('none');
    expect(decl('.match.is-3d > .self-screen .hand-card', 'pointer-events')).toBe('auto');
    expect(decl('.match.is-3d > .self-screen button', 'pointer-events')).toBe('auto');
  });

  it('keeps the Warden centred however many energy crystals sit beside it (the side columns never grow)', () => {
    expect(decl('.table3d-plane .hero-area', 'grid-template-columns')).toBe('minmax(0, 1fr) auto minmax(0, 1fr)');
  });

  it('puts the deck count on the middle of the top card of the 3D pile, raised by the pile height', () => {
    expect(decl('.table3d-plane .draw-pile-count', 'left')).toBe('50%');
    expect(decl('.table3d-plane .draw-pile-count', 'top')).toBe('50%');
    expect(decl('.table3d-plane .draw-pile-count', 'transform')).toBe('translate(calc(-50% + var(--pile-side, 0px)), calc(-50% - var(--pile-rise, 0px)))');
  });

  it('draws the hand in 3D: its DOM cards stay as invisible hit targets', () => {
    expect(decl('.match.is-3d .self-screen .hand-card > .card', 'opacity')).toBe('0');
  });

  it('fits the two rows of the mockup-sized cards (1 : 1.4) between the Warden bands', () => {
    const w = parseFloat(decl('.table3d-plane', '--unit-w') ?? '0');
    expect(2 * (w * 1.4 + 44)).toBeLessThanOrEqual(911 - 2 * 210);
  });

  it('fits three co-op rows into the middle of the plane (911 px less the two 210 px Warden bands)', () => {
    const w = parseFloat(decl('.match.is-coop .table3d-plane', '--unit-w') ?? '150');
    // A row: the unit (1.4 × its width, the mockup's card) plus 16 px row padding, 16 px row gap and 12 px margin; 34 px co-op padding.
    const needed = 3 * (w * 1.4 + 44) + 34;
    expect(needed).toBeLessThanOrEqual(911 - 2 * 210);
  });
});
