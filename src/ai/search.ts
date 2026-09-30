import { createRng, nextFloat, pickOne, shuffleInPlace } from '@/core/rng';
import { getCard } from '@/data/cards';
import { applyAction } from '@/engine/game';
import { getLegalActions } from '@/engine/legal';
import type { GameAction, GameState, PlayerId } from '@/engine/types';
import { other } from '@/engine/types';
import { effectiveCost, findUnit, unitAttack } from '@/engine/queries';
import type { AiConfig } from './config';
import { WIN_SCORE, evaluate } from './evaluate';

export const HIDDEN_CARD_ID = 'token_unknown';

/**
 * Builds the AI's *belief* state: its own deck order is unknown to it, the
 * opponent's hand and deck are replaced by placeholders, and the RNG is reseeded
 * so the AI cannot foresee random outcomes. The AI never reads the real hidden
 * information; it only plans on this copy.
 */
export function determinize(state: GameState, me: PlayerId, seed: number): GameState {
  const s = structuredClone(state);
  s.log = [];
  s.rng = createRng(seed);
  const them = other(me);
  shuffleInPlace(s.rng, s.players[me].deck);
  s.players[them].hand = s.players[them].hand.map((c) => (c.revealed ? c : { ...c, cardId: HIDDEN_CARD_ID, costMod: 0 }));
  s.players[them].deck = s.players[them].deck.map((c) => ({ ...c, cardId: HIDDEN_CARD_ID, costMod: 0 }));
  return s;
}

interface Node {
  state: GameState;
  first: GameAction | null;
  score: number;
}

function step(state: GameState, action: GameAction): GameState | null {
  const res = applyAction(state, action);
  return res.error ? null : res.state;
}

/** Evaluate the position after we end our turn, optionally letting the opponent attack greedily. */
function leafScore(state: GameState, me: PlayerId, cfg: AiConfig, rngSeed: { v: number }): number {
  if (state.phase === 'ENDED') return evaluate(state, me, cfg.weights);
  if (!cfg.simulateResponse) return evaluate(state, me, cfg.weights);
  const ended = step(state, { type: 'END_TURN', player: me });
  if (!ended || ended.phase === 'ENDED') return ended ? evaluate(ended, me, cfg.weights) : evaluate(state, me, cfg.weights);
  // Opponent response: greedy attacks only (their hand is hidden to us).
  let s = ended;
  const them = other(me);
  for (let i = 0; i < 8 && s.phase === 'MAIN' && s.activePlayer === them; i++) {
    const attacks = getLegalActions(s, them).filter((a) => a.type === 'ATTACK');
    if (attacks.length === 0) break;
    let best: GameState | null = null;
    let bestScore = -Infinity;
    for (const a of attacks) {
      const next = step(s, a);
      if (!next) continue;
      const sc = evaluate(next, them, cfg.weights);
      if (sc > bestScore) {
        bestScore = sc;
        best = next;
      }
    }
    if (!best) break;
    s = best;
  }
  rngSeed.v++;
  // Blend: our position now and after their likely response.
  return evaluate(state, me, cfg.weights) * 0.45 + evaluate(s, me, cfg.weights) * 0.55;
}

/** Cheap ordering heuristic so pruning keeps promising actions. */
function quickOrder(state: GameState, action: GameAction, me: PlayerId): number {
  if (action.type === 'PLAY_CARD') {
    const card = state.players[me].hand.find((c) => c.uid === action.cardUid);
    return card ? 10 + effectiveCost(state, me, card) : 0;
  }
  if (action.type === 'ATTACK') {
    const u = findUnit(state, action.attackerUid);
    return 5 + (u ? unitAttack(state, u) : 0);
  }
  if (action.type === 'HERO_POWER') return 4;
  return 0;
}

