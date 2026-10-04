import { describe, expect, it } from 'vitest';
import { decideReport, isMatchParticipant, markPlaying, newTournament, replayMatch, REPORT_TIMEOUT_MS, type MatchReports, type Tournament, type TournamentPlayer } from '@/domain/tournament';

const human = (id: string): TournamentPlayer => ({ id, name: id, avatar: 'a', faction: 'EMBER', bot: false, connected: true });
const bot = (id: string): TournamentPlayer => ({ ...human(id), bot: true, difficulty: 'EASY' });

/** SF1: p0 vs p1 (humans), SF2: p2 (human) vs b1 (bot); a bot-only match BB: b1 vs b2. */
function fixture(): Tournament {
  const base = newTournament('Q', human('p0'));
  return {
    ...base,
    phase: 'running',
    players: [human('p0'), human('p1'), human('p2'), bot('b1'), bot('b2')],
    matches: [
      { id: 'SF1', a: 'p0', b: 'p1', winner: null, status: 'ready' },
      { id: 'SF2', a: 'p2', b: 'b1', winner: null, status: 'ready' },
      { id: 'BB', a: 'b1', b: 'b2', winner: null, status: 'ready' },
    ],
  };
}

describe('tournament result reports', () => {
  it('only the two human players of a match may touch it; bot vs bot never', () => {
    const t = fixture();
    expect(isMatchParticipant(t, 'SF1', 'p0')).toBe(true);
    expect(isMatchParticipant(t, 'SF1', 'p2')).toBe(false);
    expect(isMatchParticipant(t, 'SF2', 'p2')).toBe(true);
    expect(isMatchParticipant(t, 'BB', 'b1')).toBe(false);
    expect(isMatchParticipant(t, 'BB', 'p0')).toBe(false);
  });

  it('needs both humans to agree; disagreement is a replay', () => {
    const t = fixture();
    const m = t.matches.find((x) => x.id === 'SF1')!;
    const book: MatchReports = { started: [m.a!, m.b!], reports: { [m.a!]: m.a! }, firstReportAt: 0 };
    expect(decideReport(t, 'SF1', book, 1000).kind).toBe('wait');
    expect(decideReport(t, 'SF1', { ...book, reports: { [m.a!]: m.a!, [m.b!]: m.a! } }, 1000)).toEqual({ kind: 'accept', winnerId: m.a });
    expect(decideReport(t, 'SF1', { ...book, reports: { [m.a!]: m.a!, [m.b!]: m.b! } }, 1000).kind).toBe('replay');
  });

  it('a lone report counts after the timeout only if both players started the match', () => {
    const t = fixture();
    const m = t.matches.find((x) => x.id === 'SF1')!;
    const late = REPORT_TIMEOUT_MS + 1;
    expect(decideReport(t, 'SF1', { started: [m.a!, m.b!], reports: { [m.a!]: m.a! }, firstReportAt: 0 }, late)).toEqual({ kind: 'accept', winnerId: m.a });
    expect(decideReport(t, 'SF1', { started: [m.a!], reports: { [m.a!]: m.a! }, firstReportAt: 0 }, late).kind).toBe('replay');
  });

  it("against a bot the human's report is enough", () => {
    const t = fixture();
    expect(decideReport(t, 'SF2', { started: ['p2'], reports: { p2: 'b1' }, firstReportAt: 0 }, 0)).toEqual({ kind: 'accept', winnerId: 'b1' });
    // A bot's "report" (impossible over the network) never counts.
    expect(decideReport(t, 'SF2', { started: [], reports: { b1: 'b1' } }, 0).kind).toBe('wait');
  });

  it('replay puts a playing match back to ready', () => {
    const t = fixture();
    const t2 = replayMatch(markPlaying(t, 'SF1'), 'SF1');
    expect(t2.matches.find((m) => m.id === 'SF1')!.status).toBe('ready');
  });
});
