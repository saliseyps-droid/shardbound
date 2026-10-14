import type { FriendView } from '@/state/socialStore';
import { ACTIVITIES, isActivity, presenceStatus, type PresenceStatus } from '@/social/friends';
import { FACTIONS } from '@/data/factions';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { Glyph } from '@/ui/components/Icons';
import { aiRankLabel } from '@/ui/components/meta/aiRankedUi';
import { formatLastOnline } from '@/social/profile';
import { t, tn } from '@/i18n';

const STATUS_LABEL: Record<PresenceStatus, string> = { online: 'Online', inMatch: 'In a match', offline: 'Offline' };

/** Online / In a match / "Last online 3 h ago" (plain "Offline" when the friend was never seen). */
export function friendStatusText(f: Pick<FriendView, 'presence'>, now: number): string {
  const st = presenceStatus(f.presence, now);
  if (st === 'offline' && f.presence && Number.isFinite(f.presence.lastSeen)) return formatLastOnline(f.presence.lastSeen, now);
  // In a match: which kind, when the friend's game version tells us.
  if (st === 'inMatch' && isActivity(f.presence?.activity)) return t('In a match: {mode}', { mode: t(ACTIVITIES[f.presence!.activity!]) });
  return t(STATUS_LABEL[st]);
}

function rankStatus(s: PresenceStatus): number {
  return s === 'online' ? 0 : s === 'inMatch' ? 1 : 2;
}

/** Online first, then in a match, then offline (most recently seen first), then by name. */
export function sortFriends<F extends Pick<FriendView, 'presence' | 'name'>>(friends: readonly F[], now: number): F[] {
  const lastSeen = (f: F) => (presenceStatus(f.presence, now) === 'offline' ? (f.presence?.lastSeen ?? 0) : 0);
  return [...friends].sort((a, b) => rankStatus(presenceStatus(a.presence, now)) - rankStatus(presenceStatus(b.presence, now)) || lastSeen(b) - lastSeen(a) || a.name.localeCompare(b.name));
}

/** Name with the equipped title, presence, then level and collection. Older profiles without stats show just name and presence. */
export function FriendInfo({ friend: f, now }: { friend: FriendView; now: number }) {
  const st = presenceStatus(f.presence, now);
  const stats: string[] = [];
  if (typeof f.level === 'number') stats.push(t('Level {n}', { n: f.level }));
  if (typeof f.cardsOwned === 'number' && typeof f.cardsTotal === 'number') stats.push(tn(f.cardsTotal, '{owned} / {n} card', '{owned} / {n} cards', { owned: f.cardsOwned }));
  // Second line: Ranked vs AI rank, achievements, campaign fights won, favourite faction.
  const more: string[] = [];
  if (typeof f.aiRank === 'number') more.push(t('Ranked vs AI: {rank}', { rank: aiRankLabel(f.aiRank) }));
  if (typeof f.achievementsDone === 'number' && typeof f.achievementsTotal === 'number') more.push(t('Achievements {done} / {total}', { done: f.achievementsDone, total: f.achievementsTotal }));
  if (typeof f.campaignWon === 'number' && typeof f.campaignTotal === 'number') more.push(t('Campaign {won} / {total}', { won: f.campaignWon, total: f.campaignTotal }));
  const fav = (PLAYABLE_FACTIONS as readonly string[]).includes(f.favFaction ?? '') ? FACTIONS[f.favFaction as PlayableFaction] : null;
  return (
    <span className="friend-name">
      <span className="friend-headline">
        <strong>{f.name}</strong>
        {f.title ? <span className="friend-title">{t(f.title)}</span> : null}
      </span>
      <span className={`friend-status status-${st}`}>
        <span className="status-dot" aria-hidden />
        {friendStatusText(f, now)}
      </span>
      {stats.length > 0 && <span className="friend-stats faint">{stats.join(' · ')}</span>}
      {(more.length > 0 || fav) && (
        <span className="friend-stats friend-more faint">
          {more.join(' · ')}
          {fav && (
            <span className="friend-fav" title={t('Favourite faction (most wins)')}>
              {more.length > 0 && ' · '}
              <Glyph name={fav.sigil} size={12} /> {fav.name}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
