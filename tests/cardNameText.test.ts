import { describe, expect, it } from 'vitest';
import { splitCardNames } from '@/ui/components/CardNameText';

describe('card names in running text', () => {
  it('marks whole card names with their card id and keeps the rest as text', () => {
    const parts = splitCardNames('Glacial Thornwings now deals 2 damage; Hailstorm is unchanged.');
    expect(parts.filter((p) => p.cardId).map((p) => [p.text, p.cardId])).toEqual([
      ['Glacial Thornwings', 'tid_glacial_thornwings'],
      ['Hailstorm', 'tid_hailstorm'],
    ]);
    expect(parts.map((p) => p.text).join('')).toBe('Glacial Thornwings now deals 2 damage; Hailstorm is unchanged.');
  });

  it('does not match inside longer words', () => {
    expect(splitCardNames('Hailstorms and XHailstorm').some((p) => p.cardId)).toBe(false);
  });

  it('knows Legendaries by their short name too', () => {
    expect(splitCardNames('Azhrel, Kaelthar and the final battle').filter((p) => p.cardId).map((p) => p.cardId)).toEqual(['tid_azhrel_drowned_champion', 'vod_kaelthar_pyre_of_souls']);
  });
});
