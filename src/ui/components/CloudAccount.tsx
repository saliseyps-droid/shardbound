import { useEffect, useState, type FormEvent } from 'react';
import { useCloud } from '@/state/cloudStore';
import { t, tn } from '@/i18n';
import { Modal } from './common';
import type { SaveSummary } from '@/cloud/sync';
import '@/ui/styles/cloud.css';

const STATUS_LABEL: Record<string, string> = {
  checking: 'Checking your cloud save…',
  synced: 'Progress saved to your account.',
  syncing: 'Saving to your account…',
  error: 'Could not save to your account. It will be retried on the next change.',
  paused: 'This account is open on another device. Progress here is not saved to the cloud.',
  conflict: 'Choose which progress to keep.',
  'signed-out': '',
};

/** Sign-in form and status. `compact` is the welcome-screen variant (restore a save from another device). */
export function CloudAccountPanel({ compact = false }: { compact?: boolean }) {
  const c = useCloud();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  if (!c.configured) return null;

  if (c.user) {
    return (
      <div className="cloud-account">
        <p>{t('Signed in as {name}.', { name: c.user.email ?? c.user.name ?? '?' })}</p>
        {STATUS_LABEL[c.status] && <p className={`cloud-status status-${c.status}`}>{t(STATUS_LABEL[c.status])}</p>}
        {c.error && <p className="online-error">{t(c.error)}</p>}
        <div className="btn-row">
          <button type="button" className="btn" disabled={c.busy} onClick={() => void c.signOut()}>
            {t('Sign out')}
          </button>
        </div>
      </div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (email.trim() && password) void c.signInWithEmail(email.trim(), password, mode === 'create');
  };
  return (
    <div className="cloud-account">
      <p className="muted">
        {compact ? t('Already playing on another device? Sign in to continue with your progress.') : t('Sign in to save your progress to an account and continue on any device.')}
      </p>
      <button type="button" className="btn btn-primary" disabled={c.busy || !c.ready} onClick={() => void c.signInWithGoogle()}>
        {t('Sign in with Google')}
      </button>
      <div className="cloud-email" role="form" aria-label={t('Sign in with e-mail')}>
        <input className="input" type="email" autoComplete="email" placeholder={t('E-mail')} aria-label={t('E-mail')} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="input"
          type="password"
          autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
          placeholder={t('Password')}
          aria-label={t('Password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(e)}
        />
        <button type="button" className="btn" disabled={c.busy || !c.ready || !email.trim() || !password} onClick={submit}>
          {mode === 'create' ? t('Create account') : t('Sign in with e-mail')}
        </button>
      </div>
      <div className="cloud-links">
        <button type="button" className="link-btn" onClick={() => setMode(mode === 'create' ? 'signin' : 'create')}>
          {mode === 'create' ? t('I already have an account') : t('Create an account with e-mail')}
        </button>
        {mode === 'signin' && (
          <button type="button" className="link-btn" disabled={!email.trim() || c.busy} onClick={() => void c.resetPassword(email.trim())}>
            {t('Forgot password?')}
          </button>
        )}
      </div>
      {c.error && <p className="online-error">{t(c.error)}</p>}
    </div>
  );
}

function SummaryCard({ title, s }: { title: string; s: SaveSummary }) {
  return (
    <div className="cloud-choice-card panel-tight">
      <strong>{title}</strong>
      <span>{s.username}</span>
      <span className="faint">
        {t('Level {n}', { n: s.level })} · {tn(s.cards, '{n} card', '{n} cards')} · {t('{n} Gold', { n: s.gold })}
      </span>
      {s.updatedAt && <span className="faint">{t('Last played {date}', { date: new Date(s.updatedAt).toLocaleString() })}</span>}
    </div>
  );
}

/** Global: the "which save to keep" choice and the "open on another device" banner. */
export function CloudDialogs() {
  const c = useCloud();
  const init = useCloud((s) => s.init);
  useEffect(() => init(), [init]);
  if (!c.configured) return null;
  return (
    <>
      {c.conflict && (
        <Modal open title={t('Which progress do you want to keep?')}>
          <p className="muted">{t('This device and your account have different progress. The one you do not choose is replaced.')}</p>
          <div className="cloud-choice">
            <SummaryCard title={t('On this device')} s={c.conflict.local} />
            <SummaryCard title={t('In your account')} s={c.conflict.cloud} />
          </div>
          <div className="btn-row">
            <button className="btn" disabled={c.busy} onClick={() => void c.resolveConflict('local')}>
              {t('Keep this device')}
            </button>
            <button className="btn btn-primary" disabled={c.busy} onClick={() => void c.resolveConflict('cloud')}>
              {t('Load from account')}
            </button>
          </div>
        </Modal>
      )}
      {c.status === 'paused' && (
        <div className="cloud-banner" role="alert">
          <span>{t('This account is open on another device. Progress here is not saved to the cloud.')}</span>
          <button className="btn btn-sm btn-primary" disabled={c.busy} onClick={() => void c.takeOver()}>
            {t('Continue here')}
          </button>
        </div>
      )}
    </>
  );
}
