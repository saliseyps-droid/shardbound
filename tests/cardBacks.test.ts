import { describe, expect, it } from 'vitest';
import { CARD_BACKS, DEFAULT_CARD_BACK, getCardBack } from '@/data/cardBacks';
import { buyCardBack, equipCardBack } from '@/domain/economy';
import { createNewSave } from '@/domain/newAccount';
import { CURRENT_SAVE_VERSION } from '@/domain/save';
import { migrateSave } from '@/persistence/migrations';
import { opponentSide, playerSide } from '@/domain/matchSetup';
import { PRACTICE_OPPONENTS } from '@/data/opponents';
import { validateRemoteSide } from '@/net/lobby';
import { starterDeckCards } from '@/data/starterDecks';
const prof = (username: string, avatar: string, cardBack?: string) => ({ username, avatar, cardBack: cardBack as string, portraits: [], factionPortraits: {} });

const fresh = (gold = 5000) => {
  const s = createNewSave('A', 'flame', 1, 'p');
  return { ...s, profile: { ...s.profile, gold } };
};

describe('card backs', () => {
  it('has 16 backs with unique ids; only the default is free', () => {
    expect(CARD_BACKS).toHaveLength(16);
    expect(new Set(CARD_BACKS.map((b) => b.id)).size).toBe(16);
    expect(CARD_BACKS[0].id).toBe(DEFAULT_CARD_BACK);
    expect(CARD_BACKS.filter((b) => b.price === 0).map((b) => b.id)).toEqual([DEFAULT_CARD_BACK]);
  });

  it('new accounts own and use the classic back', () => {
    const s = createNewSave('A', 'flame', 1, 'p');
    expect(s.profile.cardBacks).toEqual([DEFAULT_CARD_BACK]);
    expect(s.profile.cardBack).toBe(DEFAULT_CARD_BACK);
  });

  it('buying spends Gold once and unlocks the back', () => {
    const res = buyCardBack(fresh(500), 'ember_rune', 1);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.profile.gold).toBe(200);
    expect(res.value.profile.cardBacks).toContain('ember_rune');
    expect(buyCardBack(res.value, 'ember_rune', 2).ok).toBe(false);
  });

  it('refuses unknown backs and too little Gold', () => {
    expect(buyCardBack(fresh(100), 'ember_rune', 1).ok).toBe(false);
    expect(buyCardBack(fresh(), 'nope', 1).ok).toBe(false);
  });

  it('equips only owned backs', () => {
    expect(equipCardBack(fresh(), 'cathedral_glass').ok).toBe(false);
    const bought = buyCardBack(fresh(), 'cathedral_glass', 1);
    if (!bought.ok) throw new Error(bought.error);
    const eq = equipCardBack(bought.value, 'cathedral_glass');
    expect(eq.ok && eq.value.profile.cardBack).toBe('cathedral_glass');
  });

  it('repairs saves without or with broken card back data', () => {
    const base = { saveVersion: CURRENT_SAVE_VERSION, decks: [] };
    const a = migrateSave({ ...base, profile: { username: 'Old' } }).save.profile;
    expect(a.cardBacks).toEqual(['compass']);
    expect(a.cardBack).toBe('compass');
    const b = migrateSave({ ...base, profile: { username: 'Old', cardBacks: ['ember_rune', 'gone', 7], cardBack: 'cathedral_glass' } }).save.profile;
    expect(b.cardBacks).toEqual(['compass', 'ember_rune']);
    expect(b.cardBack).toBe('compass');
  });

  it('match sides carry the back: player choice, AI random', () => {
    const s = fresh();
    const deck = { ...s.decks[0], cards: starterDeckCards(s.decks[0].heroFaction) };
    expect(playerSide(prof('A', 'flame', 'moonlit_night'), deck).cardBack).toBe('moonlit_night');
    const opp = { ...PRACTICE_OPPONENTS.IRON, difficulty: 'EASY' as const, rarities: ['COMMON' as const] };
    expect(getCardBack(opponentSide(opp).cardBack)).toBeTruthy();
    expect(opponentSide(opp, () => 0).cardBack).toBe(CARD_BACKS[0].id);
    expect(opponentSide(opp, () => 0.99).cardBack).toBe(CARD_BACKS[15].id);
    const side = playerSide(prof('A', 'flame', 'moonlit_night'), deck);
    expect(validateRemoteSide(side)).toBeNull();
    expect(validateRemoteSide({ ...side, cardBack: 'hacked' })).toBe('Invalid card back.');
  });
});
