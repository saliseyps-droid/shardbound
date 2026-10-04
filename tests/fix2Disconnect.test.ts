// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gameService, useAccount } from '@/state/accountStore';
import { DISCONNECT_TIMING, useMatch } from '@/state/matchStore';
import { useSettings } from '@/state/settingsStore';
import { useUi } from '@/state/uiStore';
import { netSession, type NetMessage } from '@/net/session';
import { onlineOpponent, sanitizeRemoteSide } from '@/net/lobby';
import { playerSide } from '@/domain/matchSetup';
import type { MatchConfig } from '@/state/matchLaunch';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function waitFor(pred: () => boolean, ms = 5000) {
  const t0 = Date.now();
  while (!pred()) {
    if (Date.now() - t0 > ms) throw new Error('timeout');
    await sleep(20);
  }
}

async function hostedMatch(): Promise<MatchConfig> {
  useSettings.getState().update({ reducedMotion: true, turnTimer: false });
  if (!useAccount.getState().save) await gameService.createProfile('Tester', 'flame');
  const save = useAccount.getState().save!;
  netSession.remoteSide = sanitizeRemoteSide(playerSide({ ...save.profile, username: 'Guest' }, save.decks[0]));
  netSession.status = 'connected';
  return { mode: 'ONLINE', online: 'host', deckId: save.decks[0].id, opponent: onlineOpponent('Guest', 'b', save.decks[0].heroFaction) };
}

const dropConnection = () => (netSession as unknown as { setStatus: (s: string) => void }).setStatus('closed');
const receive = (msg: NetMessage) => (netSession as unknown as { listeners: Set<(m: NetMessage) => void> }).listeners.forEach((l) => l(msg));
const toasts = () => useUi.getState().toasts.map((x) => x.message);

const originalTiming = { ...DISCONNECT_TIMING };
afterEach(() => {
  Object.assign(DISCONNECT_TIMING, originalTiming);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  useMatch.getState().leave();
  useUi.setState({ toasts: [] });
});

describe('disconnect check', () => {
  it('locks all input while the dropped link is being checked', async () => {
    const config = await hostedMatch();
    await useMatch.getState().start(config);
    // Put the board in our main phase so ending the turn would normally be allowed.
    const g = useMatch.getState().game!;
    useMatch.setState({ game: { ...g, phase: 'MAIN', activePlayer: 0 }, phase: 'playing' });
    vi.spyOn(netSession, 'localNetworkOk').mockResolvedValue(true);
    let release: (present: boolean) => void = () => {};
    vi.spyOn(netSession, 'remotePeerPresent').mockImplementation(() => new Promise<boolean>((r) => (release = r)));
    dropConnection();
    expect(useMatch.getState().linkCheck).toBe(true);
    await sleep(50);
    const version = useMatch.getState().version;
    useMatch.getState().endTurn();
    await sleep(50);
    expect(useMatch.getState().version).toBe(version);
    expect(useMatch.getState().game!.activePlayer).toBe(0);
    release(false);
    await waitFor(() => useMatch.getState().phase === 'ended');
    expect(useMatch.getState().linkCheck).toBe(false);
    expect(useAccount.getState().save!.matchHistory[0].result).toBe('WIN');
  });

  it('after a disconnect draw this side stays reachable past the opponent\'s check window', async () => {
    const config = await hostedMatch();
    await useMatch.getState().start(config);
    Object.assign(DISCONNECT_TIMING, { checkMs: 100, retryMs: 20 });
    vi.spyOn(netSession, 'localNetworkOk').mockResolvedValue(true);
    vi.spyOn(netSession, 'remotePeerPresent').mockResolvedValue(true);
    const keep = vi.spyOn(netSession, 'keepAliveFor');
    dropConnection();
    await waitFor(() => useMatch.getState().phase === 'ended');
    expect(useAccount.getState().save!.matchHistory[0].result).toBe('DRAW');
    expect(keep).toHaveBeenCalledTimes(1);
    expect(keep.mock.calls[0][0]).toBeGreaterThanOrEqual(originalTiming.checkMs + 15_000);
  });

  it('no "connection lost" check when the opponent conceded right before leaving', async () => {
    const config = await hostedMatch();
    await useMatch.getState().start(config);
    const local = vi.spyOn(netSession, 'localNetworkOk').mockResolvedValue(true);
    const probe = vi.spyOn(netSession, 'remotePeerPresent').mockResolvedValue(false);
    // The guest concedes (its own coordinates: it is player 0 there) and its "bye" follows at once.
    receive({ t: 'action', action: { type: 'CONCEDE', player: 0 } });
    dropConnection();
    await waitFor(() => useMatch.getState().phase === 'ended');
    await sleep(100);
    expect(local).not.toHaveBeenCalled();
    expect(probe).not.toHaveBeenCalled();
    expect(toasts().some((m) => /checking|ověřuji/i.test(m))).toBe(false);
    expect(useMatch.getState().game!.endReason).toBe('CONCEDE');
    expect(useAccount.getState().save!.matchHistory[0].result).toBe('WIN');
  });

  it('no check after this player conceded or left', async () => {
    const config = await hostedMatch();
    await useMatch.getState().start(config);
    const local = vi.spyOn(netSession, 'localNetworkOk').mockResolvedValue(true);
    useMatch.getState().concede();
    dropConnection();
    await sleep(100);
    expect(local).not.toHaveBeenCalled();
    expect(useMatch.getState().linkCheck).toBe(false);
  });
});
