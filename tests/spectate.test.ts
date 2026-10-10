import { describe, expect, it } from 'vitest';
import { act, giveCard, newGame, setEnergy } from './helpers';
import { HIDDEN_CARD, spectatorEvents, spectatorView } from '@/net/view';
import { isWatchCode, matchWatchCode, tournamentWatchCode, validWatchHello } from '@/net/spectate';
import { CONTENT_HASH, PROTOCOL_VERSION } from '@/net/session';

describe('spectator view', () => {
  it('hides both hands and both decks, keeps the board', () => {
    const s = newGame({ board0: ['neu_trail_hound'], board1: ['emb_scorch_adept'] });
    const v = spectatorView(s);
    for (const p of v.players) {
      expect(p.hand.length).toBeGreaterThan(0);
      expect(p.hand.every((c) => c.cardId === HIDDEN_CARD)).toBe(true);
      expect(p.deck.every((c) => c.cardId === HIDDEN_CARD)).toBe(true);
    }
    expect(v.players[0].board[0].cardId).toBe('neu_trail_hound');
    expect(v.players[1].board[0].cardId).toBe('emb_scorch_adept');
    expect(v.rng.seed).toBe(0);
  });

  it('keeps revealed cards visible', () => {
    const s = newGame();
    s.players[1].hand[0] = { ...s.players[1].hand[0], revealed: true };
    expect(spectatorView(s).players[1].hand[0].cardId).toBe(s.players[1].hand[0].cardId);
  });

  it('hides which cards either player draws', () => {
    let s = newGame();
    setEnergy(s, 0, 10);
    const uid = giveCard(s, 0, 'neu_trail_hound');
    s = act(s, { type: 'PLAY_CARD', player: 0, cardUid: uid });
    s = act(s, { type: 'END_TURN', player: 0 });
    const drawn = spectatorView(s).log.filter((e) => e.type === 'CARD_DRAWN');
    expect(drawn.length).toBeGreaterThan(0);
    expect(drawn.every((e) => e.type === 'CARD_DRAWN' && e.cardId === HIDDEN_CARD)).toBe(true);
    expect(spectatorEvents(s.log).some((e) => e.type === 'CARD_PLAYED' && e.cardId === 'neu_trail_hound')).toBe(true);
  });
});

describe('watch codes', () => {
  it('derives the watch room from the match room, and from the tournament match', () => {
    expect(matchWatchCode('ABC234')).toBe('WABC234');
    expect(tournamentWatchCode('K7Q2M', 'QF-1')).toBe('WTK7Q2MQF-1');
    expect(tournamentWatchCode('K7Q2M', 'QF-1')).toBe(matchWatchCode('TK7Q2MQF-1'));
  });

  it('accepts only well-formed watch codes', () => {
    expect(isWatchCode('WABC234')).toBe(true);
    expect(isWatchCode('WTK7Q2MQF-1')).toBe(true);
    expect(isWatchCode('abc')).toBe(false);
    expect(isWatchCode('WAB C')).toBe(false);
    expect(isWatchCode(42)).toBe(false);
  });

  it('checks a spectator hello', () => {
    expect(validWatchHello({ t: 'w-hello', protocol: PROTOCOL_VERSION, content: CONTENT_HASH })).toBeNull();
    expect(validWatchHello({ t: 'w-hello', protocol: 1, content: CONTENT_HASH })).toMatch(/versions/);
    expect(validWatchHello({ t: 'hello' })).not.toBeNull();
  });
});
