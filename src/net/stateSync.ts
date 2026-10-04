import type { GameEvent, GameState } from '@/engine/types';
import { applyPatch, deepEqual, diff, stableHash, type Patch } from './delta';

/**
 * Delta state sync for online matches. The host remembers the last guest view it sent and
 * sends a patch against it; the guest applies it to its last received view. Every message
 * carries a sequence number and the patched view's hash: on a gap or mismatch the guest asks
 * for a full state (`resync`). Patches are computed from guest views only, so hidden
 * information never leaves the host.
 */

export type FullStateMsg = { t: 'state'; state: GameState; events: GameEvent[]; initial?: boolean; seq?: number };
/**
 * `events` are left out (`logEvents` = their count) when they are just the last entries of the
 * view's log, which the patch already carries.
 */
export type DeltaStateMsg = { t: 'delta'; seq: number; patch: Patch | null; events?: GameEvent[]; logEvents?: number; h: number };

/** Exactly what the guest will see after the wire (drops undefined, NaN -> null, ...). */
const normalize = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export class HostSync {
  private last: GameState | null = null;
  private seq = 0;

  reset() {
    this.last = null;
    this.seq = 0;
  }

  /** A full state (the initial one, or the answer to a resync); later deltas build on it. */
  full(view: GameState, events: GameEvent[], initial = false): FullStateMsg {
    if (initial) this.seq = 0;
    const state = normalize(view);
    this.last = state;
    const msg: FullStateMsg = { t: 'state', state, events: normalize(events), seq: ++this.seq };
    if (initial) msg.initial = true;
    return msg;
  }

  /** Answer to a guest's `resync`: the latest view again, in full (null before the first state). */
  resend(): FullStateMsg | null {
    if (!this.last) return null;
    return { t: 'state', state: this.last, events: [], seq: ++this.seq };
  }

  /** The next update: a delta against the last sent view (a full state if there is none). */
  next(view: GameState, events: GameEvent[]): FullStateMsg | DeltaStateMsg {
    if (!this.last) return this.full(view, events);
    const state = normalize(view);
    const patch = diff(this.last, state);
    this.last = state;
    const evs = normalize(events);
    const msg: DeltaStateMsg = { t: 'delta', seq: ++this.seq, patch, h: stableHash(state) };
    const log = state.log ?? [];
    if (evs.length <= log.length && deepEqual(evs, log.slice(log.length - evs.length))) msg.logEvents = evs.length;
    else msg.events = evs;
    return msg;
  }
}

export type GuestSyncResult = { state: GameState; events: GameEvent[] } | { resync: true } | null;

export class GuestSync {
  private last: GameState | null = null;
  private seq: number | null = null;
  /** A resync was requested; deltas are ignored until the full state arrives. */
  private awaiting = false;

  reset() {
    this.last = null;
    this.seq = null;
    this.awaiting = false;
  }

  /** Returns the new view to show, `{ resync }` to ask the host for a full state, or null to ignore. */
  receive(msg: FullStateMsg | DeltaStateMsg): GuestSyncResult {
    if (msg.t === 'state') {
      this.last = msg.state;
      this.seq = typeof msg.seq === 'number' ? msg.seq : null;
      this.awaiting = false;
      return { state: msg.state, events: msg.events ?? [] };
    }
    if (this.awaiting) return null;
    const fail = (): GuestSyncResult => {
      this.awaiting = true;
      return { resync: true };
    };
    if (!this.last || this.seq === null || msg.seq !== this.seq + 1) return fail();
    let state: GameState;
    try {
      state = applyPatch<GameState>(this.last, msg.patch);
    } catch {
      return fail();
    }
    if (stableHash(state) !== msg.h) return fail();
    this.last = state;
    this.seq = msg.seq;
    const n = msg.logEvents;
    const events = Array.isArray(msg.events) ? msg.events : typeof n === 'number' && n > 0 ? state.log.slice(-n) : [];
    return { state, events };
  }
}
