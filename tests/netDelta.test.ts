import { describe, expect, it } from 'vitest';
import { applyAction, createGame } from '@/engine';
import type { GameEvent, GameState, PlayerId } from '@/engine';
import { chooseAction, makeAiConfig, runAiMulligan } from '@/ai';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { buildOpponentDeck } from '@/domain/matchSetup';
import { factionOfList } from '@/domain/decks';
import { DEFAULT_BUILD } from '@/data/wardenTalents';
import { DIFFICULTY_POOLS, PRACTICE_OPPONENTS } from '@/data/opponents';
import { applyPatch, deepEqual, diff, stableHash } from '@/net/delta';
import { GuestSync, HostSync, type DeltaStateMsg } from '@/net/stateSync';
import { guestEvents, guestView, HIDDEN_CARD } from '@/net/view';

const json = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/** Every state the host would send in one AI game (initial view first), with its events. */
function gameStates(seed: number, a = PLAYABLE_FACTIONS[seed % PLAYABLE_FACTIONS.length], b = PLAYABLE_FACTIONS[(seed + 2) % PLAYABLE_FACTIONS.length]) {
  const deck = (f: (typeof PLAYABLE_FACTIONS)[number]) => buildOpponentDeck({ ...PRACTICE_OPPONENTS[f], difficulty: 'NORMAL', rarities: DIFFICULTY_POOLS.NORMAL });
  const d0 = deck(a);
  const d1 = deck(b);
  const cfg = makeAiConfig('NORMAL');
  let s: GameState = createGame({
    seed,
    players: [
      { name: 'Host', avatar: 'a', deck: d0, talents: DEFAULT_BUILD[factionOfList(d0)] },
      { name: 'Guest', avatar: 'b', deck: d1, talents: DEFAULT_BUILD[factionOfList(d1)] },
    ],
  }).state;
  const out: { state: GameState; events: GameEvent[] }[] = [{ state: s, events: [] }];
  s = runAiMulligan(s, 0, cfg);
  out.push({ state: s, events: [] });
  s = runAiMulligan(s, 1, cfg);
  out.push({ state: s, events: [] });
  let perTurn = 0;
  let turn = s.turn;
  for (let i = 0; i < 3000 && s.phase === 'MAIN'; i++) {
    if (s.turn !== turn) [perTurn, turn] = [0, s.turn];
    const me = s.activePlayer as PlayerId;
    const d = chooseAction(s, me, cfg, seed * 31 + i, perTurn++);
    let res = applyAction(s, d.action);
    if (res.error) res = applyAction(s, { type: 'END_TURN', player: me });
    s = res.state;
    out.push({ state: s, events: res.events });
  }
  return out;
}

/** Tiny deterministic PRNG for the fuzz test. */
function rng(seed: number) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function randomValue(r: () => number, depth = 0): unknown {
  const k = r();
  if (depth > 3 || k < 0.4) {
    const p = r();
    return p < 0.25 ? Math.floor(r() * 10) : p < 0.5 ? ['a', 'b', 'c'][Math.floor(r() * 3)] : p < 0.7 ? r() < 0.5 : p < 0.8 ? null : r() * 3;
  }
  if (k < 0.7) return Array.from({ length: Math.floor(r() * 5) }, () => randomValue(r, depth + 1));
  const o: Record<string, unknown> = {};
  for (let i = Math.floor(r() * 5); i > 0; i--) o[['x', 'y', 'z', 'w', 'v'][Math.floor(r() * 5)]] = randomValue(r, depth + 1);
  return o;
}

