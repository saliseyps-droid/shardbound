import { useState } from 'react';
import { gameService, useAccount } from '@/state/accountStore';
import { WORLD_LORE, FACTIONS } from '@/data/factions';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { Glyph } from '@/ui/components/Icons';
import { Spinner } from '@/ui/components/common';
import { audio } from '@/audio/audioService';

export function BootScreen() {
  return (
    <div className="boot-screen" aria-busy="true">
      <div className="boot-logo">
        <span className="brand-shard large" aria-hidden />
        <h1>Shardbound</h1>
      </div>
      <Spinner label="Loading your Warden" />
      <p className="muted">Gathering the shards…</p>
    </div>
  );
}

const AVATARS = PLAYABLE_FACTIONS.map((f) => FACTIONS[f].sigil);

export function WelcomeScreen() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [busy, setBusy] = useState(false);
  const valid = name.trim().length >= 2;
  const create = async () => {
    if (!valid || busy) return;
    setBusy(true);
    audio.unlock();
    audio.play('levelUp');
    await gameService.createProfile(name, avatar);
    // Keep an invite link (#/join/CODE) so a new player lands in the match lobby.
    if (!location.hash.startsWith('#/join/')) location.hash = '#/';
  };
  return (
    <div className="welcome-screen">
      <section className="welcome-lore">
        <span className="brand-shard large" aria-hidden />
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
        <h2>Awaken your Warden</h2>
        <label className="field">
          <span>Warden name</span>
          <input className="input" autoFocus value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ysolde Ashveil" />
        </label>
        <fieldset className="field">
          <legend>Sigil</legend>
          <div className="avatar-picker">
            {AVATARS.map((a) => (
              <button type="button" key={a} className={`avatar-option ${a === avatar ? 'selected' : ''}`} aria-pressed={a === avatar} onClick={() => setAvatar(a)} aria-label={`Sigil ${a}`}>
                <Glyph name={a} size={28} />
              </button>
            ))}
          </div>
        </fieldset>
        <p className="muted">You will receive 500 Gold, 2 booster packs, a starter collection of every faction and three ready-to-play decks.</p>
        <button className="btn btn-primary btn-lg" type="submit" disabled={!valid || busy}>
          {busy ? 'Binding shards…' : 'Begin'}
        </button>
      </form>
    </div>
  );
}

export function CorruptedSaveScreen() {
  const error = useAccount((s) => s.initError);
  const [busy, setBusy] = useState(false);
  return (
    <div className="boot-screen">
      <div className="panel" style={{ maxWidth: 560 }}>
        <h2>Your save could not be loaded</h2>
        <p className="muted">The stored data is damaged or unreadable. A backup copy was kept in local storage. You can start a new Warden; the damaged data will be replaced.</p>
        <pre className="error-detail">{error}</pre>
        <div className="modal-actions">
          <button className="btn" onClick={() => location.reload()}>
            Retry
          </button>
          <button
            className="btn btn-danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await gameService.resetAccount();
            }}
          >
            Start a new Warden
          </button>
        </div>
      </div>
    </div>
  );
}
