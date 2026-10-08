import { describe, expect, it } from 'vitest';
import { PORTRAITS, getPortrait } from '@/data/portraits';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { createNewSave } from '@/domain/newAccount';
import { buyPortrait, choosePortrait, effectivePortrait } from '@/domain/portraits';
import { opponentSide, playerSide } from '@/domain/matchSetup';
import { validateRemoteSide } from '@/net/lobby';
import { migrateSave } from '@/persistence/migrations';
import { CURRENT_SAVE_VERSION } from '@/domain/save';
import { PRACTICE_OPPONENTS } from '@/data/opponents';
import { createGame } from '@/engine';

const rich = () => {
  const s = createNewSave('Tester', 'compass', 0, 'p1');
  return { ...s, profile: { ...s.profile, gold: 5000 } };
};

describe('withdrawn portraits', () => {
  it('a bought portrait that left the game is refunded and dropped, together with its faction choice', () => {
    const s = rich();
    const profile = { ...s.profile, gold: 100, portraits: ['iron_dread_overlord', 'void_hooded_wraith', 'ember_orc_warchief', 'void_night_elf'], factionPortraits: { IRON: 'iron_dread_overlord' } };
    const out = migrateSave({ ...s, saveVersion: CURRENT_SAVE_VERSION, profile }).save.profile;
    expect(out.gold).toBe(100 + 250 + 150 + 150);
    expect(out.portraits).toEqual(['void_night_elf']);
    expect(out.factionPortraits.IRON).toBeUndefined();
  });
});

describe('Warden portraits', () => {
  it('has 25 portraits, at least two for every faction', () => {
    expect(PORTRAITS).toHaveLength(25);
    expect(new Set(PORTRAITS.map((p) => p.id)).size).toBe(25);
    for (const f of PLAYABLE_FACTIONS) expect(PORTRAITS.filter((p) => p.faction === f).length).toBeGreaterThanOrEqual(2);
  });

  it('can be bought once with Gold', () => {
    const p = PORTRAITS[0];
    const bought = buyPortrait(rich(), p.id, 1);
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(bought.value.profile.portraits).toContain(p.id);
    expect(bought.value.profile.gold).toBe(5000 - p.price);
    expect(buyPortrait(bought.value, p.id, 2).ok).toBe(false);
    const poor = { ...rich(), profile: { ...rich().profile, gold: 0 } };
    expect(buyPortrait(poor, p.id, 1).ok).toBe(false);
  });

  it('is chosen per faction and per deck; decks fall back to the faction choice', () => {
    const ember = PORTRAITS.find((p) => p.faction === 'EMBER')!;
    const tide = PORTRAITS.find((p) => p.faction === 'TIDE')!;
    let s = rich();
    expect(choosePortrait(s, 'EMBER', ember.id).ok).toBe(false); // not owned yet
    s = (buyPortrait(s, ember.id, 1) as { ok: true; value: typeof s }).value;
    s = (buyPortrait(s, tide.id, 1) as { ok: true; value: typeof s }).value;
    expect(choosePortrait(s, 'EMBER', tide.id).ok).toBe(false); // wrong faction
    const chosen = choosePortrait(s, 'EMBER', ember.id);
    expect(chosen.ok).toBe(true);
    if (!chosen.ok) return;
    s = chosen.value;
    const emberDeck = s.decks.find((d) => d.heroFaction === 'EMBER')!;
    expect(effectivePortrait(emberDeck, s.profile)).toBe(ember.id);
    expect(effectivePortrait({ ...emberDeck, portrait: tide.id }, s.profile)).toBe(ember.id); // wrong faction ignored
    expect(effectivePortrait({ ...emberDeck, portrait: 'default' }, s.profile)).toBeNull(); // deck forces the faction default
    expect(playerSide(s.profile, emberDeck).portrait).toBe(ember.id);
  });

  it('reaches the match, AI opponents get one of their faction, and online peers are checked', () => {
    const s = rich();
    const deck = s.decks[0];
    const own = { ...playerSide(s.profile, deck), portrait: PORTRAITS.find((p) => p.faction === deck.heroFaction)!.id };
    const opp = opponentSide({ ...PRACTICE_OPPONENTS.TIDE, difficulty: 'EASY', rarities: ['COMMON'] }, () => 0.5);
    expect(opp.portrait === null || getPortrait(opp.portrait!)?.faction === 'TIDE').toBe(true);
    const { state } = createGame({ seed: 1, players: [own, opp] });
    expect(state.players[0].hero.portrait).toBe(own.portrait);
    expect(validateRemoteSide(own)).toBeNull();
    const wrong = PORTRAITS.find((p) => p.faction !== deck.heroFaction)!.id;
    expect(validateRemoteSide({ ...own, portrait: wrong })).not.toBeNull();
  });

  it('old saves get empty portrait data and unknown portraits are dropped', () => {
    const base = { saveVersion: CURRENT_SAVE_VERSION, profile: { username: 'Old', portraits: ['nope', PORTRAITS[0].id], factionPortraits: { EMBER: 'nope' } }, decks: [] };
    const p = migrateSave(base).save.profile;
    expect(p.portraits).toEqual([PORTRAITS[0].id]);
    expect(p.factionPortraits).toEqual({});
  });
});
