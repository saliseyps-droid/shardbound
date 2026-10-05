// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { gameService, useAccount } from '@/state/accountStore';
import { useMatch } from '@/state/matchStore';
import { useSettings } from '@/state/settingsStore';
import { TUTORIAL_OPPONENT } from '@/ui/match/tutorialData';
import { TUTORIAL_STEPS } from '@/ui/match/tutorial';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function waitFor(pred: () => boolean, ms = 8000) {
  const t0 = Date.now();
  while (!pred()) {
    if (Date.now() - t0 > ms) throw new Error('timeout');
    await sleep(20);
  }
}
const step = () => TUTORIAL_STEPS[useMatch.getState().tutorialStep]?.id;
const hand = () => useMatch.getState().game!.players[0].hand;

afterEach(() => useMatch.getState().leave());

describe('strict tutorial', () => {
  it('only lets the player do what the current step asks for', async () => {
    useSettings.getState().update({ reducedMotion: true, turnTimer: false });
    if (!useAccount.getState().save) await gameService.createProfile('Tester', 'flame');
    await useMatch.getState().start({ mode: 'TUTORIAL', deckId: null, opponent: TUTORIAL_OPPONENT });
    await waitFor(() => useMatch.getState().phase === 'playing');
    const m = useMatch.getState;

    // Reading steps: no game actions at all.
    expect(step()).toBe('welcome');
    m().endTurn();
    m().clickHandCard(hand()[0].uid);
    await sleep(50);
    expect(m().game!.turn).toBe(1);
    expect(m().selection).toBeNull();
    m().nextTutorialStep();
    m().nextTutorialStep();
    expect(step()).toBe('play-unit');

    // Play a unit: Spark Bolt and End turn are refused, Shard Squire is played.
    const bolt = hand().find((c) => c.cardId === 'tut_bolt');
    if (bolt) m().clickHandCard(bolt.uid);
    m().endTurn();
    await sleep(50);
    expect(m().selection).toBeNull();
    expect(m().game!.activePlayer).toBe(0);
    const squire = hand().find((c) => c.cardId === 'tut_squire')!;
    m().clickHandCard(squire.uid);
    await waitFor(() => m().game!.players[0].board.length === 1);
    await waitFor(() => step() === 'end-turn');
    await waitFor(() => !m().busy);

    // End your turn: playing more cards is refused now.
    const another = hand().find((c) => c.cardId !== 'token_aether_shard');
    if (another) m().clickHandCard(another.uid);
    await sleep(50);
    expect(m().game!.players[0].board.length).toBe(1);
    await waitFor(() => !m().busy);
    m().endTurn();
    await waitFor(() => step() === 'attack', 15000);
  }, 30000);
});
