import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadCloud } from '@/cloud/firebase';
import { useSocial } from '@/state/socialStore';
import { inviteIsLive, INVITE_TTL_MS } from '@/social/friends';
import { audio } from '@/audio/audioService';
import { t } from '@/i18n';
import { Modal } from './common';
import '@/ui/styles/social.css';

/**
 * Runs while the player is signed in: keeps the social store connected (presence heartbeat,
 * friends, requests, invites) and shows incoming match invites.
 */
export default function SocialLayer({ uid, dev }: { uid: string | null; dev: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const invites = useSocial((s) => s.invites);
  const service = useSocial((s) => s.service);
  const [now, setNow] = useState(() => Date.now());
  const inMatch = location.pathname.startsWith('/match');

  useEffect(() => {
    let cancelled = false;
    if (import.meta.env.DEV && dev) {
      void import('@/social/devPreview').then(({ createDevSocial }) => {
        if (cancelled) return;
        const d = createDevSocial();
        useSocial.getState().start(d.uid, d.backend, 'mock');
        Object.assign(window as unknown as Record<string, unknown>, { __social: { backend: d.backend, uid: d.uid } });
      });
    } else if (uid) {
      void loadCloud()
        .then((s) => !cancelled && useSocial.getState().start(uid, s.social, 'real'))
        .catch((e) => console.warn('[social] could not start', e));
    }
    return () => {
      cancelled = true;
      useSocial.getState().stop();
    };
  }, [uid, dev]);

  useEffect(() => useSocial.getState().setInMatch(inMatch), [inMatch]);

  // Invites lapse after two minutes: re-check once in a while.
  const pending = invites.filter((i) => i.status === 'pending');
  useEffect(() => {
    if (!pending.length) return;
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, [pending.length]);

  // Expired invites left behind (the host closed the app) are cleaned up by the invitee.
  useEffect(() => {
    if (!service) return;
    for (const i of invites) if (i.status === 'pending' && now - i.createdAt > INVITE_TTL_MS * 2) void service.declineInvite(i.id).catch(() => undefined);
  }, [invites, now, service]);

  const live = pending.filter((i) => inviteIsLive(i, now));
  const invite = !inMatch ? live[0] : undefined;
  useEffect(() => {
    if (invite) audio.play('turn');
  }, [invite?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!invite || !service) return null;
  const accept = async () => {
    try {
      await service.acceptInvite(invite.id);
    } catch {
      /* the host may have cancelled; joining shows the real state */
    }
    navigate(`/join/${invite.code}`);
  };
  const decline = () => void service.declineInvite(invite.id).catch(() => undefined);
  return (
    <Modal open onClose={decline} title={t('Match invite')} className="invite-modal">
      <p>{t('{name} invites you to a match.', { name: invite.fromName })}</p>
      <p className="faint">{t('Pick your deck on the next screen and join.')}</p>
      <div className="btn-row">
        <button className="btn" onClick={decline}>
          {t('Decline')}
        </button>
        <button className="btn btn-primary" onClick={() => void accept()}>
          {t('Accept')}
        </button>
      </div>
    </Modal>
  );
}
