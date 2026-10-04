// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gameService, useAccount } from '@/state/accountStore';
import { useMatch } from '@/state/matchStore';
import { useSettings } from '@/state/settingsStore';
import { netSession, type NetMessage } from '@/net/session';
import { onlineOpponent, sanitizeRemoteSide } from '@/net/lobby';
import { playerSide } from '@/domain/matchSetup';
import { applyAction, createGame } from '@/engine';
import { GuestSync, HostSync } from '@/net/stateSync';
import { guestEvents, guestView } from '@/net/view';
import type { GameState } from '@/engine';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function waitFor(pred: () => boolean, ms = 5000) {
  const t0 = Date.now();
  while (!pred()) {
    if (Date.now() - t0 > ms) throw new Error('timeout');
    await sleep(20);
  }
}
const receive = (msg: NetMessage) => (netSession as unknown as { listeners: Set<(m: NetMessage) => void> }).listeners.forEach((l) => l(msg));
const json = <T>(v: T): T => JSON.parse(JSON.stringify(v));

async function profile() {
  useSettings.getState().update({ reducedMotion: true, turnTimer: false });
  if (!useAccount.getState().save) await gameService.createProfile('Tester', 'flame');
  return useAccount.getState().save!;
}

afterEach(() => {
  vi.restoreAllMocks();
  useMatch.getState().leave();
});

describe('online delta states through the match store', () => {
  it('host sends a full initial view, then deltas, and a full view on resync', async () => {
    const save = await profile();
    netSession.remoteSide = sanitizeRemoteSide(playerSide({ ...save.profile, username: 'Guest' }, save.decks[0]));
    netSession.status = 'connected';
    const sent: NetMessage[] = [];
    vi.spyOn(netSession, 'send').mockImplementation((m) => void sent.push(json(m)));
    await useMatch.getState().start({ mode: 'ONLINE', online: 'host', deckId: save.decks[0].id, opponent: onlineOpponent('Guest', 'b', save.decks[0].heroFaction) });
    expect(sent[0]).toMatchObject({ t: 'state', initial: true, seq: 1 });
    const guest = new GuestSync();
    guest.receive(sent[0] as never);
    // The guest keeps its opening hand (in its own coordinates it is player 0).
    receive({ t: 'action', action: { type: 'MULLIGAN', player: 0, replaceUids: [] } });
    await waitFor(() => sent.length >= 2);
    expect(sent[1].t).toBe('delta');
    const got = guest.receive(sent[1] as never) as { state: GameState };
    expect(got.state).toEqual(json(guestView(useMatch.getState().game!)));
    receive({ t: 'resync' });
    await waitFor(() => sent.length >= 3);
    expect(sent[2]).toMatchObject({ t: 'state', seq: 3 });
    expect((sent[2] as { state: GameState }).state).toEqual(json(guestView(useMatch.getState().game!)));
  });

  it('guest applies deltas and asks for a full state after a gap', async () => {
    const save = await profile();
    netSession.status = 'connected';
    const sent: NetMessage[] = [];
    vi.spyOn(netSession, 'send').mockImplementation((m) => void sent.push(json(m)));
    const deck = playerSide(save.profile, save.decks[0]);
    let s = createGame({ seed: 7, players: [{ ...deck, name: 'Host' }, { ...deck, name: 'Guest' }] }).state;
    const host = new HostSync();
    receive(json(host.full(guestView(s), [], true)));
    await useMatch.getState().start({ mode: 'ONLINE', online: 'guest', deckId: save.decks[0].id, opponent: onlineOpponent('Host', 'a', save.decks[0].heroFaction) });
    const step = (action: Parameters<typeof applyAction>[1]) => {
      const res = applyAction(s, action);
      expect(res.error).toBeUndefined();
      s = res.state;
      return json(host.next(guestView(s), guestEvents(res.events)));
    };
    receive(step({ type: 'MULLIGAN', player: 0, replaceUids: [] }));
    receive(step({ type: 'MULLIGAN', player: 1, replaceUids: [] }));
    await waitFor(() => useMatch.getState().game?.phase === 'MAIN');
    expect(useMatch.getState().game).toEqual(json(guestView(s)));
    expect(sent).toEqual([]);
    // A lost delta: the next one cannot be applied, the guest asks for the full view.
    step({ type: 'END_TURN', player: s.activePlayer });
    receive(step({ type: 'END_TURN', player: s.activePlayer }));
    await waitFor(() => sent.length > 0);
    expect(sent).toEqual([{ t: 'resync' }]);
    receive(json(host.resend()!));
    await waitFor(() => useMatch.getState().game?.turn === s.turn);
    expect(useMatch.getState().game).toEqual(json(guestView(s)));
  });
});
