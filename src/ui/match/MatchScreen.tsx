import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCardSafe } from '@/data/cards';
import { effectiveCost, canPlayCard } from '@/engine/queries';
import type { GameState } from '@/engine/types';
import { useMatch, HUMAN, AI, parseEntity } from '@/state/matchStore';
import { useMatchLaunch } from '@/state/matchLaunch';
import { useSettings } from '@/state/settingsStore';
import { toast, useUi } from '@/state/uiStore';
import { CardBack, CardView } from '@/ui/components/CardView';
import { confirmDialog, Spinner } from '@/ui/components/common';
import { audio } from '@/audio/audioService';
import { DrawPile, EmpowerBadge, EnergyBar, HeroAbilities, HeroPanel, PermanentsRow, UnitView } from './BoardParts';
import { BattleLog, CastPreview, MulliganOverlay, ResultsOverlay, TurnBanner, TurnTimer, TutorialOverlay } from './Overlays';
import { useT } from '@/i18n';
import { BrandLogo } from '@/ui/components/BrandLogo';
import { pickBoardBackground } from './boardBackgrounds';
import '@/ui/styles/board.css';

interface Drag {
  kind: 'card' | 'attack';
  uid: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  active: boolean;
}

const DRAG_THRESHOLD = 8;
let mountedBoards = 0;

