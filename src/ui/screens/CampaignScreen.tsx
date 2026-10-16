import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '@/state/accountStore';
import { launchMatch } from '@/state/matchLaunch';
import { CAMPAIGNS, findEncounter, type CampaignDef, type Chapter, type OpponentReward } from '@/data/opponents';
import { FACTIONS } from '@/data/factions';
import { SET_INFO } from '@/config/economy';
import { getCardSafe } from '@/data/cards';
import { ProgressBar, ScreenHeader, Essence, Gold } from '@/ui/components/common';
import { Glyph, PackIcon } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { DeckPicker, DIFFICULTY_INFO, factionStyle, firstValidDeck } from '@/ui/components/meta/MetaWidgets';
import { campaignProgress, isCleared, isUnlocked, nextEncounter } from '@/ui/components/meta/campaign';
import { audio } from '@/audio/audioService';
import { gameService } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { canBuyChapter, isChapterBought } from '@/domain/campaignUnlock';
import { Cinematic } from '@/ui/components/Cinematic';
import { hasNightmare, nightmareBest, nightmareCleared, nightmareLines, nightmareOpen, nightmareOpponent, NIGHTMARE_TIERS, type NightmareTier } from '@/data/nightmare';
import '@/ui/styles/meta.css';
import { t } from '@/i18n';

/** At most this many chapters are shown at once; later ones go on further tabs. */
const CHAPTERS_PER_TAB = 3;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const tabsOf = (chapters: Chapter[]) =>
  Array.from({ length: Math.ceil(chapters.length / CHAPTERS_PER_TAB) }, (_, i) => {
    const first = i * CHAPTERS_PER_TAB;
    const last = Math.min(chapters.length, first + CHAPTERS_PER_TAB) - 1;
    return { first, last, chapters: chapters.slice(first, last + 1) };
  });
const tabOf = (chapters: Chapter[], encounterId: string | null) => {
  const ci = chapters.findIndex((c) => c.encounters.some((e) => e.id === encounterId));
  return ci < 0 ? 0 : Math.floor(ci / CHAPTERS_PER_TAB);
};
/** The campaign shown last, so coming back from a fight opens the same one. */
let lastCampaign: CampaignDef['id'] = 'main';

function RewardList({ r, claimed }: { r: OpponentReward; claimed?: boolean }) {
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
      {r.cardId ? (
        <span className={`chip ${r.variant && r.variant !== 'NORMAL' ? `chip-${r.variant.toLowerCase()}` : ''}`}>
          {r.variant === 'FOIL' ? `${t('Foil')} ` : r.variant === 'PRISMATIC' ? `${t('Prismatic')} ` : ''}
          {getCardSafe(r.cardId).name}
        </span>
      ) : null}
      {claimed && <span className="chip">{t('Claimed')}</span>}
    </span>
  );
}

