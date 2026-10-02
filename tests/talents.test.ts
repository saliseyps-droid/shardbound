import { describe, expect, it } from 'vitest';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { DEFAULT_BUILD, FACTION_TALENTS, PERSONALITY_BUILD, buildPoints, getTalent, validateBuild, type TalentPick } from '@/data/wardenTalents';

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
