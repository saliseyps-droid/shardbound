import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { findPuzzle } from '@/domain/puzzles';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getCardSafe } from '@/data/cards';
import { getTalent } from '@/data/wardenTalents';
import { FACTIONS, WORLD_LORE } from '@/data/factions';
import { KEYWORDS } from '@/data/keywords';
import type { KeywordId } from '@/game/types';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import type { GameEvent, GameState } from '@/engine/types';
import { useMatch, HUMAN, AI } from '@/state/matchStore';
import { useAccount } from '@/state/accountStore';
import { useUi } from '@/state/uiStore';
import { useMatchLaunch } from '@/state/matchLaunch';
import { xpToNext } from '@/domain/progression';
import { CardView, isTouchScreen } from '@/ui/components/CardView';
import { Essence, Gold, ProgressBar, Spinner } from '@/ui/components/common';
import { TUTORIAL_STEPS } from './tutorial';
import { GAME_RULES } from '@/config/gameRules';
import { CROWN_RANK, TIER_COLORS, aiTierOf } from '@/domain/aiRanked';
import { AiRankEmblem, aiRankLabel } from '@/ui/components/meta/aiRankedUi';
import { MatchAchievements } from '@/ui/components/AchievementBadge';
import { t, tn } from '@/i18n';
import '@/ui/styles/aiRanked.css';

/** Focus a button when it mounts without scrolling the overlay (autoFocus would scroll the title away). */
const focusWithoutScroll = (el: HTMLButtonElement | null) => el?.focus({ preventScroll: true });

