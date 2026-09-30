import { useState } from 'react';
import { Link } from 'react-router-dom';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { collectibleCards } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { MAX_LEVEL } from '@/config/progression';
import { xpToNext } from '@/domain/progression';
import { ownedCopies } from '@/domain/save';
import { PLAYABLE_FACTIONS, RARITIES } from '@/game/types';
import { Essence, Gold, ProgressBar, ScreenHeader } from '@/ui/components/common';
import { Glyph } from '@/ui/components/Icons';
import { DeckBox, factionStyle } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';

const SIGILS = PLAYABLE_FACTIONS.map((f) => FACTIONS[f].sigil).concat(['crown', 'compass']);

export default function ProfileScreen() {
  const save = useAccount((s) => s.save);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  if (!save) return null;
  const p = save.profile;
  const games = p.wins + p.losses + p.draws;
  const winRate = games ? Math.round((p.wins / games) * 100) : 0;
  const all = collectibleCards();
  const unique = all.filter((c) => ownedCopies(save.collection, c.id) > 0).length;
  const totalCopies = Object.values(save.collection.cards).reduce((a, v) => a + v.NORMAL + v.FOIL + v.PRISMATIC, 0);
  const cosmetic = Object.values(save.collection.cards).reduce((a, v) => a + v.FOIL + v.PRISMATIC, 0);
  const fav = save.decks.find((d) => d.id === p.favoriteDeckId);
  const need = xpToNext(p.level);

  const saveName = () => {
    const res = gameService.updateProfile({ username: name });
    if (res.ok) {
      setEditing(false);
      toast('Name updated', 'success');
    } else toast(res.error, 'error');
  };

  return (
    <div className="screen profile-screen">
      <ScreenHeader
        title="Profile"
        actions={
          <>
            <Link className="btn btn-ghost" to="/history">
              Match history
            </Link>
            <Link className="btn btn-ghost" to="/lore">
              Lore and keywords
            </Link>
          </>
        }
      />
      <div className="profile-layout">
        <section className="panel profile-card">
          <div className="profile-id">
            <span className="warden-sigil large" aria-hidden>
              <Glyph name={p.avatar} size={56} />
            </span>
            <div>
              {editing ? (
                <form
                  className="name-edit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveName();
                  }}
                >
                  <label className="sr-only" htmlFor="pname">
                    Warden name
                  </label>
                  <input id="pname" className="input" value={name} maxLength={20} autoFocus onChange={(e) => setName(e.target.value)} />
                  <button className="btn btn-primary btn-sm" type="submit">
                    Save
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <h2 className="profile-name">
                  {p.username}{' '}
                  <button className="icon-btn small" aria-label="Rename" onClick={() => (setName(p.username), setEditing(true))}>
                    ✎
                  </button>
                </h2>
              )}
              <span className="muted">Warden since {new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <fieldset className="field">
            <legend>Sigil</legend>
            <div className="avatar-picker">
              {SIGILS.map((s) => (
                <button key={s} type="button" className={`avatar-option ${s === p.avatar ? 'selected' : ''}`} aria-pressed={s === p.avatar} aria-label={`Sigil ${s}`} onClick={() => gameService.updateProfile({ avatar: s })}>
                  <Glyph name={s} size={24} />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>Title</span>
            <select className="select" value={p.title ?? ''} onChange={(e) => gameService.updateProfile({ title: e.target.value || null })} disabled={p.titles.length === 0}>
              <option value="">{p.titles.length ? 'No title' : 'Earn titles every 10 levels'}</option>
              {p.titles.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <div className="profile-level">
            <span className="level-gem num">{p.level}</span>
            <div style={{ flex: 1 }}>
              <ProgressBar value={p.level >= MAX_LEVEL ? 1 : p.xp} max={p.level >= MAX_LEVEL ? 1 : need} gold label="Experience" />
              <span className="faint">{p.level >= MAX_LEVEL ? 'Max level' : `${p.xp} / ${need} XP`}, {p.totalXp.toLocaleString()} total</span>
            </div>
          </div>
          <div className="profile-wallet">
            <Gold amount={p.gold} size={22} />
            <Essence amount={p.essence} size={22} />
          </div>
          {fav && (
            <div>
              <div className="faint">Favorite deck</div>
              <DeckBox deck={fav} save={save} compact />
            </div>
          )}
          <RedeemCode />
        </section>

        <section className="panel">
          <div className="panel-title">Battle record</div>
          <div className="stat-tiles">
            <div className="stat-tile">
              <span className="num">{p.wins}</span>
              <span className="muted">Wins</span>
            </div>
            <div className="stat-tile">
              <span className="num">{p.losses}</span>
              <span className="muted">Losses</span>
            </div>
            <div className="stat-tile">
              <span className="num">{p.draws}</span>
              <span className="muted">Draws</span>
            </div>
            <div className="stat-tile">
              <span className="num">{winRate}%</span>
              <span className="muted">Win rate</span>
            </div>
          </div>
          <div className="panel-title" style={{ marginTop: 'var(--space-5)' }}>
            Wins by faction
          </div>
          <ul className="faction-bars">
            {PLAYABLE_FACTIONS.map((f) => {
              const n = p.factionWins[f] ?? 0;
              const max = Math.max(1, ...PLAYABLE_FACTIONS.map((x) => p.factionWins[x] ?? 0));
              return (
                <li key={f} style={factionStyle(f)}>
                  <Glyph name={FACTIONS[f].sigil} size={16} />
                  <span>{FACTIONS[f].name}</span>
                  <span className="faction-bar" aria-hidden>
                    <span style={{ width: `${(n / max) * 100}%` }} />
                  </span>
                  <span className="num">{n}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-title">Collection and economy</div>
          <dl className="info-grid">
            <dt>Cards discovered</dt>
            <dd className="num">
              {unique} / {all.length} ({Math.round((unique / all.length) * 100)}%)
            </dd>
            <dt>Cards owned</dt>
            <dd className="num">{totalCopies}</dd>
            <dt>Foil and prismatic</dt>
            <dd className="num">{cosmetic}</dd>
            <dt>Packs opened</dt>
            <dd className="num">{p.packsOpened}</dd>
            <dt>Cards crafted</dt>
            <dd className="num">{p.cardsCrafted}</dd>
            <dt>Cards recycled</dt>
            <dd className="num">{p.cardsRecycled}</dd>
            <dt>Quests completed</dt>
            <dd className="num">{save.quests.totalCompleted}</dd>
            <dt>Campaign clears</dt>
            <dd className="num">{Object.keys(save.pve.completed).length}</dd>
            <dt>Decks</dt>
            <dd className="num">{save.decks.length}</dd>
          </dl>
          <div className="panel-title" style={{ marginTop: 'var(--space-4)' }}>
            By rarity
          </div>
          <ul className="rarity-progress">
            {RARITIES.map((r) => {
              const pool = all.filter((c) => c.rarity === r);
              const owned = pool.filter((c) => ownedCopies(save.collection, c.id) > 0).length;
              return (
                <li key={r}>
                  <span className={`rarity-text-${r.toLowerCase()}`}>{r.charAt(0) + r.slice(1).toLowerCase()}</span>
                  <ProgressBar value={owned} max={pool.length} label={`${r} collected`} />
                  <span className="num faint">
                    {owned} / {pool.length}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** Redeem code form: each code works once per account. */
function RedeemCode() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    const res = await gameService.redeemCode(code);
    setBusy(false);
    if (res.ok) {
      audio.play('coin');
      toast(`Code redeemed: ${res.value.label}`, 'reward');
      setCode('');
    } else {
      audio.play('error');
      toast(res.error, 'error');
    }
  };
  return (
    <form
      className="redeem-form"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label className="faint" htmlFor="redeem-code">
        Redeem code
      </label>
      <div className="redeem-row">
        <input id="redeem-code" className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter a code" autoComplete="off" spellCheck={false} maxLength={64} />
        <button className="btn btn-cyan" type="submit" disabled={!code.trim() || busy}>
          {busy ? 'Checking…' : 'Redeem'}
        </button>
      </div>
    </form>
  );
}
