// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { gameService, useAccount } from '@/state/accountStore';
import { useMatch } from '@/state/matchStore';
import { useSettings } from '@/state/settingsStore';
import { PRACTICE_OPPONENTS, DIFFICULTY_POOLS } from '@/data/opponents';
import type { MatchConfig } from '@/state/matchLaunch';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor(pred: () => boolean, ms = 5000) {
  const t0 = Date.now();
  while (!pred()) {
    if (Date.now() - t0 > ms) throw new Error('timeout');
    await sleep(20);
  }
}

async function freshMatch(): Promise<MatchConfig> {
  useSettings.getState().update({ reducedMotion: true, turnTimer: false });
  if (!useAccount.getState().save) await gameService.createProfile('Tester', 'flame');
  const save = useAccount.getState().save!;
  return { mode: 'PRACTICE', deckId: save.decks[0].id, opponent: { ...PRACTICE_OPPONENTS.EMBER, difficulty: 'EASY', rarities: DIFFICULTY_POOLS.EASY } };
}

describe('match controller', () => {
  it('confirming the mulligan before the AI decides still starts the game', async () => {
    const config = await freshMatch();
    const starting = useMatch.getState().start(config);
    // Confirm immediately, racing the AI mulligan.
    const confirming = useMatch.getState().confirmMulligan();
    await Promise.all([starting, confirming]);
    await waitFor(() => useMatch.getState().game?.phase === 'MAIN');
    expect(useMatch.getState().phase).toBe('playing');
    useMatch.getState().leave();
  });

  it('records a match result exactly once even with repeated concedes', async () => {
    const config = await freshMatch();
    const before = useAccount.getState().save!.matchHistory.length;
    await useMatch.getState().start(config);
    await useMatch.getState().confirmMulligan();
    useMatch.getState().concede();
    useMatch.getState().concede();
    await sleep(50);
    expect(useMatch.getState().phase).toBe('ended');
    expect(useAccount.getState().save!.matchHistory.length).toBe(before + 1);
    expect(useAccount.getState().save!.matchHistory[0].result).toBe('LOSS');
    useMatch.getState().leave();
  });

  it('an in-flight action never overwrites a conceded game', async () => {
    const config = await freshMatch();
    await useMatch.getState().start(config);
    await useMatch.getState().confirmMulligan();
    await waitFor(() => useMatch.getState().game?.phase === 'MAIN');
    const s = useMatch.getState();
    // Start ending the turn (async animation) and concede during it.
    if (s.game!.activePlayer === 0) s.endTurn();
    useMatch.getState().concede();
    await sleep(400);
    expect(useMatch.getState().game?.phase).toBe('ENDED');
    expect(useMatch.getState().phase).toBe('ended');
    useMatch.getState().leave();
  });
});
