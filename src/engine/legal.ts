import { getCard } from '@/data/cards';
import type { GameAction, GameState, PlayerId } from './types';
import { activeLevelOf, attackTargets, canPlayCard, canUseHeroPower, validTargets } from './queries';

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

  p.hero.abilities.forEach((_, slot) => {
    if (!canUseHeroPower(state, playerId, slot).ok) return;
    const power = activeLevelOf(state, playerId, slot)!;
    if (power.target) {
      const targets = validTargets(state, playerId, power.target, { spellLike: true });
      for (const target of targets) actions.push({ type: 'HERO_POWER', player: playerId, slot, target });
      if (targets.length === 0) actions.push({ type: 'HERO_POWER', player: playerId, slot });
    } else {
      actions.push({ type: 'HERO_POWER', player: playerId, slot });
    }
  });

  actions.push({ type: 'END_TURN', player: playerId });
  return actions;
}