export default function CampaignScreen() {
  const save = useAccount((s) => s.save);
  const navigate = useNavigate();
  // A link can open a given campaign (?c=inferno, from the Home banner).
  const [params] = useSearchParams();
  const [campId, setCampId] = useState(() => {
    const asked = params.get('c');
    if (asked && CAMPAIGNS.some((c) => c.id === asked)) lastCampaign = asked as CampaignDef['id'];
    return lastCampaign;
  });
  const camp = CAMPAIGNS.find((c) => c.id === campId) ?? CAMPAIGNS[0];
  const TABS = tabsOf(camp.chapters);
  const firstOpen = (c: CampaignDef) => (save ? nextEncounter(save, c.chapters)?.encounter.id : undefined) ?? c.chapters[0].encounters[0].id;
  const [selectedId, setSelectedId] = useState<string | null>(() => (save ? firstOpen(camp) : null));
  const [deckId, setDeckId] = useState<string | null>(() => (save ? firstValidDeck(save, save.profile.selectedDeckId) : null));
  const [tab, setTab] = useState(() => tabOf(camp.chapters, selectedId));
  const [cinematic, setCinematic] = useState<string | null>(null);
  // A beaten boss can be fought again on Nightmare I or II (0 = the normal fight).
  const [tier, setTier] = useState<0 | NightmareTier>(0);
  useEffect(() => setTier(0), [selectedId]);
  // A campaign's intro plays the first time it is opened, its outro once every fight is won.
  const seen = save?.pve.seenCinematics ?? [];
  const allCleared = !!save && camp.chapters.every((ch) => ch.encounters.every((e) => !!save.pve.completed[e.id]));
  const autoCinematic = camp.outro && allCleared && !seen.includes(camp.outro) ? camp.outro : camp.intro && !seen.includes(camp.intro) && !allCleared ? camp.intro : null;
  useEffect(() => {
    if (autoCinematic && !cinematic) setCinematic(autoCinematic);
  }, [autoCinematic, cinematic]);
  if (!save) return null;
  const prog = campaignProgress(save, camp.chapters);
  const pickCampaign = (c: CampaignDef) => {
    if (c.id === campId) return;
    audio.play('click');
    lastCampaign = c.id;
    setCampId(c.id);
    const id = firstOpen(c);
    setSelectedId(id);
    setTab(tabOf(c.chapters, id));
  };
  const sel = selectedId ? findEncounter(selectedId) : undefined;
  const enc = sel?.encounter;
  const unlocked = enc ? isUnlocked(save, enc.id) : false;
  const cleared = enc ? isCleared(save, enc.id) : false;
  const validDeck = deckId && firstValidDeck(save, deckId) === deckId;
  const nightmares = !!enc && hasNightmare(enc) && cleared;
  const nm = nightmares && tier > 0 && nightmareOpen(save, enc!.id, tier as NightmareTier) ? (tier as NightmareTier) : 0;
  const foe = enc && nm ? nightmareOpponent(enc, nm) : enc;
  const foeCleared = !!foe && !!save.pve.completed[foe.id];

  const buyChapter = (chapterId: string) => {
    const res = gameService.buyChapter(chapterId);
    if (res.ok) {
      audio.play('coin');
      toast(t('Chapter unlocked'), 'reward');
    } else {
      audio.play('error');
      toast(res.error, 'error');
    }
  };
  const forSale = sel && !isChapterBought(save, sel.chapter) ? sel.chapter : null;

  // Some bosses (Sali) get a short cinematic right before the fight.
  const [preFight, setPreFight] = useState<string | null>(null);
  const startFight = () => {
    if (!foe) return;
    launchMatch({ mode: 'PVE', deckId, opponent: foe, encounterId: foe.id }, navigate);
  };
  const fight = () => {
    if (!foe || !unlocked || !validDeck) return;
    if (foe.preCinematic) setPreFight(foe.preCinematic);
    else startFight();
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
      <div className="camp-switch" role="tablist" aria-label={t('Campaign')}>
        {CAMPAIGNS.map((c) => {
          const p = campaignProgress(save, c.chapters);
          return (
            <button key={c.id} type="button" role="tab" aria-selected={c.id === campId} className={`camp-pick camp-pick-${c.id} ${c.id === campId ? 'is-active' : ''}`} onClick={() => pickCampaign(c)}>
              <strong>{t(c.name)}</strong>
              <span className="num faint">
                {p.cleared} / {p.total}
              </span>
            </button>
          );
        })}
      </div>
      {(camp.intro || camp.outro) && (
        <div className="camp-cine">
          {camp.intro && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCinematic(camp.intro!)}>
              ▶ {t('Watch the intro')}
            </button>
          )}
          {camp.outro && allCleared && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCinematic(camp.outro!)}>
              ▶ {t('Watch the ending')}
            </button>
          )}
        </div>
      )}
      {preFight && (
        <Cinematic
          key={preFight}
          id={preFight}
          onDone={() => {
            gameService.markCinematicSeen(preFight);
            setPreFight(null);
            startFight();
          }}
        />
      )}
      {cinematic && (
        <Cinematic
          key={cinematic}
          id={cinematic}
          onDone={() => {
            gameService.markCinematicSeen(cinematic);
            setCinematic(null);
          }}
        />
      )}
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
                    {!isChapterBought(save, ch) ? <Gold amount={ch.price!} size={15} /> : chLocked ? t('Locked') : `${chCleared} / ${ch.encounters.length}`}
                  </span>
                </header>
                <p className="muted">{ch.description}</p>
                <ol className="enc-path">
                  {ch.encounters.map((e, i) => {
                    const done = isCleared(save, e.id);
                    const open = isUnlocked(save, e.id);
                    const state = done ? 'done' : open ? 'open' : 'locked';
                    const best = hasNightmare(e) ? nightmareBest(save, e.id) : 0;
                    return (
                      <li key={e.id} className="enc-step">
                        {i > 0 && <span className={`enc-link ${isCleared(save, ch.encounters[i - 1].id) ? 'lit' : ''}`} aria-hidden />}
                        <span className="enc-node-wrap">
                          <button
                            type="button"
                            className={`enc-node ${state} ${e.boss ? 'boss' : ''} ${selectedId === e.id ? 'selected' : ''}`}
                            style={factionStyle(e.faction)}
                            onClick={() => (audio.play('click'), setSelectedId(e.id))}
                            aria-pressed={selectedId === e.id}
                            aria-label={`${e.name}${e.boss ? t(', boss') : ''}, ${state === 'done' ? t('cleared') : state === 'open' ? t('available') : t('locked')}`}
                          >
                            {state === 'locked' ? <Glyph name="shield" size={e.boss ? 30 : 24} /> : <WardenPortrait faction={e.faction} portrait={e.portrait} fill />}
                          </button>
                          {/* Outside the hexagon: the portrait fills the node and its clip would hide the mark. */}
                          {done && <span className="enc-check" aria-hidden>✓</span>}
                          {best > 0 && (
                            <span className="enc-nm" title={best === 2 ? t('Nightmare II beaten') : t('Nightmare I beaten')}>
                              {best === 2 ? 'II' : 'I'}
                            </span>
                          )}
                        </span>
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
          <aside className={`panel enc-detail ${enc.boss ? 'boss' : ''} ${nm ? 'is-nightmare' : ''}`} style={factionStyle(enc.faction)} aria-live="polite">
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
            {nightmares && (
              <div className="nm-tiers" role="radiogroup" aria-label={t('Difficulty')}>
                {([0, ...NIGHTMARE_TIERS] as const).map((k) => {
                  const open = k === 0 || nightmareOpen(save, enc.id, k);
                  return (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={nm === k}
                      className={`nm-tier ${k ? 'is-nm' : ''} ${nm === k ? 'is-active' : ''}`}
                      disabled={!open}
                      title={open ? undefined : t('Beat Nightmare I to open Nightmare II.')}
                      onClick={() => (audio.play('click'), setTier(k))}
                    >
                      {k === 0 ? t('Normal') : k === 1 ? t('Nightmare I') : t('Nightmare II')}
                      {k > 0 && nightmareCleared(save, enc.id, k as NightmareTier) && <span aria-label={t('cleared')}> ✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
            <dl className="info-grid">
              <dt>{t('Difficulty')}</dt>
              <dd>{nm === 1 ? t('Nightmare I') : nm === 2 ? t('Nightmare II') : t(DIFFICULTY_INFO[enc.difficulty].label)}</dd>
              <dt>{t('Strategy')}</dt>
              <dd>{enc.archetype ? t(enc.archetype) : FACTIONS[enc.faction].archetypes[0].name}</dd>
              {foe?.firstWinReward && (
                <>
                  <dt>{t('First clear')}</dt>
                  <dd>
                    <RewardList r={foe.firstWinReward} claimed={foeCleared} />
                  </dd>
                </>
              )}
              {foeCleared && (
                <>
                  <dt>{t('Wins')}</dt>
                  <dd className="num">{save.pve.completed[foe!.id].wins}</dd>
                </>
              )}
            </dl>
            {nm ? (
              <div className="special-rules nm-rules">
                <strong>{nm === 2 ? t('Nightmare II: the boss is stronger and cursed') : t('Nightmare I: the boss is stronger')}</strong>
                <ul>
                  {nightmareLines(enc, nm).map((l) => (
                    <li key={l.key}>{t(l.key, { ...l.params, cards: (l.card ?? []).map((id) => getCardSafe(id).name).join(', ') })}</li>
                  ))}
                </ul>
              </div>
            ) : enc.special && (
              <div className="special-rules">
                <strong>{t('Special rules')}</strong>
                <ul>
                  {enc.special.description.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
            {forSale ? (
              canBuyChapter(save, forSale) ? (
                <>
                  <p className="muted">{t('This chapter opens for {n} Gold.', { n: forSale.price! })}</p>
                  <button className="btn btn-primary btn-lg enc-fight" disabled={save.profile.gold < forSale.price!} onClick={() => buyChapter(forSale.id)}>
                    {t('Unlock chapter')} <Gold amount={forSale.price!} size={16} />
                  </button>
                </>
              ) : (
                <p className="locked-note">
                  <Glyph name="shield" size={16} /> {t('Clear the previous chapter, then unlock this one for {n} Gold.', { n: forSale.price! })}
                </p>
              )
            ) : unlocked ? (
              <>
                <div className="faint" style={{ margin: 'var(--space-3) 0 var(--space-2)' }}>
                  {t('Your deck')}
                </div>
                <DeckPicker save={save} value={deckId} onChange={setDeckId} />
                <button className="btn btn-primary btn-lg enc-fight" disabled={!validDeck} onClick={fight}>
                  {nm ? (foeCleared ? t('Face the Nightmare again') : t('Face the Nightmare')) : cleared ? t('Fight again') : t('Fight')}
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