export function MulliganOverlay({ game }: { game: GameState }) {
  const picks = useMatch((s) => s.mulliganPicks);
  const toggle = useMatch((s) => s.toggleMulligan);
  const confirm = useMatch((s) => s.confirmMulligan);
  const hand = game.players[HUMAN].hand;
  const first = game.firstPlayer === HUMAN;
  const waiting = game.players[HUMAN].mulliganDone;
  if (waiting) {
    return (
      <div className="match-overlay mulligan" role="status">
        <h2>{t('Waiting for your opponent')}</h2>
        <p className="muted">{t('They are still choosing which cards to keep.')}</p>
        <Spinner label={t('Waiting for opponent')} />
      </div>
    );
  }
  return (
    <div className="match-overlay mulligan" role="dialog" aria-label={t('Choose cards to replace')}>
      <h2>{first ? t('You go first') : t('You go second')}</h2>
      <p className="muted">{t('Select any cards you want to replace, then keep your hand.')}{!first && ` ${t('Going second grants an Aether Shard.')}`}</p>
      <div className="mulligan-cards">
        {hand.map((c) => (
          <div key={c.uid} className={`mulligan-card ${picks.includes(c.uid) ? 'is-replaced' : ''}`} data-card-id={c.cardId}>
            <CardView card={c.cardId} variant={c.variant} size="lg" onClick={() => toggle(c.uid)} ariaLabel={picks.includes(c.uid) ? t('{name}, marked for replacement', { name: getCardSafe(c.cardId).name }) : getCardSafe(c.cardId).name} />
            {picks.includes(c.uid) && <span className="replace-mark">{t('Replace')}</span>}
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => void confirm()} ref={focusWithoutScroll}>
        {picks.length ? t('Replace {n} and keep', { n: picks.length }) : t('Keep hand')}
      </button>
    </div>
  );
}

export function TurnBanner() {
  const banner = useMatch((s) => s.banner);
  const [visible, setVisible] = useState<number | null>(null);
  useEffect(() => {
    if (!banner) return;
    setVisible(banner.id);
    const t = setTimeout(() => setVisible(null), 1300);
    return () => clearTimeout(t);
  }, [banner]);
  if (!banner || visible !== banner.id) return null;
  return (
    <div className="turn-banner" role="status" key={banner.id}>
      <span>{banner.text}</span>
    </div>
  );
}

export function CastPreview() {
  const cast = useMatch((s) => s.cast);
  if (!cast) return null;
  return (
    <div className={`cast-preview ${cast.player === AI ? 'from-enemy' : 'from-self'}`} key={cast.id} data-card-id={cast.cardId} role="status" aria-label={t('{who} played {card}', { who: cast.player === AI ? t('Opponent') : t('You'), card: getCardSafe(cast.cardId).name })}>
      <CardView card={cast.cardId} size="lg" />
    </div>
  );
}

export function TurnTimer() {
  const deadline = useMatch((s) => s.turnDeadline);
  const endTurn = useMatch((s) => s.endTurn);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [deadline]);
  useEffect(() => {
    if (deadline && now >= deadline) endTurn();
  }, [now, deadline, endTurn]);
  if (!deadline) return null;
  const left = Math.max(0, Math.ceil((deadline - now) / 1000));
  const warn = GAME_RULES.turnTimerWarningSeconds;
  if (left > warn) return null;
  return (
    <div className={`turn-timer ${left <= 10 ? 'urgent' : ''}`} role="timer" aria-live="polite">
      <span className="num">{left}s</span>
      <span className="turn-timer-rope" style={{ width: `${(left / warn) * 100}%` }} />
    </div>
  );
}

/** Marks a card inside a log line; BattleLog turns marked ids into highlighted, hoverable names. */
const CARD_MARK = '\u0001';

function describeEvent(e: GameEvent, game: GameState, spectating = false): string | null {
  // A spectator is neither player: both are named.
  const who = (p: number) => (p === HUMAN && !spectating ? t('You') : game.players[p as 0 | 1].hero.name);
  const name = (id: string) => `${CARD_MARK}${id}${CARD_MARK}`;
  switch (e.type) {
    case 'CARD_PLAYED':
      return t('{who} played {card}', { who: who(e.player), card: name(e.cardId) });
    case 'UNIT_DIED':
      return t('{card} was destroyed', { card: name(e.cardId) });
    case 'HERO_POWER_USED':
      return t('{who} used {ability}', { who: who(e.player), ability: getTalent(e.abilityId)?.name ?? t('a Warden ability') });
    case 'HERO_ABILITY_TRIGGERED':
      return t('{ability} triggered', { ability: getTalent(e.abilityId)?.name ?? t('A Warden ability') });
    case 'TURN_STARTED':
      return e.player === HUMAN && !spectating ? t('— Your turn —') : t("— {name}'s turn —", { name: game.players[e.player as 0 | 1].hero.name });
    case 'FATIGUE':
      return t('{who} took {n} fatigue damage', { who: who(e.player), n: e.damage });
    case 'CARD_BURNED':
      return t('{card} burned (hand full)', { card: name(e.cardId) });
    case 'UNIT_ATTACKED':
      return null;
    case 'RELIC_BROKEN':
      return t('{card} broke', { card: name(e.cardId) });
    case 'TRIGGER_LIMIT_REACHED':
      return t('Too many triggers — chain stopped');
    default:
      return null;
  }
}

type LogLine = { seq: number; text: string };

const LOG_PREVIEW_W = 220;

/** The hovered card from the log, drawn large to the left of the log (portal: panels clip). */
function LogCardPreview({ id, rect }: { id: string; rect: DOMRect }) {
  const h = LOG_PREVIEW_W * 1.4;
  const top = Math.max(8, Math.min(window.innerHeight - h - 8, rect.top + rect.height / 2 - h / 2));
  const left = Math.max(8, rect.left - LOG_PREVIEW_W - 24);
  return createPortal(
    <div className="log-card-preview" style={{ top, left }} aria-hidden>
      <CardView card={id} width={LOG_PREVIEW_W} />
    </div>,
    document.body,
  );
}

/** A log line with its card names highlighted; hovering one shows the card. */
function LogText({ text, onHover }: { text: string; onHover: (h: { id: string; rect: DOMRect } | null) => void }) {
  const parts = text.split(CARD_MARK);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            className="log-card"
            data-card-id={part}
            onMouseEnter={(e) => !isTouchScreen() && onHover({ id: part, rect: e.currentTarget.getBoundingClientRect() })}
            onMouseLeave={() => onHover(null)}
            // Tapping a card name (phones have no hover) opens it in the inspector.
            onClick={() => useUi.getState().inspectCard(part)}
          >
            {getCardSafe(part).name}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * The whole match, line by line. The engine keeps only a rolling window of events,
 * so lines are collected here as they arrive and kept for the rest of the match.
 */
export function BattleLog({ game }: { game: GameState }) {
  const startedAt = useMatch((s) => s.startedAt);
  const spectating = useMatch((s) => s.config?.online === 'spectator');
  const store = useRef<{ match: unknown; lastSeq: number; lines: LogLine[] }>({ match: null, lastSeq: -1, lines: [] });
  const box = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [hover, setHover] = useState<{ id: string; rect: DOMRect } | null>(null);
  const memo = store.current;
  if (memo.match !== startedAt) Object.assign(memo, { match: startedAt, lastSeq: -1, lines: [] });
  for (const e of game.log) {
    if (e.seq <= memo.lastSeq) continue;
    memo.lastSeq = e.seq;
    const text = describeEvent(e, game, spectating);
    if (text) memo.lines.push({ seq: e.seq, text });
  }
  const lines = memo.lines;
  // Follow new lines unless the player scrolled up to read older ones.
  useLayoutEffect(() => {
    if (stick.current && box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [lines.length]);
  return (
    <div
      className="battle-log"
      ref={box}
      aria-label={t('Battle log')}
      aria-live="polite"
      tabIndex={0}
      onScroll={(e) => {
        const el = e.currentTarget;
        stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        setHover(null);
      }}
    >
      {lines.map((l) => (
        <div key={l.seq} className="log-line">
          <LogText text={l.text} onHover={setHover} />
        </div>
      ))}
      {hover && <LogCardPreview id={hover.id} rect={hover.rect} />}
    </div>
  );
}

/** A bobbing arrow over (or under, near the top) the element the current tutorial step is about. */
function TutorialPointer({ target, card }: { target: string; card?: string }) {
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = (card && document.querySelector(`[data-tutorial="${target}"] [data-card-id="${card}"]`)) || document.querySelector(`[data-tutorial="${target}"]`);
      const r = el?.getBoundingClientRect();
      if (r && r.width > 0) {
        const below = r.top < window.innerHeight * 0.3;
        const next = { x: Math.round(r.left + r.width / 2), y: Math.round(below ? r.bottom + 10 : r.top - 10), below };
        setPos((p) => (p && p.x === next.x && p.y === next.y && p.below === next.below ? p : next));
      } else setPos(null);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [target, card]);
  if (!pos) return null;
  return (
    <div className={`tutorial-pointer ${pos.below ? 'below' : ''}`} style={{ left: pos.x, top: pos.y }} aria-hidden>
      <svg viewBox="0 0 24 24" width="34" height="34">
        <path d="M12 22 3 11h5V2h8v9h5z" fill="currentColor" />
      </svg>
    </div>
  );
}

const HIGHLIGHT_LOOK = 'outline: 3px solid var(--cyan); outline-offset: 6px; box-shadow: 0 0 30px rgba(114,223,230,.6); border-radius: 8px;';
/** The hand strip spans the whole table, so its highlight is a box that hugs just the fanned cards. */
function highlightCss(target: string): string {
  if (target === 'hand')
    return `[data-tutorial="hand"]::before { content: ''; position: absolute; left: 50%; bottom: 0; height: 100%; width: calc((var(--n) - 1) * var(--spread) + var(--card-w)); transform: translateX(-50%); pointer-events: none; ${HIGHLIGHT_LOOK} }`;
  return `[data-tutorial="${target}"] { ${HIGHLIGHT_LOOK} }`;
}

/** Keywords a new player meets first; the full list is in the Lore screen. */
const INTRO_KEYWORDS: KeywordId[] = ['GUARD', 'RUSH', 'SWIFT', 'BARRIER', 'WARD', 'DRAIN', 'BURN', 'FREEZE', 'ON_DEPLOY', 'LAST_BREATH'];

/** Before the tutorial: the world, the six factions and the keywords on the cards. */
function TutorialIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="tutorial-intro-backdrop" role="dialog" aria-modal="true" aria-labelledby="tut-intro-title">
      <div className="tutorial-intro panel">
        <div className="tutorial-intro-scroll">
          <h2 id="tut-intro-title">{WORLD_LORE.title}</h2>
          <div className="tutorial-intro-cols">
            <section>
              {WORLD_LORE.paragraphs.map((p) => (
                <p key={p} className="tutorial-intro-lore">{p}</p>
              ))}
              <h3>{t('The six factions')}</h3>
              <ul className="tutorial-intro-factions">
                {PLAYABLE_FACTIONS.map((f) => (
                  <li key={f} style={{ '--fc': FACTIONS[f].colors.primary } as CSSProperties}>
                    <WardenPortrait faction={f} size={34} />
                    <span>
                      <strong>{FACTIONS[f].name}</strong>
                      <em className="faint">“{FACTIONS[f].motto}”</em>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>{t('Keywords on the cards')}</h3>
              <dl className="tutorial-intro-keywords">
                {INTRO_KEYWORDS.map((k) => (
                  <div key={k}>
                    <dt>
                      <span aria-hidden>{KEYWORDS[k].icon}</span> {KEYWORDS[k].name}
                    </dt>
                    <dd className="muted">{KEYWORDS[k].definition}</dd>
                  </div>
                ))}
              </dl>
              <p className="faint">{t('Every keyword is also explained when you inspect a card, and in Lore.')}</p>
            </section>
          </div>
        </div>
        <div className="tutorial-intro-actions">
          <button className="btn btn-primary btn-lg" onClick={onStart} autoFocus>
            {t('Start the lesson')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TutorialOverlay() {
  const startedAt = useMatch((s) => s.startedAt);
  const [introFor, setIntroFor] = useState<number | null>(null);
  const step = useMatch((s) => s.tutorialStep);
  const next = useMatch((s) => s.nextTutorialStep);
  const mode = useMatch((s) => s.config?.mode);
  const phase = useMatch((s) => s.phase);
  if (mode !== 'TUTORIAL' || phase === 'ended' || step >= TUTORIAL_STEPS.length) return null;
  // First the world and the keywords, then the lesson (once per tutorial match).
  if (step === 0 && introFor !== startedAt) return <TutorialIntro onStart={() => setIntroFor(startedAt)} />;
  const s = TUTORIAL_STEPS[step];
  const text = isTouchScreen() && s.touchText ? s.touchText : s.text;
  return (
    <>
      {s.highlight && <style>{highlightCss(s.highlight)}</style>}
      {s.highlight && <TutorialPointer key={s.id} target={s.highlight} card={s.pointAt} />}
      <div className={`tutorial-box panel ${s.highlight === 'enemy-hero' ? 'is-hero-step' : ''}`} role="dialog" aria-live="polite" aria-label={t('Tutorial')}>
        <span className="faint num">
          {t('Step {n} of {total}', { n: step + 1, total: TUTORIAL_STEPS.length })}
        </span>
        <h4>{s.title}</h4>
        <p>{text}</p>
        {!s.done && (
          <button className="btn btn-cyan btn-sm" onClick={next} ref={focusWithoutScroll}>
            {t('Next')}
          </button>
        )}
      </div>
    </>
  );
}

/**
 * A heraldic wing in outline: a fan of slim feathers from the shoulder, long flight feathers under a row of
 * shorter coverts. Its root is on the right; the right wing is mirrored.
 */
function feather(rootX: number, rootY: number, angleDeg: number, length: number, width: number): string {
  const a = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const tx = rootX + ux * length;
  const ty = rootY + uy * length;
  const mx = rootX + ux * length * 0.55;
  const my = rootY + uy * length * 0.55;
  const f = (n: number) => n.toFixed(1);
  // Slim leaf: widest a little past the middle, pointed tip.
  return `M${f(rootX)} ${f(rootY)} Q${f(mx - uy * width)} ${f(my + ux * width)} ${f(tx)} ${f(ty)} Q${f(mx + uy * width)} ${f(my - ux * width)} ${f(rootX)} ${f(rootY)}`;
}
const WING_FEATHERS = [
  // Flight feathers: from up-and-out to down-and-out, shorter towards the bottom.
  ...Array.from({ length: 7 }, (_, i) => ({ d: feather(196, 46, 196 - i * 9, 182 - i * 15, 8), kind: 'primary', i })),
  // Coverts over their roots.
  ...Array.from({ length: 5 }, (_, i) => ({ d: feather(198, 44, 190 - i * 11, 92 - i * 8, 9), kind: 'covert', i: i + 7 })),
];

function ResultsWing({ side }: { side: 'left' | 'right' }) {
  return (
    <svg className={`results-wing ${side}`} viewBox="0 -20 204 150" aria-hidden>
      {WING_FEATHERS.map((w) => (
        <path key={w.i} className={w.kind} d={w.d} pathLength={1} style={{ '--i': w.i } as CSSProperties} />
      ))}
      <path className="shoulder" d="M198 44 C170 18 120 6 70 14" pathLength={1} />
    </svg>
  );
}

/** The result title, its letters dropping in one by one, between two outline wings. */
function ResultsTitle({ text, outcome }: { text: string; outcome: 'win' | 'loss' | 'draw' }) {
  return (
    <div className={`results-heading is-${outcome}`}>
      <ResultsWing side="left" />
      <h1 className="results-title" aria-label={text}>
        {[...text].map((ch, i) => (
          <span key={i} aria-hidden style={{ '--i': i } as CSSProperties}>
            {ch === ' ' ? '\u00a0' : ch}
          </span>
        ))}
      </h1>
      <ResultsWing side="right" />
    </div>
  );
}

/** The end of a watched match: who won, and the way back. */
export function SpectatorResults({ game, onLeave }: { game: GameState; onLeave: () => void }) {
  const winner = game.winner === 0 || game.winner === 1 ? game.players[game.winner].hero.name : null;
  const text = winner ? t('{name} wins', { name: winner }) : t('Draw');
  return (
    <div className="match-overlay results is-draw" role="dialog" aria-label={text}>
      <ResultsTitle text={text} outcome="draw" />
      <p className="muted">{game.endReason === 'CONCEDE' ? t('By concession.') : game.endReason === 'DISCONNECT' ? t('A player lost the connection.') : t('Thanks for watching.')}</p>
      <div className="results-actions">
        <button className="btn btn-primary" onClick={onLeave} autoFocus>
          {t('Stop watching')}
        </button>
      </div>
    </div>
  );
}

export function ResultsOverlay({ game }: { game: GameState }) {
  const rewards = useMatch((s) => s.rewards);
  const config = useMatch((s) => s.config);
  const startedAt = useMatch((s) => s.startedAt);
  const start = useMatch((s) => s.start);
  const profile = useAccount((s) => s.save?.profile);
  const quests = useAccount((s) => s.save?.quests.active ?? []);
  const navigate = useNavigate();
  const [endedAt] = useState(Date.now());
  const win = game.winner === HUMAN;
  const draw = game.winner === 'DRAW';
  const stats = game.players[HUMAN].stats;
  const mins = Math.max(1, Math.round((endedAt - startedAt) / 60000));
  const rematch = () => {
    if (!config) return;
    useMatchLaunch.getState().setConfig(config);
    void start(config);
  };
  // Leaving the board unmounts it; its cleanup resets the match store.
  const exit = (path: string) => navigate(path);
  return (
    <div className={`match-overlay results ${win ? 'is-win' : draw ? 'is-draw' : 'is-loss'}`} role="dialog" aria-label={win ? t('Victory') : draw ? t('Draw') : t('Defeat')}>
      <ResultsTitle text={config?.mode === 'PUZZLE' ? (win ? t('Puzzle solved!') : t('Not solved')) : win ? t('Victory') : draw ? t('Draw') : t('Defeat')} outcome={win ? 'win' : draw ? 'draw' : 'loss'} />
      <p className="muted">
        {config?.mode === 'PUZZLE' ? t('Daily puzzle: {name}', { name: t(findPuzzle(config.puzzle?.id ?? '')?.name ?? '') }) : config?.mode === 'ARENA' ? t('Arena match against {name}', { name: config.opponent.name }) : config?.mode === 'DUNGEON' ? t('Dungeon match against {name}', { name: config.opponent.name }) : config?.mode === 'TOURNAMENT' ? t('Tournament match against {name}', { name: config.opponent.name }) : config?.mode === 'RANKED' ? t('Ranked match against {name}', { name: config.opponent.name }) : config?.mode === 'AI_RANKED' ? t('Ranked match against the AI {name}', { name: config.opponent.name }) : config?.online ? t('Online match against {name}', { name: config.opponent.name }) : t(`Against {name} on ${config?.opponent.difficulty.toLowerCase()} difficulty`, { name: String(config?.opponent.name) })}
        {config?.mode === 'PUZZLE' ? '' : game.endReason === 'CONCEDE' ? t(', by concession') : game.endReason === 'DISCONNECT' ? t(', connection lost') : ''}
      </p>
      <div className="results-grid">
        <div className="panel results-stats">
          <h4>{t('Battle report')}</h4>
          <dl>
            <dt>{t('Turns played')}</dt>
            <dd className="num">{Math.ceil(game.turn / 2)}</dd>
            <dt>{t('Damage dealt')}</dt>
            <dd className="num">{stats.damageDealt}</dd>
            <dt>{t('Cards played')}</dt>
            <dd className="num">{stats.cardsPlayed}</dd>
            <dt>{t('Units destroyed')}</dt>
            <dd className="num">{stats.unitsDestroyed}</dd>
            <dt>{t('Healing')}</dt>
            <dd className="num">{stats.healingDone}</dd>
            <dt>{t('Duration')}</dt>
            <dd className="num">{t('{n} min', { n: mins })}</dd>
          </dl>
        </div>
        <div className="panel results-rewards">
          <h4>{t('Rewards')}</h4>
          {!rewards && <p className="muted">{t('Recording result…')}</p>}
          {rewards && rewards.lines.length === 0 && (
            <p className="muted">
              {config?.mode === 'PUZZLE' ? (win ? t('You already solved today’s puzzle. Come back tomorrow for a new one.') : t('Solve it to earn today’s reward. You can try as often as you like.')) : t('No rewards — matches shorter than 3 turns don’t count.')}
            </p>
          )}
          {rewards?.lines.map((l) => (
            <div key={l.label} className="reward-line">
              <span>{t(l.label)}</span>
              <span className="reward-values">
                {l.gold ? <Gold amount={l.gold} /> : null}
                {l.essence ? <Essence amount={l.essence} /> : null}
                {l.xp ? <span className="num xp-text">{t('+{n} XP', { n: l.xp })}</span> : null}
                {l.packs ? <span className="chip">{tn(l.packs.amount, '+{n} pack', '+{n} packs')}</span> : null}
              </span>
            </div>
          ))}
          {rewards && profile && (
            <div className="results-xp">
              <div className="xp-row">
                <span className="level-gem num">{profile.level}</span>
                <ProgressBar value={profile.xp} max={xpToNext(profile.level) || 1} gold label={t('Experience')} />
              </div>
              <div className="xp-numbers faint num">
                {(() => {
                  const gained = rewards.xp;
                  const need = xpToNext(profile.level);
                  const total = need ? t('{xp} / {need} XP', { xp: profile.xp, need }) : t('Max level');
                  return gained > 0 ? `${t('+{n} XP', { n: gained })} · ${total}` : total;
                })()}
              </div>
              {rewards.levelUps.map((lu) => (
                <div key={lu.level} className="level-up">
                  {t('Level {n} reached!', { n: lu.level })}{' '}
                  {lu.rewards.map((r, i) => (
                    <span key={i} className="chip">
                      {r.kind === 'GOLD' ? t('{n} Gold', { n: r.amount }) : r.kind === 'ESSENCE' ? t('{n} Essence', { n: r.amount }) : r.kind === 'PACK' ? tn(r.amount, '{n} pack', '{n} packs') : r.kind === 'CARD_BACK' ? t('New card back') : t('Title: {title}', { title: t(r.title) })}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
          {rewards?.firstClear && <p className="gold-text">{t('Encounter cleared for the first time!')}</p>}
          {rewards?.achievements && rewards.achievements.length > 0 && <MatchAchievements ids={rewards.achievements} />}
          {rewards?.aiRanked && (() => {
            const a = rewards.aiRanked;
            const crown = a.after.rank >= CROWN_RANK;
            return (
              <div className="air-result" style={{ '--tc': TIER_COLORS[aiTierOf(a.after.rank)] } as CSSProperties}>
                <AiRankEmblem rank={a.after.rank} size={52} />
                <div>
                  {a.rankChange === 'UP' && <span className="air-rankup">{t('Rank up: {rank}!', { rank: aiRankLabel(a.after.rank) })}</span>}
                  {a.rankChange === 'DOWN' && <span className="down">{t('Rank lost: {rank}', { rank: aiRankLabel(a.after.rank) })}</span>}
                  {a.rankChange === 'NONE' && <span>{aiRankLabel(a.after.rank)}</span>}
                  <span className="num">
                    {a.starDelta > 0 ? (
                      <strong className="up">{crown && a.rankChange === 'NONE' ? tn(a.starDelta, '+{n} Crown point', '+{n} Crown points') : tn(a.starDelta, '+{n} star', '+{n} stars')}</strong>
                    ) : a.starDelta < 0 ? (
                      <strong className="down">{tn(-a.starDelta, '−{n} star', '−{n} stars')}</strong>
                    ) : (
                      <span className="faint">{crown ? t('No Crown points lost') : t('No star change')}</span>
                    )}
                    <span className="faint" aria-hidden> · </span>
                    <span className="faint">{crown ? t('{n} Crown points', { n: a.after.stars }) : t('{n} of {max} stars', { n: a.after.stars, max: 3 })}</span>
                  </span>
                  {a.tierReached && <span className="gold-text">{t('{tier} reached for the first time!', { tier: t(a.tierReached) })}</span>}
                </div>
              </div>
            );
          })()}
          {rewards?.ratingChange !== undefined && (
            <p className="rating-change">
              {t('Ranked rating')} <strong className={rewards.ratingChange >= 0 ? 'up' : 'down'}>{rewards.ratingChange >= 0 ? '+' : ''}{rewards.ratingChange}</strong> → {rewards.ratingAfter}
            </p>
          )}
        </div>
        {config?.mode !== 'TUTORIAL' && config?.mode !== 'PUZZLE' && quests.length > 0 && (
          <div className="panel results-quests">
            <h4>{t('Quest progress')}</h4>
            {quests.map((q) => (
              <div key={q.id} className="quest-mini">
                <span>
                  {t(q.name)} {q.completed && !q.claimed && <span className="badge-new">{t('Complete')}</span>}
                </span>
                <ProgressBar value={q.progress} max={q.target} label={t(q.name)} />
                <span className="faint num">
                  {q.progress}/{q.target}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="results-actions">
        {config?.mode === 'TUTORIAL' ? (
          <div className="tutorial-next">
            <p className="muted">{t('You know the basics. Where to next?')}</p>
            <div className="tutorial-next-actions">
              <button className="btn btn-primary" onClick={() => exit('/campaign')} ref={focusWithoutScroll}>
                {t('Start the campaign')}
              </button>
              <button className="btn" onClick={() => exit('/packs')}>
                {t('Open your packs')}
              </button>
              <button className="btn" onClick={() => exit('/decks')}>
                {t('Build a deck')}
              </button>
              <button className="btn" onClick={() => exit('/')}>
                {t('Home')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {config?.mode === 'ARENA' || config?.mode === 'DUNGEON' ? (
              <button className="btn btn-primary btn-lg" onClick={() => exit(config.mode === 'ARENA' ? '/arena' : '/dungeon')} ref={focusWithoutScroll}>
                {config.mode === 'ARENA' ? t('Back to Arena') : t('Back to the Dungeon')}
              </button>
            ) : (
            <>
            <button className="btn btn-ghost" onClick={() => exit(config?.mode === 'PVE' ? '/campaign' : config?.mode === 'TOURNAMENT' ? '/tournament' : config?.mode === 'RANKED' ? '/ranked' : config?.mode === 'AI_RANKED' ? '/ai-ranked' : config?.mode === 'BRAWL' ? '/brawl' : config?.online ? '/online' : '/play')}>
              {config?.mode === 'PVE' ? t('Back to campaign') : config?.mode === 'TOURNAMENT' ? t('Back to bracket') : config?.mode === 'RANKED' ? t('Ranked') : config?.mode === 'AI_RANKED' ? t('Next ranked match') : config?.mode === 'BRAWL' ? t('Back to Brawl') : config?.mode === 'PUZZLE' ? t('Back to Play') : config?.online ? t('New online match') : t('Choose opponent')}
            </button>
            {/* A ranked rematch would replay the same rival; the ladder screen rolls a new one. */}
            {!config?.online && config?.mode !== 'TOURNAMENT' && config?.mode !== 'AI_RANKED' && (
              <button className="btn" onClick={rematch}>
                {config?.mode === 'PUZZLE' ? t('Try again') : t('Rematch')}
              </button>
            )}
            <button className="btn btn-primary btn-lg" onClick={() => exit(config?.mode === 'TOURNAMENT' ? '/tournament' : '/')} ref={focusWithoutScroll}>
              {t('Continue')}
            </button>
            </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
