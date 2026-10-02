import { describe, expect, it } from 'vitest';
import { DEFAULT_BUILD } from '@/data/wardenTalents';
import { applyAction, createGame, getLegalActions } from '@/engine';
import { guestEvents, guestView, mirrorAction, mirrorState, HIDDEN_CARD } from '@/net/view';
import { validateRemoteSide } from '@/net/lobby';
import { playerSide } from '@/domain/matchSetup';
import { createNewSave } from '@/domain/newAccount';
import { starterDeckCards } from '@/data/starterDecks';
import { deckToList } from '@/domain/decks';

function game() {
  return createGame({
    seed: 9,
    firstPlayer: 0,
    skipMulligan: true,
    players: [
      { name: 'Host', avatar: 'a', deck: deckToList({ cards: starterDeckCards('EMBER') }), talents: DEFAULT_BUILD.EMBER },
      { name: 'Guest', avatar: 'b', deck: deckToList({ cards: starterDeckCards('TIDE') }), talents: DEFAULT_BUILD.TIDE },
    ],
  }).state;
}

describe('online views', () => {
  it('mirrors so the guest is player 0 and round-trips', () => {
    const s = game();
    const m = mirrorState(s);
    expect(m.players[0].hero.name).toBe('Guest');
    expect(m.players[0].id).toBe(0);
    expect(m.activePlayer).toBe(1);
    expect(mirrorState(m)).toEqual(s);
  });

  it('hides the host hand and every deck order from the guest', () => {
    const v = guestView(game());
    expect(v.players[1].hand.every((c) => c.cardId === HIDDEN_CARD)).toBe(true);
    expect(v.players[1].deck.every((c) => c.cardId === HIDDEN_CARD)).toBe(true);
    expect(v.players[0].deck.every((c) => c.cardId === HIDDEN_CARD)).toBe(true);
    expect(v.players[0].hand.some((c) => c.cardId !== HIDDEN_CARD)).toBe(true);
    expect(v.rng.seed).toBe(0);
  });

  it('redacts host draws in events but keeps plays public', () => {
    let s = game();
    const res = applyAction(s, { type: 'END_TURN', player: 0 });
    s = res.state;
    const back = applyAction(s, { type: 'END_TURN', player: 1 });
    const evs = guestEvents(back.events);
    const hostDraw = evs.find((e) => e.type === 'CARD_DRAWN');
    expect(hostDraw && hostDraw.type === 'CARD_DRAWN' && hostDraw.player).toBe(1);
    expect(hostDraw && hostDraw.type === 'CARD_DRAWN' && hostDraw.cardId).toBe(HIDDEN_CARD);
  });

  it('guest actions computed on its view are legal for the host after mirroring', () => {
    let s = game();
    s = applyAction(s, { type: 'END_TURN', player: 0 }).state; // guest's turn
    const view = guestView(s);
    const actions = getLegalActions(view, 0);
    expect(actions.length).toBeGreaterThan(0);
    for (const a of actions) {
      const res = applyAction(s, mirrorAction(a));
      expect(res.error, JSON.stringify(a)).toBeUndefined();
    }
  });

  it('host validates the guest deck', () => {
    const save = createNewSave('G', 'b', 0, 'g');
    const side = playerSide('G', 'b', save.decks[0]);
    expect(validateRemoteSide(side)).toBeNull();
    expect(validateRemoteSide({ ...side, deck: side.deck.slice(0, 10) })).toMatch(/not valid/);
    expect(validateRemoteSide({ ...side, heroHealth: 99 })).toBe('Invalid match setup.');
  });
});
