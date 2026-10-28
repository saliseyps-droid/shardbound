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

  it('fits three co-op rows into the middle of the plane (911 px less the two 210 px Warden bands)', () => {
    const w = parseFloat(decl('.match.is-coop .table3d-plane', '--unit-w') ?? '150');
    // A row: the unit (1.22 × its width) plus 16 px row padding, 16 px row gap and 12 px margin; 34 px co-op padding.
    const needed = 3 * (w * 1.22 + 44) + 34;
    expect(needed).toBeLessThanOrEqual(911 - 2 * 210);
  });
});
