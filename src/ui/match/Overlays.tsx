import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCardSafe } from '@/data/cards';
import type { GameEvent, GameState } from '@/engine/types';
import { useMatch, HUMAN, AI } from '@/state/matchStore';
import { useAccount } from '@/state/accountStore';
import { useMatchLaunch } from '@/state/matchLaunch';
import { xpToNext } from '@/domain/progression';
import { CardView } from '@/ui/components/CardView';
import { Essence, Gold, ProgressBar, Spinner } from '@/ui/components/common';
import { TUTORIAL_STEPS } from './tutorial';
import { GAME_RULES } from '@/config/gameRules';

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
        <h2>Waiting for your opponent</h2>
        <p className="muted">They are still choosing which cards to keep.</p>
        <Spinner label="Waiting for opponent" />
      </div>
    );
  }
  return (
    <div className="match-overlay mulligan" role="dialog" aria-label="Choose cards to replace">
      <h2>{first ? 'You go first' : 'You go second'}</h2>
      <p className="muted">Select any cards you want to replace, then keep your hand.{!first && ' Going second grants an Aether Shard.'}</p>
      <div className="mulligan-cards">
        {hand.map((c) => (
          <div key={c.uid} className={`mulligan-card ${picks.includes(c.uid) ? 'is-replaced' : ''}`}>
            <CardView card={c.cardId} size="lg" onClick={() => toggle(c.uid)} ariaLabel={`${getCardSafe(c.cardId).name}${picks.includes(c.uid) ? ', marked for replacement' : ''}`} />
            {picks.includes(c.uid) && <span className="replace-mark">Replace</span>}
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => void confirm()} autoFocus>
        {picks.length ? `Replace ${picks.length} and keep` : 'Keep hand'}
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
    <div className={`cast-preview ${cast.player === AI ? 'from-enemy' : 'from-self'}`} key={cast.id} role="status" aria-label={`${cast.player === AI ? 'Opponent' : 'You'} played ${getCardSafe(cast.cardId).name}`}>
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
  const who = (p: number) => (p === HUMAN ? 'You' : game.players[AI].hero.name);
  const name = (id: string) => getCardSafe(id).name;
  switch (e.type) {
    case 'CARD_PLAYED':
      return `${who(e.player)} played ${name(e.cardId)}`;
    case 'UNIT_DIED':
      return `${name(e.cardId)} was destroyed`;
    case 'HERO_POWER_USED':
      return `${who(e.player)} used a Warden Sigil`;
    case 'TURN_STARTED':
      return `— ${e.player === HUMAN ? 'Your' : `${game.players[AI].hero.name}'s`} turn —`;
    case 'FATIGUE':
      return `${who(e.player)} took ${e.damage} fatigue damage`;
    case 'CARD_BURNED':
      return `${name(e.cardId)} burned (hand full)`;
    case 'UNIT_ATTACKED':
      return null;
    case 'RELIC_BROKEN':
      return `${name(e.cardId)} broke`;
    case 'TRIGGER_LIMIT_REACHED':
      return 'Too many triggers — chain stopped';
    default:
      return null;
  }
}

export function BattleLog({ game }: { game: GameState }) {
  const lines = game.log
    .map((e) => ({ seq: e.seq, text: describeEvent(e, game) }))
    .filter((l): l is { seq: number; text: string } => !!l.text)
    .slice(-9);
  return (
    <div className="battle-log" aria-label="Battle log" aria-live="polite">
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
      <div className="tutorial-box panel" role="dialog" aria-live="polite" aria-label="Tutorial">
        <span className="faint num">
          Step {step + 1} of {TUTORIAL_STEPS.length}
        </span>
        <h4>{s.title}</h4>
        <p>{s.text}</p>
        {!s.done && (
          <button className="btn btn-cyan btn-sm" onClick={next} autoFocus>
            Next
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
    <div className={`match-overlay results ${win ? 'is-win' : draw ? 'is-draw' : 'is-loss'}`} role="dialog" aria-label={win ? 'Victory' : draw ? 'Draw' : 'Defeat'}>
      <h1 className="results-title">{win ? 'Victory' : draw ? 'Draw' : 'Defeat'}</h1>
      <p className="muted">
        {config?.online ? `Online match against ${config.opponent.name}` : `Against ${config?.opponent.name} on ${config?.opponent.difficulty.toLowerCase()} difficulty`}
        {game.endReason === 'CONCEDE' ? ', by concession' : ''}
      </p>
      <div className="results-grid">
        <div className="panel results-stats">
          <h4>Battle report</h4>
          <dl>
            <dt>Turns played</dt>
            <dd className="num">{Math.ceil(game.turn / 2)}</dd>
            <dt>Damage dealt</dt>
            <dd className="num">{stats.damageDealt}</dd>
            <dt>Cards played</dt>
            <dd className="num">{stats.cardsPlayed}</dd>
            <dt>Units destroyed</dt>
            <dd className="num">{stats.unitsDestroyed}</dd>
            <dt>Healing</dt>
            <dd className="num">{stats.healingDone}</dd>
            <dt>Duration</dt>
            <dd className="num">{mins} min</dd>
          </dl>
        </div>
        <div className="panel results-rewards">
          <h4>Rewards</h4>
          {!rewards && <p className="muted">Recording result…</p>}
          {rewards && rewards.lines.length === 0 && <p className="muted">No rewards — matches shorter than 3 turns don’t count.</p>}
          {rewards?.lines.map((l) => (
            <div key={l.label} className="reward-line">
              <span>{l.label}</span>
              <span className="reward-values">
                {l.gold ? <Gold amount={l.gold} /> : null}
                {l.essence ? <Essence amount={l.essence} /> : null}
                {l.xp ? <span className="num xp-text">+{l.xp} XP</span> : null}
                {l.packs ? <span className="chip">+{l.packs.amount} pack</span> : null}
              </span>
            </div>
          ))}
          {rewards && profile && (
            <div className="results-xp">
              <div className="xp-row">
                <span className="level-gem num">{profile.level}</span>
                <ProgressBar value={profile.xp} max={xpToNext(profile.level) || 1} gold label="Experience" />
              </div>
              {rewards.levelUps.map((lu) => (
                <div key={lu.level} className="level-up">
                  Level {lu.level} reached!{' '}
                  {lu.rewards.map((r, i) => (
                    <span key={i} className="chip">
                      {r.kind === 'GOLD' ? `${r.amount} Gold` : r.kind === 'ESSENCE' ? `${r.amount} Essence` : r.kind === 'PACK' ? `${r.amount} pack${r.amount > 1 ? 's' : ''}` : `Title: ${r.title}`}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
          {rewards?.firstClear && <p className="gold-text">Encounter cleared for the first time!</p>}
        </div>
        {config?.mode !== 'TUTORIAL' && quests.length > 0 && (
          <div className="panel results-quests">
            <h4>Quest progress</h4>
            {quests.map((q) => (
              <div key={q.id} className="quest-mini">
                <span>
                  {q.name} {q.completed && !q.claimed && <span className="badge-new">Complete</span>}
                </span>
                <ProgressBar value={q.progress} max={q.target} label={q.name} />
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
            Continue
          </button>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => exit(config?.mode === 'PVE' ? '/campaign' : config?.online ? '/online' : '/play')}>
              {config?.mode === 'PVE' ? 'Back to campaign' : config?.online ? 'New online match' : 'Choose opponent'}
            </button>
            {!config?.online && (
              <button className="btn" onClick={rematch}>
                Rematch
              </button>
            )}
            <button className="btn btn-primary btn-lg" onClick={() => exit('/')} autoFocus>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
