// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { gameService, useAccount } from '@/state/accountStore';
import { DISCONNECT_TIMING, useMatch } from '@/state/matchStore';
import { useSettings } from '@/state/settingsStore';
import { netSession } from '@/net/session';
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

async function hostedMatch(mode: MatchConfig['mode'] = 'ONLINE'): Promise<MatchConfig> {
  useSettings.getState().update({ reducedMotion: true, turnTimer: false });
  if (!useAccount.getState().save) await gameService.createProfile('Tester', 'flame');
  const save = useAccount.getState().save!;
  netSession.remoteSide = sanitizeRemoteSide(playerSide({ ...save.profile, username: 'Guest' }, save.decks[0]));
  netSession.status = 'connected';
  return { mode, online: 'host', deckId: save.decks[0].id, opponent: onlineOpponent('Guest', 'b', save.decks[0].heroFaction), opponentRating: mode === 'RANKED' ? 1000 : undefined };
}

const dropConnection = () => (netSession as unknown as { setStatus: (s: string) => void }).setStatus('closed');

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  useMatch.getState().leave();
});

describe('online disconnects', () => {
  it('marks a match with stakes as active while it runs', async () => {
    const config = await hostedMatch('RANKED');
    await useMatch.getState().start(config);
    expect(useAccount.getState().save!.profile.activeMatch).toMatchObject({ mode: 'RANKED', opponentRating: 1000 });
  });

  it('the player who still has a connection wins when the opponent is gone from the server', async () => {
    const config = await hostedMatch();
    await useMatch.getState().start(config);
    vi.spyOn(netSession, 'localNetworkOk').mockResolvedValue(true);
    vi.spyOn(netSession, 'remotePeerPresent').mockResolvedValue(false);
    const before = useAccount.getState().save!.matchHistory.length;
    dropConnection();
    await waitFor(() => useMatch.getState().phase === 'ended');
    const save = useAccount.getState().save!;
    expect(save.matchHistory.length).toBe(before + 1);
    expect(save.matchHistory[0].result).toBe('WIN');
    expect(save.profile.activeMatch ?? null).toBeNull();
  });

  it('is a draw when both players stay online and only the link between them broke', async () => {
    const config = await hostedMatch();
    await useMatch.getState().start(config);
    Object.assign(DISCONNECT_TIMING, { checkMs: 200, retryMs: 50 });
    vi.spyOn(netSession, 'localNetworkOk').mockResolvedValue(true);
    const probe = vi.spyOn(netSession, 'remotePeerPresent').mockResolvedValue(true);
    const before = useAccount.getState().save!.matchHistory.length;
    dropConnection();
    await waitFor(() => useMatch.getState().phase === 'ended');
    Object.assign(DISCONNECT_TIMING, { checkMs: 75_000, retryMs: 8_000 });
    const save = useAccount.getState().save!;
    expect(probe.mock.calls.length).toBeGreaterThan(1);
    expect(save.matchHistory.length).toBe(before + 1);
    expect(save.matchHistory[0].result).toBe('DRAW');
    expect(useMatch.getState().game?.endReason).toBe('DISCONNECT');
    expect(save.profile.activeMatch ?? null).toBeNull();
  });

  it('a player who is offline himself does not get the win', async () => {
    const config = await hostedMatch();
    await useMatch.getState().start(config);
    vi.stubGlobal('navigator', { ...navigator, onLine: false });
    const before = useAccount.getState().save!.matchHistory.length;
    dropConnection();
    await waitFor(() => useMatch.getState().phase === 'ended');
    const save = useAccount.getState().save!;
    expect(save.matchHistory.length).toBe(before + 1);
    expect(save.matchHistory[0].result).toBe('LOSS');
  });
});
