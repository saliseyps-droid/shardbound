import { describe, expect, it } from 'vitest';
import type { TalentPick } from '@/data/wardenTalents';
import { canUseHeroPower } from '@/engine/queries';
import { act, endTurn, newGame, setEnergy, unitRef } from './helpers';

const t = (abilityId: string, level: 0 | 1 | 2): TalentPick => ({ abilityId, level });

describe('Undertow cooldown', () => {
  it('can be used, then not on your next turn, then again on the turn after', () => {
    let s = newGame({ talents0: [t('wt_tide_undertow', 2), t('wt_tide_cold_snap', 0)], board1: ['token_wolf', 'token_wolf', 'token_wolf'] });
    setEnergy(s, 0, 10);
    expect(canUseHeroPower(s, 0, 0).ok).toBe(true);
    s = act(s, { type: 'HERO_POWER', player: 0, slot: 0, target: unitRef(s.players[1].board[0]) });
    s = endTurn(s); // opponent
    s = endTurn(s); // our next turn
    setEnergy(s, 0, 10);
    expect(canUseHeroPower(s, 0, 0)).toMatchObject({ ok: false });
    s = endTurn(s);
    s = endTurn(s); // the turn after
    setEnergy(s, 0, 10);
    expect(canUseHeroPower(s, 0, 0).ok).toBe(true);
  });
});

import { getTalent } from '@/data/wardenTalents';

describe('Thornweald talent changes', () => {
  it('Barkskin III works once per turn and Sap of the Root III costs 2', () => {
    expect((getTalent('wt_verdant_barkskin')!.levels[2] as { limitPerTurn?: number }).limitPerTurn).toBe(1);
    expect((getTalent('wt_verdant_sap_of_the_root')!.levels[2] as { cost: number }).cost).toBe(2);
  });
});
