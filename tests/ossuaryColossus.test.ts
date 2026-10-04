import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';

describe('Ossuary Colossus', () => {
  it('costs 5, is a 3/4 and grows up to +4/+4', () => {
    const c = getCard('vod_ossuary_colossus')!;
    expect([c.manaCost, c.attack, c.health]).toEqual([5, 3, 4]);
    const buff = c.abilities![0].effects[0] as { attack: { max: number }; health: { max: number } };
    expect([buff.attack.max, buff.health.max]).toEqual([4, 4]);
  });
});
