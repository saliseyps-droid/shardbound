import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { findPuzzle } from '@/domain/puzzles';
import { findBrawlFight } from '@/domain/brawl';
import '@/ui/styles/brawl.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCardSafe } from '@/data/cards';
import { effectiveCost, canPlayCard } from '@/engine/queries';
import type { GameState, PlayerId } from '@/engine/types';
import { useMatch, HUMAN, AI, parseEntity } from '@/state/matchStore';
import { useMatchLaunch, type MatchConfig } from '@/state/matchLaunch';
import { useSettings } from '@/state/settingsStore';
import { toast, useUi } from '@/state/uiStore';
import { CardBack, CardView } from '@/ui/components/CardView';
import { confirmDialog, Spinner } from '@/ui/components/common';
import { audio } from '@/audio/audioService';
import { usingTouch } from '@/ui/inputMode';
import { AudioToggles } from './AudioToggles';
import { DrawPile, EmpowerBadge, EnergyBar, HeroAbilities, HeroInspector, HeroPanel, PermanentsRow, UnitView } from './BoardParts';
import { showTipFor } from '@/ui/components/Tooltip';
import { LONG_PRESS_CLICK_GUARD_MS, LONG_PRESS_MS, TAP_SLOP_PX, isActingTap, peekClickAllowed } from './touchGuards';
import { BattleLog, CastPreview, MulliganOverlay, ResultsOverlay, TurnBanner, TurnTimer, TutorialOverlay } from './Overlays';
import { t, tn, useT } from '@/i18n';
import { BrandLogo } from '@/ui/components/BrandLogo';
import { Glyph } from '@/ui/components/Icons';
import { enterGameFullscreen, fullscreenSupported, maybeAutoFullscreen, startMatchFullscreen } from './fullscreen';
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
  /** Touch: a tap first enlarges the card (peek) instead of playing it. */
  touch?: boolean;
}

const DRAG_THRESHOLD = 8;
let mountedBoards = 0;

/** Hand card width: from the viewport height; much smaller on phones held sideways. */
const cardWidthFor = (h: number) => (h <= 520 ? Math.round(Math.max(54, h * 0.17)) : Math.round(Math.min(150, Math.max(104, h * 0.14))));

/** Footer label for the match's mode ("Ranked vs Skolky"). */
function modeLabel(config: MatchConfig | null | undefined): string {
  switch (config?.mode) {
    case 'ARENA':
      return t('Arena');
    case 'PVE':
      return t('Campaign');
    case 'TUTORIAL':
      return t('Tutorial');
    case 'AI_RANKED':
      return t('AI Ranked');
    case 'BRAWL':
      return t('Brawl');
    case 'DUNGEON':
      return t('Dungeon');
    case 'PUZZLE':
      return t('Daily puzzle');
    case 'RANKED':
      return t('Ranked');
    case 'TOURNAMENT':
      return t('Tournament');
    case 'ONLINE':
      return t('Online match');
    default:
      return config?.online ? t('Online match') : t('Practice');
  }
}

/** The puzzle's goal and hint, under the battle log. */
function PuzzleGoal({ id }: { id?: string }) {
  const puzzle = id ? findPuzzle(id) : undefined;
  if (!puzzle) return null;
  return (
    <div className="match-brawl-rules">
      <div>
        <strong>{t(puzzle.name)}:</strong> <span>{t('Win this turn. Ending your turn gives the puzzle up.')}</span>
      </div>
      <div className="faint">{t(puzzle.hint)}</div>
    </div>
  );
}

/** The Brawl fight's rules, under the battle log. */
function BrawlRules({ fightId }: { fightId?: string }) {
  const fight = fightId ? findBrawlFight(fightId) : undefined;
  if (!fight) return null;
  return (
    <div className="match-brawl-rules">
      {fight.modifiers.map((m) => (
        <div key={m.id}>
          <strong>{t(m.name)}:</strong> <span className="faint">{t(m.description)}</span>
        </div>
      ))}
    </div>
  );
}

