import { describe, expect, it } from 'vitest';
import {
  TOURNAMENT_SIZES,
  matchLabel,
  newTournament,
  placementOf,
  readyMatches,
  reportResult,
  roundLabel,
  startTournament,
  tournamentPrizes,
  type Tournament,
  type TournamentPlayer,
} from '@/domain/tournament';

const human = (id: string): TournamentPlayer => ({ id, name: id, avatar: 'a', faction: 'EMBER', bot: false, connected: true });
const bots = [{ name: 'B', avatar: 'b', faction: 'TIDE' as const, difficulty: 'EASY' as const }];

/** Plays the whole bracket, always letting side A win. */
function playOut(t: Tournament): Tournament {
  for (let guard = 0; guard < 200 && t.phase !== 'done'; guard++) {
    const m = readyMatches(t)[0];
    if (!m) throw new Error('bracket stuck');
    t = reportResult(t, m.id, m.a!);
  }
  return t;
}

describe('tournament sizes', () => {
  it('offers 4, 8, 16 and 32 players', () => {
    expect(TOURNAMENT_SIZES).toEqual([4, 8, 16, 32]);
  });

  for (const size of [4, 8, 16, 32] as const) {
    it(`runs a full ${size}-player bracket with a third-place match`, () => {
      let t = newTournament('ABCDE', human('p0'), size);
      t = { ...t, players: [...t.players, human('p1'), human('p2')] };
      t = startTournament(t, bots, () => 0.42);
      expect(t.players).toHaveLength(size);
      expect(readyMatches(t)).toHaveLength(size / 2);
      expect(t.matches).toHaveLength(size); // size - 1 knockout matches + third place
      t = playOut(t);
      expect(t.phase).toBe('done');
      const places = t.players.map((p) => placementOf(t, p.id));
      expect(places.filter((p) => p === 1)).toHaveLength(1);
      expect(places.filter((p) => p === 2)).toHaveLength(1);
      expect(places.filter((p) => p === 3)).toHaveLength(1);
    });
  }

  it('names rounds and matches by size', () => {
    expect(matchLabel('F')).toBe('Final');
    expect(matchLabel('P3')).toBe('Third-place match');
    expect(matchLabel('SF2')).toBe('Semi-final 2');
    expect(matchLabel('QF3')).toBe('Quarter-final 3');
    expect(matchLabel('R16-5')).toBe('Round of 16, match 5');
    expect(roundLabel(4)).toBe('Round of 32');
    expect(roundLabel(1)).toBe('Semi-finals');
  });

  it('gives bigger prizes for bigger tournaments', () => {
    const p = TOURNAMENT_SIZES.map((s) => tournamentPrizes(s));
    for (let i = 1; i < p.length; i++) {
      expect(p[i].champion.gold).toBeGreaterThan(p[i - 1].champion.gold);
      expect(p[i].third.gold).toBeGreaterThan(p[i - 1].third.gold);
    }
    expect(p[3].champion.packs).toBeGreaterThan(p[0].champion.packs);
  });
});
