import { describe, expect, it } from 'vitest';
import { getLegalActions } from '@/engine/legal';
import type { TalentPick } from '@/data/wardenTalents';
import { act, endTurn, giveCard, hero, newGame, setEnergy, tryAct, unitAt, unitRef } from './helpers';

const t = (abilityId: string, level: 0 | 1 | 2): TalentPick => ({ abilityId, level });

describe('Warden abilities in the engine', () => {
  it('uses both active slots in the same turn, each once', () => {
    let s = newGame({ talents0: [t('wt_tide_rime_touch', 2), t('wt_tide_undertow', 1)], board1: ['token_treant', 'token_sentry'] });
    setEnergy(s, 0, 10);
    s = act(s, { type: 'HERO_POWER', player: 0, slot: 0, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.players[0].energy).toBe(9);
    expect(unitAt(s, 1, 0).frozen).toBe(true);
    s = act(s, { type: 'HERO_POWER', player: 0, slot: 1, target: unitRef(unitAt(s, 1, 1)) });
    expect(s.players[0].energy).toBe(7);
    expect(s.players[1].board).toHaveLength(1);
    expect(tryAct(s, { type: 'HERO_POWER', player: 0, slot: 0, target: unitRef(unitAt(s, 1, 0)) }).error).toBe('Already used this turn');
  });

  it('requires a target when the ability has one', () => {
    const s = newGame({ talents0: [t('wt_ember_cinder_bolt', 2), t('wt_ember_kindled_fury', 1)] });
    setEnergy(s, 0, 5);
    expect(tryAct(s, { type: 'HERO_POWER', player: 0, slot: 0 }).error).toBe('A target is required');
    const after = act(s, { type: 'HERO_POWER', player: 0, slot: 0, target: hero(1) });
    expect(after.players[1].hero.health).toBe(29);
  });

  it('a passive slot cannot be activated', () => {
    const s = newGame({ talents0: [t('wt_iron_reinforced_hull', 2), t('wt_iron_rivet_plating', 1)] });
    setEnergy(s, 0, 5);
    expect(tryAct(s, { type: 'HERO_POWER', player: 0, slot: 0 }).error).toBeTruthy();
  });

  it('resolves two passive slots independently', () => {
    let s = newGame({ talents0: [t('wt_iron_reinforced_hull', 2), t('wt_verdant_wellspring', 1)] });
    s = endTurn(s);
    expect(s.players[0].hero.armor).toBe(2);
    const triggered = s.log.filter((e) => e.type === 'HERO_ABILITY_TRIGGERED' && e.player === 0).map((e) => (e as { slot: number }).slot);
    expect(triggered).toEqual(expect.arrayContaining([0, 1]));
  });

  it('respects limitPerTurn and resets it each turn', () => {
    let s = newGame({ talents0: [t('wt_ember_searing_wrath', 0), t('wt_ember_cinder_bolt', 2)] });
    giveCard(s, 0, 'token_aether_shard');
    giveCard(s, 0, 'token_aether_shard');
    const cast = (st: typeof s) => act(st, { type: 'PLAY_CARD', player: 0, cardUid: st.players[0].hand.find((c) => c.cardId === 'token_aether_shard')!.uid });
    s = cast(s);
    s = cast(s);
    expect(s.players[1].hero.health).toBe(29);
    s = endTurn(endTurn(s));
    giveCard(s, 0, 'token_aether_shard');
    s = cast(s);
    expect(s.players[1].hero.health).toBe(28);
  });

  it('passive limits reset on the opponent turn too', () => {
    let s = newGame({ talents0: [t('wt_void_soul_harvest', 0), t('wt_void_hollow_summons', 2)], board0: ['token_recruit', 'token_recruit', 'token_recruit', 'token_recruit'] });
    s.players[0].hero.abilities[0].uses = 3; // spent on our own turn
    s = endTurn(s); // opponent's turn starts
    expect(s.players[0].hero.abilities[0].uses).toBe(0);
  });

  it('lists hero power actions for every usable active slot', () => {
    const s = newGame({ talents0: [t('wt_iron_rivet_plating', 2), t('wt_iron_assemble', 1)] });
    setEnergy(s, 0, 10);
    const slots = getLegalActions(s, 0).filter((a) => a.type === 'HERO_POWER').map((a) => (a as { slot: number }).slot);
    expect(slots.sort()).toEqual([0, 1]);
  });

  it('stays deterministic', () => {
    const run = () => {
      let s = newGame({ seed: 7, talents0: [t('wt_astral_arcane_volley', 2), t('wt_astral_spellweave', 1)], board1: ['token_recruit'] });
      setEnergy(s, 0, 5);
      s = act(s, { type: 'HERO_POWER', player: 0, slot: 0 });
      return JSON.stringify(s.players);
    };
    expect(run()).toBe(run());
  });
});
