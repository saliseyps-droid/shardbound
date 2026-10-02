import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCardSafe } from '@/data/cards';
import { getTalent } from '@/data/wardenTalents';
import type { GameEvent, GameState } from '@/engine/types';
import { useMatch, HUMAN, AI } from '@/state/matchStore';
import { useAccount } from '@/state/accountStore';
import { useMatchLaunch } from '@/state/matchLaunch';
import { xpToNext } from '@/domain/progression';
import { CardView } from '@/ui/components/CardView';
import { Essence, Gold, ProgressBar, Spinner } from '@/ui/components/common';
import { TUTORIAL_STEPS } from './tutorial';
import { GAME_RULES } from '@/config/gameRules';
import { t, tn } from '@/i18n';

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
          <div key={c.uid} className={`mulligan-card ${picks.includes(c.uid) ? 'is-replaced' : ''}`}>
            <CardView card={c.cardId} size="lg" onClick={() => toggle(c.uid)} ariaLabel={picks.includes(c.uid) ? t('{name}, marked for replacement', { name: getCardSafe(c.cardId).name }) : getCardSafe(c.cardId).name} />
            {picks.includes(c.uid) && <span className="replace-mark">{t('Replace')}</span>}
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => void confirm()} autoFocus>
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
    <div className={`cast-preview ${cast.player === AI ? 'from-enemy' : 'from-self'}`} key={cast.id} role="status" aria-label={t('{who} played {card}', { who: cast.player === AI ? t('Opponent') : t('You'), card: getCardSafe(cast.cardId).name })}>
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

function describeEvent(e: GameEvent, game: GameState): string | null {
  const who = (p: number) => (p === HUMAN ? t('You') : game.players[AI].hero.name);
  const name = (id: string) => getCardSafe(id).name;
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
      return e.player === HUMAN ? t('— Your turn —') : t("— {name}'s turn —", { name: game.players[AI].hero.name });
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

/**
 * The whole match, line by line. The engine keeps only a rolling window of events,
 * so lines are collected here as they arrive and kept for the rest of the match.
 */
export function BattleLog({ game }: { game: GameState }) {
  const startedAt = useMatch((s) => s.startedAt);
  const store = useRef<{ match: unknown; lastSeq: number; lines: LogLine[] }>({ match: null, lastSeq: -1, lines: [] });
  const box = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const memo = store.current;
  if (memo.match !== startedAt) Object.assign(memo, { match: startedAt, lastSeq: -1, lines: [] });
  for (const e of game.log) {
    if (e.seq <= memo.lastSeq) continue;
    memo.lastSeq = e.seq;
    const text = describeEvent(e, game);
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
      }}
    >
      {lines.map((l) => (
        <div key={l.seq} className="log-line">
          {l.text}
        </div>
      ))}
    </div>
  );
}

