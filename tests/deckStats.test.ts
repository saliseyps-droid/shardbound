import { describe, expect, it } from 'vitest';
import { deckStatsFromHistory, games, playedModes, rankedCards, recordDeckGame, repairDeckStats, statsFor, winRate } from '@/domain/deckStats';
import { createNewSave } from '@/domain/newAccount';
import { applyMatchResult, type MatchSummary } from '@/domain/matchResults';
import { migrateSave } from '@/persistence/migrations';

const summary = (over: Partial<MatchSummary>): MatchSummary => ({
  mode: 'PRACTICE', opponentId: 'o', opponentName: 'O', difficulty: 'NORMAL', deckId: 'x', deckName: 'D', deckFaction: 'EMBER', result: 'WIN', turns: 8, durationMs: 1000,
  stats: { damageDealt: 10, heroDamageDealt: 10, cardsPlayed: 5, unitsPlayed: 3, spellsPlayed: 2, unitsDestroyed: 1, healingDone: 0, cardsDrawn: 6 }, conceded: false, ...over,
});

describe('deck statistics', () => {
  it('keeps every mode apart, with opponents and cards, and sums them for All modes', () => {
    let s = recordDeckGame(undefined, { mode: 'AI_RANKED', result: 'WIN', turns: 10, date: 1, opponentFaction: 'VOID', cardsPlayed: ['a', 'a', 'b'] });
    s = recordDeckGame(s, { mode: 'AI_RANKED', result: 'LOSS', turns: 6, date: 2, opponentFaction: 'VOID', cardsPlayed: ['a'] });
    s = recordDeckGame(s, { mode: 'PVE', result: 'WIN', turns: 4, date: 3, opponentFaction: 'TIDE', cardsPlayed: ['b'] });
    s = recordDeckGame(s, { mode: 'TUTORIAL', result: 'WIN', turns: 4, date: 9 });
    expect(playedModes(s)).toEqual(['PVE', 'AI_RANKED']);
    const air = statsFor(s, 'AI_RANKED');
    expect([air.w, air.l, air.turns]).toEqual([1, 1, 16]);
    expect(air.vs.VOID).toEqual({ w: 1, l: 1, d: 0 });
    expect(air.cards.a).toEqual({ games: 2, wins: 1 });
    const all = statsFor(s, 'ALL');
    expect(games(all)).toBe(3);
    expect(winRate(all)).toBe(67);
    expect(all.cards.b).toEqual({ games: 2, wins: 2 });
    expect(rankedCards(all, 2).map((c) => c.id)).toEqual(['b', 'a']);
    expect(s.lastPlayed).toBe(3);
  });

  it('a recorded match adds to the saved deck; the history seeds old saves; repair drops junk', () => {
    const save = createNewSave('A', 'flame', 1, 'p');
    const deck = save.decks[0];
    const { save: next } = applyMatchResult(save, summary({ deckId: deck.id, mode: 'AI_RANKED', opponentFaction: 'IRON', cardsPlayed: [deck.cards ? Object.keys(deck.cards)[0] : 'x'] }), 5);
    expect(statsFor(next.profile.deckStats?.[deck.id], 'AI_RANKED').vs.IRON).toEqual({ w: 1, l: 0, d: 0 });
    // Arena or tutorial decks are not saved decks: nothing recorded.
    expect(applyMatchResult(save, summary({ deckId: 'tutorial' }), 5).save.profile.deckStats?.tutorial).toBeUndefined();

    const old = JSON.parse(JSON.stringify(next));
    delete old.profile.deckStats;
    const migrated = migrateSave(old).save;
    expect(games(statsFor(migrated.profile.deckStats?.[deck.id], 'AI_RANKED'))).toBe(1);
    expect(deckStatsFromHistory([])).toEqual({});
    expect(repairDeckStats({ d: { modes: { PVE: { w: -2, l: 'x', d: 1, turns: 3, cards: { c: { games: 2, wins: 9 } } }, NOPE: { w: 3 } } } })).toEqual({
      d: { modes: { PVE: { w: 0, l: 0, d: 1, turns: 3, vs: {}, cards: { c: { games: 2, wins: 2 } } } }, lastPlayed: 0 },
    });
  });
});