function expand(node: Node, me: PlayerId, cfg: AiConfig): Node[] {
  let actions = getLegalActions(node.state, me).filter((a) => a.type !== 'END_TURN');
  // Skip playing hidden placeholders or pointless zero-effect actions.
  actions = actions.filter((a) => a.type !== 'PLAY_CARD' || node.state.players[me].hand.find((c) => c.uid === a.cardUid)?.cardId !== HIDDEN_CARD_ID);
  if (actions.length > cfg.branching * 3) {
    actions.sort((a, b) => quickOrder(node.state, b, me) - quickOrder(node.state, a, me));
    actions = actions.slice(0, cfg.branching * 3);
  }
  const children: Node[] = [];
  for (const a of actions) {
    const s = step(node.state, a);
    if (!s) continue;
    children.push({ state: s, first: node.first ?? a, score: evaluate(s, me, cfg.weights) });
  }
  children.sort((x, y) => y.score - x.score);
  return children.slice(0, cfg.branching);
}

export interface Decision {
  action: GameAction;
  /** Evaluation estimate, useful for debugging and tests. */
  score: number;
  considered: number;
}

/**
 * Chooses the next action for `me`. The engine is stepped one action at a time so
 * that random outcomes are observed before planning continues.
 */
export function chooseAction(realState: GameState, me: PlayerId, cfg: AiConfig, seed: number, actionsThisTurn = 0): Decision {
  const endTurn: GameAction = { type: 'END_TURN', player: me };
  if (realState.phase !== 'MAIN' || realState.activePlayer !== me) return { action: endTurn, score: 0, considered: 0 };
  if (actionsThisTurn >= cfg.maxActionsPerTurn) return { action: endTurn, score: 0, considered: 0 };

  const rng = createRng(seed);
  const root = determinize(realState, me, seed);
  const legal = getLegalActions(root, me);
  const nonEnd = legal.filter((a) => a.type !== 'END_TURN');
  if (nonEnd.length === 0) return { action: endTurn, score: 0, considered: 1 };

  // Difficulty-driven mistakes.
  if (cfg.blunderChance > 0 && nextFloat(rng) < cfg.blunderChance) {
    return { action: pickOne(rng, legal)!, score: 0, considered: 1 };
  }
  if (cfg.passChance > 0 && actionsThisTurn > 0 && nextFloat(rng) < cfg.passChance) {
    return { action: endTurn, score: 0, considered: 1 };
  }

  const counter = { v: 0 };
  const baseline = leafScore(root, me, cfg, counter);
  let considered = 0;

  // Lethal check: can any single action win right now?
  if (cfg.checkLethal) {
    for (const a of nonEnd) {
      const s = step(root, a);
      considered++;
      if (s && s.phase === 'ENDED' && s.winner === me) return { action: a, score: WIN_SCORE, considered };
    }
  }

  let beam: Node[] = [{ state: root, first: null, score: baseline }];
  let bestFirst: GameAction | null = null;
  let bestScore = baseline;
  for (let depth = 0; depth < cfg.depth; depth++) {
    const next: Node[] = [];
    for (const node of beam) {
      if (node.state.phase === 'ENDED') continue;
      for (const child of expand(node, me, cfg)) {
        considered++;
        next.push(child);
      }
    }
    if (next.length === 0) break;
    // Re-score the leaves with the (possibly deeper) leaf evaluation.
    for (const n of next) {
      n.score = leafScore(n.state, me, cfg, counter);
      if (cfg.noise > 0) n.score *= 1 + (nextFloat(rng) - 0.5) * 2 * cfg.noise * (Math.abs(n.score) > 1 ? 1 : 0);
      if (n.score > bestScore) {
        bestScore = n.score;
        bestFirst = n.first;
      }
      if (n.state.phase === 'ENDED' && n.state.winner === me) return { action: n.first!, score: WIN_SCORE, considered };
    }
    next.sort((a, b) => b.score - a.score);
    beam = next.slice(0, cfg.beamWidth);
  }

  if (!bestFirst) return { action: endTurn, score: baseline, considered };
  return { action: bestFirst, score: bestScore, considered };
}

/** Simple mulligan policy: keep cheap cards, replace expensive ones. */
export function chooseMulligan(state: GameState, me: PlayerId, cfg: AiConfig): number[] {
  const hand = state.players[me].hand;
  const threshold = cfg.difficulty === 'EASY' ? 5 : 3;
  return hand.filter((c) => (getCard(c.cardId)?.manaCost ?? 0) > threshold).map((c) => c.uid);
}