function useViewportCardWidth() {
  const [w, setW] = useState(() => cardWidthFor(window.innerHeight));
  useEffect(() => {
    const on = () => setW(cardWidthFor(window.innerHeight));
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
    // The ambient music keeps playing under the match, at half volume.
    audio.setInMatch(true);
    audio.startMusic();
    return () => {
      mountedBoards--;
      // Deferred so React StrictMode's dev re-mount doesn't count as leaving.
      setTimeout(() => {
        if (mountedBoards > 0) return;
        audio.setInMatch(false);
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
          <h3>{t('The match could not start')}</h3>
          <p className="muted">{t(error)}</p>
          <button className="btn btn-primary" onClick={() => navigate('/decks')}>
            {t('Fix my deck')}
          </button>
        </div>
      </div>
    );
  if (!game || matchConfig !== config)
    return (
      <div className="screen-loading">
        <Spinner label={t('Preparing the battlefield')} />
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
  const [hover, setHover] = useState<{ cardId: string; uid?: number } | null>(null);
  // Touch screens send a mouseenter on tap but never a mouseleave: the sidebar preview would stick
  // on the last tapped card, so it only follows a real mouse (a long press opens the inspector instead).
  const setHoverCard = (cardId: string | null, uid?: number) => {
    if (cardId && usingTouch()) return;
    setHover(cardId ? { cardId, uid } : null);
  };
  const hoverCard = hover?.cardId ?? null;
  const hoverSilenced = hover?.uid !== undefined && !!game.players.some((p) => p.board.some((u) => u.uid === hover.uid && u.silenced));
  const hoverVariant = hover?.uid !== undefined ? game.players.flatMap((p) => p.board).find((u) => u.uid === hover.uid)?.variant : undefined;
  const [newCards, setNewCards] = useState<Set<number>>(new Set());
  const prevHand = useRef<number[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  /** Touch long press: its timer, whether it fired (inspected) for the current press, and until when clicks are swallowed. */
  const longPress = useRef<{ timer?: number; fired: boolean; suppressUntil: number }>({ fired: false, suppressUntil: 0 });
  /** Phones: the battle log opened as a sheet over the board. */
  const [logOpen, setLogOpen] = useState(false);
  /** A Warden shown in the hero inspector (right-click / long press). */
  const [heroInspect, setHeroInspect] = useState<PlayerId | null>(null);
  useEffect(() => startMatchFullscreen(), []);
  /** Touch: the hand card shown enlarged above the hand (tap it again to play it). */
  const [peek, setPeek] = useState<number | null>(null);
  const peekRef = useRef<number | null>(null);
  peekRef.current = peek;
  /** When the peek opened, and whether a new press has started on it since (see peekClickAllowed). */
  const peekOpened = useRef({ at: 0, fresh: false });
  const openPeek = (uid: number | null) => {
    peekOpened.current = { at: performance.now(), fresh: false };
    setPeek(uid);
  };

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
      // The wrapper sits in the card's resting place (only the card inside flies); restart the animation.
      const inner = el.querySelector<HTMLElement>(':scope > .card');
      if (inner) inner.style.animation = 'none';
      const r = el.getBoundingClientRect();
      el.style.setProperty('--dx', `${pile.left + pile.width / 2 - (r.left + r.width / 2)}px`);
      el.style.setProperty('--dy', `${pile.top + pile.height / 2 - (r.top + r.height / 2)}px`);
      void el.offsetWidth;
      if (inner) inner.style.animation = '';
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
      const ok = await confirmDialog({ title: t('End your turn?'), message: t('You still have playable cards.'), confirmLabel: t('End turn') });
      if (!ok) return;
    }
    audio.play('click');
    store.getState().endTurn();
  }, [interactive, me.hand, game, confirmEnd, store]);

  const concede = useCallback(async () => {
    const ok = await confirmDialog({ title: t('Concede the match?'), message: t('This counts as a loss.'), confirmLabel: t('Concede'), danger: true });
    if (ok) store.getState().concede();
  }, [store]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      // Esc with an inspector / dialog open only closes that, the card keeps waiting for its target.
      if (document.querySelector('.modal-backdrop')) return;
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
        // The card waiting for a target (moved aside, enlarged): a click on it does nothing, so it
        // can't cancel by accident; the cross, Esc and right-click cancel.
        if (d.kind === 'card' && s.selection?.kind === 'card' && s.selection.uid === d.uid) return;
        if (d.kind === 'card' && d.touch && peekRef.current !== d.uid) {
          openPeek(d.uid);
          return;
        }
        setPeek(null);
        if (d.kind === 'card') s.clickHandCard(d.uid);
        else s.clickUnit(d.uid);
        return;
      }
      setPeek(null);
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
    // Touch: cards can always be enlarged to read them, even on the opponent's turn.
    if (e.pointerType === 'touch' && !interactive) {
      e.preventDefault();
      openPeek(peekRef.current === uid ? null : uid);
      return;
    }
    if (!interactive) {
      if (!myTurn) toast('Wait for your turn.', 'info');
      return;
    }
    e.preventDefault();
    beginDrag({ kind: 'card', uid, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, active: false, touch: e.pointerType === 'touch' });
  };
  /** Touch: runs `act` when the press ends as a tap (no movement, no long press), so holding only inspects. */
  const onTap = (e: RPointerEvent, act: () => void) => {
    const x0 = e.clientX;
    const y0 = e.clientY;
    const done = (ev: PointerEvent) => {
      window.removeEventListener('pointerup', done);
      window.removeEventListener('pointercancel', done);
      if (ev.type === 'pointerup' && isActingTap(x0, y0, ev.clientX, ev.clientY, longPress.current.fired)) act();
    };
    window.addEventListener('pointerup', done);
    window.addEventListener('pointercancel', done);
  };
  const startUnitDrag = (e: RPointerEvent, uid: number) => {
    if (e.button !== 0 || !interactive) return;
    const s = store.getState();
    const isMine = me.board.some((u) => u.uid === uid);
    // A pending selection wants this unit as a target (or it's an enemy unit): click semantics.
    // Touch acts on release, so a long press on a target only opens the inspector.
    if ((s.selection && s.targets.includes(`u:${uid}`)) || !isMine) {
      if (e.pointerType === 'touch') onTap(e, () => store.getState().clickUnit(uid));
      else s.clickUnit(uid);
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
        aria-label={player === HUMAN ? t('Your battlefield') : t('Enemy battlefield')}
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
  const peekCard = peek !== null && !drag?.active ? me.hand.find((c) => c.uid === peek) : undefined;
  const peekW = Math.round(Math.min(220, window.innerHeight * 0.44));

  /** Opens the inspector for the hand card or unit under `el`; true when there was one. */
  const inspectAt = (el: HTMLElement): boolean => {
    const handUid = el.closest('[data-hand-uid]')?.getAttribute('data-hand-uid');
    const entity = el.closest('[data-entity^="u:"]')?.getAttribute('data-entity');
    const unit = entity ? game.players.flatMap((p) => p.board).find((u) => `u:${u.uid}` === entity) : undefined;
    // Anything else showing a card (relics, location, mulligan, cast preview, revealed enemy
    // cards, card names in the log, the sidebar preview) carries data-card-id.
    const handCard = handUid ? me.hand.find((c) => c.uid === Number(handUid)) : undefined;
    const cardId = (handUid ? handCard?.cardId : unit?.cardId) ?? el.closest('[data-card-id]')?.getAttribute('data-card-id') ?? undefined;
    if (cardId) {
      useUi.getState().inspectCard(cardId, handCard?.variant ?? unit?.variant, { silenced: unit?.silenced });
      return true;
    }
    // A Warden: its name, health and abilities.
    const hero = el.closest('[data-entity^="h:"]')?.getAttribute('data-entity');
    if (hero) {
      setHeroInspect(Number(hero.slice(2)) as PlayerId);
      return true;
    }
    // Anything with a tooltip (Warden abilities, keyword badges): touch has no hover, so show it.
    return usingTouch() && showTipFor(el);
  };

  return (
    <div
      className={`match ${myTurn ? 'my-turn' : 'their-turn'} ${selection ? 'is-targeting' : ''}`}
      style={boardBg ? ({ '--board-bg': `url(${boardBg})` } as CSSProperties) : undefined}
      ref={boardRef}
      onContextMenu={(e) => {
        e.preventDefault();
        // Touch: a long press already inspects (below); its contextmenu must not also cancel the selection.
        if (usingTouch()) return;
        const s = store.getState();
        if (s.selection) return s.cancelSelection();
        // Right-click inspects a card in hand or a unit on the battlefield.
        inspectAt(e.target as HTMLElement);
      }}
      onPointerUpCapture={(e) => e.pointerType === 'touch' && maybeAutoFullscreen()}
      onClickCapture={(e) => {
        // The click a browser may still send after a long press must not also play / use / attack.
        if (performance.now() < longPress.current.suppressUntil) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onPointerDownCapture={(e) => {
        // Touch: press and hold a card, unit, Warden or ability to inspect it (phones have no right click).
        if (e.pointerType !== 'touch') return;
        const el = e.target as HTMLElement;
        if (peekRef.current !== null && !el.closest('[data-hand-uid], .hand-peek')) setPeek(null);
        const lp = longPress.current;
        lp.fired = false;
        lp.suppressUntil = 0;
        const x0 = e.clientX;
        const y0 = e.clientY;
        clearTimeout(lp.timer);
        const stopWatching = () => {
          clearTimeout(lp.timer);
          window.removeEventListener('pointermove', onMove);
        };
        const end = () => {
          stopWatching();
          window.removeEventListener('pointerup', end);
          window.removeEventListener('pointercancel', end);
          if (lp.fired) lp.suppressUntil = performance.now() + LONG_PRESS_CLICK_GUARD_MS;
        };
        const onMove = (ev: PointerEvent) => Math.hypot(ev.clientX - x0, ev.clientY - y0) > TAP_SLOP_PX && stopWatching();
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
        lp.timer = window.setTimeout(() => {
          stopWatching();
          if (inspectAt(el)) {
            lp.fired = true;
            lp.suppressUntil = Infinity;
            endDrag.current?.();
          }
        }, LONG_PRESS_MS);
      }}
    >
      <div className="board-mat" aria-hidden />
      {/* ---- Enemy side ---- */}
      <section className="side enemy-side" aria-label={t('Opponent')}>
        <div className="enemy-hand" aria-label={tn(opp.hand.length, 'Opponent has {n} cards', 'Opponent has {n} cards')}>
          {opp.hand.map((c, i) => (
            <div key={c.uid} className="enemy-hand-card" data-card-id={c.revealed ? c.cardId : undefined} style={{ '--i': i - (opp.hand.length - 1) / 2 } as CSSProperties}>
              {c.revealed ? <CardView card={c.cardId} variant={c.variant} width={64} /> : <CardBack width={64} design={opp.hero.cardBack} />}
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
          <DrawPile count={opp.deck.length} label="the opponent's deck" player={AI} width={Math.round(cardW * 0.83)} design={opp.hero.cardBack} />
        </div>
      </section>

      {/* ---- Battlefield ---- */}
      <section className="battlefield" aria-label={t('Battlefield')}>
        {renderRow(AI)}
        <div className="battle-divider" aria-hidden>
          <span />
        </div>
        {renderRow(HUMAN)}
      </section>

      {/* ---- Player side ---- */}
      <section className="side self-side" aria-label={t('You')} style={{ '--card-w': `${cardW}px` } as CSSProperties}>
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
        <div className="hand" data-tutorial="hand" style={{ '--card-w': `${cardW}px`, '--n': handCount } as CSSProperties} aria-label={t('Your hand')}>
          {me.hand.map((c, i) => {
            const playable = interactive && canPlayCard(game, HUMAN, c).ok;
            const cost = effectiveCost(game, HUMAN, c);
            const offset = i - (handCount - 1) / 2;
            const selected = selection?.kind === 'card' && selection.uid === c.uid;
            return (
              <div
                key={c.uid}
                className={`hand-card ${newCards.has(c.uid) ? 'is-new' : ''} ${selected ? 'is-selected' : ''} ${drag?.active && drag.uid === c.uid ? 'is-dragging' : ''} ${c.fleeting ? 'is-fleeting' : ''} ${peek === c.uid ? 'is-peek' : ''}`}
                data-hand-uid={c.uid}
                data-card-id={c.cardId}
                style={{ '--o': offset } as CSSProperties}
                // On the wrapper, not the card: the card itself flies in from the deck (is-new) while
                // the wrapper already sits in its slot, so a just-drawn card can be grabbed right away.
                onPointerDown={(e) => startCardDrag(e, c.uid)}
              >
                <CardView
                  card={c.cardId}
                  variant={c.variant}
                  width={cardW}
                  cost={cost}
                  playable={playable}
                  dimmed={myTurn && !playable}
                  selected={selected}
                  onClick={(e) => e.detail === 0 && store.getState().clickHandCard(c.uid)}
                  ariaLabel={`${t(playable ? '{name}, costs {cost}, playable.' : '{name}, costs {cost}.', { name: getCardSafe(c.cardId).name, cost })} ${getCardSafe(c.cardId).description ?? ''}`}
                />
                {c.fleeting && <span className="fleeting-tag">{t('Fleeting')}</span>}
                {/* Touch: cancel choosing a target without tapping somewhere else. */}
                {selected && (
                  <button
                    type="button"
                    className="hand-cancel"
                    aria-label={t('Cancel playing this card')}
                    title={t('Cancel playing this card')}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      store.getState().cancelSelection();
                    }}
                  >
                    ✕
                  </button>
                )}
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
            aria-label={myTurn ? t('End turn (E)') : t('Opponent turn')}
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

      {logOpen && <div className="log-sheet-backdrop" onClick={() => setLogOpen(false)} aria-hidden />}
      <aside className={`match-sidebar ${logOpen ? 'is-open' : ''}`}>
        <div className="log-sheet-head">
          <strong>{t('Battle log')}</strong>
          <button type="button" className="icon-btn" aria-label={t('Close')} onClick={() => setLogOpen(false)}>
            ✕
          </button>
        </div>
        <div className="hover-preview" aria-hidden data-card-id={hoverCard ?? undefined}>
          {hoverCard ? <CardView card={hoverCard} variant={hoverVariant} width={220} silenced={hoverSilenced} /> : <BrandLogo size={200} className="sidebar-logo" />}
        </div>
        <BattleLog game={game} />
        <div className="match-meta faint">
          {t('{mode} vs {name}', { mode: modeLabel(config), name: game.players[AI].hero.name })}
        </div>
        {config?.mode === 'BRAWL' && <BrawlRules fightId={config.brawlFightId} />}
        {config?.mode === 'PUZZLE' && <PuzzleGoal id={config.puzzle?.id} />}
      </aside>

      {/* ---- Targeting arrow ---- */}
      {sourceRect && arrowTo && (drag?.active || (selection && !usingTouch())) && (
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
          <CardView card={draggingCard.cardId} variant={draggingCard.variant} width={cardW} cost={effectiveCost(game, HUMAN, draggingCard)} />
        </div>
      )}

      {peekCard && (
        <div className="hand-peek" style={{ '--peek-w': `${peekW}px` } as CSSProperties} onPointerDown={() => (peekOpened.current.fresh = true)}>
          <CardView
            card={peekCard.cardId}
            variant={peekCard.variant}
            width={peekW}
            cost={effectiveCost(game, HUMAN, peekCard)}
            playable={interactive && canPlayCard(game, HUMAN, peekCard).ok}
            onClick={() => {
              // The tap that opened the peek ends with a click right here (the peek sits over the
              // hand): only a deliberate second tap plays the card.
              if (!peekClickAllowed(peekOpened.current.at, performance.now(), peekOpened.current.fresh)) return;
              setPeek(null);
              if (interactive) store.getState().clickHandCard(peekCard.uid);
              else toast('Wait for your turn.', 'info');
            }}
            ariaLabel={t('{name}. Tap to play.', { name: getCardSafe(peekCard.cardId).name })}
          />
          <span className="hand-peek-hint">{interactive ? (canPlayCard(game, HUMAN, peekCard).ok ? t('Tap the card to play it') : t('Not enough energy')) : t('Opponent’s turn')}</span>
        </div>
      )}
      {/* Only the live board needs landscape; the results screen works upright. */}
      {phase !== 'ended' && (
      <div className="rotate-hint" role="alert">
        <Glyph name="deck" size={48} />
        <strong>{t('Turn your phone sideways')}</strong>
        <span className="muted">{t('The battlefield needs a landscape screen.')}</span>
        {fullscreenSupported() && (
          <button className="btn btn-primary" onClick={() => void enterGameFullscreen()}>
            {t('Play fullscreen')}
          </button>
        )}
      </div>
      )}
      <CastPreview />
      <TurnBanner />
      <TutorialOverlay />
      {phase === 'mulligan' && <MulliganOverlay game={game} />}
      {phase === 'ended' && <ResultsOverlay game={game} />}
      <AudioToggles />
      {/* Phones: the sidebar is hidden, so the battle log opens as a sheet from this button. */}
      <button
        type="button"
        className={`log-btn icon-btn ${config?.mode === 'TUTORIAL' ? 'is-first' : ''}`}
        aria-label={t('Battle log')}
        title={t('Battle log')}
        onClick={() => {
          setLogOpen(true);
          requestAnimationFrame(() => {
            const box = boardRef.current?.querySelector('.match-sidebar .battle-log');
            if (box) box.scrollTop = box.scrollHeight;
          });
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3h11a2 2 0 012 2v2h-4" />
          <path d="M17 7v12a2 2 0 01-2 2H6a2 2 0 01-2-2v-2h9" />
          <path d="M8 3a2 2 0 00-2 2v12" />
          <path d="M10 8h4M10 12h4" />
        </svg>
      </button>
      {heroInspect !== null && <HeroInspector game={game} player={heroInspect} onClose={() => setHeroInspect(null)} />}
      {phase !== 'ended' && config?.mode !== 'TUTORIAL' && (
        <button className="leave-btn icon-btn" aria-label={t('Leave match (concede)')} onClick={() => void concede()}>
          ✕
        </button>
      )}
    </div>
  );
}
