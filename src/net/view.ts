import type { GameEvent, GameState, PlayerId, TargetRef } from '@/engine/types';
import type { GameAction } from '@/engine/types';

/**
 * Online views. The host runs the authoritative engine with itself as player 0
 * and the guest as player 1. The guest receives a *mirrored* view (so the guest
 * is always player 0 locally and the whole UI works unchanged) with all hidden
 * information of the host removed.
 */

export const HIDDEN_CARD = 'token_unknown';

const swap = (p: PlayerId): PlayerId => (p === 0 ? 1 : 0);

const PLAYER_KEYS = new Set(['player', 'owner', 'activePlayer', 'firstPlayer', 'sourcePlayer', 'newOwner', 'controller']);

/** Recursively swaps every player-id field. `winner` is swapped only when numeric. */
function mirrorDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.map(mirrorDeep) as T;
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (PLAYER_KEYS.has(k) && (v === 0 || v === 1)) out[k] = swap(v);
    else if (k === 'winner' && (v === 0 || v === 1)) out[k] = swap(v);
    else out[k] = mirrorDeep(v);
  }
  return out as T;
}

export function mirrorState(state: GameState): GameState {
  const m = mirrorDeep(state);
  const [a, b] = m.players;
  // PlayerState.id is a player id too.
  return { ...m, players: [{ ...b, id: 0 }, { ...a, id: 1 }] };
}

export function mirrorEvents(events: GameEvent[]): GameEvent[] {
  return mirrorDeep(events);
}

export function mirrorTarget(t: TargetRef | undefined): TargetRef | undefined {
  return t ? mirrorDeep(t) : t;
}

export function mirrorAction(a: GameAction): GameAction {
  return mirrorDeep(a);
}

/** Removes what `viewer` may not know: the other player's hand and both deck orders. */
export function redactState(state: GameState, viewer: PlayerId): GameState {
  const other = swap(viewer);
  const players = state.players.map((p) => {
    const hideHand = p.id === other;
    return {
      ...p,
      hand: hideHand ? p.hand.map((c) => (c.revealed ? c : { ...c, cardId: HIDDEN_CARD, costMod: 0, variant: undefined })) : p.hand,
      // Deck order is secret for everyone; only the count matters to the UI.
      deck: p.deck.map((c) => ({ ...c, cardId: HIDDEN_CARD, costMod: 0, variant: undefined })),
    };
  }) as GameState['players'];
  return { ...state, players, rng: { seed: 0 }, log: redactEvents(state.log, viewer) };
}

export function redactEvents(events: GameEvent[], viewer: PlayerId): GameEvent[] {
  const other = swap(viewer);
  return events.map((e) => {
    if ((e.type === 'CARD_DRAWN' || (e.type === 'CARD_CREATED' && e.destination === 'HAND')) && e.player === other) {
      return { ...e, cardId: HIDDEN_CARD };
    }
    if (e.type === 'CARD_CREATED' && e.destination === 'DECK') return { ...e, cardId: HIDDEN_CARD };
    return e;
  });
}

/** What the host sends the guest: redacted for player 1, then mirrored so the guest is player 0. */
export function guestView(state: GameState): GameState {
  return mirrorState(redactState(state, 1));
}

export function guestEvents(events: GameEvent[]): GameEvent[] {
  return mirrorEvents(redactEvents(events, 1));
}