function useViewportCardWidth() {
  const [w, setW] = useState(() => Math.round(Math.min(150, Math.max(104, window.innerHeight * 0.14))));
  useEffect(() => {
    const on = () => setW(Math.round(Math.min(150, Math.max(104, window.innerHeight * 0.14))));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

export default function MatchScreen() {
  const config = useMatchLaunch((s) => s.config);
  const game = useMatch((s) => s.game);
  const phase = useMatch((s) => s.phase);
  const start = useMatch((s) => s.start);
  const matchConfig = useMatch((s) => s.config);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    if (matchConfig === config && game) return; // already running (e.g. StrictMode double effect)
    start(config).catch((e: Error) => {
      setError(e.message);
      toast(e.message, 'error');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    mountedBoards++;
    audio.stopMusic();
    return () => {
      mountedBoards--;
      // Deferred so React StrictMode's dev re-mount doesn't count as leaving.
      setTimeout(() => {
        if (mountedBoards > 0) return;
        audio.startMusic();
        // Leaving an unfinished match counts as conceding (prevents reward exploits and stray AI turns).
        const st = useMatch.getState();
        if (st.game && st.phase !== 'ended' && st.phase !== 'idle') st.concede();
        useMatch.getState().leave();
      }, 0);
    };
  }, []);

  if (!config) return <Navigate to="/play" replace />;
  if (error)
    return (
      <div className="screen">
        <div className="panel error-panel">
          <h3>The match could not start</h3>
          <p className="muted">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/decks')}>
            Fix my deck
          </button>
        </div>
      </div>
    );
  if (!game || matchConfig !== config)
    return (
      <div className="screen-loading">
        <Spinner label="Preparing the battlefield" />
      </div>
    );
  return <Board game={game} phase={phase} />;
}

function Board({ game, phase }: { game: GameState; phase: string }) {
  const store = useMatch;
  const selection = useMatch((s) => s.selection);
  const targets = useMatch((s) => s.targets);
  const ghosts = useMatch((s) => s.ghosts);
  const busy = useMatch((s) => s.busy);
  const aiThinking = useMatch((s) => s.aiThinking);
  const version = useMatch((s) => s.version);
  const config = useMatch((s) => s.config);
  const confirmEnd = useSettings((s) => s.confirmEndTurn);
  const cardW = useViewportCardWidth();
  const t = useT();
  const startedAt = useMatch((s) => s.startedAt);
  // A new random play-mat for every match (rematches included).
  const boardBg = useMemo(() => pickBoardBackground(), [startedAt]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoverCard, setHoverCard] = useState<string | null>(null);
  const [newCards, setNewCards] = useState<Set<number>>(new Set());
  const prevHand = useRef<number[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  const me = game.players[HUMAN];
  const opp = game.players[AI];
  const myTurn = game.activePlayer === HUMAN && game.phase === 'MAIN';
  const interactive = myTurn && !busy && phase === 'playing';

  // Newly drawn cards fly in from the draw pile: offset from the pile to their place in the hand.
  useLayoutEffect(() => {
    if (newCards.size === 0) return;
    const pile = document.querySelector('[data-draw-pile="0"] .draw-pile-stack')?.getBoundingClientRect();
    if (!pile) return;
    for (const uid of newCards) {
      const el = document.querySelector<HTMLElement>(`[data-hand-uid="${uid}"]`);
      if (!el) continue;
      // Measure the card's resting place without the fly-in transform, then restart the animation.
      el.style.animation = 'none';
      const r = el.getBoundingClientRect();
      el.style.setProperty('--dx', `${pile.left + pile.width / 2 - (r.left + r.width / 2)}px`);
      el.style.setProperty('--dy', `${pile.top + pile.height / 2 - (r.top + r.height / 2)}px`);
      void el.offsetWidth;
      el.style.animation = '';
    }
  }, [newCards]);

  // Highlight newly drawn cards.
  useEffect(() => {
    const uids = me.hand.map((c) => c.uid);
    const fresh = uids.filter((u) => !prevHand.current.includes(u));
    prevHand.current = uids;
    if (fresh.length && version > 0) {
      setNewCards(new Set(fresh));
      const t = setTimeout(() => setNewCards(new Set()), 700);
      return () => clearTimeout(t);
    }
  }, [version, me.hand]);

  const endTurn = useCallback(async () => {
    if (!interactive) return;
    const hasPlays = me.hand.some((c) => canPlayCard(game, HUMAN, c).ok);
    if (confirmEnd && hasPlays) {
      const ok = await confirmDialog({ title: 'End your turn?', message: 'You still have playable cards.', confirmLabel: 'End turn' });
      if (!ok) return;
    }
    audio.play('click');
    store.getState().endTurn();
  }, [interactive, me.hand, game, confirmEnd, store]);

  const concede = useCallback(async () => {
    const ok = await confirmDialog({ title: 'Concede the match?', message: 'This counts as a loss.', confirmLabel: 'Concede', danger: true });
    if (ok) store.getState().concede();
  }, [store]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'Escape') store.getState().cancelSelection();
      if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey) void endTurn();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [endTurn, store]);

  // Track pointer for targeting arrows.
  useEffect(() => {
    if (!selection && !drag) return;
    const move = (e: PointerEvent) => setPointer({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [selection, drag]);

  // Drag handling ---------------------------------------------------------------
  // Listeners are attached synchronously on press (not in an effect), so even a very
  // quick release is never missed; cancel/blur/escape always end the drag cleanly.
  const dragRef = useRef<Drag | null>(null);
  const endDrag = useRef<(() => void) | null>(null);
  useEffect(() => () => endDrag.current?.(), []);

  const beginDrag = (initial: Drag) => {
    endDrag.current?.();
    dragRef.current = initial;
    setDrag(initial);
    const cleanup = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
      window.removeEventListener('keydown', onKey);
      dragRef.current = null;
      endDrag.current = null;
      setDrag(null);
    };
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
      const next = { ...d, x: e.clientX, y: e.clientY, active: d.active || dist > DRAG_THRESHOLD };
      dragRef.current = next;
      setDrag(next);
    };
    const cancel = () => cleanup();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cleanup();
    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      cleanup();
      if (!d) return;
      const s = store.getState();
      const moved = d.active || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_THRESHOLD;
      if (!moved) {
        if (d.kind === 'card') s.clickHandCard(d.uid);
        else s.clickUnit(d.uid);
        return;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const entity = el?.closest('[data-entity]')?.getAttribute('data-entity');
      if (d.kind === 'card') {
        // A valid target plays the card; the battlefield plays it (or asks for a target);
        // anywhere else the card simply returns to the hand.
        if (entity) s.dropCard(d.uid, parseEntity(entity));
        else if (el?.closest('[data-dropzone="board"]')) s.dropCard(d.uid, null, dropPosition(e.clientX));
      } else if (entity) {
        const t = parseEntity(entity);
        if (!(t.type === 'unit' && t.uid === d.uid)) s.dropAttack(d.uid, t);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    window.addEventListener('keydown', onKey);
    endDrag.current = cleanup;
  };

  const dropPosition = (x: number): number => {
    const units = [...(boardRef.current?.querySelectorAll('.board-row.self [data-entity^="u:"]') ?? [])];
    let pos = 0;
    for (const u of units) {
      const r = u.getBoundingClientRect();
      if (x > r.left + r.width / 2) pos++;
    }
    return pos;
  };

  const startCardDrag = (e: RPointerEvent, uid: number) => {
    if (e.button !== 0) return;
    if (!interactive) {
      if (!myTurn) toast('Wait for your turn.', 'info');
      return;
    }
    e.preventDefault();
    beginDrag({ kind: 'card', uid, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, active: false });
  };
  const startUnitDrag = (e: RPointerEvent, uid: number) => {
    if (e.button !== 0 || !interactive) return;
    const s = store.getState();
    // A pending selection wants this unit as a target: click semantics.
    if (s.selection && s.targets.includes(`u:${uid}`)) {
      s.clickUnit(uid);
      return;
    }
    const isMine = me.board.some((u) => u.uid === uid);
    if (!isMine) {
      s.clickUnit(uid);
      return;
    }
    e.preventDefault();
    beginDrag({ kind: 'attack', uid, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, active: false });
  };

  // Arrow source for targeting / attack drag.
  const arrowSource = (() => {
    if (drag?.active && drag.kind === 'attack') return document.querySelector(`[data-entity="u:${drag.uid}"]`);
    if (selection?.kind === 'attacker') return document.querySelector(`[data-entity="u:${selection.uid}"]`);
    if (selection?.kind === 'card') return document.querySelector(`[data-hand-uid="${selection.uid}"]`);
    if (selection?.kind === 'power') return document.querySelector(`.hero-self-area .hero-power[data-slot="${selection.slot}"]`);
    return null;
  })();
  const arrowTo = drag?.active && drag.kind === 'attack' ? { x: drag.x, y: drag.y } : pointer;
  const sourceRect = arrowSource?.getBoundingClientRect();

  // The drop hint only appears while a unit card is being dragged.
  const draggedCard = drag?.active && drag.kind === 'card' ? me.hand.find((c) => c.uid === drag.uid) : undefined;
  const draggingUnit = !!draggedCard && getCardSafe(draggedCard.cardId).cardType === 'UNIT';

  const renderRow = (player: 0 | 1) => {
    const p = game.players[player];
    const units = [...p.board];
    const rowGhosts = ghosts.filter((g) => g.owner === player);
    const items: { key: string; node: React.ReactNode }[] = units.map((u) => ({
      key: `u${u.uid}`,
      node: (
        <UnitView
          unit={u}
          game={game}
          targetable={targets.includes(`u:${u.uid}`)}
          selected={selection?.kind === 'attacker' && selection.uid === u.uid}
          onPointerDown={startUnitDrag}
          onHover={setHoverCard}
        />
      ),
    }));
    for (const g of rowGhosts.sort((a, b) => a.index - b.index)) {
      items.splice(Math.min(g.index, items.length), 0, { key: `g${g.unit.uid}`, node: <UnitView unit={g.unit} game={game} ghost /> });
    }
    return (
      <div
        className={`board-row ${player === HUMAN ? 'self' : 'enemy'} ${drag?.active && drag.kind === 'card' && player === HUMAN ? 'is-drop-target' : ''}`}
        data-dropzone={player === HUMAN ? 'board' : undefined}
        data-tutorial={player === HUMAN ? 'my-board' : 'enemy-board'}
        aria-label={player === HUMAN ? 'Your battlefield' : 'Enemy battlefield'}
      >
        {player === HUMAN && draggingUnit && items.length < 7 && <span className="board-empty faint">{t('match.dragHere')}</span>}
        {items.map((i) => (
          <div key={i.key} className="unit-slot">
            {i.node}
          </div>
        ))}
      </div>
    );
  };

  const handCount = me.hand.length;
  const draggingCard = drag?.active && drag.kind === 'card' ? me.hand.find((c) => c.uid === drag.uid) : undefined;

  return (
    <div
      className={`match ${myTurn ? 'my-turn' : 'their-turn'} ${selection ? 'is-targeting' : ''}`}
      style={boardBg ? ({ '--board-bg': `url(${boardBg})` } as CSSProperties) : undefined}
      ref={boardRef}
      onContextMenu={(e) => {
        e.preventDefault();
        const s = store.getState();
        if (s.selection) return s.cancelSelection();
        // Right-click inspects a card in hand or a unit on the battlefield.
        const el = e.target as HTMLElement;
        const handUid = el.closest('[data-hand-uid]')?.getAttribute('data-hand-uid');
        const entity = el.closest('[data-entity^="u:"]')?.getAttribute('data-entity');
        const cardId = handUid ? me.hand.find((c) => c.uid === Number(handUid))?.cardId : entity ? game.players.flatMap((p) => p.board).find((u) => `u:${u.uid}` === entity)?.cardId : undefined;
        if (cardId) useUi.getState().inspectCard(cardId);
      }}
    >
      <div className="board-mat" aria-hidden />
      {/* ---- Enemy side ---- */}
      <section className="side enemy-side" aria-label="Opponent">
        <div className="enemy-hand" aria-label={`Opponent has ${opp.hand.length} cards`}>
          {opp.hand.map((c, i) => (
            <div key={c.uid} className="enemy-hand-card" style={{ '--i': i - (opp.hand.length - 1) / 2 } as CSSProperties}>
              {c.revealed ? <CardView card={c.cardId} width={64} /> : <CardBack width={64} design={opp.hero.cardBack} />}
            </div>
          ))}
        </div>
        <div className="hero-area hero-enemy-area">
          <div className="hero-col-left">
            <PermanentsRow game={game} player={AI} onHover={setHoverCard} />
            <HeroAbilities game={game} player={AI} slots={[0]} />
          </div>
          <div data-tutorial="enemy-hero">
            <HeroPanel game={game} player={AI} targetable={targets.includes('h:1')} onClick={() => store.getState().clickHero(AI)} />
          </div>
          <div className="hero-side-info">
            <HeroAbilities game={game} player={AI} slots={[1]} />
            <EnergyBar game={game} player={AI} />
          </div>
        </div>
        <div className="draw-pile-anchor">
          <DrawPile count={opp.deck.length} label="the opponent's deck" player={AI} width={104} design={opp.hero.cardBack} />
        </div>
      </section>

      {/* ---- Battlefield ---- */}
      <section className="battlefield" aria-label="Battlefield">
        {renderRow(AI)}
        <div className="battle-divider" aria-hidden>
          <span />
        </div>
        {renderRow(HUMAN)}
      </section>

      {/* ---- Player side ---- */}
      <section className="side self-side" aria-label="You" style={{ '--card-w': `${cardW}px` } as CSSProperties}>
        <div className="hero-area hero-self-area">
          <div className="hero-col-left">
            <PermanentsRow game={game} player={HUMAN} onHover={setHoverCard} />
            <HeroAbilities game={game} player={HUMAN} slots={[0]} />
          </div>
          <div data-tutorial="my-hero">
            <HeroPanel game={game} player={HUMAN} targetable={targets.includes('h:0')} onClick={() => store.getState().clickHero(HUMAN)} />
          </div>
          <div className="hero-side-info">
            <HeroAbilities game={game} player={HUMAN} slots={[1]} />
            <EnergyBar game={game} player={HUMAN} />
            <EmpowerBadge game={game} player={HUMAN} />
          </div>
        </div>
        <div className="draw-pile-anchor">
          <DrawPile count={me.deck.length} label="your deck" player={HUMAN} width={Math.round(cardW * 1.24)} design={me.hero.cardBack} />
        </div>
        <div className="hand" data-tutorial="hand" style={{ '--card-w': `${cardW}px`, '--n': handCount } as CSSProperties} aria-label="Your hand">
          {me.hand.map((c, i) => {
            const playable = interactive && canPlayCard(game, HUMAN, c).ok;
            const cost = effectiveCost(game, HUMAN, c);
            const offset = i - (handCount - 1) / 2;
            const selected = selection?.kind === 'card' && selection.uid === c.uid;
            return (
              <div
                key={c.uid}
                className={`hand-card ${newCards.has(c.uid) ? 'is-new' : ''} ${selected ? 'is-selected' : ''} ${drag?.active && drag.uid === c.uid ? 'is-dragging' : ''} ${c.fleeting ? 'is-fleeting' : ''}`}
                data-hand-uid={c.uid}
                style={{ '--o': offset } as CSSProperties}
              >
                <CardView
                  card={c.cardId}
                  width={cardW}
                  cost={cost}
                  playable={playable}
                  dimmed={myTurn && !playable}
                  selected={selected}
                  onPointerDown={(e) => startCardDrag(e, c.uid)}
                  onClick={(e) => e.detail === 0 && store.getState().clickHandCard(c.uid)}
                  ariaLabel={`${getCardSafe(c.cardId).name}, costs ${cost}${playable ? ', playable' : ''}. ${getCardSafe(c.cardId).description ?? ''}`}
                />
                {c.fleeting && <span className="fleeting-tag">Fleeting</span>}
              </div>
            );
          })}
        </div>
        <div className="turn-controls">
          <TurnTimer />
          <button
            className={`end-turn ${myTurn ? 'is-mine' : ''} ${interactive && !me.hand.some((c) => canPlayCard(game, HUMAN, c).ok) ? 'is-urgent' : ''}`}
            data-tutorial="end-turn"
            onClick={() => void endTurn()}
            disabled={!interactive}
            aria-label={myTurn ? 'End turn (E)' : 'Opponent turn'}
          >
            {myTurn ? t('match.endTurn') : aiThinking ? t('match.thinking') : t('match.enemyTurn')}
          </button>
          <div className="match-menu">
            <button className="btn btn-ghost btn-sm" onClick={() => void concede()} disabled={game.phase === 'ENDED'}>
              {t('match.concede')}
            </button>
          </div>
        </div>
      </section>

      <aside className="match-sidebar">
        <div className="hover-preview" aria-hidden>
          {hoverCard ? <CardView card={hoverCard} width={220} /> : <BrandLogo size={200} className="sidebar-logo" />}
        </div>
        <BattleLog game={game} />
        <div className="match-meta faint">
          {config?.mode === 'ARENA' ? 'Arena' : config?.mode === 'PVE' ? 'Campaign' : config?.mode === 'TUTORIAL' ? 'Tutorial' : config?.online ? 'Online' : 'Practice'} vs {game.players[AI].hero.name}
        </div>
      </aside>

      {/* ---- Targeting arrow ---- */}
      {sourceRect && arrowTo && (selection || drag?.active) && (
        <svg className="target-arrow" aria-hidden>
          <defs>
            <marker id="arrowhead" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
              <path d="M0 0 L12 6 L0 12 Z" fill="var(--gold-bright)" />
            </marker>
          </defs>
          <path
            d={`M ${sourceRect.left + sourceRect.width / 2} ${sourceRect.top + sourceRect.height / 2} Q ${(sourceRect.left + sourceRect.width / 2 + arrowTo.x) / 2} ${Math.min(sourceRect.top, arrowTo.y) - 60} ${arrowTo.x} ${arrowTo.y}`}
            markerEnd="url(#arrowhead)"
          />
        </svg>
      )}
      {draggingCard && drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
          <CardView card={draggingCard.cardId} width={cardW} cost={effectiveCost(game, HUMAN, draggingCard)} />
        </div>
      )}

      <CastPreview />
      <TurnBanner />
      <TutorialOverlay />
      {phase === 'mulligan' && <MulliganOverlay game={game} />}
      {phase === 'ended' && <ResultsOverlay game={game} />}
      {phase !== 'ended' && config?.mode !== 'TUTORIAL' && (
        <button className="leave-btn icon-btn" aria-label="Leave match (concede)" onClick={() => void concede()}>
          ✕
        </button>
      )}
    </div>
  );
}
