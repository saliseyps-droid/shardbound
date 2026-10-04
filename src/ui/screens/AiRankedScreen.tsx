import { useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { randomSeed } from '@/core/rng';
import { MATCH_REWARDS, XP_REWARDS } from '@/config/progression';
import { SET_INFO } from '@/config/economy';
import { FACTIONS } from '@/data/factions';
import {
  AI_RANKED_CONFIG,
  AI_TIERS,
  CROWN_RANK,
  STARS_PER_RANK,
  TIER_COLORS,
  aiRankedOpponent,
  aiStrengthFor,
  aiTierOf,
  nextTierReward,
  repairAiRanked,
} from '@/domain/aiRanked';
import { Essence, Gold, ScreenHeader } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { DeckPicker, factionStyle, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { AiRankEmblem, aiRankLabel, aiStrengthText } from '@/ui/components/meta/aiRankedUi';
import { t } from '@/i18n';
import '@/ui/styles/meta.css';
import '@/ui/styles/aiRanked.css';

/** Ranked vs AI: a star ladder where the computer gets stronger with every rank. */
export default function AiRankedScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  // The next rival is rolled when the screen opens (a new one after every match).
  const [seed] = useState(() => randomSeed());
  if (!save) return null;
  const ladder = repairAiRanked(save.profile.aiRanked);
  const tier = aiTierOf(ladder.rank);
  const color = TIER_COLORS[tier];
  const strength = aiStrengthFor(ladder.rank);
  const opponent = aiRankedOpponent(ladder.rank, seed);
  const next = nextTierReward(ladder);
  const validDeck = !!deckId && firstValidDeck(save, deckId) === deckId;
  const winGold = AI_RANKED_CONFIG.winGold[tier];
  const winXp = Math.round(XP_REWARDS.win * MATCH_REWARDS.difficultyXpMultiplier[strength.difficulty]);
  const crown = ladder.rank >= CROWN_RANK;
  const streakBonus = ladder.rank < 12;

  const play = () => {
    if (!validDeck) return;
    launchMatch({ mode: 'AI_RANKED', deckId, opponent, aiTuning: strength.tuning }, navigate);
  };

  return (
    <div className="screen air-screen" style={{ '--tier': color } as CSSProperties}>
      <ScreenHeader title={t('Ranked vs AI')} subtitle={t('Climb from Bronze to Crown. Every rank you reach, the AI plays sharper and brings stronger cards.')} />
      <div className="air-layout">
        <section className="panel air-rank" aria-labelledby="air-rank-name">
          <div className="air-rank-head">
            <AiRankEmblem rank={ladder.rank} size={112} />
            <div className="air-rank-info">
              <span className="air-kicker">{t('Current rank')}</span>
              <h2 id="air-rank-name" className="air-rank-name">
                {aiRankLabel(ladder.rank)}
              </h2>
              {crown ? (
                <span className="air-crown-points num">{t('{n} Crown points', { n: ladder.stars })}</span>
              ) : (
                <span className="air-stars" role="img" aria-label={t('{n} of {max} stars', { n: ladder.stars, max: STARS_PER_RANK })}>
                  {Array.from({ length: STARS_PER_RANK }, (_, i) => (
                    <span key={i} className={`air-star ${i < ladder.stars ? 'on' : ''}`}>
                      <Glyph name="star" size={22} />
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>

          <dl className="air-stats">
            <div>
              <dt>{t('Win streak')}</dt>
              <dd className="num">{ladder.streak}</dd>
            </div>
            <div>
              <dt>{t('Wins / losses')}</dt>
              <dd className="num">
                {ladder.wins} / {ladder.losses}
              </dd>
            </div>
            <div>
              <dt>{t('Best rank')}</dt>
              <dd style={{ color: TIER_COLORS[aiTierOf(ladder.best)] }}>{aiRankLabel(ladder.best)}</dd>
            </div>
          </dl>

          <ol className="air-track" aria-label={t('Ladder')}>
            {AI_TIERS.map((name, ti) => {
              const ranks = name === 'Crown' ? [CROWN_RANK] : [ti * 3, ti * 3 + 1, ti * 3 + 2];
              return (
                <li key={name} className="air-track-tier" style={{ '--tc': TIER_COLORS[name] } as CSSProperties}>
                  <span className="air-track-name">{t(name)}</span>
                  <span className="air-track-pips">
                    {ranks.map((r) => (
                      <span key={r} className={`air-pip ${r < ladder.rank ? 'done' : r === ladder.rank ? 'here' : ''}`} title={aiRankLabel(r)} />
                    ))}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="air-ai">
            <span className="air-kicker">{t('Your rivals at this rank')}</span>
            <strong>{aiStrengthText(ladder.rank)}</strong>
            {strength.tuning && <span className="faint">{t('The AI sharpens with every division: fewer mistakes from III to I.')}</span>}
          </div>

          <div className="air-rules faint">
            {t('Win: +1 star. Loss: −1 star. Three stars rank you up.')} {streakBonus ? t('From the third win in a row, each win gives a bonus star.') : ''}{' '}
            {t('You never fall out of Silver, Gold or Diamond once you reach them.')}
          </div>
        </section>

        <section className="panel air-side" aria-labelledby="air-deck-title">
          <div className="air-opponent" style={factionStyle(opponent.faction)}>
            <WardenPortrait faction={opponent.faction} size={64} />
            <div>
              <span className="air-kicker">{t('Next rival')}</span>
              <strong>{opponent.name}</strong>
              <span className="faint">
                {opponent.title} · {FACTIONS[opponent.faction].name}
              </span>
            </div>
          </div>

          <div className="panel-title">
            <span id="air-deck-title">{t('Your deck')}</span>
            <Link to="/decks" className="small-link">
              {t('Manage decks')}
            </Link>
          </div>
          <DeckPicker save={save} value={deckId} onChange={setDeckId} />

          <div className="play-rewards muted">
            {t('Victory pays')} <strong className="gold-text">{t('{n} Gold', { n: winGold })}</strong> {t('and')} <strong>{winXp} XP</strong>
            {t(', plus a first-win-of-the-day bonus.')}
          </div>

          {next && (
            <div className="air-next" style={{ '--tc': TIER_COLORS[next.tier] } as CSSProperties}>
              <span className="air-kicker">{t('First time in {tier}', { tier: t(next.tier) })}</span>
              <span className="reward-bits">
                <Gold amount={next.reward.gold} size={15} />
                {next.reward.essence ? <Essence amount={next.reward.essence} size={15} /> : null}
                <span className="currency">
                  <PackIcon size={15} /> {next.reward.packs.amount} {SET_INFO[next.reward.packs.setId].name}
                </span>
              </span>
            </div>
          )}

          <button className="btn btn-primary btn-xl play-start" disabled={!validDeck} onClick={play}>
            {t('Play ranked match')}
          </button>
          {!validDeck && <p className="deckbox-issue">{t('Choose a valid 30-card deck to play.')}</p>}
          <p className="faint air-warning">{t('Leaving or reloading during the match counts as a loss.')}</p>
        </section>
      </div>
    </div>
  );
}
