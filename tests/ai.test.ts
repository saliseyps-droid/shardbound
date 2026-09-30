import { describe, expect, it } from 'vitest';
import { applyAction, createGame, getLegalActions } from '@/engine';
import type { GameState, PlayerId } from '@/engine';
import { chooseAction, determinize, makeAiConfig, runAiMulligan } from '@/ai';
import type { AiConfig } from '@/ai';
import { starterDeckCards } from '@/data/starterDecks';
import { deckToList } from '@/domain/decks';
import { FACTION_HERO_POWER } from '@/data/heroPowers';
import type { Difficulty } from '@/config/progression';
import type { PlayableFaction } from '@/game/types';
import { newGame, giveCard, hero, setEnergy } from './helpers';

function startMatch(seed: number, f0: PlayableFaction, f1: PlayableFaction): GameState {
  return createGame({
    seed,
    players: [
      { name: 'A', avatar: 'a', deck: deckToList({ cards: starterDeckCards(f0) }), heroPowerId: FACTION_HERO_POWER[f0] },
      { name: 'B', avatar: 'b', deck: deckToList({ cards: starterDeckCards(f1) }), heroPowerId: FACTION_HERO_POWER[f1] },
    ],
  }).state;
}

/** Plays a full AI-vs-AI game, asserting every chosen action is legal. */
function playOut(state: GameState, cfgs: [AiConfig, AiConfig], seed: number): { state: GameState; illegal: number } {
  let s = runAiMulligan(state, 0, cfgs[0]);
  s = runAiMulligan(s, 1, cfgs[1]);
  let illegal = 0;
  let perTurn = 0;
  let lastTurn = s.turn;
  for (let i = 0; i < 3000 && s.phase === 'MAIN'; i++) {
    const me = s.activePlayer as PlayerId;
    if (s.turn !== lastTurn) {
      perTurn = 0;
      lastTurn = s.turn;
    }
    const energyBefore = s.players[me].energy;
    const d = chooseAction(s, me, cfgs[me], seed + i, perTurn);
    const res = applyAction(s, d.action);
    if (res.error) {
      illegal++;
      s = applyAction(s, { type: 'END_TURN', player: me }).state;
      continue;
    }
    if (d.action.type !== 'END_TURN') expect(res.state.players[me].energy).toBeGreaterThanOrEqual(0);
    expect(energyBefore).toBeGreaterThanOrEqual(0);
    s = res.state;
    perTurn++;
  }
  return { state: s, illegal };
}

describe('AI', () => {
  it('determinization hides the opponent hand and deck', () => {
    const s = startMatch(5, 'EMBER', 'TIDE');
    const view = determinize(s, 1, 1);
    expect(view.players[0].hand.every((c) => c.cardId === 'token_unknown')).toBe(true);
    expect(view.players[0].deck.every((c) => c.cardId === 'token_unknown')).toBe(true);
    expect(view.players[1].hand.map((c) => c.cardId)).toEqual(s.players[1].hand.map((c) => c.cardId));
  });

  it('only chooses legal actions and never spends unavailable energy', () => {
    for (const d of ['EASY', 'NORMAL', 'HARD'] as Difficulty[]) {
      const cfg = makeAiConfig(d);
      const { state, illegal } = playOut(startMatch(11, 'EMBER', 'VERDANT'), [cfg, cfg], 100);
      expect(illegal, d).toBe(0);
      expect(state.phase, d).toBe('ENDED');
    }
  });

  it('takes lethal when available', () => {
    const s = newGame({ board0: ['token_golem'] });
    s.players[1].hero.health = 6;
    const d = chooseAction(s, 0, makeAiConfig('NORMAL'), 1);
    expect(d.action.type).toBe('ATTACK');
    const res = applyAction(s, d.action);
    expect(res.state.winner).toBe(0);
  });

  it('uses a burn spell for lethal from hand', () => {
    const s = newGame();
    s.players[1].hero.health = 2;
    giveCard(s, 0, 'emb_flame_jolt');
    setEnergy(s, 0, 1);
    const d = chooseAction(s, 0, makeAiConfig('HARD'), 3);
    expect(d.action).toMatchObject({ type: 'PLAY_CARD', target: hero(1) });
  });

  it('makes favourable trades instead of ignoring a big threat', () => {
    // Enemy board threatens exactly lethal; the AI must trade its 5/5 into an attacker to survive.
    const s = newGame({ board0: ['token_horror'], board1: ['token_drakeling', 'token_drakeling', 'token_drakeling'] });
    s.players[0].hero.health = 6;
    const d = chooseAction(s, 0, makeAiConfig('HARD'), 9);
    expect(d.action.type).toBe('ATTACK');
    if (d.action.type === 'ATTACK') expect(d.action.target.type).toBe('unit');
  });

  it('ends the turn when nothing useful is possible', () => {
    const s = newGame();
    s.players[0].hand = [];
    const actions = getLegalActions(s, 0);
    expect(actions.map((a) => a.type)).toEqual(['END_TURN']);
    expect(chooseAction(s, 0, makeAiConfig('EXPERT'), 1).action.type).toBe('END_TURN');
  });

  it('harder bots beat easy bots most of the time', () => {
    let hardWins = 0;
    const games = 8;
    for (let g = 0; g < games; g++) {
      const hardSeat = (g % 2) as PlayerId;
      const cfgs: [AiConfig, AiConfig] = hardSeat === 0 ? [makeAiConfig('HARD'), makeAiConfig('EASY')] : [makeAiConfig('EASY'), makeAiConfig('HARD')];
      const { state } = playOut(startMatch(1000 + g, 'EMBER', 'EMBER'), cfgs, 7 * g);
      if (state.winner === hardSeat) hardWins++;
    }
    expect(hardWins).toBeGreaterThanOrEqual(5);
  }, 120_000);
});
