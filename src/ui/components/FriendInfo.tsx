import type { FriendView } from '@/state/socialStore';
import { presenceStatus, type PresenceStatus } from '@/social/friends';
import { formatLastOnline } from '@/social/profile';
import { t, tn } from '@/i18n';

const STATUS_LABEL: Record<PresenceStatus, string> = { online: 'Online', inMatch: 'In a match', offline: 'Offline' };

/** Online / In a match / "Last online 3 h ago" (plain "Offline" when the friend was never seen). */
export function friendStatusText(f: Pick<FriendView, 'presence'>, now: number): string {
  const st = presenceStatus(f.presence, now);
  if (st === 'offline' && f.presence && Number.isFinite(f.presence.lastSeen)) return formatLastOnline(f.presence.lastSeen, now);
  return t(STATUS_LABEL[st]);
}

/** Name with the equipped title, presence, then level and collection. Older profiles without stats show just name and presence. */
export function FriendInfo({ friend: f, now }: { friend: FriendView; now: number }) {
  const st = presenceStatus(f.presence, now);
  const stats: string[] = [];
  if (typeof f.level === 'number') stats.push(t('Level {n}', { n: f.level }));
  if (typeof f.cardsOwned === 'number' && typeof f.cardsTotal === 'number') stats.push(tn(f.cardsTotal, '{owned} / {n} card', '{owned} / {n} cards', { owned: f.cardsOwned }));
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
    </span>
  );
}
