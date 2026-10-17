import type { GameEvent, GameState, PlayerId, TargetRef } from '@/engine/types';
import type { GameAction } from '@/engine/types';

/**
 * Online views. The host runs the authoritative engine with itself as player 0
 * and the guest as player 1. The guest receives a *mirrored* view (so the guest
 * is always player 0 locally and the whole UI works unchanged) with all hidden
 * information of the host removed.
 *
 * Co-op (2 v 1): the guest is the host's teammate on seat 2 and the boss (seat 1,
 * the host's AI) stays put; the mirror swaps seats 0 and 2 instead.
 */

export const HIDDEN_CARD = 'token_unknown';

/** The guest's seat on the host: 1, or 2 in a co-op match. */
const guestSeat = (coop: boolean): PlayerId => (coop ? 2 : 1);
const swapper =
  (coop: boolean) =>
  (p: PlayerId): PlayerId => {
    const g = guestSeat(coop);
    return p === 0 ? g : p === g ? 0 : p;
  };

const PLAYER_KEYS = new Set(['player', 'owner', 'activePlayer', 'firstPlayer', 'sourcePlayer', 'newOwner', 'controller']);
const isSeat = (v: unknown): v is PlayerId => v === 0 || v === 1 || v === 2;

/** Recursively swaps every player-id field. `winner` is swapped only when numeric (in co-op it names a team, which the mirror keeps). */
function mirrorDeep<T>(value: T, coop = false): T {
  const swap = swapper(coop);
  const walk = (val: unknown): unknown => {
    if (Array.isArray(val)) return val.map(walk);
    if (!val || typeof val !== 'object') return val;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (PLAYER_KEYS.has(k) && isSeat(v)) out[k] = swap(v);
      else if (k === 'winner' && isSeat(v)) out[k] = coop ? v : swap(v);
      else out[k] = walk(v);
    }
    return out;
  };
  return walk(value) as T;
}

export function mirrorState(state: GameState): GameState {
  const coop = state.players.length > 2;
  const swap = swapper(coop);
  const m = mirrorDeep(state, coop);
  // PlayerState.id is a player id too; the turn order lists seats.
  const players = m.players.map((_, i) => ({ ...m.players[swap(i as PlayerId)], id: i as PlayerId }));
  return { ...m, players, ...(m.turnOrder ? { turnOrder: m.turnOrder.map(swap) } : {}), ...(m.teams ? { teams: m.teams.map((_, i) => m.teams![swap(i as PlayerId)]) } : {}) };
}

export function mirrorEvents(events: GameEvent[], coop = false): GameEvent[] {
  return mirrorDeep(events, coop);
}

export function mirrorTarget(t: TargetRef | undefined, coop = false): TargetRef | undefined {
  return t ? mirrorDeep(t, coop) : t;
}

export function mirrorAction(a: GameAction, coop = false): GameAction {
  return mirrorDeep(a, coop);
}

/** Removes what `viewer` may not know: the other players' hands and every deck order. */
export function redactState(state: GameState, viewer: PlayerId): GameState {
  const players = state.players.map((p) => {
    const hideHand = p.id !== viewer;
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
  return events.map((e) => {
    if ((e.type === 'CARD_DRAWN' || (e.type === 'CARD_CREATED' && e.destination === 'HAND')) && e.player !== viewer) {
      return { ...e, cardId: HIDDEN_CARD };
    }
    if (e.type === 'CARD_CREATED' && e.destination === 'DECK') return { ...e, cardId: HIDDEN_CARD };
    return e;
  });
}

/** What the host sends the guest: redacted for the guest's seat, then mirrored so the guest is player 0. */
export function guestView(state: GameState): GameState {
  return mirrorState(redactState(state, guestSeat(state.players.length > 2)));
}

export function guestEvents(events: GameEvent[], coop = false): GameEvent[] {
  return mirrorEvents(redactEvents(events, guestSeat(coop)), coop);
}

/** What a spectator may see: neither player's hand (unless revealed), no deck order, no draws. */
export function spectatorView(state: GameState): GameState {
  const hide = <C extends { cardId: string; revealed?: boolean }>(c: C): C => (c.revealed ? c : { ...c, cardId: HIDDEN_CARD, costMod: 0, variant: undefined });
  const players = state.players.map((p) => ({
    ...p,
    hand: p.hand.map(hide),
    deck: p.deck.map((c) => ({ ...c, cardId: HIDDEN_CARD, costMod: 0, variant: undefined })),
  })) as GameState['players'];
  return { ...state, players, rng: { seed: 0 }, log: spectatorEvents(state.log) };
}

export function spectatorEvents(events: GameEvent[]): GameEvent[] {
  return redactEvents(events, -1 as PlayerId);
}
