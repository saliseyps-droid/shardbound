import type { MatchConfig } from '@/state/matchLaunch';
import { findBrawlFight } from '@/domain/brawl';
import { matchLabel, type TournamentMatchId } from '@/domain/tournament';
import { t } from '@/i18n';

/** The kind of match, as shown in the sidebar and the match intro. */
export function modeLabel(config: MatchConfig | null | undefined): string {
  switch (config?.mode) {
    case 'ARENA':
      return t('Arena');
    case 'PVE':
      return t('Campaign');
    case 'TUTORIAL':
      return t('Tutorial');
    case 'AI_RANKED':
      return t('AI Ranked');
    case 'BRAWL':
      return t('Brawl');
    case 'DUNGEON':
      return t('Dungeon');
    case 'PUZZLE':
      return t('Daily puzzle');
    case 'RANKED':
      return t('Ranked');
    case 'TOURNAMENT':
      return t('Tournament');
    case 'ONLINE':
      return t('Online match');
    case 'SPECTATE':
      return t('Spectating');
    default:
      return config?.online ? t('Online match') : t('Practice');
  }
}

const DIFFICULTY_LABEL = { EASY: 'Easy AI', NORMAL: 'Normal AI', HARD: 'Hard AI', EXPERT: 'Expert AI' } as const;

/** A second line for the match intro: the tournament round, the Brawl rules or the AI's difficulty. */
export function introSubtitle(config: MatchConfig | null | undefined): string {
  if (!config) return '';
  if (config.mode === 'TOURNAMENT' && config.tournamentMatchId) return t(matchLabel(config.tournamentMatchId as TournamentMatchId));
  if (config.mode === 'BRAWL' && config.brawlFightId) {
    const fight = findBrawlFight(config.brawlFightId);
    return fight ? fight.modifiers.map((m) => t(m.name)).join(' · ') : '';
  }
  // Online and spectated matches are between players; everything else is against the AI.
  if (config.online || config.mode === 'ONLINE' || config.mode === 'RANKED') return '';
  return t(DIFFICULTY_LABEL[config.opponent.difficulty] ?? 'Normal AI');
}
