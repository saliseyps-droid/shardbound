import { getCard } from '@/data/cards';
import type { GameState, PlayerId, UnitInstance } from '@/engine/types';
import { other } from '@/engine/types';
import { currentHealth, hasActiveGuard, hasKeyword, keywordValue, unitAttack } from '@/engine/queries';
import type { EvalWeights } from './config';

export const WIN_SCORE = 1_000_000;

/** Value of a single unit on the battlefield (from its controller's point of view). */
export function unitValue(state: GameState, u: UnitInstance, w: EvalWeights): number {
  const atk = unitAttack(state, u);
  const hp = currentHealth(u);
  if (hp <= 0) return 0;
  let v = atk * w.unitAttack + hp * w.unitHealth;
  // Units with both stats are worth more than the sum (they trade and threaten).
  v += Math.sqrt(atk * hp) * 0.6;
  const k = w.keywordValue;
  if (hasKeyword(state, u, 'GUARD')) v += hp * 0.35 * k;
  if (u.barrier) v += (atk + 1) * 0.8 * k;
  if (hasKeyword(state, u, 'DRAIN')) v += atk * 0.5 * k;
  if (hasKeyword(state, u, 'VENOM')) v += 2.5 * k;
  if (hasKeyword(state, u, 'FRENZY')) v += atk * 0.8 * k;
  if (u.ambush) v += 1 * k;
  if (hasKeyword(state, u, 'WARD')) v += 1.2 * k;
  if (hasKeyword(state, u, 'REGENERATE')) v += Math.min(4, u.baseHealth + u.healthBuff) * 0.4 * k;
  if (u.keywords.includes('EMPOWER')) v += keywordValue(u, 'EMPOWER') * 1.4 * k;
  if (!u.silenced) {
    for (const a of u.abilities) {
      if (a.trigger === 'ON_DEPLOY') continue; // already spent
      v += (a.trigger === 'LAST_BREATH' ? 1.8 : 2.2) * w.abilityValue;
    }
    if (getCard(u.cardId)?.aura) v += 2 * w.abilityValue;
  }
  if (u.frozen) v -= atk * 0.5;
  if (u.burn > 0) v -= Math.min(hp, u.burn) * 0.9;
  return Math.max(0.1, v);
}

function heroValue(health: number, armor: number, w: EvalWeights, mine: boolean): number {
  const effective = health + armor * w.armor;
  let v = effective * (mine ? w.myHealth : w.enemyHealth);
  if (effective < w.dangerThreshold) v -= (w.dangerThreshold - effective) * w.danger * (mine ? 1 : 0.8);
  return v;
}

/**
 * Static evaluation from `me`'s perspective. Only uses information `me` could know:
 * own hand contents, and only the opponent's hand *size*.
 */
export function evaluate(state: GameState, me: PlayerId, w: EvalWeights): number {
  if (state.phase === 'ENDED') {
    if (state.winner === me) return WIN_SCORE;
    if (state.winner === 'DRAW') return -WIN_SCORE / 2;
    return -WIN_SCORE;
  }
  const them = other(me);
  const my = state.players[me];
  const op = state.players[them];
  let score = 0;

  score += heroValue(my.hero.health, my.hero.armor, w, true);
  score -= heroValue(op.hero.health, op.hero.armor, w, false);

  for (const u of my.board) score += unitValue(state, u, w);
  for (const u of op.board) score -= unitValue(state, u, w) * w.enemyBoard;

  // Cards in hand: diminishing returns to discourage hoarding.
  const handValue = (n: number) => (n <= 6 ? n : 6 + (n - 6) * 0.4);
  score += handValue(my.hand.length) * w.cardInHand;
  score -= handValue(op.hand.length) * w.enemyCardInHand;

  score += my.relics.reduce((s, r) => s + (r.charges ?? 3) * 0.6 + w.relic, 0);
  score -= op.relics.reduce((s, r) => s + (r.charges ?? 3) * 0.6 + w.relic, 0);
  if (my.location) score += 3;
  if (op.location) score -= 3;

  // Resource advantage matters (ramp / energy destruction).
  score += (my.maxEnergy - op.maxEnergy) * 1.2;

  // Fatigue pressure.
  if (my.deck.length === 0) score -= (my.fatigue + 1) * 1.5;
  if (op.deck.length === 0) score += (op.fatigue + 1) * 1.5;

  // Lethal threat: can our current board kill next turn if unanswered?
  const opEffective = op.hero.health + op.hero.armor;
  if (hasActiveGuard(state, them).length === 0) {
    const potential = my.board.filter((u) => !u.frozen).reduce((s, u) => s + unitAttack(state, u) * (hasKeyword(state, u, 'FRENZY') ? 2 : 1), 0);
    if (potential >= opEffective) score += w.lethalThreat;
  }
  // And the reverse: their board threatens us.
  const myEffective = my.hero.health + my.hero.armor;
  if (hasActiveGuard(state, me).length === 0) {
    const potential = op.board.reduce((s, u) => s + unitAttack(state, u) * (hasKeyword(state, u, 'FRENZY') ? 2 : 1), 0);
    if (potential >= myEffective) score -= w.lethalThreat * 1.5;
  }
  return score;
}
