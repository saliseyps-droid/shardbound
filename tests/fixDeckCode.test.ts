import { describe, expect, it } from 'vitest';
import { decodeDeck, encodeDeck } from '@/domain/deckCode';
import { createNewSave } from '@/domain/newAccount';

const code = (payload: unknown) => 'SB1.' + btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

describe('deck code decoding never throws', () => {
  const deck = createNewSave('A', 'flame', 0, 'p').decks[0];
  const base = JSON.parse(atob(encodeDeck(deck).slice(4).replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - ((encodeDeck(deck).length - 4) % 4)) % 4)));

  it.each([
    ['t is a number', { ...base, t: 5 }],
    ['t is an object', { ...base, t: { a: 1 } }],
    ['t has non-pairs', { ...base, t: [1, 'x', null] }],
    ['payload is null', null],
    ['c entries are junk', { ...base, c: [null, 4, 'x'] }],
  ])('%s', (_, payload) => {
    expect(() => decodeDeck(code(payload))).not.toThrow();
    const res = decodeDeck(code(payload));
    if (res.ok) expect(Array.isArray(res.value.talents)).toBe(true);
    else expect(typeof res.error).toBe('string');
  });

  it('a valid code still round-trips', () => {
    const res = decodeDeck(encodeDeck(deck));
    expect(res.ok && res.value.cards).toEqual(deck.cards);
  });
});
