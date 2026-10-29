import { describe, expect, it } from 'vitest';
import { DEFAULT_ROOM } from '@/data/lounge';
import { activeRoom, buyDecor, placeDecor } from '@/domain/lounge';
import { createNewSave } from '@/domain/newAccount';
import { migrateSave } from '@/persistence/migrations';

const rich = () => {
  const s = createNewSave('A', 'flame', 1, 'p');
  s.profile.gold = 3000;
  return s;
};
const unwrap = <T,>(r: { ok: true; value: T } | { ok: false; error: string }) => {
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe('Lounge decor', () => {
  it('starts with the default room', () => {
    expect(activeRoom(createNewSave('A', 'flame', 1, 'p').profile)).toEqual(DEFAULT_ROOM);
  });

  it('is bought with Gold, once', () => {
    const s = unwrap(buyDecor(rich(), 't_cinder', 2));
    expect(s.profile.gold).toBe(1500);
    expect(s.profile.ownedDecor).toEqual(['t_cinder']);
    expect(buyDecor(s, 't_cinder', 3).ok).toBe(false);
    expect(buyDecor(s, 't_tavern', 3).ok).toBe(false);
    expect(buyDecor(s, 'nope', 3).ok).toBe(false);
  });

  it('cannot be bought without enough Gold', () => {
    const s = createNewSave('A', 'flame', 1, 'p');
    s.profile.gold = 100;
    expect(buyDecor(s, 't_neon', 2).ok).toBe(false);
  });

  it('is placed only when owned and only in a slot of its kind', () => {
    let s = rich();
    expect(placeDecor(s, 'table', 't_cinder').ok).toBe(false);
    s = unwrap(buyDecor(s, 't_cinder', 2));
    expect(placeDecor(s, 'floor', 't_cinder').ok).toBe(false);
    s = unwrap(placeDecor(s, 'table', 't_cinder'));
    expect(activeRoom(s.profile).table).toBe('t_cinder');
    s = unwrap(placeDecor(s, 'table', 't_tavern'));
    expect(activeRoom(s.profile).table).toBe('t_tavern');
  });

  it('moves a piece of furniture from one slot to another', () => {
    let s = unwrap(buyDecor(rich(), 'fu_wine', 2));
    s = unwrap(placeDecor(s, 'furnLeft', 'fu_wine'));
    s = unwrap(placeDecor(s, 'furnRight', 'fu_wine'));
    expect(activeRoom(s.profile).furnLeft).toBeNull();
    expect(activeRoom(s.profile).furnRight).toBe('fu_wine');
  });

  it('empties optional slots only', () => {
    let s = unwrap(buyDecor(rich(), 'p_crown', 2));
    s = unwrap(placeDecor(s, 'painting', 'p_crown'));
    s = unwrap(placeDecor(s, 'painting', null));
    expect(activeRoom(s.profile).painting).toBeNull();
    expect(placeDecor(s, 'table', null).ok).toBe(false);
  });

  it('is repaired when loaded: unknown pieces dropped, unowned ones taken out of the room', () => {
    const s = createNewSave('A', 'flame', 1, 'p');
    const raw = JSON.parse(JSON.stringify(s));
    raw.profile.ownedDecor = ['fu_wine', 'fu_wine', 'gone'];
    raw.profile.room = { ...DEFAULT_ROOM, furnLeft: 'fu_wine', table: 't_neon' };
    const m = migrateSave(raw).save;
    expect(m.profile.ownedDecor).toEqual(['fu_wine']);
    expect(m.profile.room?.furnLeft).toBe('fu_wine');
    expect(m.profile.room?.table).toBe('t_tavern');
  });
});
