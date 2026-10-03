import { describe, expect, it } from 'vitest';
import { forfeitPlayer, newTournament, placementOf, readyMatches, reportResult, startTournament, type TournamentPlayer } from '@/domain/tournament';
import { applyRanked, eloDelta, tierFor } from '@/domain/ranked';
import { simulateBotMatch } from '@/ai/simulate';
import { opponentSide } from '@/domain/matchSetup';
import { PRACTICE_OPPONENTS, DIFFICULTY_POOLS } from '@/data/opponents';

const human = (id: string): TournamentPlayer => ({ id, name: id, avatar: 'a', faction: 'EMBER', bot: false, connected: true });
const bots = [{ name: 'B', avatar: 'b', faction: 'TIDE' as const, difficulty: 'EASY' as const }];

describe('tournament bracket', () => {
  it('fills empty seats with bots and runs semis then a final', () => {
    let t = newTournament('ABCDE', human('p0'));
    t = { ...t, players: [...t.players, human('p1')] };
    t = startTournament(t, bots, () => 0.3);
    expect(t.players.length).toBe(4);
    expect(t.players.filter((p) => p.bot).length).toBe(2);
    expect(readyMatches(t).map((m) => m.id).sort()).toEqual(['SF1', 'SF2']);
    const [sf1, sf2] = t.matches;
    t = reportResult(t, 'SF1', sf1.a!);
    expect(t.matches.find((m) => m.id === 'F')!.status).toBe('waiting');
    t = reportResult(t, 'SF2', sf2.b!);
    const f = t.matches.find((m) => m.id === 'F')!;
    expect([f.a, f.b]).toEqual([sf1.a, sf2.b]);
    t = reportResult(t, 'F', f.b!);
    // The final is over, but the third-place match is still to be played.
    expect(t.phase).toBe('running');
    expect(t.championId).toBe(f.b);
    const p3 = t.matches.find((m) => m.id === 'P3')!;
    expect([p3.a, p3.b]).toEqual([sf1.b, sf2.a]);
    t = reportResult(t, 'P3', p3.a!);
    expect(t.phase).toBe('done');
    expect(placementOf(t, f.b!)).toBe(1);
    expect(placementOf(t, f.a!)).toBe(2);
    expect(placementOf(t, p3.a!)).toBe(3);
    expect(placementOf(t, p3.b!)).toBe(4);
  });

  it('plays the third-place match between the semi-final losers alongside the final', () => {
    let t = startTournament({ ...newTournament('Q', human('p0')), players: [human('p0'), human('p1'), human('p2'), human('p3')] }, bots, () => 0.5);
    const [sf1, sf2] = t.matches;
    expect(t.matches.find((m) => m.id === 'P3')!.status).toBe('waiting');
    t = reportResult(t, 'SF1', sf1.a!);
    t = reportResult(t, 'SF2', sf2.a!);
    expect(readyMatches(t).map((m) => m.id).sort()).toEqual(['F', 'P3']);
    expect(t.matches.find((m) => m.id === 'P3')!.room).toBe('TQP3');
  });

  it('awards third place to the opponent of a semi-final loser who already left', () => {
    let t = startTournament({ ...newTournament('Q', human('p0')), players: [human('p0'), human('p1'), human('p2'), human('p3')] }, bots, () => 0.5);
    const [sf1, sf2] = t.matches;
    t = reportResult(t, 'SF1', sf1.a!);
    t = forfeitPlayer(t, sf1.b!); // lost, then closed the browser before the other semi-final ended
    t = reportResult(t, 'SF2', sf2.a!);
    const p3 = t.matches.find((m) => m.id === 'P3')!;
    expect(p3.status).toBe('done');
    expect(p3.winner).toBe(sf2.b);
  });

  it('assigns a host and room for human-vs-human matches', () => {
    let t = newTournament('XYZ12', human('p0'));
    t = { ...t, players: [...t.players, human('p1'), human('p2'), human('p3')] };
    t = startTournament(t, bots);
    for (const m of readyMatches(t)) {
      expect(m.hostId).toBeDefined();
      expect(m.room).toMatch(/^TXYZ12SF[12]$/);
    }
  });

  it('needs at least two humans and forfeits leavers', () => {
    expect(() => startTournament(newTournament('A', human('p0')), bots)).toThrow();
    let t = startTournament({ ...newTournament('A', human('p0')), players: [human('p0'), human('p1')] }, bots);
    const m = t.matches.find((x) => x.a === 'p1' || x.b === 'p1')!;
    t = forfeitPlayer(t, 'p1');
    const after = t.matches.find((x) => x.id === m.id)!;
    expect(after.status).toBe('done');
    expect(after.winner).not.toBe('p1');
  });

  it('ignores duplicate or invalid reports', () => {
    let t = startTournament({ ...newTournament('A', human('p0')), players: [human('p0'), human('p1')] }, bots);
    const sf1 = t.matches[0];
    t = reportResult(t, 'SF1', sf1.a!);
    const again = reportResult(t, 'SF1', sf1.b!);
    expect(again.matches[0].winner).toBe(sf1.a);
    expect(reportResult(t, 'SF2', 'nobody')).toBe(t);
  });

  it('simulates bot vs bot matches with the real engine', () => {
    const side = (f: 'EMBER' | 'VERDANT') => opponentSide({ ...PRACTICE_OPPONENTS[f], difficulty: 'EASY', rarities: DIFFICULTY_POOLS.EASY });
    const w = simulateBotMatch(side('EMBER'), side('VERDANT'), ['EASY', 'EASY'], 5);
    expect([0, 1]).toContain(w);
  });
});

describe('ranked rating', () => {
  it('uses Elo with tiers', () => {
    expect(eloDelta(1000, 1000, 'WIN')).toBe(16);
    expect(eloDelta(1000, 1000, 'LOSS')).toBe(-16);
    expect(eloDelta(1000, 1400, 'WIN')).toBeGreaterThan(16);
    const r = applyRanked({ rating: 1000, peak: 1000, wins: 0, losses: 0 }, 1000, 'WIN');
    expect(r.state).toEqual({ rating: 1016, peak: 1016, wins: 1, losses: 0 });
    expect(tierFor(1000).name).toBe('Bronze');
    expect(tierFor(1300).name).toBe('Gold');
  });
});
