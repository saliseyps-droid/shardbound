import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { useCloud } from '@/state/cloudStore';
import { useSocial, type FriendView } from '@/state/socialStore';
import { launchMatch } from '@/state/matchLaunch';
import { spectate } from '@/state/spectateLaunch';
import { toast } from '@/state/uiStore';
import { netSession } from '@/net/session';
import { onlineOpponent, validateRemoteSide } from '@/net/lobby';
import { factionOfList } from '@/domain/decks';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { formatFriendCode, INVITE_TTL_MS, presenceStatus } from '@/social/friends';
import type { Unsubscribe } from '@/social/backend';
import { confirmDialog, Modal, ScreenHeader, Spinner } from '@/ui/components/common';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { FriendInfo, sortFriends } from '@/ui/components/FriendInfo';
import { CloudAccountPanel } from '@/ui/components/CloudAccount';
import { deckIssues, decksForPicking, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { audio } from '@/audio/audioService';
import { t } from '@/i18n';
import '@/ui/styles/meta.css';
import '@/ui/styles/online.css';
import '@/ui/styles/social.css';

const asFaction = (v: string): PlayableFaction | null => ((PLAYABLE_FACTIONS as readonly string[]).includes(v) ? (v as PlayableFaction) : null);

type InviteState = { friend: FriendView; phase: 'opening' | 'waiting' | 'accepted' | 'declined' | 'expired' | 'error'; error?: string };

/** Friends: your code, requests, the list with online status, and one-click match invites. */
export default function FriendsScreen() {
  const save = useAccount((s) => s.save);
  const cloud = useCloud();
  const social = useSocial();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [invite, setInvite] = useState<InviteState | null>(null);
  const inviteRef = useRef<{ to: string; id: string | null; unwatch: Unsubscribe | null; timer: ReturnType<typeof setTimeout> | null } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  // The friend joined the hosted room: start the match as host (same as the room-code lobby).
  const [netStatus, setNetStatus] = useState(netSession.status);
  useEffect(() => netSession.onStatus(() => setNetStatus(netSession.status)), []);
  // Fresh level / title / cards whenever the list is opened.
  useEffect(() => useSocial.getState().refreshFriendProfiles(), [social.friends.length]);
  useEffect(() => {
    if (!invite || netStatus !== 'connected' || netSession.role !== 'host' || !netSession.remoteSide) return;
    audio.play('turn');
    cleanupInvite(false);
    const faction = factionOfList(netSession.remoteSide.deck);
    launchMatch({ mode: 'ONLINE', online: 'host', deckId, opponent: onlineOpponent(netSession.remoteName, netSession.remoteAvatar, faction) }, navigate);
  }, [netStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Leaving the screen while waiting closes the room and withdraws the invite.
  useEffect(() => () => cleanupInvite(true), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!save) return null;
  const signedIn = !!social.uid;
  const service = social.service;

  function cleanupInvite(closeRoom: boolean) {
    const cur = inviteRef.current;
    inviteRef.current = null;
    if (!cur) return;
    cur.unwatch?.();
    if (cur.timer) clearTimeout(cur.timer);
    if (cur.id) void useSocial.getState().service?.backend.deleteInvite(cur.to, cur.id).catch(() => undefined);
    if (closeRoom && netSession.role === 'host' && netSession.status === 'waiting') netSession.close();
  }

  const sendInvite = async (friend: FriendView) => {
    if (!service || invite) return;
    const deck = firstValidDeck(save, deckId);
    if (!deck) {
      toast('Choose a valid 30-card deck first.', 'error');
      return;
    }
    setDeckId(deck);
    setInvite({ friend, phase: 'opening' });
    inviteRef.current = { to: friend.uid, id: null, unwatch: null, timer: null };
    try {
      const room = await netSession.host(save.profile.username, save.profile.avatar, (hello) => validateRemoteSide(hello.side));
      const id = await service.invite(friend.uid, save.profile.username, room);
      const ref = inviteRef.current;
      if (!ref) {
        void service.backend.deleteInvite(friend.uid, id).catch(() => undefined);
        return;
      }
      ref.id = id;
      setInvite({ friend, phase: 'waiting' });
      ref.unwatch = service.backend.watchInvite(friend.uid, id, (inv) => {
        if (inviteRef.current?.id !== id) return;
        if (!inv) {
          // Gone while we still wait: the friend declined.
          inviteRef.current.id = null;
          cleanupInvite(true);
          setInvite({ friend, phase: 'declined' });
        } else if (inv.status === 'accepted') setInvite((s) => (s && s.phase === 'waiting' ? { ...s, phase: 'accepted' } : s));
      });
      ref.timer = setTimeout(() => {
        if (inviteRef.current?.id !== id || netSession.status === 'connected') return;
        cleanupInvite(true);
        setInvite({ friend, phase: 'expired' });
      }, INVITE_TTL_MS);
    } catch (e) {
      cleanupInvite(true);
      setInvite({ friend, phase: 'error', error: (e as Error).message || 'Could not send the invite.' });
    }
  };

  const closeInvite = () => {
    cleanupInvite(true);
    setInvite(null);
  };

  const add = async () => {
    if (!service || busy) return;
    setBusy(true);
    try {
      const res = await service.addFriendByCode(code);
      if (!res.ok) toast(res.error, 'error');
      else {
        toast(res.value === 'accepted' ? 'You are now friends.' : 'Friend request sent.', 'success');
        setCode('');
      }
    } catch (e) {
      console.warn('[friends] add failed', e);
      toast('Could not send the request. Try again later.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const act = (fn: () => Promise<unknown>, failure: string) => void fn().catch(() => toast(failure, 'error'));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(social.me?.friendCode ?? '');
      toast('Code copied', 'success');
    } catch {
      toast('Copy failed — write the code down instead.', 'error');
    }
  };

  const remove = async (f: FriendView) => {
    const yes = await confirmDialog({ title: t('Remove friend'), message: t('Remove {name} from your friends?', { name: f.name }), confirmLabel: t('Remove'), danger: true });
    if (yes && service) act(() => service.removeFriend(f.uid), 'Could not remove the friend. Try again later.');
  };

  if (!signedIn) {
    return (
      <div className="screen friends-screen">
        <ScreenHeader title={t('Friends')} subtitle={t('Add friends, see who is online and invite them to a match with one click.')} />
        <section className="panel friends-signin">
          <div className="panel-title">{t('Friends need a cloud account')}</div>
          <p className="muted">{t('Your friend code and friends list are kept in your account, so you need to sign in first. Your progress also gets saved to the account.')}</p>
          {cloud.configured ? <CloudAccountPanel /> : <p className="faint">{t('Accounts are not available in this version.')}</p>}
          <p className="faint">
            {t('You can still play a friend without an account:')}{' '}
            <Link to="/online" className="small-link">
              {t('use a room code')}
            </Link>
          </p>
        </section>
      </div>
    );
  }

  const validDecks = decksForPicking(save.decks).filter((d) => deckIssues(save, d).length === 0);
  const sorted = sortFriends(social.friends, now);

  return (
    <div className="screen friends-screen">
      <ScreenHeader
        title={t('Friends')}
        subtitle={t('Add friends, see who is online and invite them to a match with one click.')}
        actions={
          <Link to="/online" className="btn btn-sm btn-ghost">
            {t('Play with a room code')}
          </Link>
        }
      />
      {social.error && <p className="online-error">{t(social.error)}</p>}
      <div className="friends-layout">
        <div className="friends-side">
          <section className="panel friends-code" aria-labelledby="fr-code">
            <div className="panel-title" id="fr-code">
              {t('Your friend code')}
            </div>
            {social.me ? (
              <div className="invite-row">
                <strong className="room-code friend-code num">{formatFriendCode(social.me.friendCode)}</strong>
                <button className="btn btn-cyan" onClick={() => void copy()}>
                  {t('Copy code')}
                </button>
              </div>
            ) : (
              <Spinner />
            )}
            <p className="faint">{t('Give this code to a friend so they can add you.')}</p>
          </section>

          <section className="panel" aria-labelledby="fr-add">
            <div className="panel-title" id="fr-add">
              {t('Add a friend')}
            </div>
            <form
              className="invite-row"
              onSubmit={(e) => {
                e.preventDefault();
                void add();
              }}
            >
              <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('Friend code')} aria-label={t('Friend code')} maxLength={12} autoComplete="off" />
              <button className="btn btn-primary" type="submit" disabled={busy || code.trim().length < 8}>
                {t('Add')}
              </button>
            </form>
          </section>

          {(social.incoming.length > 0 || social.outgoing.length > 0) && (
            <section className="panel" aria-labelledby="fr-req">
              <div className="panel-title" id="fr-req">
                {t('Friend requests')}
              </div>
              <ul className="friends-list">
                {social.incoming.map((r) => (
                  <li key={`in-${r.from}`} className="friend-row">
                    <WardenPortrait faction={asFaction(r.fromAvatar)} size={36} fallbackGlyph="person" />
                    <span className="friend-name">
                      <strong>{r.fromName}</strong>
                      <span className="faint">{t('wants to be your friend')}</span>
                    </span>
                    <span className="friend-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => service && act(() => service.acceptRequest(r.from), 'Could not accept the request. Try again later.')}>
                        {t('Accept')}
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => service && act(() => service.declineRequest(r.from), 'Could not decline the request. Try again later.')}>
                        {t('Decline')}
                      </button>
                    </span>
                  </li>
                ))}
                {social.outgoing.map((r) => (
                  <li key={`out-${r.to}`} className="friend-row">
                    <WardenPortrait faction={null} size={36} fallbackGlyph="person" />
                    <span className="friend-name">
                      <strong>{social.names[r.to] ?? '…'}</strong>
                      <span className="faint">{t('Request sent')}</span>
                    </span>
                    <span className="friend-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => service && act(() => service.cancelRequest(r.to), 'Could not cancel the request. Try again later.')}>
                        {t('Cancel')}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section className="panel friends-main" aria-labelledby="fr-list">
          <div className="panel-title">
            <span id="fr-list">{t('Your friends')}</span>
            {validDecks.length > 0 && (
              <label className="friends-deck">
                <span className="faint">{t('Deck for invites')}</span>
                <select className="input" value={deckId ?? ''} onChange={(e) => setDeckId(e.target.value)}>
                  {validDecks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {sorted.length === 0 ? (
            <p className="muted">{t('No friends yet. Share your friend code or add a friend by theirs.')}</p>
          ) : (
            <ul className="friends-list">
              {sorted.map((f) => {
                const st = presenceStatus(f.presence, now);
                return (
                  <li key={f.uid} className={`friend-row status-${st}`}>
                    <WardenPortrait faction={asFaction(f.avatar)} portrait={f.portrait || null} size={40} fallbackGlyph="person" />
                    <FriendInfo friend={f} now={now} />
                    <span className="friend-actions">
                      {st === 'inMatch' && f.presence?.watch && (
                        <button className="btn btn-sm btn-cyan" onClick={() => spectate(f.presence!.watch!, navigate)} title={t('Watch {name}’s match', { name: f.name })}>
                          {t('Watch')}
                        </button>
                      )}
                      <button className="btn btn-sm btn-primary" disabled={st !== 'online' || !!invite || validDecks.length === 0} onClick={() => void sendInvite(f)} title={st === 'online' ? undefined : t('You can invite friends who are online and not in a match.')}>
                        {t('Invite')}
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => void remove(f)} aria-label={t('Remove {name} from your friends?', { name: f.name })}>
                        ✕
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {validDecks.length === 0 && <p className="deckbox-issue">{t('Choose a valid 30-card deck first.')}</p>}
        </section>
      </div>

      {invite && (
        <Modal open onClose={closeInvite} title={t('Invite {name}', { name: invite.friend.name })}>
          {(invite.phase === 'opening' || invite.phase === 'waiting' || invite.phase === 'accepted') && (
            <>
              <p className="muted">
                {invite.phase === 'opening' ? t('Creating…') : invite.phase === 'accepted' ? t('{name} accepted and is joining…', { name: invite.friend.name }) : t('Waiting for {name} to answer…', { name: invite.friend.name })}
              </p>
              <Spinner />
              <p className="faint">{t('Keep this screen open until they join.')}</p>
            </>
          )}
          {invite.phase === 'declined' && <p>{t('{name} declined your invite.', { name: invite.friend.name })}</p>}
          {invite.phase === 'expired' && <p>{t('{name} did not answer in time.', { name: invite.friend.name })}</p>}
          {invite.phase === 'error' && <p className="online-error">{t(invite.error ?? 'Could not send the invite.')}</p>}
          <div className="btn-row">
            <button className="btn" onClick={closeInvite}>
              {invite.phase === 'opening' || invite.phase === 'waiting' || invite.phase === 'accepted' ? t('Cancel') : t('Close')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
