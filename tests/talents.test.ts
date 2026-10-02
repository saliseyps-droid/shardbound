import { describe, expect, it } from 'vitest';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { DEFAULT_BUILD, FACTION_TALENTS, PERSONALITY_BUILD, buildPoints, defaultBuild, getTalent, toggleNode, validateBuild, type TalentPick } from '@/data/wardenTalents';
import { starterDeckCards } from '@/data/starterDecks';
import { CAMPAIGN } from '@/data/opponents';
import { validateDeck } from '@/domain/decks';
import { createNewSave } from '@/domain/newAccount';
import { opponentSide, playerSide } from '@/domain/matchSetup';
import { CURRENT_SAVE_VERSION } from '@/domain/save';
import { migrateSave } from '@/persistence/migrations';
import { validateRemoteSide } from '@/net/lobby';

const pick = (abilityId: string, level: 0 | 1 | 2): TalentPick => ({ abilityId, level });

describe('Warden talent data', () => {
  it('gives every faction 5 abilities with ranks I-III', () => {
    for (const f of PLAYABLE_FACTIONS) {
      expect(FACTION_TALENTS[f]).toHaveLength(5);
      for (const t of FACTION_TALENTS[f]) {
        expect(t.faction).toBe(f);
        expect(t.levels).toHaveLength(3);
        expect(t.upgradeNotes).toHaveLength(2);
        expect(getTalent(t.id)).toBe(t);
      }
    }
  });

  it('default and AI builds are valid', () => {
    for (const f of PLAYABLE_FACTIONS) {
      expect(validateBuild(f, DEFAULT_BUILD[f])).toBeNull();
      for (const b of Object.values(PERSONALITY_BUILD[f])) expect(validateBuild(f, b)).toBeNull();
    }
  });

  it('accepts all 20 III + II builds of a faction', () => {
    const ids = FACTION_TALENTS.EMBER.map((t) => t.id);
    let n = 0;
    for (const a of ids) for (const b of ids) {
      if (a === b) continue;
      expect(validateBuild('EMBER', [pick(a, 2), pick(b, 1)])).toBeNull();
      n++;
    }
    expect(n).toBe(20);
  });

  it('rejects builds that break the rules', () => {
    const [a, b, c] = FACTION_TALENTS.EMBER.map((t) => t.id);
    const foreign = FACTION_TALENTS.TIDE[0].id;
    expect(validateBuild('EMBER', [pick(a, 2)])).not.toBeNull();
    expect(validateBuild('EMBER', [pick(a, 2), pick(b, 1), pick(c, 0)])).not.toBeNull();
    expect(validateBuild('EMBER', [pick(a, 2), pick(a, 1)])).not.toBeNull();
    expect(validateBuild('EMBER', [pick(a, 2), pick(foreign, 1)])).not.toBeNull();
    expect(validateBuild('EMBER', [pick(a, 1), pick(b, 1)])).not.toBeNull(); // only 4 points
    expect(validateBuild('EMBER', [pick(a, 0), pick(b, 2)])).not.toBeNull(); // 4 points
    expect(validateBuild('EMBER', [{ abilityId: a, level: 3 }, pick(b, 0)])).not.toBeNull();
    expect(validateBuild('EMBER', 'nope')).not.toBeNull();
    expect(validateBuild('EMBER', undefined)).not.toBeNull();
  });

  it('counts points as rank number', () => {
    const [a, b] = FACTION_TALENTS.IRON.map((t) => t.id);
    expect(buildPoints([pick(a, 2), pick(b, 1)])).toBe(5);
    expect(buildPoints([pick(a, 0)])).toBe(1);
  });
});

