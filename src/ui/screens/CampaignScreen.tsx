import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { CAMPAIGN, findEncounter, type OpponentReward } from '@/data/opponents';
import { FACTIONS } from '@/data/factions';
import { SET_INFO } from '@/config/economy';
import { getCardSafe } from '@/data/cards';
import { ProgressBar, ScreenHeader, Essence, Gold } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { DeckPicker, DIFFICULTY_INFO, factionStyle, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { campaignProgress, isCleared, isUnlocked, nextEncounter } from '@/ui/components/meta/campaign';
import { audio } from '@/audio/audioService';
import '@/ui/styles/meta.css';
import { t } from '@/i18n';

/** At most this many chapters are shown at once; later ones go on further tabs. */
const CHAPTERS_PER_TAB = 3;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const TABS = Array.from({ length: Math.ceil(CAMPAIGN.length / CHAPTERS_PER_TAB) }, (_, i) => {
  const first = i * CHAPTERS_PER_TAB;
  const last = Math.min(CAMPAIGN.length, first + CHAPTERS_PER_TAB) - 1;
  return { first, last, chapters: CAMPAIGN.slice(first, last + 1) };
});
const tabOf = (encounterId: string | null) => {
  const ci = CAMPAIGN.findIndex((c) => c.encounters.some((e) => e.id === encounterId));
  return ci < 0 ? 0 : Math.floor(ci / CHAPTERS_PER_TAB);
};

function RewardList({ r }: { r: OpponentReward }) {
  return (
    <span className="reward-bits">
      {r.gold ? <Gold amount={r.gold} size={15} /> : null}
      {r.essence ? <Essence amount={r.essence} size={15} /> : null}
      {r.xp ? <span className="num faint">+{r.xp} XP</span> : null}
      {r.packs ? (
        <span className="currency">
          <PackIcon size={15} /> {r.packs.amount} {SET_INFO[r.packs.setId].name}
        </span>
      ) : null}
      {r.cardId ? <span className="chip">{getCardSafe(r.cardId).name}</span> : null}
    </span>
  );
}

export default function CampaignScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(() => (save ? nextEncounter(save)?.encounter.id ?? CAMPAIGN[0].encounters[0].id : null));
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [tab, setTab] = useState(() => tabOf(selectedId));
  if (!save) return null;
  const prog = campaignProgress(save);
  const sel = selectedId ? findEncounter(selectedId) : undefined;
  const enc = sel?.encounter;
  const unlocked = enc ? isUnlocked(save, enc.id) : false;
  const cleared = enc ? isCleared(save, enc.id) : false;
  const validDeck = deckId && firstValidDeck(save, deckId) === deckId;

  const fight = () => {
    if (!enc || !unlocked || !validDeck) return;
    launchMatch({ mode: 'PVE', deckId, opponent: enc, encounterId: enc.id }, navigate);
  };

  return (
    <div className="screen campaign-screen">
      <ScreenHeader
        title={t('Campaign')}
        subtitle={t('Follow the falling Shards across Aethra. Each victory unlocks the next rival; first clears pay extra.')}
        actions={
          <div className="camp-progress">
            <span className="num">
              {prog.cleared} / {prog.total}
            </span>
            <ProgressBar value={prog.cleared} max={prog.total} label={t('Campaign progress')} />
          </div>
        }
      />
      <div className="campaign-layout">
        <div className="chapters panel">
          {TABS.length > 1 && (
            <div className="camp-tabs" role="tablist" aria-label={t('Chapters')}>
              {TABS.map((tb, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={tab === i}
                  className={`camp-tab ${tab === i ? 'is-active' : ''}`}
                  onClick={() => {
                    audio.play('click');
                    setTab(i);
                    // Show the first open (or first) rival of the newly picked chapters.
                    const encs = tb.chapters.flatMap((c) => c.encounters);
                    setSelectedId((encs.find((e) => isUnlocked(save, e.id) && !isCleared(save, e.id)) ?? encs[0]).id);
                  }}
                >
                  {tb.first === tb.last ? t('Chapter {n}', { n: ROMAN[tb.first] }) : t('Chapters {from}–{to}', { from: ROMAN[tb.first], to: ROMAN[tb.last] })}
                </button>
              ))}
            </div>
          )}
          {TABS[tab].chapters.map((ch, ci) => {
            const chCleared = ch.encounters.filter((e) => isCleared(save, e.id)).length;
            const chLocked = !isUnlocked(save, ch.encounters[0].id);
            return (
              <section key={ch.id} className={`chapter ${chLocked ? 'locked' : ''}`} aria-labelledby={`${ch.id}-t`}>
                <header className="chapter-head">
                  <h3 id={`${ch.id}-t`}>{ch.name}</h3>
                  <span className="faint">
                    {chLocked ? t('Locked') : `${chCleared} / ${ch.encounters.length}`}
                  </span>
                </header>
                <p className="muted">{ch.description}</p>
                <ol className="enc-path">
                  {ch.encounters.map((e, i) => {
                    const done = isCleared(save, e.id);
                    const open = isUnlocked(save, e.id);
                    const state = done ? 'done' : open ? 'open' : 'locked';
                    return (
                      <li key={e.id} className="enc-step">
                        {i > 0 && <span className={`enc-link ${isCleared(save, ch.encounters[i - 1].id) ? 'lit' : ''}`} aria-hidden />}
                        <button
                          type="button"
                          className={`enc-node ${state} ${e.boss ? 'boss' : ''} ${selectedId === e.id ? 'selected' : ''}`}
                          style={factionStyle(e.faction)}
                          onClick={() => (audio.play('click'), setSelectedId(e.id))}
                          aria-pressed={selectedId === e.id}
                          aria-label={`${e.name}${e.boss ? t(', boss') : ''}, ${state === 'done' ? t('cleared') : state === 'open' ? t('available') : t('locked')}`}
                        >
                          {state === 'locked' ? <Glyph name="shield" size={e.boss ? 30 : 24} /> : <WardenPortrait faction={e.faction} portrait={e.portrait} fill />}
                          {done && <span className="enc-check" aria-hidden>✓</span>}
                        </button>
                        <span className="enc-name">{e.name}</span>
                      </li>
                    );
                  })}
                </ol>
                {ci < TABS[tab].chapters.length - 1 && <span className="chapter-sep" aria-hidden />}
              </section>
            );
          })}
        </div>

        {enc && (
          <aside className={`panel enc-detail ${enc.boss ? 'boss' : ''}`} style={factionStyle(enc.faction)} aria-live="polite">
            <div className="enc-detail-head">
              <span className="enc-portrait" aria-hidden>
                <WardenPortrait faction={enc.faction} portrait={enc.portrait} fill />
              </span>
              <div>
                <span className="faint">{sel?.chapter.name}</span>
                <h3>
                  {enc.name} {enc.boss && <span className="boss-tag">{t('Boss')}</span>}
                </h3>
                <span className="muted">
                  {enc.title}. {FACTIONS[enc.faction].name}
                  {enc.secondFaction && enc.secondFaction !== 'NEUTRAL' ? t(' and {name}', { name: FACTIONS[enc.secondFaction].name }) : ''}
                </span>
              </div>
            </div>
            <blockquote>“{enc.intro}”</blockquote>
            <dl className="info-grid">
              <dt>{t('Difficulty')}</dt>
              <dd>{t(DIFFICULTY_INFO[enc.difficulty].label)}</dd>
              <dt>{t('Strategy')}</dt>
              <dd>{enc.archetype ?? FACTIONS[enc.faction].archetypes[0].name}</dd>
              {enc.firstWinReward && (
                <>
                  <dt>{t('First clear')}</dt>
                  <dd>
                    <RewardList r={enc.firstWinReward} /> {cleared && <span className="chip">{t('Claimed')}</span>}
                  </dd>
                </>
              )}
              {cleared && (
                <>
                  <dt>{t('Wins')}</dt>
                  <dd className="num">{save.pve.completed[enc.id].wins}</dd>
                </>
              )}
            </dl>
            {enc.special && (
              <div className="special-rules">
                <strong>{t('Special rules')}</strong>
                <ul>
                  {enc.special.description.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
            {unlocked ? (
              <>
                <div className="faint" style={{ margin: 'var(--space-3) 0 var(--space-2)' }}>
                  {t('Your deck')}
                </div>
                <DeckPicker save={save} value={deckId} onChange={setDeckId} />
                <button className="btn btn-primary btn-lg enc-fight" disabled={!validDeck} onClick={fight}>
                  {cleared ? t('Fight again') : t('Fight')}
                </button>
              </>
            ) : (
              <p className="locked-note">
                <Glyph name="shield" size={16} /> {t('Clear the previous encounter to unlock this fight.')}
              </p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
