import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { SET_INFO } from '@/config/economy';
import { FACTIONS } from '@/data/factions';
import { brawlFights, brawlPackSet, brawlProgress, brawlRotation, brawlRotationEnds, } from '@/domain/brawl';
import { brawlFightTitle, brawlTimeLeft } from '@/ui/components/meta/brawlUi';
import { trustedNow } from '@/domain/clock';
import { ScreenHeader } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { DeckPicker, factionStyle, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { audio } from '@/audio/audioService';
import { t } from '@/i18n';
import '@/ui/styles/meta.css';
import '@/ui/styles/brawl.css';

/** Brawl: two fights with special rules against the AI, new ones every three weeks. */
export default function BrawlScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [fightIndex, setFightIndex] = useState(0);
  if (!save) return null;
  const now = trustedNow(save, Date.now());
  const rotation = brawlRotation(now);
  const fights = brawlFights(rotation);
  const progress = brawlProgress(save.profile.brawl, rotation);
  const setId = brawlPackSet();
  const fight = fights[fightIndex] ?? fights[0];
  const validDeck = !!deckId && firstValidDeck(save, deckId) === deckId;

  const play = () => {
    if (!validDeck) return;
    launchMatch({ mode: 'BRAWL', deckId, opponent: fight.opponent, brawlFightId: fight.id }, navigate);
  };

  return (
    <div className="screen brawl-screen">
      <ScreenHeader title={t('Brawl')} subtitle={t('Two fights with special rules against the Expert AI, played with your own deck. New fights every three weeks.')} />
      <div className="brawl-rotation panel">
        <Glyph name="clock" size={18} />
        <span>{t('New fights in {time}', { time: brawlTimeLeft(brawlRotationEnds(rotation) - now) })}</span>
        <span className="brawl-rotation-reward">
          <PackIcon size={16} /> {t('First win in each fight: a free {set} pack', { set: SET_INFO[setId].name })}
        </span>
      </div>

      <div className="play-layout">
        <section className="brawl-fights" role="radiogroup" aria-label={t('Brawl fights')}>
          {fights.map((f, i) => {
            const won = progress.won.includes(f.id);
            const sel = i === fightIndex;
            const opp = f.opponent;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={sel}
                className={`brawl-fight panel ${sel ? 'selected' : ''}`}
                style={factionStyle(opp.faction)}
                onClick={() => (audio.play('click'), setFightIndex(i))}
              >
                <span className="brawl-fight-head">
                  <span className="brawl-fight-portrait" aria-hidden>
                    <WardenPortrait faction={opp.faction} size={56} />
                  </span>
                  <span className="brawl-fight-title">
                    <span className="brawl-kicker">{t('Fight {n}', { n: i + 1 })}</span>
                    <strong>{brawlFightTitle(f)}</strong>
                    <span className="faint">{t('vs {name} · {faction}', { name: opp.name, faction: FACTIONS[opp.faction].name })}</span>
                  </span>
                </span>
                <ul className="brawl-mods">
                  {f.modifiers.map((m) => (
                    <li key={m.id}>
                      <strong>{t(m.name)}</strong>
                      <span className="muted">{t(m.description)}</span>
                    </li>
                  ))}
                </ul>
                <span className={`brawl-reward ${won ? 'is-claimed' : ''}`}>
                  {won ? (
                    <>
                      <Glyph name="star" size={14} /> {t('Pack claimed')}
                    </>
                  ) : (
                    <>
                      <PackIcon size={14} /> {t('First win: a free {set} pack', { set: SET_INFO[setId].name })}
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </section>

        <section className="panel play-side" aria-labelledby="brawl-deck-title">
          <div className="panel-title">
            <span id="brawl-deck-title">{t('Your deck')}</span>
            <Link to="/decks" className="small-link">{t('Manage decks')}</Link>
          </div>
          <DeckPicker save={save} value={deckId} onChange={setDeckId} />
          <button className="btn btn-primary btn-xl play-start" disabled={!validDeck} onClick={play}>
            {t('Start fight {n}', { n: fightIndex + 1 })}
          </button>
          {!validDeck && <p className="deckbox-issue">{t('Choose a valid 30-card deck to play.')}</p>}
        </section>
      </div>
    </div>
  );
}
