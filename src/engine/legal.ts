import { getCard } from '@/data/cards';
import { getHeroPower } from '@/data/heroPowers';
import type { GameAction, GameState, PlayerId } from './types';
import { attackTargets, canPlayCard, canUseHeroPower, validTargets } from './queries';

/** Enumerates every legal action for a player (excluding mulligan). */
export function getLegalActions(state: GameState, playerId: PlayerId): GameAction[] {
  if (state.phase !== 'MAIN' || state.activePlayer !== playerId) return [];
  const p = state.players[playerId];
  const actions: GameAction[] = [];

  for (const card of p.hand) {
    if (!canPlayCard(state, playerId, card).ok) continue;
    const def = getCard(card.cardId)!;
    if (def.target) {
      const targets = validTargets(state, playerId, def.target, { spellLike: true });
      if (targets.length === 0) actions.push({ type: 'PLAY_CARD', player: playerId, cardUid: card.uid });
      for (const target of targets) actions.push({ type: 'PLAY_CARD', player: playerId, cardUid: card.uid, target });
    } else {
      actions.push({ type: 'PLAY_CARD', player: playerId, cardUid: card.uid });
    }
  }

  for (const unit of p.board) {
    for (const target of attackTargets(state, unit)) {
      actions.push({ type: 'ATTACK', player: playerId, attackerUid: unit.uid, target });
    }
  }

  if (canUseHeroPower(state, playerId).ok) {
    const power = getHeroPower(p.hero.heroPowerId!)!;
    if (power.target) {
      const targets = validTargets(state, playerId, power.target, { spellLike: true });
      for (const target of targets) actions.push({ type: 'HERO_POWER', player: playerId, target });
      if (targets.length === 0) actions.push({ type: 'HERO_POWER', player: playerId });
    } else {
      actions.push({ type: 'HERO_POWER', player: playerId });
    }
  }

  actions.push({ type: 'END_TURN', player: playerId });
  return actions;
}
