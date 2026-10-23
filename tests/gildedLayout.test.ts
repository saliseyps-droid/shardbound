import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// The stat gems sit at bottom: -1cqw with a height of 20cqw, so their top is 19cqw above the card's
// bottom edge. The Gilded layout stacks the text from the bottom, so its bottom padding must clear that.
const css = readFileSync('src/ui/styles/gilded.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const paddingFor = (selector: string) => {
  const rule = css.split('}').find((r) => r.split('{')[0].split(',').map((s) => s.trim()).includes(selector));
  const m = rule?.match(/padding-bottom:\s*([\d.]+)cqw/);
  return m ? Number(m[1]) : 0;
};

describe('Gilded card layout', () => {
  it('keeps unit text above the Attack and Health gems', () => {
    expect(paddingFor('.card.card-gilded.card-unit .card-inner')).toBeGreaterThanOrEqual(19);
  });

  it('keeps relic and location text above the charges and duration gem', () => {
    expect(paddingFor('.card.card-gilded.card-relic .card-inner')).toBeGreaterThanOrEqual(19);
    expect(paddingFor('.card.card-gilded.card-location .card-inner')).toBeGreaterThanOrEqual(19);
  });
});
