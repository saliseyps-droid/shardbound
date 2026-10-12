// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fxFrom } from '@/state/matchStore';
import type { GameEvent } from '@/engine/types';

const hit = (seq: number, target: Extract<GameEvent, { type: 'DAMAGE_DEALT' }>['target']): GameEvent => ({ seq, type: 'DAMAGE_DEALT', target, amount: 1, sourcePlayer: 0, combat: false });

describe('damage popups', () => {
  it('sums repeated hits on one target, so a 5-bolt barrage shows all 5 points', () => {
    const fx = fxFrom([hit(1, { type: 'hero', player: 1 }), hit(2, { type: 'unit', uid: 7 }), hit(3, { type: 'hero', player: 1 }), hit(4, { type: 'hero', player: 1 }), hit(5, { type: 'unit', uid: 8 })]);
    expect(fx.map((f) => [f.target, f.amount])).toEqual([['h:1', 3], ['u:7', 1], ['u:8', 1]]);
  });
});
