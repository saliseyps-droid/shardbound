import { describe, expect, it } from 'vitest';
import { decksForPicking } from '@/ui/components/meta/MetaWidgets';

describe('deck picking order', () => {
  it('puts favourite decks first and keeps the rest in order', () => {
    const decks = [{ id: 'a' }, { id: 'b', favorite: true }, { id: 'c' }, { id: 'd', favorite: true }];
    expect(decksForPicking(decks).map((d) => d.id)).toEqual(['b', 'd', 'a', 'c']);
    expect(decks.map((d) => d.id)).toEqual(['a', 'b', 'c', 'd']);
  });
});
