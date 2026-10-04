import { describe, expect, it } from 'vitest';
import { getCard } from '@/data/cards';
import { KEYWORDS } from '@/data/keywords';
import { describeCard } from '@/game/describe';
import type { CardDefinition } from '@/game/types';
import { getLegalActions } from '@/engine/legal';
import type { GameState, PlayerId } from '@/engine';
import { act, addKeyword, endTurn, giveCard, newGame, ready, setEnergy, tryAct, unitAt, unitRef } from './helpers';

function addRelic(state: GameState, p: PlayerId, cardId: string) {
  const relic = { uid: state.nextUid++, cardId, owner: p, charges: getCard(cardId)!.charges ?? null };
  state.players[p].relics.push(relic);
  return relic;
}

const relicCharges = (state: GameState, p: PlayerId, cardId: string) => state.players[p].relics.find((r) => r.cardId === cardId)?.charges;

describe('Empower applies once and only against enemies', () => {
  it('Abyssal Flare with a Knight and Empower 1 deals 2+1+1', () => {
    let s = newGame({ board0: ['ast_lumen_acolyte', 'neu_redcloak_sentinel'], board1: ['token_golem'] });
    setEnergy(s, 0, 5);
    const card = giveCard(s, 0, 'emb_abyssal_flare');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card, target: unitRef(unitAt(s, 1, 0)) });
    expect(unitAt(s, 1, 0).damage).toBe(4);
  });

  it('Frost Lance on a Frozen unit with Empower 1 deals 5', () => {
    let s = newGame({ board0: ['ast_lumen_acolyte'], board1: ['token_golem', 'token_golem'] });
    s.players[1].board[0].frozen = true;
    setEnergy(s, 0, 5);
    const card = giveCard(s, 0, 'tid_frost_lance');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card, target: unitRef(unitAt(s, 1, 0)) });
    expect(unitAt(s, 1, 0).damage).toBe(5);
  });

  it('Frost Lance bonus does not get through a Barrier popped by the base hit', () => {
    let s = newGame({ board1: ['token_golem'] });
    const target = unitAt(s, 1, 0);
    target.frozen = true;
    addKeyword(target, 'BARRIER');
    setEnergy(s, 0, 5);
    const card = giveCard(s, 0, 'tid_frost_lance');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card, target: unitRef(unitAt(s, 1, 0)) });
    expect(unitAt(s, 1, 0).damage).toBe(0);
    expect(unitAt(s, 1, 0).barrier).toBe(false);
  });

  it('Soulfire Rite: Empower boosts the enemy hit, not the damage to your own Warden', () => {
    let s = newGame({ board0: ['ast_lumen_acolyte'], board1: ['token_golem'] });
    setEnergy(s, 0, 5);
    const before = s.players[0].hero.health;
    const card = giveCard(s, 0, 'vod_soulfire_rite');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card, target: unitRef(unitAt(s, 1, 0)) });
    expect(unitAt(s, 1, 0).damage).toBe(5);
    expect(s.players[0].hero.health).toBe(before - 2);
  });

  it('Empower does not boost spell damage to your own units', () => {
    let s = newGame({ board0: ['ast_lumen_acolyte', 'token_golem'] });
    setEnergy(s, 0, 5);
    const card = giveCard(s, 0, 'emb_abyssal_flare');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card, target: unitRef(unitAt(s, 0, 1)) });
    expect(unitAt(s, 0, 1).damage).toBe(2);
  });
});

describe('Silence', () => {
  it('does not kill a damaged unit whose health came from buffs', () => {
    let s = newGame({ board1: ['token_golem'] });
    const u = unitAt(s, 1, 0);
    u.healthBuff = 3;
    u.damage = 8; // 9 max health, 1 left
    setEnergy(s, 0, 5);
    const card = giveCard(s, 0, 'ast_hush_of_stars');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card, target: unitRef(u) });
    expect(s.players[1].board).toHaveLength(1);
    const after = unitAt(s, 1, 0);
    expect(after.silenced).toBe(true);
    expect(after.baseHealth + after.healthBuff - after.damage).toBe(1);
  });
});

describe('ON_KILL', () => {
  it('fires when the unit kills an attacker with counter-damage', () => {
    let s = newGame({ board0: ['token_recruit'], board1: ['vod_hornmoon_reaver'] });
    ready(s, 0);
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.players[0].board).toHaveLength(0);
    expect(unitAt(s, 1, 0).attackBuff).toBe(1);
    expect(unitAt(s, 1, 0).healthBuff).toBe(1);
  });

  it('still fires when the unit kills as the attacker', () => {
    let s = newGame({ board0: ['vod_hornmoon_reaver'], board1: ['token_recruit'] });
    ready(s, 0);
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(unitAt(s, 0, 0).attackBuff).toBe(1);
  });

  it('does not fire when both die', () => {
    let s = newGame({ board0: ['token_golem'], board1: ['vod_hornmoon_reaver'] });
    unitAt(s, 0, 0).damage = 2; // 6/4 vs 4/4
    ready(s, 0);
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.players[1].board).toHaveLength(0);
  });
});