export function TutorialOverlay() {
  const step = useMatch((s) => s.tutorialStep);
  const next = useMatch((s) => s.nextTutorialStep);
  const mode = useMatch((s) => s.config?.mode);
  const phase = useMatch((s) => s.phase);
  if (mode !== 'TUTORIAL' || phase === 'ended' || step >= TUTORIAL_STEPS.length) return null;
  const s = TUTORIAL_STEPS[step];
  return (
    <>
      {s.highlight && <style>{`[data-tutorial="${s.highlight}"] { outline: 3px solid var(--cyan); outline-offset: 6px; box-shadow: 0 0 30px rgba(114,223,230,.6); border-radius: 8px; }`}</style>}
      <div className="tutorial-box panel" role="dialog" aria-live="polite" aria-label={t('Tutorial')}>
        <span className="faint num">
          {t('Step {n} of {total}', { n: step + 1, total: TUTORIAL_STEPS.length })}
        </span>
        <h4>{s.title}</h4>
        <p>{s.text}</p>
        {!s.done && (
          <button className="btn btn-cyan btn-sm" onClick={next} autoFocus>
            {t('Next')}
          </button>
        )}
      </div>
    </>
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
      <h1 className="results-title">{win ? t('Victory') : draw ? t('Draw') : t('Defeat')}</h1>
      <p className="muted">
        {config?.mode === 'ARENA' ? t('Arena match against {name}', { name: config.opponent.name }) : config?.mode === 'TOURNAMENT' ? t('Tournament match against {name}', { name: config.opponent.name }) : config?.mode === 'RANKED' ? t('Ranked match against {name}', { name: config.opponent.name }) : config?.online ? t('Online match against {name}', { name: config.opponent.name }) : t(`Against {name} on ${config?.opponent.difficulty.toLowerCase()} difficulty`, { name: String(config?.opponent.name) })}
        {game.endReason === 'CONCEDE' ? t(', by concession') : ''}
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
          {rewards && rewards.lines.length === 0 && <p className="muted">{t('No rewards — matches shorter than 3 turns don’t count.')}</p>}
          {rewards?.lines.map((l) => (
            <div key={l.label} className="reward-line">
              <span>{t(l.label)}</span>
              <span className="reward-values">
                {l.gold ? <Gold amount={l.gold} /> : null}
                {l.essence ? <Essence amount={l.essence} /> : null}
                {l.xp ? <span className="num xp-text">{t('+{n} XP', { n: l.xp })}</span> : null}
                {l.packs ? <span className="chip">{t('+{n} pack', { n: l.packs.amount })}</span> : null}
              </span>
            </div>
          ))}
          {rewards && profile && (
            <div className="results-xp">
              <div className="xp-row">
                <span className="level-gem num">{profile.level}</span>
                <ProgressBar value={profile.xp} max={xpToNext(profile.level) || 1} gold label={t('Experience')} />
              </div>
              {rewards.levelUps.map((lu) => (
                <div key={lu.level} className="level-up">
                  {t('Level {n} reached!', { n: lu.level })}{' '}
                  {lu.rewards.map((r, i) => (
                    <span key={i} className="chip">
                      {r.kind === 'GOLD' ? t('{n} Gold', { n: r.amount }) : r.kind === 'ESSENCE' ? t('{n} Essence', { n: r.amount }) : r.kind === 'PACK' ? tn(r.amount, '{n} pack', '{n} packs') : t('Title: {title}', { title: t(r.title) })}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
          {rewards?.firstClear && <p className="gold-text">{t('Encounter cleared for the first time!')}</p>}
          {rewards?.ratingChange !== undefined && (
            <p className="rating-change">
              {t('Ranked rating')} <strong className={rewards.ratingChange >= 0 ? 'up' : 'down'}>{rewards.ratingChange >= 0 ? '+' : ''}{rewards.ratingChange}</strong> → {rewards.ratingAfter}
            </p>
          )}
        </div>
        {config?.mode !== 'TUTORIAL' && quests.length > 0 && (
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
          <button className="btn btn-primary btn-lg" onClick={() => exit('/')} autoFocus>
            {t('Continue')}
          </button>
        ) : (
          <>
            {config?.mode === 'ARENA' ? (
              <button className="btn btn-primary btn-lg" onClick={() => exit('/arena')} autoFocus>
                {t('Back to Arena')}
              </button>
            ) : (
            <>
            <button className="btn btn-ghost" onClick={() => exit(config?.mode === 'PVE' ? '/campaign' : config?.mode === 'TOURNAMENT' ? '/tournament' : config?.mode === 'RANKED' ? '/ranked' : config?.online ? '/online' : '/play')}>
              {config?.mode === 'PVE' ? t('Back to campaign') : config?.mode === 'TOURNAMENT' ? t('Back to bracket') : config?.mode === 'RANKED' ? t('Ranked') : config?.online ? t('New online match') : t('Choose opponent')}
            </button>
            {!config?.online && config?.mode !== 'TOURNAMENT' && (
              <button className="btn" onClick={rematch}>
                {t('Rematch')}
              </button>
            )}
            <button className="btn btn-primary btn-lg" onClick={() => exit(config?.mode === 'TOURNAMENT' ? '/tournament' : '/')} autoFocus>
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
