import { describe, expect, it } from 'vitest';
import { sanitizeRemoteSide, validateRemoteSide } from '@/net/lobby';
import { playerSide } from '@/domain/matchSetup';
import { createNewSave } from '@/domain/newAccount';
import type { SideSetup } from '@/engine/types';

const prof = { username: 'G', avatar: 'b', cardBack: undefined as unknown as string, portraits: [], factionPortraits: {} };

describe('remote side validation', () => {
  const save = createNewSave('G', 'b', 0, 'g');
  const side = playerSide(prof, save.decks[0]);

  it('rejects a guest that asks to keep its deck order', () => {
    expect(validateRemoteSide(side)).toBeNull();
    expect(validateRemoteSide({ ...side, keepDeckOrder: true })).toBe('Invalid match setup.');
  });

  it('rejects a faction that does not match the deck', () => {
    const other = side.faction === 'EMBER' ? 'TIDE' : 'EMBER';
    expect(validateRemoteSide({ ...side, faction: other })).toBe('Invalid Warden.');
  });

  it('rejects non-string names', () => {
    expect(validateRemoteSide({ ...side, name: 5 as unknown as string })).toBe('Invalid match setup.');
  });

  it('sanitizing keeps only known fields and never keeps the deck order', () => {
    const dirty = { ...side, keepDeckOrder: true, heroHealth: 99, junk: 1 } as SideSetup & { junk: number };
    const clean = sanitizeRemoteSide(dirty) as SideSetup & { junk?: number };
    expect(clean.keepDeckOrder).toBe(false);
    expect(clean.heroHealth).toBeUndefined();
    expect(clean.junk).toBeUndefined();
    expect(clean.deck).toEqual(side.deck);
    expect(clean.faction).toBe(side.faction);
    expect(clean.name).toBe('G');
  });
});
