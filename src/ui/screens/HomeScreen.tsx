import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { TUTORIAL_OPPONENT } from '@/ui/match/tutorialData';
import { collectibleCards } from '@/data/cards';
import { CAMPAIGN } from '@/data/opponents';
import { FACTIONS } from '@/data/factions';
import { SET_INFO } from '@/config/economy';
import { MAX_LEVEL } from '@/config/progression';
import { xpToNext } from '@/domain/progression';
import { ownedCopies } from '@/domain/save';
import type { SetId } from '@/game/types';
import { ProgressBar } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { effectivePortrait } from '@/domain/portraits';
import { DailyTrack, DeckBox, QuestRow, RewardSummary, timeAgo, DIFFICULTY_INFO } from '@/ui/components/meta/MetaWidgets';
import { campaignProgress, nextEncounter } from '@/ui/components/meta/campaign';
import { audio } from '@/audio/audioService';
import '@/ui/styles/meta.css';
import { t, tn } from '@/i18n';

export default function HomeScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  if (!save) return null;
  const p = save.profile;
  const deck = save.decks.find((d) => d.id === p.selectedDeckId) ?? save.decks.find((d) => d.favorite) ?? save.decks[0];
  const need = xpToNext(p.level);
  const all = collectibleCards();
  const ownedUnique = all.filter((c) => ownedCopies(save.collection, c.id) > 0).length;
  const packs = Object.entries(save.economy.packs).filter(([, n]) => (n ?? 0) > 0) as [SetId, number][];
  const next = nextEncounter(save);
  const camp = campaignProgress(save);
  const quests = save.quests.active;
  const faction = deck ? FACTIONS[deck.heroFaction] : null;

  const startTutorial = () => {
    audio.play('click');
    launchMatch({ mode: 'TUTORIAL', deckId: null, opponent: TUTORIAL_OPPONENT }, navigate);
  };

  return (
    <div className="screen home">
      <section className="home-hero" style={faction ? ({ '--f1': faction.colors.primary, '--fglow': faction.colors.glow } as React.CSSProperties) : undefined}>
        <div className="home-hero-warden">
          <span className="warden-sigil" aria-hidden>
            <WardenPortrait faction={deck?.heroFaction} portrait={deck ? effectivePortrait(deck, p) : null} fill />
          </span>
          <div>
            <h1 className="home-name">{p.username}</h1>
            <p className="muted home-title">
              {t('{title}, level {n}', { title: p.title ? t(p.title) : t('Newly awakened Warden'), n: p.level })}
            </p>
            <div className="home-xp">
              <ProgressBar value={p.level >= MAX_LEVEL ? 1 : p.xp} max={p.level >= MAX_LEVEL ? 1 : need} gold label={t('Experience')} />
              <span className="faint">{p.level >= MAX_LEVEL ? t('Max level') : t('{xp} / {need} XP to level {n}', { xp: p.xp, need, n: p.level + 1 })}</span>
            </div>
          </div>
        </div>

        <button className="play-shard" onClick={() => (audio.play('click'), navigate('/play'))} aria-label={t('Play a match')}>
          <span className="play-shard-facet" aria-hidden />
          <span className="play-shard-label">{t('Play')}</span>
          <span className="play-shard-sub">{t('Practice against a bot')}</span>
        </button>

        <div className="home-deck">
          <span className="faint">{t('Your deck')}</span>
          {deck && <DeckBox deck={deck} save={save} />}
          <div className="home-deck-links">
            <Link to="/play">{t('Change deck')}</Link>
            {deck && <Link to={`/decks/${deck.id}`}>{t('Edit deck')}</Link>}
          </div>
        </div>
      </section>

      {!p.tutorialCompleted && (
        <section className="tutorial-banner panel">
          <Glyph name="compass" size={36} />
          <div>
            <h3>{t('Learn to fight as a Warden')}</h3>
            <p className="muted">{t('A short guided match teaches playing units, spending energy, attacking, targeting spells and winning. Completing it rewards Gold and XP.')}</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={startTutorial}>
            {t('Start the tutorial')}
          </button>
        </section>
      )}

      <div className="home-grid">
        <section className="panel home-quests" aria-labelledby="home-quests-title">
          <div className="panel-title">
            <span id="home-quests-title">{t('Daily quests')}</span>
            <Link to="/quests" className="small-link">{t('All quests')}</Link>
          </div>
          {quests.length === 0 ? (
            <p className="empty">{t('New quests arrive tomorrow.')}</p>
          ) : (
            <div className="quest-list">
              {quests.map((q) => (
                <QuestRow key={q.id} quest={q} save={save} allowReroll={false} />
              ))}
            </div>
          )}
        </section>

        <section className="panel home-daily" aria-labelledby="home-daily-title">
          <div className="panel-title">
            <span id="home-daily-title">{t('Login rewards')}</span>
            <span className="faint">{t('{n} claimed', { n: save.daily.totalClaims })}</span>
          </div>
          <DailyTrack save={save} />
        </section>

        <section className="panel home-campaign" aria-labelledby="home-camp-title">
          <div className="panel-title">
            <span id="home-camp-title">{t('Campaign')}</span>
            <span className="faint num">
              {t('{cleared} / {total} cleared', { cleared: camp.cleared, total: camp.total })}
            </span>
          </div>
          <ProgressBar value={camp.cleared} max={camp.total} label={t('Campaign progress')} />
          {next ? (
            <div className="next-encounter" style={{ '--f1': FACTIONS[next.encounter.faction].colors.primary } as React.CSSProperties}>
              <span className="enc-sigil" aria-hidden>
                <WardenPortrait faction={next.encounter.faction} portrait={next.encounter.portrait} fill inset={2} />
              </span>
              <div>
                <span className="faint">{CAMPAIGN[next.chapterIndex].name}</span>
                <strong>
                  {next.encounter.name}
                  {next.encounter.boss && <span className="boss-tag">{t('Boss')}</span>}
                </strong>
                <span className="muted">
                  {next.encounter.title}, {t(DIFFICULTY_INFO[next.encounter.difficulty].label)}
                </span>
              </div>
              <Link className="btn btn-cyan btn-sm" to="/campaign">
                {t('Continue')}
              </Link>
            </div>
          ) : (
            <p className="muted">{t('You have conquered the Crown Ascendant. Replay any encounter from the campaign map.')}</p>
          )}
        </section>

        <section className="panel home-packs" aria-labelledby="home-packs-title">
          <div className="panel-title">
            <span id="home-packs-title">{t('Booster packs')}</span>
            <Link to="/shop" className="small-link">{t('Shop')}</Link>
          </div>
          {packs.length === 0 ? (
            <p className="muted">{t('No unopened packs. Earn Gold from matches and quests, then visit the shop.')}</p>
          ) : (
            <div className="pack-stack-list">
              {packs.map(([setId, n]) => (
                <Link key={setId} to="/packs" className="pack-mini">
                  <PackIcon size={28} />
                  <span>
                    <strong>{SET_INFO[setId].name}</strong>
                    <span className="faint num">{t('{n} unopened', { n })}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel home-collection" aria-labelledby="home-coll-title">
          <div className="panel-title">
            <span id="home-coll-title">{t('Collection')}</span>
            <Link to="/collection" className="small-link">{t('Browse')}</Link>
          </div>
          <div className="big-stat">
            <span className="num">{Math.round((ownedUnique / all.length) * 100)}%</span>
            <span className="muted num">
              {tn(all.length, '{owned} of {n} card discovered', '{owned} of {n} cards discovered', { owned: ownedUnique })}
            </span>
          </div>
          <ProgressBar value={ownedUnique} max={all.length} label={t('Collection progress')} />
        </section>

        <section className="panel home-rewards" aria-labelledby="home-rew-title">
          <div className="panel-title">
            <span id="home-rew-title">{t('Recent rewards')}</span>
            <Link to="/profile" className="small-link">{t('Profile')}</Link>
          </div>
          {save.recentRewards.length === 0 ? (
            <p className="muted">{t('Rewards you earn will be listed here.')}</p>
          ) : (
            <ul className="reward-list">
              {save.recentRewards.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <span className="reward-source">{t(r.source)}</span>
                  <RewardSummary reward={r} />
                  <span className="faint reward-time">{timeAgo(r.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