describe('Warden talents in decks, saves, bosses and online play', () => {
  const cards = () => starterDeckCards('EMBER');

  it('flags decks with an incomplete or foreign build', () => {
    const base = { name: 'D', heroFaction: 'EMBER' as const, cards: cards() };
    expect(validateDeck({ ...base, talents: defaultBuild('EMBER') }).map((i) => i.code)).not.toContain('TALENTS');
    expect(validateDeck({ ...base, talents: [] }).map((i) => i.code)).toContain('TALENTS');
    expect(validateDeck({ ...base, talents: defaultBuild('TIDE') }).map((i) => i.code)).toContain('TALENTS');
  });

  it('repairs saves without talents or with a broken build', () => {
    const report = migrateSave({
      saveVersion: CURRENT_SAVE_VERSION,
      profile: { username: 'Old' },
      decks: [
        { id: 'd1', name: 'Old', heroFaction: 'IRON', cards: {} },
        { id: 'd2', name: 'Broken', heroFaction: 'VOID', cards: {}, talents: [{ abilityId: 'wt_tide_rime_touch', level: 2 }] },
        { id: 'd3', name: 'Mine', heroFaction: 'ASTRAL', cards: {}, talents: [pick('wt_astral_foresight', 2), pick('wt_astral_spellweave', 1)] },
      ],
    });
    const [d1, d2, d3] = report.save.decks;
    expect(d1.talents).toEqual(DEFAULT_BUILD.IRON);
    expect(d2.talents).toEqual(DEFAULT_BUILD.VOID);
    expect(d3.talents).toEqual([pick('wt_astral_foresight', 2), pick('wt_astral_spellweave', 1)]);
  });

  it('new accounts start with valid builds on every starter deck', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    for (const d of save.decks) expect(validateBuild(d.heroFaction, d.talents)).toBeNull();
  });

  it('gives every campaign boss two known abilities', () => {
    for (const ch of CAMPAIGN) for (const enc of ch.encounters) {
      const side = opponentSide(enc);
      expect(side.talents).toHaveLength(2);
      for (const t of side.talents!) expect(getTalent(t.abilityId)?.levels[t.level]).toBeTruthy();
    }
  });

  it('the host rejects an online guest with an invalid build', () => {
    const save = createNewSave('G', 'wave', 1, 'g');
    const deck = { ...save.decks[0], cards: starterDeckCards(save.decks[0].heroFaction) };
    const side = playerSide('G', 'wave', deck);
    expect(validateRemoteSide(side)).toBeNull();
    expect(validateRemoteSide({ ...side, talents: [] })).toBe('Invalid Warden abilities.');
    expect(validateRemoteSide({ ...side, talents: undefined })).toBe('Invalid Warden abilities.');
  });
});

describe('talent tree clicks', () => {
  const [a, b, c] = FACTION_TALENTS.VOID.map((t) => t.id);

  it('learns rank I, then upgrades in order', () => {
    let build = toggleNode([], a, 0) as TalentPick[];
    expect(build).toEqual([pick(a, 0)]);
    build = toggleNode(build, a, 1) as TalentPick[];
    build = toggleNode(build, a, 2) as TalentPick[];
    expect(build).toEqual([pick(a, 2)]);
  });

  it('refuses out-of-order ranks, a third ability and overspending', () => {
    expect(toggleNode([], a, 1)).toBe('Learn rank I first.');
    expect(toggleNode([pick(a, 0)], a, 2)).toBe('Learn rank II first.');
    expect(toggleNode([pick(a, 0), pick(b, 0)], c, 0)).toBe('You can learn only 2 abilities.');
    expect(toggleNode([pick(a, 2), pick(b, 1)], b, 2)).toBe('No talent points left.');
  });

  it('unlearning a rank also drops the ranks above it', () => {
    expect(toggleNode([pick(a, 2), pick(b, 1)], a, 0)).toEqual([pick(b, 1)]);
    expect(toggleNode([pick(a, 2), pick(b, 1)], a, 1)).toEqual([pick(a, 0), pick(b, 1)]);
    expect(toggleNode([pick(a, 2), pick(b, 1)], b, 1)).toEqual([pick(a, 2), pick(b, 0)]);
  });
});
