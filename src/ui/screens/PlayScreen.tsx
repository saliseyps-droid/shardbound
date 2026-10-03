import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { DIFFICULTY_POOLS, PRACTICE_OPPONENTS } from '@/data/opponents';
import { FACTIONS } from '@/data/factions';
import { DIFFICULTIES, MATCH_REWARDS, XP_REWARDS, type Difficulty } from '@/config/progression';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { TUTORIAL_OPPONENT } from '@/ui/match/tutorialData';
import { ScreenHeader } from '@/ui/components/common';
import { Glyph } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { DeckPicker, DIFFICULTY_INFO, factionStyle, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { audio } from '@/audio/audioService';
import '@/ui/styles/meta.css';
import { t } from '@/i18n';

export default function PlayScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [faction, setFaction] = useState<PlayableFaction>('VERDANT');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  if (!save) return null;
  const opp = PRACTICE_OPPONENTS[faction];
  const validDeck = deckId && firstValidDeck(save, deckId) === deckId;
  const winGold = MATCH_REWARDS.goldPerWin + MATCH_REWARDS.difficultyGoldBonus[difficulty];
  const winXp = Math.round(XP_REWARDS.win * MATCH_REWARDS.difficultyXpMultiplier[difficulty]);

  const start = () => {
    if (!validDeck) return;
    launchMatch({ mode: 'PRACTICE', deckId, opponent: { ...opp, difficulty, rarities: DIFFICULTY_POOLS[difficulty] } }, navigate);
  };

  return (
    <div className="screen play-screen">
      <ScreenHeader title={t('Practice match')} subtitle={t('Pick a rival Warden, set their skill, and bring your deck.')} />
      <div className="play-layout">
        <section className="panel" aria-labelledby="opp-title">
          <div className="panel-title" id="opp-title">
            {t('Opponent')}
          </div>
          <div className="opponent-grid" role="radiogroup" aria-label={t('Opponent faction')}>
            {PLAYABLE_FACTIONS.map((f) => {
              const o = PRACTICE_OPPONENTS[f];
              const sel = f === faction;
              return (
                <button key={f} type="button" role="radio" aria-checked={sel} className={`opponent-tile ${sel ? 'selected' : ''}`} style={factionStyle(f)} onClick={() => (audio.play('click'), setFaction(f))}>
                  <span className="opp-sigil" aria-hidden>
                    <WardenPortrait faction={f} size={48} />
                  </span>
                  <strong>{o.name}</strong>
                  <span className="faint">{FACTIONS[f].name}</span>
                </button>
              );
            })}
          </div>
          <div className="opponent-detail" style={factionStyle(faction)}>
            <h3>{opp.name}</h3>
            <p className="muted">
              {t('{title}. Plays {archetype} strategy: {identity}', { title: opp.title, archetype: opp.archetype ?? t('a balanced'), identity: FACTIONS[faction].identity })}
            </p>
            <blockquote>“{opp.intro}”</blockquote>
          </div>

          <div className="panel-title" style={{ marginTop: 'var(--space-5)' }}>
            {t('Difficulty')}
          </div>
          <div className="difficulty-list" role="radiogroup" aria-label={t('Difficulty')}>
            {DIFFICULTIES.map((d, i) => (
              <button key={d} type="button" role="radio" aria-checked={d === difficulty} className={`difficulty-option ${d === difficulty ? 'selected' : ''}`} onClick={() => (audio.play('click'), setDifficulty(d))}>
                <span className="diff-pips" aria-hidden>
                  {DIFFICULTIES.map((_, j) => (
                    <span key={j} className={j <= i ? 'on' : ''} />
                  ))}
                </span>
                <strong>{t(DIFFICULTY_INFO[d].label)}</strong>
                <span className="muted">{t(DIFFICULTY_INFO[d].text)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel play-side" aria-labelledby="deck-title">
          <div className="panel-title">
            <span id="deck-title">{t('Your deck')}</span>
            <Link to="/decks" className="small-link">{t('Manage decks')}</Link>
          </div>
          <DeckPicker save={save} value={deckId} onChange={setDeckId} />
          <div className="play-rewards muted">
            {t('Victory pays')} <strong className="gold-text">{t('{n} Gold', { n: winGold })}</strong> {t('and')} <strong>{winXp} XP</strong>{t(', plus a first-win-of-the-day bonus.')}
          </div>
          <button className="btn btn-primary btn-xl play-start" disabled={!validDeck} onClick={start}>
            {t('Fight {name}', { name: opp.name.split(' ').slice(-1)[0] })}
          </button>
          {!validDeck && <p className="deckbox-issue">{t('Choose a valid 30-card deck to play.')}</p>}

          <div className="tutorial-card online-card">
            <Glyph name="trophy" size={28} />
            <div>
              <strong>{t('Ranked')}</strong>
              <span className="muted">{t('Get matched against a random player who is searching right now and climb the ladder.')}</span>
            </div>
            <Link className="btn btn-sm btn-cyan" to="/ranked">
              {t('Find match')}
            </Link>
          </div>

          <div className="tutorial-card online-card">
            <Glyph name="crown" size={28} />
            <div>
              <strong>{t('Tournament')}</strong>
              <span className="muted">{t('A 4-player knockout for 2–4 friends; bots fill the empty seats.')}</span>
            </div>
            <Link className="btn btn-sm btn-cyan" to="/tournament">
              {t('Open')}
            </Link>
          </div>

          <div className="tutorial-card online-card">
            <Glyph name="person" size={28} />
            <div>
              <strong>{t('Play a friend online')}</strong>
              <span className="muted">{t('Create a match, send your friend the room code, and they join from their browser.')}</span>
            </div>
            <Link className="btn btn-sm btn-cyan" to="/online">
              {t('Play online')}
            </Link>
          </div>

          <div className="tutorial-card">
            <Glyph name="compass" size={28} />
            <div>
              <strong>{t('Tutorial')}</strong>
              <span className="muted">{save.profile.tutorialCompleted ? t('Replay the guided lesson any time.') : t('New to Shardbound? Learn the basics in a guided match.')}</span>
            </div>
            <button className="btn btn-sm" onClick={() => launchMatch({ mode: 'TUTORIAL', deckId: null, opponent: TUTORIAL_OPPONENT }, navigate)}>
              {save.profile.tutorialCompleted ? t('Replay') : t('Start')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
