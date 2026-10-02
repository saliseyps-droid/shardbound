import { describe, expect, it } from 'vitest';
import { getLegalActions } from '@/engine/legal';
import { BOSS_TALENTS, FACTION_TALENTS } from '@/data/wardenTalents';
import { PLAYABLE_FACTIONS } from '@/game/types';
import type { GameState } from '@/engine';
import { endTurn, newGame, setEnergy, tryAct } from './helpers';

const all = [...PLAYABLE_FACTIONS.flatMap((f) => FACTION_TALENTS[f]), ...BOSS_TALENTS];

describe('every Warden ability works at every rank in a live game', () => {
  for (const talent of all) {
    talent.levels.forEach((_, level) => {
      it(`${talent.name} rank ${level + 1}`, () => {
        let s: GameState = newGame({
          talents0: [{ abilityId: talent.id, level: level as 0 | 1 | 2 }],
          board0: ['token_scrapbot', 'token_recruit'],
          board1: ['token_recruit', 'token_treant'],
        });
        if (talent.kind === 'ACTIVE') {
          setEnergy(s, 0, 10);
          const action = getLegalActions(s, 0).find((a) => a.type === 'HERO_POWER');
          expect(action, 'ability should be usable').toBeTruthy();
          const res = tryAct(s, action!);
          expect(res.error).toBeUndefined();
          expect(res.events.some((e) => e.type === 'HERO_POWER_USED')).toBe(true);
          expect(res.state.players[0].energy).toBe(10 - (talent.levels[level] as { cost: number }).cost);
        } else {
          for (let i = 0; i < 4; i++) s = endTurn(s);
          expect(s.phase).not.toBe('ENDED');
        }
      });
    });
  }
});