describe('Relic charges', () => {
  it('Rimed Tide-Bell keeps its charge when there is no enemy unit to Freeze', () => {
    let s = newGame();
    addRelic(s, 0, 'tid_rimed_tide_bell');
    s = endTurn(endTurn(s));
    expect(relicCharges(s, 0, 'tid_rimed_tide_bell')).toBe(3);
  });

  it('Rimed Tide-Bell uses a charge when it Freezes something', () => {
    let s = newGame({ board1: ['token_golem'] });
    addRelic(s, 0, 'tid_rimed_tide_bell');
    s = endTurn(endTurn(s));
    expect(relicCharges(s, 0, 'tid_rimed_tide_bell')).toBe(2);
    expect(unitAt(s, 1, 0).frozen).toBe(true);
  });

  it('Heartwood Idol keeps its charge with no unit to buff', () => {
    let s = newGame();
    addRelic(s, 0, 'ver_heartwood_idol');
    s = endTurn(s);
    expect(relicCharges(s, 0, 'ver_heartwood_idol')).toBe(3);
  });

  it('Offering Blade keeps its charge when the last ally dies', () => {
    let s = newGame({ board0: ['token_recruit'], board1: ['token_golem'] });
    addRelic(s, 0, 'vod_offering_blade');
    ready(s, 0);
    s = act(s, { type: 'ATTACK', player: 0, attackerUid: unitAt(s, 0, 0).uid, target: unitRef(unitAt(s, 1, 0)) });
    expect(s.players[0].board).toHaveLength(0);
    expect(relicCharges(s, 0, 'vod_offering_blade')).toBe(3);
  });
});

describe('Spellweaver Adept', () => {
  it('deals separate 2-damage hits, one per spell cast this turn', () => {
    let s = newGame({ board1: ['token_golem', 'token_golem', 'token_golem'] });
    setEnergy(s, 0, 10);
    s.players[0].spellsCastThisTurn = 3;
    const card = giveCard(s, 0, 'ast_spellweaver_adept');
    const res = tryAct(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    expect(res.error).toBeUndefined();
    const adept = res.state.players[0].board[0];
    const hits = res.events.filter((e) => e.type === 'DAMAGE_DEALT' && e.sourceUid === adept.uid);
    expect(hits.map((e) => (e.type === 'DAMAGE_DEALT' ? e.amount : 0))).toEqual([2, 2, 2]);
  });

  it('does nothing when no spell was cast', () => {
    let s = newGame({ board1: ['token_golem'] });
    setEnergy(s, 0, 10);
    const hp = s.players[1].hero.health;
    const card = giveCard(s, 0, 'ast_spellweaver_adept');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    expect(s.players[1].hero.health).toBe(hp);
    expect(unitAt(s, 1, 0).damage).toBe(0);
  });
});

describe('Ward definition', () => {
  it('mentions deploy effects', () => {
    expect(KEYWORDS.WARD.definition.toLowerCase()).toContain('deploy');
  });
});

describe('Optional deploy targets for units', () => {
  it('a unit with a deploy target can be played without choosing one', () => {
    let s = newGame({ board1: ['token_recruit'] });
    setEnergy(s, 0, 10);
    const card = giveCard(s, 0, 'tid_riptide_reaver');
    const legal = getLegalActions(s, 0).filter((a) => a.type === 'PLAY_CARD' && a.cardUid === card);
    expect(legal.some((a) => a.type === 'PLAY_CARD' && !a.target)).toBe(true);
    expect(legal.some((a) => a.type === 'PLAY_CARD' && !!a.target)).toBe(true);
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card });
    expect(s.players[0].board).toHaveLength(1);
    expect(s.players[1].board).toHaveLength(1);
  });

  it('spells still require a target', () => {
    const s = newGame({ board1: ['token_recruit'] });
    setEnergy(s, 0, 10);
    const card = giveCard(s, 0, 'tid_frost_lance');
    expect(tryAct(s, { type: 'PLAY_CARD', player: 0, cardUid: card }).error).toBe('A target is required');
    expect(getLegalActions(s, 0).some((a) => a.type === 'PLAY_CARD' && a.cardUid === card && !a.target)).toBe(false);
  });
});

describe('Generated CONTROLS_TAG text', () => {
  const strip = (c: CardDefinition): CardDefinition => ({ ...c, description: undefined });
  it('says "another" when the unit itself has the tag', () => {
    expect(describeCard(strip(getCard('neu_redcloak_sentinel')!), getCard)).toContain('If you control another Knight');
  });
  it('says "a" for spells and units without the tag', () => {
    expect(describeCard(strip(getCard('irn_forge_oath')!), getCard)).toMatch(/if you control a Knight/i);
    expect(describeCard(strip(getCard('irn_overclock_engineer')!), getCard)).toMatch(/if you control a Construct/i);
  });
});

describe('Aura-granted keywords', () => {
  function withAura<T>(keyword: 'REGENERATE' | 'EMPOWER', fn: () => T): T {
    const def = getCard('emb_legion_banneret')!;
    const saved = def.aura;
    def.aura = { target: 'ALLY_UNITS', keyword };
    try {
      return fn();
    } finally {
      def.aura = saved;
    }
  }

  it('Regenerate from an aura heals at end of turn', () => {
    withAura('REGENERATE', () => {
      let s = newGame({ board0: ['emb_legion_banneret', 'token_golem'] });
      unitAt(s, 0, 1).damage = 3;
      s = endTurn(s);
      expect(unitAt(s, 0, 1).damage).toBe(0);
    });
  });

  it('Empower from an aura boosts spell damage', () => {
    withAura('EMPOWER', () => {
      let s = newGame({ board0: ['emb_legion_banneret'], board1: ['token_golem'] });
      setEnergy(s, 0, 5);
      const card = giveCard(s, 0, 'tid_frost_lance');
      s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: card, target: unitRef(unitAt(s, 1, 0)) });
      expect(unitAt(s, 1, 0).damage).toBe(3);
    });
  });
});
