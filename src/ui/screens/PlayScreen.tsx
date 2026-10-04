import { useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { DIFFICULTY_POOLS, PRACTICE_OPPONENTS } from '@/data/opponents';
import { FACTIONS } from '@/data/factions';
import { DIFFICULTIES, MATCH_REWARDS, XP_REWARDS, type Difficulty } from '@/config/progression';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { TUTORIAL_OPPONENT } from '@/ui/match/tutorialData';
import { ScreenHeader } from '@/ui/components/common';
import { campaignProgress } from '@/ui/components/meta/campaign';
import { aiRankLabel } from '@/ui/components/meta/aiRankedUi';
import { hasFreeArenaEntry } from '@/domain/arena';
import { tierFor } from '@/domain/ranked';
import { ARENA } from '@/config/arena';
import type { GameSave } from '@/domain/save';
import { Glyph } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { DeckPicker, DIFFICULTY_INFO, factionStyle, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { audio } from '@/audio/audioService';
import '@/ui/styles/meta.css';
import { t } from '@/i18n';

interface ModeTile {
  key: string;
  icon: string;
  title: string;
  text: string;
  status: string;
  to?: string;
  onClick?: () => void;
  highlight?: boolean;
}

function ModeGrid({ title, tiles, variant }: { title: string; tiles: ModeTile[]; variant?: 'pvp' }) {
  const navigate = useNavigate();
  return (
    <section className={`mode-group ${variant === 'pvp' ? 'is-pvp' : ''}`} aria-label={title}>
      <h3 className="mode-group-title">{title}</h3>
      <div className="mode-grid" style={{ '--cols': tiles.length } as CSSProperties}>
        {tiles.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`mode-tile panel ${m.highlight ? 'is-highlight' : ''}`}
            onClick={() => {
              audio.play('click');
              if (m.onClick) m.onClick();
              else if (m.to) navigate(m.to);
            }}
          >
            <span className="mode-icon" aria-hidden>
              <Glyph name={m.icon} size={26} />
            </span>
            <strong>{m.title}</strong>
            <span className="mode-text muted">{m.text}</span>
            <span className="mode-status">{m.status}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function modeTiles(save: GameSave, startTutorial: () => void): { ai: ModeTile[]; pvp: ModeTile[] } {
  const camp = campaignProgress(save);
  const run = save.arena.run;
  const tutorialDone = save.profile.tutorialCompleted;
  const ai: ModeTile[] = [
    { key: 'campaign', icon: 'map', title: t('Campaign'), text: t('Follow the story across nine chapters of rivals and bosses.'), status: camp.cleared >= camp.total ? t('Completed') : t('{n} of {total} cleared', { n: camp.cleared, total: camp.total }), to: '/campaign' },
    { key: 'ai-ranked', icon: 'star', title: t('Ranked vs AI'), text: t('Climb from Bronze to Crown against the AI. It gets stronger with every rank.'), status: aiRankLabel(save.profile.aiRanked.rank), to: '/ai-ranked' },
    {
      key: 'arena', icon: 'trophy', title: t('Arena'), text: t('Draft a deck from random cards and win as many of 4 matches as you can.'),
      status: run ? t('Run in progress: {w} of {max} wins', { w: run.results.filter((r) => r === 'WIN').length, max: ARENA.maxWins }) : hasFreeArenaEntry(save, Date.now()) ? t('Free entry today') : t('Entry: {n} Gold', { n: ARENA.entryGold }),
      to: '/arena', highlight: !run && hasFreeArenaEntry(save, Date.now()),
    },
    { key: 'tutorial', icon: 'compass', title: t('Tutorial'), text: tutorialDone ? t('Replay the guided lesson any time.') : t('New to Shardbound? Learn the basics in a guided match.'), status: tutorialDone ? t('Completed') : t('Start here'), onClick: startTutorial, highlight: !tutorialDone },
  ];
  const pvp: ModeTile[] = [
    { key: 'ranked', icon: 'crown', title: t('Ranked'), text: t('Get matched against a random player who is searching right now and climb the ladder.'), status: `${t(tierFor(save.profile.ranked.rating).name)} · ${save.profile.ranked.rating}`, to: '/ranked' },
    { key: 'friend', icon: 'person', title: t('Play a friend online'), text: t('Create a match, send your friend the room code, and they join from their browser.'), status: t('Room code'), to: '/online' },
    { key: 'tournament', icon: 'sword', title: t('Tournament'), text: t('A knockout for 4 to 32 players with your friends; bots fill the empty seats.'), status: t('4 to 32 players'), to: '/tournament' },
  ];
  return { ai, pvp };
}

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

  const tiles = modeTiles(save, () => launchMatch({ mode: 'TUTORIAL', deckId: null, opponent: TUTORIAL_OPPONENT }, navigate));

  return (
    <div className="screen play-screen">
      <ScreenHeader title={t('Play')} subtitle={t('Choose how you want to play.')} />
      <div className="mode-groups">
        <ModeGrid title={t('Against the AI')} tiles={tiles.ai} />
        <ModeGrid title={t('Against players')} tiles={tiles.pvp} variant="pvp" />
      </div>
      <div className="practice-head">
        <h2>{t('Practice match')}</h2>
        <p className="muted">{t('Pick a rival Warden, set their skill, and bring your deck.')}</p>
      </div>
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
              {t('{title}. Plays {archetype} strategy: {identity}', { title: opp.title, archetype: opp.archetype ? t(opp.archetype) : t('a balanced'), identity: FACTIONS[faction].identity })}
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

        </section>
      </div>
    </div>
  );
}
