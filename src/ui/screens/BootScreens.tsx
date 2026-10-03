import { BrandLogo } from '@/ui/components/BrandLogo';
import { useState } from 'react';
import { gameService, useAccount } from '@/state/accountStore';
import { WORLD_LORE } from '@/data/factions';
import { Spinner } from '@/ui/components/common';
import { audio } from '@/audio/audioService';
import { currentLocale, setLanguage, t, type Locale } from '@/i18n';
import { CloudAccountPanel } from '@/ui/components/CloudAccount';

export function BootScreen() {
  return (
    <div className="boot-screen" aria-busy="true">
      <div className="boot-logo">
        <BrandLogo size={140} className="large" />
        <h1>Shardbound</h1>
      </div>
      <Spinner label={t('Loading your Warden')} />
      <p className="muted">{t('Gathering the shards…')}</p>
    </div>
  );
}


export function WelcomeScreen() {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const valid = name.trim().length >= 2;
  const create = async () => {
    if (!valid || busy) return;
    setBusy(true);
    audio.unlock();
    audio.play('levelUp');
    // The portrait follows the Warden of the deck you play, so no avatar choice is needed.
    await gameService.createProfile(name, 'compass');
    // Keep an invite link (#/join/CODE) so a new player lands in the match lobby.
    if (!location.hash.startsWith('#/join/')) location.hash = '#/';
  };
  return (
    <div className="welcome-screen">
      <LanguageToggle />
      <section className="welcome-lore">
        <BrandLogo size={140} className="large" />
        <h1>Shardbound</h1>
        <h3>{WORLD_LORE.title}</h3>
        {WORLD_LORE.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
      <form
        className="welcome-form panel"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <h2>{t('Awaken your Warden')}</h2>
        <label className="field">
          <span>{t('Warden name')}</span>
          <input className="input" autoFocus value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder={t('e.g. Ysolde Ashveil')} />
        </label>
        <p className="muted">{t('You will receive 500 Gold, 2 booster packs, a starter collection of every faction and three ready-to-play decks.')}</p>
        <button className="btn btn-primary btn-lg" type="submit" disabled={!valid || busy}>
          {busy ? t('Binding shards…') : t('Begin')}
        </button>
        <CloudAccountPanel compact />
      </form>
    </div>
  );
}

/** Small EN | CZ switch for the welcome screen (switching reloads the page). */
function LanguageToggle() {
  const active = currentLocale();
  const opts: { code: Locale; label: string; name: string }[] = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'cs', label: 'CZ', name: 'Čeština' },
  ];
  return (
    <div role="group" aria-label={t('Language')} style={{ position: 'fixed', top: 12, right: 12, zIndex: 5, display: 'flex', gap: 4 }}>
      {opts.map((o) => (
        <button key={o.code} type="button" className={`btn btn-sm ${o.code === active ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={o.code === active} title={o.name} onClick={() => setLanguage(o.code)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function CorruptedSaveScreen() {
  const error = useAccount((s) => s.initError);
  const [busy, setBusy] = useState(false);
  return (
    <div className="boot-screen">
      <div className="panel" style={{ maxWidth: 560 }}>
        <h2>{t('Your save could not be loaded')}</h2>
        <p className="muted">{t('The stored data is damaged or unreadable. A backup copy was kept in local storage. You can start a new Warden; the damaged data will be replaced.')}</p>
        <pre className="error-detail">{error}</pre>
        <div className="modal-actions">
          <button className="btn" onClick={() => location.reload()}>
            {t('Retry')}
          </button>
          <button
            className="btn btn-danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await gameService.resetAccount();
            }}
          >
            {t('Start a new Warden')}
          </button>
        </div>
      </div>
    </div>
  );
}
