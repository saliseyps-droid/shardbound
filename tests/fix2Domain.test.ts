import { describe, expect, it } from 'vitest';
import { DRAW_REPORT, decideReport, markPlaying, newTournament, replayMatch, REPORT_TIMEOUT_MS, type Tournament, type TournamentPlayer } from '@/domain/tournament';
import { applyAiRankedResult, newAiRanked, nextAiRival, repairAiRanked } from '@/domain/aiRanked';
import { SHOP_BONUS_PACKS, SHOP_OFFERS } from '@/config/economy';

const human = (id: string): TournamentPlayer => ({ id, name: id, avatar: 'a', faction: 'EMBER', bot: false, connected: true });
const bot = (id: string): TournamentPlayer => ({ ...human(id), bot: true, difficulty: 'EASY' });

function fixture(): Tournament {
  return {
    ...newTournament('Q', human('p0')),
    phase: 'running',
    players: [human('p0'), human('p1'), human('p2'), bot('b1')],
    matches: [
      { id: 'SF1', a: 'p0', b: 'p1', winner: null, status: 'playing' },
      { id: 'SF2', a: 'p2', b: 'b1', winner: null, status: 'playing' },
    ],
  };
}

describe('tournament draws', () => {
  it('two humans who both report a draw replay the match', () => {
    const t = fixture();
    const d = decideReport(t, 'SF1', { started: ['p0', 'p1'], reports: { p0: DRAW_REPORT, p1: DRAW_REPORT }, firstReportAt: 0 }, 0);
    expect(d).toEqual({ kind: 'replay', draw: true });
    expect(replayMatch(t, 'SF1').matches[0]).toMatchObject({ status: 'ready', winner: null });
  });

  it('a draw against a bot is a replay, never an elimination', () => {
    const t = fixture();
    expect(decideReport(t, 'SF2', { started: ['p2'], reports: { p2: DRAW_REPORT }, firstReportAt: 0 }, 0)).toEqual({ kind: 'replay', draw: true });
  });

  it('a draw report waits for the second human, and a lone draw report times out into a replay', () => {
    const t = fixture();
    expect(decideReport(t, 'SF1', { started: ['p0', 'p1'], reports: { p0: DRAW_REPORT }, firstReportAt: 0 }, 0).kind).toBe('wait');
    expect(decideReport(t, 'SF1', { started: ['p0', 'p1'], reports: { p0: DRAW_REPORT }, firstReportAt: 0 }, REPORT_TIMEOUT_MS).kind).toBe('replay');
  });

  it('a draw against a win report is still a disagreement (replay)', () => {
    const t = fixture();
    expect(decideReport(t, 'SF1', { started: ['p0', 'p1'], reports: { p0: DRAW_REPORT, p1: 'p1' }, firstReportAt: 0 }, 0).kind).toBe('replay');
  });

  it('agreeing winners are still accepted', () => {
    const t = markPlaying(fixture(), 'SF1');
    expect(decideReport(t, 'SF1', { started: ['p0', 'p1'], reports: { p0: 'p1', p1: 'p1' }, firstReportAt: 0 }, 0)).toEqual({ kind: 'accept', winnerId: 'p1' });
  });
});

describe('ranked vs AI', () => {
  it('a draw resets the win streak but keeps the stars', () => {
    const s = { ...newAiRanked(), rank: 4, stars: 2, best: 4, streak: 2, wins: 2 };
    const r = applyAiRankedResult(s, 'DRAW');
    expect(r.state.streak).toBe(0);
    expect(r.state.stars).toBe(2);
    expect(r.state.rank).toBe(4);
    expect(r.starDelta).toBe(0);
  });

  it('the next rival is saved with the ladder: same until a match is recorded', () => {
    const s = newAiRanked();
    expect(nextAiRival(s)).toBe(nextAiRival(repairAiRanked(JSON.parse(JSON.stringify(s)))));
    const afterWin = applyAiRankedResult(s, 'WIN').state;
    const afterLoss = applyAiRankedResult(s, 'LOSS').state;
    const afterDraw = applyAiRankedResult(s, 'DRAW').state;
    const seeds = new Set([nextAiRival(s), nextAiRival(afterWin), nextAiRival(afterLoss), nextAiRival(afterDraw)]);
    expect(seeds.size).toBe(4);
    // Two draws in a row bring a new rival each time.
    expect(nextAiRival(applyAiRankedResult(afterDraw, 'DRAW').state)).not.toBe(nextAiRival(afterDraw));
  });

  it('draws are counted and survive the load-time repair', () => {
    const s = applyAiRankedResult(newAiRanked(), 'DRAW').state;
    expect(s.draws).toBe(1);
    expect(repairAiRanked(s).draws).toBe(1);
  });
});

describe('shop prices', () => {
  it('every set: bigger offers are cheaper per pack', () => {
    const sets = [...new Set(SHOP_OFFERS.map((o) => o.setId))];
    for (const set of sets) {
      const offers = SHOP_OFFERS.filter((o) => o.setId === set).sort((a, b) => a.packs - b.packs);
      const perPack = offers.map((o) => o.price / (o.packs + (SHOP_BONUS_PACKS[o.id] ?? 0)));
      for (let i = 1; i < perPack.length; i++) expect(perPack[i]).toBeLessThan(perPack[i - 1]);
    }
  });
});
