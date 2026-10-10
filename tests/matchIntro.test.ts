import { describe, expect, it } from 'vitest';
import { introSubtitle, modeLabel } from '@/ui/match/matchLabels';
import { PRACTICE_OPPONENTS } from '@/data/opponents';
import type { MatchConfig } from '@/state/matchLaunch';
import { setLocaleForTests } from '@/i18n';
import { afterEach } from 'vitest';

const opponent = { ...PRACTICE_OPPONENTS.TIDE, difficulty: 'HARD' as const, rarities: [] };
const cfg = (c: Partial<MatchConfig>): MatchConfig => ({ mode: 'PRACTICE', deckId: 'd', opponent, ...c }) as MatchConfig;

describe('match intro labels', () => {
  it('names the kind of match', () => {
    expect(modeLabel(cfg({ mode: 'RANKED' }))).toBe('Ranked');
    expect(modeLabel(cfg({ mode: 'TOURNAMENT' }))).toBe('Tournament');
    expect(modeLabel(cfg({ mode: 'PRACTICE' }))).toBe('Practice');
    expect(modeLabel(cfg({ mode: 'SPECTATE', online: 'spectator' }))).toBe('Spectating');
  });

  it('adds the round of a tournament match, or the AI difficulty', () => {
    expect(introSubtitle(cfg({ mode: 'TOURNAMENT', tournamentMatchId: 'F' }))).toBe('Final');
    expect(introSubtitle(cfg({ mode: 'PRACTICE' }))).toBe('Hard AI');
    expect(introSubtitle(cfg({ mode: 'ONLINE', online: 'host' }))).toBe('');
    expect(introSubtitle(cfg({ mode: 'RANKED', online: 'host' }))).toBe('');
  });

  it('has Czech titles for every kind of match', () => {
    setLocaleForTests('cs');
    const modes: MatchConfig['mode'][] = ['PRACTICE', 'PVE', 'ONLINE', 'RANKED', 'TOURNAMENT', 'ARENA', 'AI_RANKED', 'BRAWL', 'DUNGEON', 'SPECTATE'];
    const english = ['Practice', 'Campaign', 'Online match', 'Ranked', 'Tournament', 'Arena', 'AI Ranked', 'Brawl', 'Dungeon', 'Spectating'];
    modes.forEach((mode, i) => {
      const label = modeLabel(cfg({ mode }));
      if (mode !== 'BRAWL' && mode !== 'DUNGEON') expect(label, mode).not.toBe(english[i]);
    });
    expect(introSubtitle(cfg({ mode: 'TOURNAMENT', tournamentMatchId: 'QF2' }))).toBe('Čtvrtfinále 2');
    expect(introSubtitle(cfg({ mode: 'TOURNAMENT', tournamentMatchId: 'R16-3' }))).toBe('Osmifinále, zápas 3');
    expect(introSubtitle(cfg({ mode: 'ARENA' }))).toBe('Těžká AI');
  });
});

afterEach(() => setLocaleForTests('en'));