/** A random small edit of a JSON value (so diffs stay partial). */
function mutate(r: () => number, v: unknown, depth = 0): unknown {
  if (r() < 0.15 || depth > 4) return randomValue(r, depth);
  if (Array.isArray(v)) {
    const out = v.slice();
    const op = r();
    if (op < 0.3 && out.length) out.splice(Math.floor(r() * out.length), 1);
    else if (op < 0.6) out.splice(Math.floor(r() * (out.length + 1)), 0, randomValue(r, depth + 1));
    else if (out.length) {
      const i = Math.floor(r() * out.length);
      out[i] = mutate(r, out[i], depth + 1);
    }
    return out;
  }
  if (v && typeof v === 'object') {
    const out = { ...(v as Record<string, unknown>) };
    const keys = Object.keys(out);
    const op = r();
    if (op < 0.25 && keys.length) delete out[keys[Math.floor(r() * keys.length)]];
    else if (op < 0.5) out[['x', 'y', 'z', 'q'][Math.floor(r() * 4)]] = randomValue(r, depth + 1);
    else if (keys.length) {
      const k = keys[Math.floor(r() * keys.length)];
      out[k] = mutate(r, out[k], depth + 1);
    }
    return out;
  }
  return randomValue(r, depth);
}

describe('structural diff/patch', () => {
  it('handles primitives, objects, arrays and type changes', () => {
    const cases: [unknown, unknown][] = [
      [1, 2],
      ['a', null],
      [{ a: 1 }, [1]],
      [{ a: 1, b: { c: [1, 2, 3] } }, { a: 1, b: { c: [1, 3] }, d: 'x' }],
      [[1, 2, 3, 4, 5], [1, 2, 9, 3, 4, 5]],
      [[1, 2, 3, 4, 5], [1, 5]],
      [[{ uid: 1, hp: 3 }, { uid: 2, hp: 1 }], [{ uid: 1, hp: 2 }]],
      [[], [1, 2]],
      [[1, 2], []],
      [{ a: { b: { c: 1 } } }, { a: { b: {} } }],
      // A capped log sliding forward.
      [Array.from({ length: 50 }, (_, i) => ({ seq: i })), Array.from({ length: 50 }, (_, i) => ({ seq: i + 3 }))],
    ];
    for (const [a, b] of cases) {
      const before = JSON.stringify(a);
      expect(applyPatch(a, json(diff(a, b))), JSON.stringify([a, b])).toEqual(b);
      expect(JSON.stringify(a)).toBe(before); // never mutates the base
    }
    expect(diff({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBeNull();
    const log = Array.from({ length: 400 }, (_, i) => ({ type: 'X', seq: i }));
    expect(diff(log, [...log.slice(2), { type: 'Y', seq: 400 }, { type: 'Y', seq: 401 }])).toEqual([4, 2, [{ type: 'Y', seq: 400 }, { type: 'Y', seq: 401 }]]);
  });

  it('treats undefined like JSON does (absent)', () => {
    expect(diff({ a: 1, b: undefined }, { a: 1 })).toBeNull();
    expect(applyPatch({ a: 1 }, diff({ a: 1 }, { a: 1, b: undefined, c: 2 }))).toEqual({ a: 1, c: 2 });
  });

  it('round-trips random edits of random JSON values (through the wire)', () => {
    const r = rng(1234);
    for (let i = 0; i < 2000; i++) {
      const a = json(randomValue(r));
      let b = a;
      for (let k = 1 + Math.floor(r() * 3); k > 0; k--) b = mutate(r, b);
      b = json(b);
      const patch = json(diff(a, b));
      expect(applyPatch(a, patch), JSON.stringify([a, b])).toEqual(b);
      expect(deepEqual(a, b)).toBe(patch === null);
    }
  });

  it('rejects malformed patches', () => {
    expect(() => applyPatch([1], [2, 1, { 5: [0, 1] }] as never)).toThrow();
    expect(() => applyPatch({}, [3, 0, 1, []] as never)).toThrow();
    expect(() => applyPatch(1, [1, { a: [0, 1] }])).toThrow();
    expect(() => applyPatch(1, [9] as never)).toThrow();
  });

  it('hashes independently of key order', () => {
    expect(stableHash({ a: 1, b: [1, { c: 2, d: 3 }] })).toBe(stableHash({ b: [1, { d: 3, c: 2 }], a: 1 }));
    expect(stableHash({ a: 1 })).not.toBe(stableHash({ a: 2 }));
  });
});

describe('delta state sync on real games', () => {
  it('sequential patches rebuild exactly the full guest view at every step', () => {
    let full = 0;
    let delta = 0;
    for (const seed of [3, 11, 27]) {
      const states = gameStates(seed);
      const host = new HostSync();
      const guest = new GuestSync();
      const first = json(host.full(guestView(states[0].state), [], true));
      guest.receive(first);
      for (const step of states.slice(1)) {
        const view = guestView(step.state);
        const msg = json(host.next(view, guestEvents(step.events)));
        expect(msg.t).toBe('delta');
        const got = guest.receive(msg);
        expect(got && 'state' in got).toBe(true);
        const shown = (got as { state: GameState }).state;
        expect(shown).toEqual(json(view));
        expect((got as { events: GameEvent[] }).events).toEqual(json(guestEvents(step.events)));
        // The rebuilt view hides the host's hand and every deck order, like the full view.
        expect(shown.players[0].deck.every((c) => c.cardId === HIDDEN_CARD)).toBe(true);
        expect(shown.players[1].hand.every((c) => c.revealed || c.cardId === HIDDEN_CARD)).toBe(true);
        full += JSON.stringify({ t: 'state', state: view, events: guestEvents(step.events) }).length;
        delta += JSON.stringify(msg).length;
      }
      expect(states[states.length - 1].state.phase).toBe('ENDED');
    }
    // Deltas are a fraction of the full views.
    expect(delta * 5).toBeLessThan(full);
  }, 120_000);

  it('asks for a full state after a gap and recovers with it', () => {
    const states = gameStates(5).slice(0, 30);
    const host = new HostSync();
    const guest = new GuestSync();
    guest.receive(json(host.full(guestView(states[0].state), [], true)));
    expect(guest.receive(json(host.next(guestView(states[1].state), [])))).not.toBeNull();
    host.next(guestView(states[2].state), []); // lost on the way
    expect(guest.receive(json(host.next(guestView(states[3].state), [])))).toEqual({ resync: true });
    // Until the full state arrives later deltas are ignored (no second resync).
    expect(guest.receive(json(host.next(guestView(states[4].state), [])))).toBeNull();
    const full = json(host.resend()!);
    expect(full.t).toBe('state');
    expect((guest.receive(full) as { state: GameState }).state).toEqual(json(guestView(states[4].state)));
    for (const step of states.slice(5)) {
      const got = guest.receive(json(host.next(guestView(step.state), [])));
      expect((got as { state: GameState }).state).toEqual(json(guestView(step.state)));
    }
  });

  it('asks for a full state when a patch does not match (hash) or is malformed', () => {
    const states = gameStates(8).slice(0, 6);
    const host = new HostSync();
    const guest = new GuestSync();
    guest.receive(json(host.full(guestView(states[0].state), [], true)));
    const bad = json(host.next(guestView(states[1].state), [])) as DeltaStateMsg;
    expect(guest.receive({ ...bad, h: bad.h ^ 1 })).toEqual({ resync: true });

    const guest2 = new GuestSync();
    const host2 = new HostSync();
    guest2.receive(json(host2.full(guestView(states[0].state), [], true)));
    const msg = json(host2.next(guestView(states[1].state), [])) as DeltaStateMsg;
    expect(guest2.receive({ ...msg, patch: [2, -1, {}] as never })).toEqual({ resync: true });
  });

  it('a delta before any full state needs a resync', () => {
    const guest = new GuestSync();
    expect(guest.receive({ t: 'delta', seq: 1, patch: null, events: [], h: 0 })).toEqual({ resync: true });
  });
});
