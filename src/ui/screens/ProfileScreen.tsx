import { useState } from 'react';
import { Link } from 'react-router-dom';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { collectibleCards } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { LEVELS, MAX_LEVEL, type LevelReward } from '@/config/progression';
import { SET_INFO } from '@/config/economy';
import { xpToNext } from '@/domain/progression';
import { ownedCopies } from '@/domain/save';
import { PLAYABLE_FACTIONS, RARITIES } from '@/game/types';
import { Essence, Gold, ProgressBar, ScreenHeader } from '@/ui/components/common';
import { Glyph } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { DeckBox, factionStyle } from '@/ui/components/meta/MetaWidgets';
import '@/ui/styles/meta.css';
import { t, tn } from '@/i18n';


function rewardLabel(r: LevelReward): string {
  switch (r.kind) {
    case 'GOLD':
      return t('{n} Gold', { n: r.amount });
    case 'ESSENCE':
      return t('{n} Essence', { n: r.amount });
    case 'PACK':
      return tn(r.amount, '{n} {set} pack', '{n} {set} packs', { set: SET_INFO[r.setId].name });
    case 'CARD_BACK':
      return t('New card back');
    case 'TITLE':
      return t('Title: {title}', { title: t(r.title) });
  }
}

/** What the next few levels give, so levelling up has a visible goal. */
function LevelRoad({ level }: { level: number }) {
  if (level >= MAX_LEVEL) return null;
  const next = LEVELS.slice(level, Math.min(MAX_LEVEL, level + 5));
  return (
    <div className="level-road">
      <div className="faint">{t('Next level rewards')}</div>
      <ul>
        {next.map((l) => (
          <li key={l.level} className={l.level % 10 === 0 ? 'milestone' : l.level % 5 === 0 ? 'major' : ''}>
            <span className="level-gem small num">{l.level}</span>
            <span className="level-road-rewards">
              {l.rewards.map((r, i) => (
                <span key={i} className="chip">
                  {rewardLabel(r)}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  // The portrait follows the Warden of the deck you play (selected, else favourite, else first).
  const playingFaction = (save.decks.find((d) => d.id === p.selectedDeckId) ?? fav ?? save.decks[0])?.heroFaction;
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
        title={t('Profile')}
        actions={
          <>
            <Link className="btn btn-ghost" to="/history">
              {t('Match history')}
            </Link>
            <Link className="btn btn-ghost" to="/lore">
              {t('Lore and keywords')}
            </Link>
          </>
        }
      />
      <div className="profile-layout">
        <section className="panel profile-card">
          <div className="profile-id">
            <span className="warden-sigil large" aria-hidden title={t('The Warden of the deck you play')}>
              <WardenPortrait faction={playingFaction} fill />
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
                    {t('Warden name')}
                  </label>
                  <input id="pname" className="input" value={name} maxLength={20} autoFocus onChange={(e) => setName(e.target.value)} />
                  <button className="btn btn-primary btn-sm" type="submit">
                    {t('Save')}
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(false)}>
                    {t('Cancel')}
                  </button>
                </form>
              ) : (
                <h2 className="profile-name">
                  {p.username}{' '}
                  <button className="icon-btn small" aria-label={t('Rename')} onClick={() => (setName(p.username), setEditing(true))}>
                    ✎
                  </button>
                </h2>
              )}
              <span className="muted">{t('Warden since {date}', { date: new Date(p.createdAt).toLocaleDateString() })}</span>
            </div>
          </div>
          <p className="faint">{playingFaction ? t('Your portrait is the Warden of the deck you play: {faction}.', { faction: FACTIONS[playingFaction].name }) : t('Your portrait is the Warden of the deck you play.')}</p>
          <label className="field">
            <span>{t('Title')}</span>
            <select className="select" value={p.title ?? ''} onChange={(e) => gameService.updateProfile({ title: e.target.value || null })} disabled={p.titles.length === 0}>
              <option value="">{p.titles.length ? t('No title') : t('Earn titles every 10 levels')}</option>
              {p.titles.map((ti) => (
                <option key={ti} value={ti}>
                  {t(ti)}
                </option>
              ))}
            </select>
          </label>
          <div className="profile-level">
            <span className="level-gem num">{p.level}</span>
            <div style={{ flex: 1 }}>
              <ProgressBar value={p.level >= MAX_LEVEL ? 1 : p.xp} max={p.level >= MAX_LEVEL ? 1 : need} gold label={t('Experience')} />
              <span className="faint">{t('{progress}, {total} total', { progress: p.level >= MAX_LEVEL ? t('Max level') : t('{xp} / {need} XP', { xp: p.xp, need }), total: p.totalXp.toLocaleString() })}</span>
            </div>
          </div>
          <LevelRoad level={p.level} />
          <div className="profile-wallet">
            <Gold amount={p.gold} size={22} />
            <Essence amount={p.essence} size={22} />
          </div>
          {fav && (
            <div>
              <div className="faint">{t('Favorite deck')}</div>
              <DeckBox deck={fav} save={save} compact />
            </div>
          )}
          <RedeemCode />
        </section>

        <section className="panel">
          <div className="panel-title">{t('Battle record')}</div>
          <div className="stat-tiles">
            <div className="stat-tile">
              <span className="num">{p.wins}</span>
              <span className="muted">{t('Wins')}</span>
            </div>
            <div className="stat-tile">
              <span className="num">{p.losses}</span>
              <span className="muted">{t('Losses')}</span>
            </div>
            <div className="stat-tile">
              <span className="num">{p.draws}</span>
              <span className="muted">{t('Draws')}</span>
            </div>
            <div className="stat-tile">
              <span className="num">{winRate}%</span>
              <span className="muted">{t('Win rate')}</span>
            </div>
          </div>
          <div className="panel-title" style={{ marginTop: 'var(--space-5)' }}>
            {t('Wins by faction')}
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
          <div className="panel-title">{t('Collection and economy')}</div>
          <dl className="info-grid">
            <dt>{t('Cards discovered')}</dt>
            <dd className="num">
              {unique} / {all.length} ({Math.round((unique / all.length) * 100)}%)
            </dd>
            <dt>{t('Cards owned')}</dt>
            <dd className="num">{totalCopies}</dd>
            <dt>{t('Foil and prismatic')}</dt>
            <dd className="num">{cosmetic}</dd>
            <dt>{t('Packs opened')}</dt>
            <dd className="num">{p.packsOpened}</dd>
            <dt>{t('Cards crafted')}</dt>
            <dd className="num">{p.cardsCrafted}</dd>
            <dt>{t('Cards recycled')}</dt>
            <dd className="num">{p.cardsRecycled}</dd>
            <dt>{t('Quests completed')}</dt>
            <dd className="num">{save.quests.totalCompleted}</dd>
            <dt>{t('Campaign clears')}</dt>
            <dd className="num">{Object.keys(save.pve.completed).length}</dd>
            <dt>{t('Decks')}</dt>
            <dd className="num">{save.decks.length}</dd>
          </dl>
          <div className="panel-title" style={{ marginTop: 'var(--space-4)' }}>
            {t('By rarity')}
          </div>
          <ul className="rarity-progress">
            {RARITIES.map((r) => {
              const pool = all.filter((c) => c.rarity === r);
              const owned = pool.filter((c) => ownedCopies(save.collection, c.id) > 0).length;
              return (
                <li key={r}>
                  <span className={`rarity-text-${r.toLowerCase()}`}>{t(r.charAt(0) + r.slice(1).toLowerCase())}</span>
                  <ProgressBar value={owned} max={pool.length} label={t('{rarity} collected', { rarity: t(r) })} />
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
        {t('Redeem code')}
      </label>
      <div className="redeem-row">
        <input id="redeem-code" className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('Enter a code')} autoComplete="off" spellCheck={false} maxLength={64} />
        <button className="btn btn-cyan" type="submit" disabled={!code.trim() || busy}>
          {busy ? t('Checking…') : t('Redeem')}
        </button>
      </div>
    </form>
  );
}
