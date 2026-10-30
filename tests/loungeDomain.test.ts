import { describe, expect, it } from 'vitest';
import { DEFAULT_ROOM, inSeason } from '@/data/lounge';
import { activeRoom, buyDecor, earnedTrophies, placeDecor, roomInfoOf, setLoungeCard } from '@/domain/lounge';
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
    let s = unwrap(buyDecor(rich(), 'fu_rocking', 2));
    s = unwrap(placeDecor(s, 'furnLeft', 'fu_rocking'));
    s = unwrap(placeDecor(s, 'furnRight', 'fu_rocking'));
    expect(activeRoom(s.profile).furnLeft).toBeNull();
    expect(activeRoom(s.profile).furnRight).toBe('fu_rocking');
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
    raw.profile.ownedDecor = ['fu_rocking', 'fu_rocking', 'gone'];
    raw.profile.room = { ...DEFAULT_ROOM, furnLeft: 'fu_rocking', table: 't_neon' };
    const m = migrateSave(raw).save;
    expect(m.profile.ownedDecor).toEqual(['fu_rocking']);
    expect(m.profile.room?.furnLeft).toBe('fu_rocking');
    expect(m.profile.room?.table).toBe('t_tavern');
  });
});

describe('Lounge seasons', () => {
  const halloween = { season: { from: '10-15', to: '11-10' } };
  it('sells a seasonal piece only in its season', () => {
    expect(inSeason(halloween, new Date(2026, 9, 30))).toBe(true);
    expect(inSeason(halloween, new Date(2026, 10, 10))).toBe(true);
    expect(inSeason(halloween, new Date(2026, 10, 11))).toBe(false);
    expect(inSeason(halloween, new Date(2026, 5, 1))).toBe(false);
    expect(inSeason({}, new Date(2026, 5, 1))).toBe(true);
  });

  it('handles a season across the new year', () => {
    const winter = { season: { from: '12-10', to: '01-06' } };
    expect(inSeason(winter, new Date(2026, 11, 24))).toBe(true);
    expect(inSeason(winter, new Date(2027, 0, 3))).toBe(true);
    expect(inSeason(winter, new Date(2027, 1, 3))).toBe(false);
  });

  it('refuses to sell out of season', () => {
    expect(buyDecor(rich(), 'fu_pumpkins', new Date(2026, 5, 1).getTime()).ok).toBe(false);
    expect(buyDecor(rich(), 'fu_pumpkins', new Date(2026, 9, 30).getTime()).ok).toBe(true);
  });
});

describe('what the room shows of its owner', () => {
  it('earns trophies by tier', () => {
    const p = { ...rich().profile, wins: 120, bestWinStreak: 4, tournamentsWon: 1, packsOpened: 600 };
    expect(earnedTrophies(p)).toEqual([
      { id: 'wins', tier: 2 },
      { id: 'tournament', tier: 1 },
      { id: 'packs', tier: 3 },
    ]);
  });

  it('frames the rarest card owned until one is chosen', () => {
    const s = rich();
    const info = roomInfoOf(s);
    expect(info.cardId).toBeDefined();
    const owned = Object.keys(s.collection.cards).find((id) => id !== info.cardId)!;
    const chosen = unwrap(setLoungeCard(s, owned));
    expect(roomInfoOf(chosen).cardId).toBe(owned);
    expect(setLoungeCard(s, 'not_a_card').ok).toBe(false);
  });

  it('drops a framed card that no longer exists on load', () => {
    const s = rich();
    (s.profile as { loungeCard?: string }).loungeCard = 'gone_card';
    expect(migrateSave(JSON.parse(JSON.stringify(s))).save.profile.loungeCard).toBeUndefined();
  });
});
