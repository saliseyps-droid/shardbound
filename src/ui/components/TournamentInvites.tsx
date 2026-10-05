import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { useCloud } from '@/state/cloudStore';
import { useSocial, type FriendView } from '@/state/socialStore';
import { sizeOf, type Tournament } from '@/domain/tournament';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { presenceStatus, TOURNAMENT_INVITE_TTL_MS } from '@/social/friends';
import type { Unsubscribe } from '@/social/backend';
import { FriendInfo, sortFriends } from './FriendInfo';
import { WardenPortrait } from './WardenPortrait';
import { t } from '@/i18n';
import '@/ui/styles/social.css';

const asFaction = (v: string): PlayableFaction | null => ((PLAYABLE_FACTIONS as readonly string[]).includes(v) ? (v as PlayableFaction) : null);

export type TournamentInvitePhase = 'sending' | 'sent' | 'accepted' | 'declined' | 'expired' | 'error';
type Live = { id: string | null; phase: TournamentInvitePhase; unwatch: Unsubscribe | null; timer: ReturnType<typeof setTimeout> | null };

const PHASE_LABEL: Record<TournamentInvitePhase | 'joined', string> = {
  sending: 'Sending…',
  sent: 'Invite sent',
  accepted: 'Accepted, joining…',
  declined: 'Declined',
  expired: 'No answer',
  error: 'Could not send the invite.',
  joined: 'Joined',
};

/** A friend counts as joined once a player with their name sits in the lobby (the organizer is p0). */
export function friendJoined(tour: Tournament, friend: Pick<FriendView, 'name'>): boolean {
  const name = friend.name.trim().toLowerCase();
  return tour.players.some((p) => !p.bot && p.id !== 'p0' && p.name.trim().toLowerCase() === name);
}

/**
 * Organizer lobby: the organizer's friends with their status and an Invite button for those
 * online. Each invite is watched, so the organizer sees it sent / declined / joined; leaving
 * the lobby (or starting) withdraws the invites still out.
 */
export function TournamentInvites({ tour }: { tour: Tournament }) {
  const save = useAccount((s) => s.save);
  const configured = useCloud((s) => s.configured);
  const social = useSocial();
  const [now, setNow] = useState(() => Date.now());
  const [phases, setPhases] = useState<Record<string, TournamentInvitePhase>>({});
  const live = useRef(new Map<string, Live>());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => useSocial.getState().refreshFriendProfiles(), []);
  useEffect(
    () => () => {
      for (const [to, l] of live.current) withdraw(to, l);
      live.current.clear();
    },
    [],
  );

  const signedIn = !!social.uid && !!social.service;
  if (!signedIn) {
    if (!configured && social.mode === 'off') return null;
    return (
      <section className="panel t-invites" aria-labelledby="t-inv">
        <div className="panel-title" id="t-inv">
          {t('Invite friends')}
        </div>
        <p className="faint">
          {t('Sign in to invite your friends directly.')}{' '}
          <Link to="/friends" className="small-link">
            {t('Friends')}
          </Link>
        </p>
      </section>
    );
  }

  const setPhase = (uid: string, phase: TournamentInvitePhase) => setPhases((p) => ({ ...p, [uid]: phase }));

  function withdraw(to: string, l: Live) {
    l.unwatch?.();
    if (l.timer) clearTimeout(l.timer);
    if (l.id) void useSocial.getState().service?.backend.deleteInvite(to, l.id).catch(() => undefined);
    l.id = null;
  }

  const send = async (f: FriendView) => {
    const service = social.service;
    if (!service || !save) return;
    const prev = live.current.get(f.uid);
    if (prev) withdraw(f.uid, prev);
    const entry: Live = { id: null, phase: 'sending', unwatch: null, timer: null };
    live.current.set(f.uid, entry);
    setPhase(f.uid, 'sending');
    try {
      const id = await service.sendInvite(f.uid, save.profile.username, tour.code, 'tournament', sizeOf(tour));
      if (live.current.get(f.uid) !== entry) {
        void service.backend.deleteInvite(f.uid, id).catch(() => undefined);
        return;
      }
      entry.id = id;
      entry.phase = 'sent';
      setPhase(f.uid, 'sent');
      entry.unwatch = service.backend.watchInvite(f.uid, id, (inv) => {
        if (live.current.get(f.uid) !== entry || entry.id !== id) return;
        if (!inv) {
          // Gone while still out: the friend declined.
          entry.id = null;
          withdraw(f.uid, entry);
          entry.phase = 'declined';
          setPhase(f.uid, 'declined');
        } else if (inv.status === 'accepted' && entry.phase === 'sent') {
          entry.phase = 'accepted';
          setPhase(f.uid, 'accepted');
        }
      });
      entry.timer = setTimeout(() => {
        if (live.current.get(f.uid) !== entry || entry.phase !== 'sent') return;
        withdraw(f.uid, entry);
        entry.phase = 'expired';
        setPhase(f.uid, 'expired');
      }, TOURNAMENT_INVITE_TTL_MS);
    } catch (e) {
      console.warn('[tournament] invite failed', e);
      if (live.current.get(f.uid) === entry) {
        entry.phase = 'error';
        setPhase(f.uid, 'error');
      }
    }
  };

  const full = tour.players.filter((p) => !p.bot).length >= sizeOf(tour);
  const friends = sortFriends(social.friends, now);
  return (
    <section className="panel t-invites" aria-labelledby="t-inv">
      <div className="panel-title" id="t-inv">
        {t('Invite friends')}
      </div>
      {friends.length === 0 ? (
        <p className="muted">{t('No friends yet. Share your friend code or add a friend by theirs.')}</p>
      ) : (
        <ul className="friends-list t-invite-list">
          {friends.map((f) => {
            const st = presenceStatus(f.presence, now);
            const joined = friendJoined(tour, f);
            const phase = joined ? 'joined' : phases[f.uid];
            const out = phase === 'sending' || phase === 'sent' || phase === 'accepted';
            const reason = joined ? undefined : full ? t('Every seat is taken.') : st !== 'online' ? t('You can invite friends who are online and not in a match.') : undefined;
            return (
              <li key={f.uid} className={`friend-row status-${st}`}>
                <WardenPortrait faction={asFaction(f.avatar)} portrait={f.portrait || null} size={36} fallbackGlyph="person" />
                <FriendInfo friend={f} now={now} />
                <span className="friend-actions">
                  {phase && <span className={`t-invite-state ${phase}`}>{t(PHASE_LABEL[phase])}</span>}
                  {!joined && !out && (
                    <span title={reason}>
                      <button className="btn btn-sm btn-primary" disabled={!!reason} onClick={() => void send(f)}>
                        {t('Invite')}
                      </button>
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
