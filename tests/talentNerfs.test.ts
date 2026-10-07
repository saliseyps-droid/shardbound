import { describe, expect, it } from 'vitest';
import { getTalent } from '@/data/wardenTalents';
import type { TalentPick } from '@/data/wardenTalents';
import { act, newGame, setEnergy } from './helpers';

const t = (abilityId: string, level: 0 | 1 | 2): TalentPick => ({ abilityId, level });
const summons = (effects: { type: string; cardId?: string; count?: number }[]) =>
  effects.filter((e) => e.type === 'SUMMON').map((e) => `${e.count ?? 1}x ${e.cardId}`);

describe('0.13.5 talent nerfs', () => {
  it('Assemble III costs 4 energy', () => {
    const lv = getTalent('wt_iron_assemble')!.levels[2] as { cost: number };
    expect(lv.cost).toBe(4);
  });

  it('Assembly Protocol II gives +1/+0 and 1 Armor; +1/+1 only at III', () => {
    let s = newGame({ talents0: [t('wt_iron_assemble', 0), t('wt_iron_assembly_protocol', 1)] });
    setEnergy(s, 0, 10);
    const armor = s.players[0].hero.armor;
    s = act(s, { type: 'HERO_POWER', player: 0, slot: 0 });
    const bot = s.players[0].board.find((u) => u.cardId === 'token_scrapbot')!;
    expect([bot.attackBuff, bot.healthBuff]).toEqual([1, 0]);
    expect(s.players[0].hero.armor).toBe(armor + 1);
  });

  it('Hollow Summons III no longer adds a Wisp', () => {
    const lv = getTalent('wt_void_hollow_summons')!.levels[2] as { effects: { type: string; cardId?: string }[] };
    expect(summons(lv.effects)).toEqual(['1x token_skeleton']);
  });

  it('Hollow Summons III costs 2 and no longer heals the Warden', () => {
    const lv = getTalent('wt_void_hollow_summons')!.levels[2] as { cost: number; effects: { type: string }[] };
    expect(lv.cost).toBe(2);
    expect(lv.effects.some((e) => e.type === 'HEAL')).toBe(false);
  });

  it('Unending summons Risen Bones only at rank III', () => {
    const levels = getTalent('wt_void_unending')!.levels as { abilities: { effects: { type: string; cardId?: string }[] }[] }[];
    expect(summons(levels[1].abilities[0].effects)).toEqual(['1x token_hollow_wisp']);
    expect(summons(levels[2].abilities[0].effects)).toEqual(['1x token_skeleton']);
  });
});
