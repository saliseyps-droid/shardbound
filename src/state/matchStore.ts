import { arenaDeck, arenaOpponent, arenaPhase } from '@/domain/arena';
import { create } from 'zustand';
import { randomSeed } from '@/core/rng';
import { applyAction, createGame } from '@/engine/game';
import type { GameAction, GameEvent, GameState, PlayerId, TargetRef, UnitInstance } from '@/engine/types';
import { activeLevelOf, attackTargets, canAttack, canPlayCard, canUseHeroPower, findUnit, validTargets } from '@/engine/queries';
import { getCard } from '@/data/cards';
import { aiClient } from '@/ai/aiClient';
import { audio, type SoundEvent } from '@/audio/audioService';
import { GAME_RULES } from '@/config/gameRules';
import type { MatchRewards } from '@/domain/matchResults';
import { opponentSide, playerSide } from '@/domain/matchSetup';
import { ownedCopies } from '@/domain/save';
import type { ActiveMatch } from '@/domain/activeMatch';
import { sanitizeRating } from '@/domain/ranked';
import { validateDeck } from '@/domain/decks';
import { gameService, useAccount } from './accountStore';
import { anim, useSettings } from './settingsStore';
import { toast } from './uiStore';
import { useMatchLaunch, type MatchConfig } from './matchLaunch';
import { setLastMatchLog } from '@/ui/match/matchLog';
import { t } from '@/i18n';
import { netSession, type NetMessage } from '@/net/session';
import { guestEvents, guestView, mirrorAction } from '@/net/view';
import { TUTORIAL_STEPS, tutorialOpponentAction, tutorialSetup } from '@/ui/match/tutorial';

/** How long to keep asking the signalling server about a vanished opponent (it drops dead peers after ~60 s). */
export const DISCONNECT_TIMING = { checkMs: 75_000, retryMs: 8_000 };

export const HUMAN: PlayerId = 0;
export const AI: PlayerId = 1;

export type EntityKey = string; // 'u:12' | 'h:0'
export const entityKey = (t: TargetRef): EntityKey => (t.type === 'unit' ? `u:${t.uid}` : `h:${t.player}`);
export function parseEntity(key: EntityKey): TargetRef {
  const [k, v] = key.split(':');
  return k === 'u' ? { type: 'unit', uid: Number(v) } : { type: 'hero', player: Number(v) as PlayerId };
}

export interface Fx {
  id: number;
  target: EntityKey;
  kind: 'damage' | 'heal' | 'buff' | 'armor' | 'shield' | 'freeze' | 'burn' | 'summon' | 'silence';
  amount?: number;
}

export interface Ghost {
  unit: UnitInstance;
  owner: PlayerId;
  index: number;
}

export type Selection =
  | { kind: 'card'; uid: number }
  | { kind: 'attacker'; uid: number }
  | { kind: 'power'; slot: number }
  | null;

interface MatchStore {
  config: MatchConfig | null;
  game: GameState | null;
  phase: 'idle' | 'mulligan' | 'playing' | 'ended';
  busy: boolean;
  aiThinking: boolean;
  fx: Fx[];
  ghosts: Ghost[];
  selection: Selection;
  targets: EntityKey[];
  banner: { text: string; id: number } | null;
  cast: { cardId: string; player: PlayerId; id: number } | null;
  turnDeadline: number | null;
  rewards: MatchRewards | null;
  startedAt: number;
  deckName: string;
  mulliganPicks: number[];
  tutorialStep: number;
  lastError: string | null;
  /** Monotonic counter bumped for every committed action (lets UI detect new draws). */
  version: number;

  start: (config: MatchConfig) => Promise<void>;
  toggleMulligan: (uid: number) => void;
  confirmMulligan: () => Promise<void>;
  clickHandCard: (uid: number) => void;
  clickUnit: (uid: number) => void;
  clickHero: (player: PlayerId) => void;
  clickHeroPower: (slot: number) => void;
  dropCard: (uid: number, target: TargetRef | null, position?: number) => void;
  dropAttack: (attackerUid: number, target: TargetRef) => void;
  cancelSelection: () => void;
  endTurn: () => void;
  concede: () => void;
  nextTutorialStep: () => void;
  leave: () => void;
}

let fxSeq = 1;
let bannerSeq = 1;
let aiLoopToken = 0;
/** Match generation: bumped by start/leave/concede so in-flight dispatches never commit stale state. */
let matchGen = 0;
/** Generation whose result has been recorded (results are recorded exactly once). */
let recordedGen = -1;
/** Initial online state received by the guest before its board mounted. */
let pendingInitial: GameState | null = null;
/** Set by the tournament store: called once when a tournament match finishes. */
let onTournamentMatchEnd: ((matchId: string, won: boolean) => void) | null = null;
export function setTournamentMatchHandler(fn: ((matchId: string, won: boolean) => void) | null) {
  onTournamentMatchEnd = fn;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Finds the DOM node for an entity (used for attack lunges). */
function entityEl(key: EntityKey): HTMLElement | null {
  return document.querySelector(`[data-entity="${key}"]`);
}

async function lunge(attackerKey: EntityKey, targetKey: EntityKey) {
  const a = entityEl(attackerKey);
  const t = entityEl(targetKey);
  if (!a || !t || useSettings.getState().reducedMotion) return;
  const ar = a.getBoundingClientRect();
  const tr = t.getBoundingClientRect();
  const dx = (tr.left + tr.width / 2 - (ar.left + ar.width / 2)) * 0.82;
  const dy = (tr.top + tr.height / 2 - (ar.top + ar.height / 2)) * 0.82;
  const dur = anim(420);
  const animation = a.animate(
    [
      { transform: 'translate(0,0) scale(1)', zIndex: 50 },
      { transform: `translate(${dx * -0.08}px, ${dy * -0.08}px) scale(1.08)`, offset: 0.25, zIndex: 50 },
      { transform: `translate(${dx}px, ${dy}px) scale(1.05)`, offset: 0.6, zIndex: 50 },
      { transform: 'translate(0,0) scale(1)', zIndex: 50 },
    ],
    { duration: dur, easing: 'cubic-bezier(.3,.7,.3,1)' },
  );
  await sleep(dur * 0.6);
  void animation;
}

function soundsFor(events: GameEvent[]): SoundEvent[] {
  const out = new Set<SoundEvent>();
  for (const e of events) {
    switch (e.type) {
      case 'CARD_DRAWN':
        if (e.player === HUMAN) out.add('draw');
        break;
      // Every card played from hand (unit, spell, relic, location) makes the same card sound.
      case 'CARD_PLAYED':
        out.add('play');
        break;
      case 'DAMAGE_DEALT':
        out.add('hit');
        break;
      case 'HEALED':
        out.add('heal');
        break;
      case 'UNIT_DIED':
        out.add('death');
        break;
      case 'UNIT_BUFFED':
        out.add('buff');
        break;
      case 'STATUS_APPLIED':
        if (e.status === 'FROZEN') out.add('freeze');
        break;
      case 'BARRIER_BROKEN':
      case 'ARMOR_GAINED':
        out.add('shield');
        break;
    }
  }
  return [...out];
}

function fxFrom(events: GameEvent[]): Fx[] {
  const fx: Fx[] = [];
  for (const e of events) {
    if (e.type === 'DAMAGE_DEALT') fx.push({ id: fxSeq++, target: entityKey(e.target), kind: 'damage', amount: e.amount });
    else if (e.type === 'HEALED') fx.push({ id: fxSeq++, target: entityKey(e.target), kind: 'heal', amount: e.amount });
    else if (e.type === 'UNIT_BUFFED' && (e.attack || e.health)) fx.push({ id: fxSeq++, target: `u:${e.uid}`, kind: 'buff' });
    else if (e.type === 'ARMOR_GAINED') fx.push({ id: fxSeq++, target: `h:${e.player}`, kind: 'armor', amount: e.amount });
    else if (e.type === 'BARRIER_BROKEN') fx.push({ id: fxSeq++, target: `u:${e.uid}`, kind: 'shield' });
    else if (e.type === 'STATUS_APPLIED' && e.status === 'FROZEN') fx.push({ id: fxSeq++, target: `u:${e.uid}`, kind: 'freeze' });
    else if (e.type === 'STATUS_APPLIED' && e.status === 'BURN') fx.push({ id: fxSeq++, target: `u:${e.uid}`, kind: 'burn', amount: e.amount });
    else if (e.type === 'UNIT_SUMMONED') fx.push({ id: fxSeq++, target: `u:${e.uid}`, kind: 'summon' });
    else if (e.type === 'UNIT_SILENCED') fx.push({ id: fxSeq++, target: `u:${e.uid}`, kind: 'silence' });
  }
  // Merge damage per target for readability (area effects).
  return fx;
}

function ghostsFrom(prev: GameState, events: GameEvent[]): Ghost[] {
  const ghosts: Ghost[] = [];
  for (const e of events) {
    if (e.type !== 'UNIT_DIED') continue;
    for (const p of prev.players) {
      const index = p.board.findIndex((u) => u.uid === e.uid);
      if (index >= 0) ghosts.push({ unit: p.board[index], owner: p.id, index });
    }
  }
  return ghosts;
}

function targetsFor(game: GameState, sel: Selection): EntityKey[] {
  if (!sel) return [];
  if (sel.kind === 'card') {
    const card = game.players[HUMAN].hand.find((c) => c.uid === sel.uid);
    const def = card && getCard(card.cardId);
    if (!def?.target) return [];
    return validTargets(game, HUMAN, def.target, { spellLike: true }).map(entityKey);
  }
  if (sel.kind === 'attacker') {
    const u = findUnit(game, sel.uid);
    return u ? attackTargets(game, u).map(entityKey) : [];
  }
  const power = activeLevelOf(game, HUMAN, sel.slot);
  return power?.target ? validTargets(game, HUMAN, power.target, { spellLike: true }).map(entityKey) : [];
}

export const useMatch = create<MatchStore>((set, get) => {
  /** Applies an action with animation, sound and effects. Returns false if illegal. */
  async function dispatch(action: GameAction): Promise<boolean> {
    const s = get();
    const game = s.game;
    const gen = matchGen;
    if (!game || game.phase === 'ENDED' || s.phase === 'ended') return false;
    // Online guest: the host is authoritative; send the action and wait for its state.
    if (s.config?.online === 'guest') return sendGuestAction(action);
    const res = applyAction(game, action);
    if (res.error) {
      if (action.player === HUMAN) {
        audio.play('error');
        toast(res.error, 'error');
      } else if (s.config?.online === 'host') {
        netSession.send({ t: 'error', message: res.error });
      }
      set({ lastError: res.error });
      return false;
    }
    return present(game, res, gen);
  }

  /** Animates and commits a transition (computed locally, or received from the online host). */
  async function present(game: GameState, res: { state: GameState; events: GameEvent[] }, gen = matchGen): Promise<boolean> {
    const stale = () => gen !== matchGen || get().game !== game;
    if (get().config?.online === 'host') netSession.send({ t: 'state', state: guestView(res.state), events: guestEvents(res.events) });
    set({ busy: true });
    try {
      // Show what the opponent played before it resolves.
      const played = res.events.find((e) => e.type === 'CARD_PLAYED');
      if (played && played.type === 'CARD_PLAYED' && played.player === AI) {
        set({ cast: { cardId: played.cardId, player: AI, id: fxSeq++ } });
        await sleep(anim(1100));
      } else if (played && played.type === 'CARD_PLAYED' && getCard(played.cardId)?.cardType === 'SPELL') {
        set({ cast: { cardId: played.cardId, player: HUMAN, id: fxSeq++ } });
        await sleep(anim(450));
      }
      const attack = res.events.find((e) => e.type === 'UNIT_ATTACKED');
      if (attack && attack.type === 'UNIT_ATTACKED') {
        audio.play('attack');
        await lunge(`u:${attack.attackerUid}`, entityKey(attack.target));
      }
      if (stale()) return false;
      for (const snd of soundsFor(res.events)) audio.play(snd);
      const newFx = useSettings.getState().showDamageNumbers ? fxFrom(res.events) : fxFrom(res.events).filter((f) => f.kind !== 'damage' && f.kind !== 'heal');
      const ghosts = ghostsFrom(game, res.events);
      set((st) => ({
        game: res.state,
        fx: [...st.fx, ...newFx],
        ghosts: [...st.ghosts, ...ghosts],
        cast: null,
        version: st.version + 1,
        selection: null,
        targets: [],
        // Both mulligans done (online the opponent may finish last).
        phase: st.phase === 'mulligan' && res.state.phase === 'MAIN' ? 'playing' : st.phase,
      }));
      setLastMatchLog(res.state.log);
      if (newFx.length) {
        const ids = new Set(newFx.map((f) => f.id));
        setTimeout(() => set((st) => ({ fx: st.fx.filter((f) => !ids.has(f.id)) })), anim(1300) + 100);
      }
      if (ghosts.length) {
        const uids = new Set(ghosts.map((g) => g.unit.uid));
        setTimeout(() => set((st) => ({ ghosts: st.ghosts.filter((g) => !uids.has(g.unit.uid)) })), anim(700) + 50);
      }
      advanceTutorial(res.events, res.state);
      const turnStarted = res.events.find((e) => e.type === 'TURN_STARTED');
      if (turnStarted && turnStarted.type === 'TURN_STARTED') onTurnStarted(turnStarted.player);
      if (res.state.phase === 'ENDED') await finishMatch(res.state);
      await sleep(anim(ghosts.length ? 380 : 160));
    } finally {
      if (gen === matchGen) set({ busy: false });
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Online play
  // ---------------------------------------------------------------------------

  let guestBusyTimer: ReturnType<typeof setTimeout> | null = null;

  /** Guest: forward an action (in the guest's own coordinates; the host mirrors it) and lock input until the host answers. */
  function sendGuestAction(action: GameAction): boolean {
    if (!netSession.connected) {
      toast('Not connected to your opponent.', 'error');
      return false;
    }
    netSession.send({ t: 'action', action });
    set({ busy: true, selection: null, targets: [] });
    if (guestBusyTimer) clearTimeout(guestBusyTimer);
    guestBusyTimer = setTimeout(() => set({ busy: false }), 10000);
    return true;
  }

  async function waitIdle() {
    while (get().busy) await sleep(30);
  }

  /** Host: validate and apply an action sent by the guest. */
  async function hostApplyRemote(remote: GameAction) {
    await waitIdle();
    const game = get().game;
    if (!game || get().config?.online !== 'host') return;
    // The guest may only act as player 1.
    const action = mirrorAction(remote);
    if (action.player !== AI) return netSession.send({ t: 'error', message: 'Illegal action.' });
    if (game.phase === 'ENDED') return;
    const res = applyAction(game, action);
    if (res.error) return netSession.send({ t: 'error', message: res.error });
    await present(game, res);
  }

  let netChain: Promise<unknown> = Promise.resolve();
  netSession.onMessage((msg: NetMessage) => {
    netChain = netChain
      .then(async () => {
        const cfg = get().config;
        if (msg.t === 'state' && msg.initial) {
          pendingInitial = msg.state;
          return;
        }
        if (!cfg?.online) return;
        if (cfg.online === 'host' && msg.t === 'action') return hostApplyRemote(msg.action);
        if (cfg.online === 'guest' && msg.t === 'state') {
          if (guestBusyTimer) clearTimeout(guestBusyTimer);
          const game = get().game;
          if (!game) return;
          set({ busy: false });
          await present(game, { state: msg.state, events: msg.events });
          return;
        }
        if (cfg.online === 'guest' && msg.t === 'error') {
          if (guestBusyTimer) clearTimeout(guestBusyTimer);
          set({ busy: false });
          audio.play('error');
          toast(msg.message, 'error');
        }
      })
      .catch((e) => console.error('[net] message handling failed', e));
  });

  netSession.onStatus(() => {
    const s = get();
    if (netSession.status !== 'closed' || !s.config?.online || !s.game || s.phase === 'ended') return;
    const gen = matchGen;
    netChain = netChain.then(async () => {
      // Both sides see the link drop. A player who went offline (e.g. turned Wi-Fi off while
      // losing) gets the loss. Otherwise ask the signalling server whether the opponent is still
      // there: gone means they left (win); still there after the server would have dropped a dead
      // peer means only the link between the two broke, so the match is a draw for both.
      const localOk = await netSession.localNetworkOk();
      if (gen !== matchGen) return;
      let outcome: 'WIN' | 'LOSS' | 'DRAW' = localOk ? 'DRAW' : 'LOSS';
      if (localOk) {
        toast(t('Connection lost — checking whether your opponent is still there…'), 'info');
        const deadline = Date.now() + DISCONNECT_TIMING.checkMs;
        for (;;) {
          if (!(await netSession.remotePeerPresent())) {
            outcome = 'WIN';
            break;
          }
          if (gen !== matchGen || Date.now() >= deadline) break;
          await new Promise((r) => setTimeout(r, DISCONNECT_TIMING.retryMs));
          if (gen !== matchGen) return;
        }
        if (gen !== matchGen) return;
      }
      await waitIdle();
      const game = get().game;
      if (!game || game.phase === 'ENDED') return;
      if (outcome === 'DRAW') {
        toast(t('The connection between you broke, but both of you are online — the match is a draw.'), 'info');
        const state: GameState = structuredClone(game);
        state.phase = 'ENDED';
        state.winner = 'DRAW';
        state.endReason = 'DISCONNECT';
        state.eventSeq += 1;
        await present(game, { state, events: [{ seq: state.eventSeq, type: 'GAME_ENDED', winner: 'DRAW', reason: 'DISCONNECT' }] });
        return;
      }
      toast(outcome === 'WIN' ? t('Your opponent disconnected — you win.') : t('You lost your connection, so the match counts as a loss.'), 'info');
      const res = applyAction(game, { type: 'CONCEDE', player: outcome === 'WIN' ? AI : HUMAN });
      if (!res.error) await present(game, res);
    });
  });

  function onTurnStarted(player: PlayerId) {
    const cfg = get().config;
    set({ banner: { text: player === HUMAN ? t('match.yourTurn') : t('match.theirTurn', { name: get().game?.players[AI].hero.name ?? '' }), id: bannerSeq++ } });
    if (player === HUMAN) {
      // No chime here: the draw at the start of the turn already makes a sound.
      const timer = useSettings.getState().turnTimer && cfg?.mode !== 'TUTORIAL' && GAME_RULES.turnTimerSeconds > 0;
      set({ turnDeadline: timer ? Date.now() + GAME_RULES.turnTimerSeconds * 1000 : null });
    } else {
      set({ turnDeadline: null });
      if (!cfg?.online) void runAiTurn();
    }
  }

  async function runAiTurn() {
    const token = ++aiLoopToken;
    const cfg = get().config;
    if (!cfg) return;
    let actions = 0;
    // Wait for the human's end-turn animation to finish.
    while (get().busy) await sleep(30);
    await sleep(anim(700));
    while (token === aiLoopToken) {
      const game = get().game;
      if (!game || game.phase !== 'MAIN' || game.activePlayer !== AI) break;
      set({ aiThinking: true });
      const started = performance.now();
      let action: GameAction;
      if (cfg.mode === 'TUTORIAL') action = tutorialOpponentAction(game);
      else {
        action = await aiClient.chooseAction(game, AI, cfg.opponent.difficulty, cfg.opponent.personality, randomSeed(), actions);
      }
      // Human-like pacing: at least a short pause between actions.
      const elapsed = performance.now() - started;
      await sleep(Math.max(0, anim(action.type === 'END_TURN' ? 350 : 650) - elapsed));
      set({ aiThinking: false });
      if (token !== aiLoopToken) break;
      const ok = await dispatch(action);
      actions++;
      if (!ok) {
        await dispatch({ type: 'END_TURN', player: AI });
        break;
      }
      if (action.type === 'END_TURN') break;
      if (actions > 60) {
        await dispatch({ type: 'END_TURN', player: AI });
        break;
      }
    }
    set({ aiThinking: false });
  }

  function advanceTutorial(events: GameEvent[], state: GameState) {
    const s = get();
    if (s.config?.mode !== 'TUTORIAL') return;
    let step = s.tutorialStep;
    while (step < TUTORIAL_STEPS.length) {
      const done = TUTORIAL_STEPS[step].done;
      if (!done || !done(events, state)) break;
      step++;
    }
    if (step !== s.tutorialStep) set({ tutorialStep: step });
  }

  async function finishMatch(state: GameState) {
    if (recordedGen === matchGen) return;
    recordedGen = matchGen;
    const s = get();
    const cfg = s.config;
    set({ phase: 'ended', turnDeadline: null, selection: null, targets: [] });
    aiLoopToken++;
    const result = state.winner === HUMAN ? 'WIN' : state.winner === 'DRAW' ? 'DRAW' : 'LOSS';
    audio.play(result === 'WIN' ? 'victory' : 'defeat');
    if (!cfg) return;
    const save = useAccount.getState().save;
    const deck = cfg.mode === 'ARENA' && save?.arena.run ? arenaDeck(save.arena.run) : save?.decks.find((d) => d.id === cfg.deckId);
    try {
      const rewards = gameService.recordMatch({
        mode: cfg.mode === 'ONLINE' ? 'PVP' : cfg.mode,
        ranked: cfg.mode === 'RANKED' && cfg.opponentRating !== undefined ? { opponentRating: sanitizeRating(cfg.opponentRating) } : undefined,
        opponentId: cfg.opponent.id,
        opponentName: cfg.opponent.name,
        difficulty: cfg.opponent.difficulty,
        deckId: deck?.id ?? 'tutorial',
        deckName: deck?.name ?? 'Tutorial deck',
        deckFaction: deck?.heroFaction ?? 'EMBER',
        result,
        turns: Math.ceil(state.turn / 2),
        durationMs: Date.now() - s.startedAt,
        stats: state.players[HUMAN].stats,
        conceded: state.endReason === 'CONCEDE' && state.winner !== HUMAN,
        pveEncounterId: cfg.mode === 'PVE' ? cfg.encounterId : undefined,
        firstWinReward: cfg.mode === 'PVE' ? cfg.opponent.firstWinReward : undefined,
      });
      set({ rewards });
      if (cfg.mode === 'TOURNAMENT' && cfg.tournamentMatchId) onTournamentMatchEnd?.(cfg.tournamentMatchId, result === 'WIN');
      if (rewards.levelUps.length) setTimeout(() => audio.play('levelUp'), 1200);
    } catch (e) {
      console.error('[match] failed to record result', e);
      toast('The match result could not be saved.', 'error');
    }
  }

  function selectionAllowed(): boolean {
    const s = get();
    return !!s.game && s.phase === 'playing' && !s.busy && s.game.activePlayer === HUMAN && s.game.phase === 'MAIN';
  }

  return {
    config: null,
    game: null,
    phase: 'idle',
    busy: false,
    aiThinking: false,
    fx: [],
    ghosts: [],
    selection: null,
    targets: [],
    banner: null,
    cast: null,
    turnDeadline: null,
    rewards: null,
    startedAt: 0,
    deckName: '',
    mulliganPicks: [],
    tutorialStep: 0,
    lastError: null,
    version: 0,

    start: async (config) => {
      aiLoopToken++;
      const gen = ++matchGen;
      const save = useAccount.getState().save;
      if (!save) throw new Error('No profile');
      let setup;
      let deckName = 'Tutorial deck';
      let initialState: GameState | null = null;
      if (config.online === 'guest') {
        const deck = save.decks.find((d) => d.id === config.deckId);
        deckName = deck?.name ?? 'Deck';
        const t0 = Date.now();
        while (!pendingInitial && Date.now() - t0 < 20000 && gen === matchGen) await sleep(50);
        if (gen !== matchGen) return;
        if (!pendingInitial) throw new Error('The host did not start the match.');
        initialState = pendingInitial;
        pendingInitial = null;
      } else if (config.mode === 'TUTORIAL') {
        setup = tutorialSetup(save.profile.username, save.profile.avatar);
      } else if (config.mode === 'ARENA') {
        // The drafted deck lives in the Arena run; ownership does not matter there.
        const run = save.arena.run;
        if (!run || arenaPhase(run) !== 'PLAYING') throw new Error('There is no Arena match to play.');
        const deck = arenaDeck(run);
        const issues = validateDeck(deck);
        if (issues.length) throw new Error(`Arena deck is not valid: ${issues[0].message}`);
        deckName = 'Arena deck';
        setup = { seed: config.seed ?? randomSeed(), players: [playerSide(save.profile, deck), opponentSide(arenaOpponent(run))] as [ReturnType<typeof playerSide>, ReturnType<typeof opponentSide>] };
      } else {
        const deck = save.decks.find((d) => d.id === config.deckId);
        if (!deck) throw new Error('Deck not found');
        const issues = validateDeck(deck, (id) => ownedCopies(save.collection, id));
        if (issues.length) throw new Error(`Deck is not valid: ${issues[0].message}`);
        deckName = deck.name;
        const opponent = config.online === 'host' ? netSession.remoteSide : opponentSide(config.opponent);
        if (!opponent) throw new Error('Your opponent is no longer connected.');
        setup = { seed: config.seed ?? randomSeed(), players: [playerSide(save.profile, deck), opponent] as [ReturnType<typeof playerSide>, ReturnType<typeof opponentSide>] };
      }
      const state = initialState ?? createGame(setup!).state;
      if (gen !== matchGen) return;
      // Matches with stakes are remembered until their result is recorded: reloading
      // or closing the app mid-match then counts as conceding (src/domain/activeMatch.ts).
      const stakes: ActiveMatch['mode'] | null = config.mode === 'ONLINE' ? 'PVP' : config.mode === 'RANKED' || config.mode === 'TOURNAMENT' || config.mode === 'ARENA' ? config.mode : null;
      if (stakes) {
        const deck = config.mode === 'ARENA' && save.arena.run ? arenaDeck(save.arena.run) : save.decks.find((d) => d.id === config.deckId);
        gameService.beginMatch({
          id: `am_${Date.now().toString(36)}_${gen}`,
          mode: stakes,
          startedAt: Date.now(),
          opponentId: config.opponent.id,
          opponentName: config.opponent.name,
          difficulty: config.opponent.difficulty,
          deckId: deck?.id ?? 'unknown',
          deckName: deck?.name ?? deckName,
          deckFaction: deck?.heroFaction ?? 'EMBER',
          opponentRating: config.mode === 'RANKED' ? sanitizeRating(config.opponentRating) : undefined,
        });
      }
      if (config.online === 'host') netSession.send({ t: 'state', state: guestView(state), events: [], initial: true });
      set({
        config,
        game: state,
        phase: state.phase === 'MULLIGAN' ? 'mulligan' : 'playing',
        busy: false,
        aiThinking: false,
        fx: [],
        ghosts: [],
        selection: null,
        targets: [],
        banner: null,
        cast: null,
        turnDeadline: null,
        rewards: null,
        startedAt: Date.now(),
        deckName,
        mulliganPicks: [],
        tutorialStep: 0,
        lastError: null,
        version: 0,
      });
      setLastMatchLog(state.log);
      if (config.online) {
        // Online: each player mulligans on their own screen.
      } else if (state.phase === 'MULLIGAN') {
        // The AI decides its mulligan immediately (it cannot see the human's choice).
        const replace = await aiClient.chooseMulligan(state, AI, config.opponent.difficulty, config.opponent.personality);
        if (gen !== matchGen) return;
        const res = applyAction(get().game!, { type: 'MULLIGAN', player: AI, replaceUids: replace });
        if (!res.error) set({ game: res.state });
      } else if (state.activePlayer === HUMAN) {
        onTurnStarted(HUMAN);
      } else {
        onTurnStarted(AI);
      }
    },

    toggleMulligan: (uid) => set((s) => ({ mulliganPicks: s.mulliganPicks.includes(uid) ? s.mulliganPicks.filter((x) => x !== uid) : [...s.mulliganPicks, uid] })),

    confirmMulligan: async () => {
      const cur = get();
      if (cur.config?.online === 'guest') {
        if (!cur.game || cur.game.players[HUMAN].mulliganDone) return;
        audio.play('draw');
        sendGuestAction({ type: 'MULLIGAN', player: HUMAN, replaceUids: cur.mulliganPicks });
        return;
      }
      if (cur.config?.online === 'host' && cur.game && !cur.game.players[HUMAN].mulliganDone) {
        // Apply our mulligan now; the main phase starts once the guest has chosen too.
        await waitIdle();
        const g = get().game!;
        const r = applyAction(g, { type: 'MULLIGAN', player: HUMAN, replaceUids: cur.mulliganPicks });
        if (r.error) return toast(r.error, 'error');
        audio.play('draw');
        await present(g, r);
        return;
      }
      // Wait for the AI's (hidden) mulligan so the main phase starts from one place.
      const gen = matchGen;
      while (get().game && !get().game!.players[AI].mulliganDone && gen === matchGen) await sleep(40);
      if (gen !== matchGen) return;
      const s = get();
      if (!s.game || s.phase !== 'mulligan') return;
      const res = applyAction(s.game, { type: 'MULLIGAN', player: HUMAN, replaceUids: s.mulliganPicks });
      if (res.error) return toast(res.error, 'error');
      audio.play('draw');
      set({ game: res.state, phase: 'playing', version: s.version + 1 });
      setLastMatchLog(res.state.log);
      const started = res.events.find((e) => e.type === 'TURN_STARTED');
      if (started && started.type === 'TURN_STARTED') onTurnStarted(started.player);
    },

    clickHandCard: (uid) => {
      if (!selectionAllowed()) return;
      const s = get();
      const game = s.game!;
      // Clicking the selected card again cancels.
      if (s.selection?.kind === 'card' && s.selection.uid === uid) return set({ selection: null, targets: [] });
      // A targeted selection awaiting a target: clicking another card switches.
      const card = game.players[HUMAN].hand.find((c) => c.uid === uid);
      if (!card) return;
      const check = canPlayCard(game, HUMAN, card);
      if (!check.ok) {
        audio.play('error');
        toast(check.reason ?? 'Cannot play this card', 'error');
        return;
      }
      const sel: Selection = { kind: 'card', uid };
      const targets = targetsFor(game, sel);
      if (targets.length === 0) {
        audio.play('click');
        void dispatch({ type: 'PLAY_CARD', player: HUMAN, cardUid: uid });
        return;
      }
      audio.play('click');
      set({ selection: sel, targets });
    },

    clickUnit: (uid) => {
      if (!selectionAllowed()) return;
      const s = get();
      const game = s.game!;
      const key = `u:${uid}`;
      if (s.selection && s.targets.includes(key)) {
        const target: TargetRef = { type: 'unit', uid };
        if (s.selection.kind === 'card') void dispatch({ type: 'PLAY_CARD', player: HUMAN, cardUid: s.selection.uid, target });
        else if (s.selection.kind === 'attacker') void dispatch({ type: 'ATTACK', player: HUMAN, attackerUid: s.selection.uid, target });
        else void dispatch({ type: 'HERO_POWER', player: HUMAN, slot: s.selection.slot, target });
        return;
      }
      const unit = findUnit(game, uid);
      if (unit && unit.owner === HUMAN) {
        if (s.selection?.kind === 'attacker' && s.selection.uid === uid) return set({ selection: null, targets: [] });
        const check = canAttack(game, unit);
        if (!check.ok) {
          toast(check.reason === 'Deployed this turn' ? 'This unit arrived this turn and cannot attack yet.' : check.reason ?? 'Cannot attack', 'info');
          return;
        }
        const sel: Selection = { kind: 'attacker', uid };
        set({ selection: sel, targets: targetsFor(game, sel) });
        audio.play('click');
      } else if (s.selection) {
        audio.play('error');
      }
    },

    clickHero: (player) => {
      if (!selectionAllowed()) return;
      const s = get();
      const key = `h:${player}`;
      if (!s.selection || !s.targets.includes(key)) return;
      const target: TargetRef = { type: 'hero', player };
      if (s.selection.kind === 'card') void dispatch({ type: 'PLAY_CARD', player: HUMAN, cardUid: s.selection.uid, target });
      else if (s.selection.kind === 'attacker') void dispatch({ type: 'ATTACK', player: HUMAN, attackerUid: s.selection.uid, target });
      else void dispatch({ type: 'HERO_POWER', player: HUMAN, slot: s.selection.slot, target });
    },

    clickHeroPower: (slot) => {
      if (!selectionAllowed()) return;
      const game = get().game!;
      const check = canUseHeroPower(game, HUMAN, slot);
      if (!check.ok) {
        audio.play('error');
        toast(check.reason ?? 'Cannot use Warden ability', 'error');
        return;
      }
      const current = get().selection;
      if (current?.kind === 'power' && current.slot === slot) return set({ selection: null, targets: [] });
      const sel: Selection = { kind: 'power', slot };
      const targets = targetsFor(game, sel);
      if (targets.length === 0) void dispatch({ type: 'HERO_POWER', player: HUMAN, slot });
      else set({ selection: sel, targets });
    },

    dropCard: (uid, target, position) => {
      if (!selectionAllowed()) return;
      const game = get().game!;
      const card = game.players[HUMAN].hand.find((c) => c.uid === uid);
      if (!card) return;
      const check = canPlayCard(game, HUMAN, card);
      if (!check.ok) {
        audio.play('error');
        toast(check.reason ?? 'Cannot play this card', 'error');
        return;
      }
      const targets = targetsFor(game, { kind: 'card', uid });
      if (targets.length > 0) {
        if (target && targets.includes(entityKey(target))) void dispatch({ type: 'PLAY_CARD', player: HUMAN, cardUid: uid, target, position });
        // Dropped on something that isn't a valid target: the card goes back to the hand.
        else if (target) toast('Not a valid target.', 'info');
        // Dropped on the battlefield without a target: ask for one.
        else set({ selection: { kind: 'card', uid }, targets });
        return;
      }
      void dispatch({ type: 'PLAY_CARD', player: HUMAN, cardUid: uid, position });
    },

    dropAttack: (attackerUid, target) => {
      if (!selectionAllowed()) return;
      void dispatch({ type: 'ATTACK', player: HUMAN, attackerUid, target });
    },

    cancelSelection: () => set({ selection: null, targets: [] }),

    endTurn: () => {
      const s = get();
      if (!s.game || s.game.activePlayer !== HUMAN || s.game.phase !== 'MAIN' || s.busy) return;
      audio.play('endTurn');
      set({ selection: null, targets: [], turnDeadline: null });
      void dispatch({ type: 'END_TURN', player: HUMAN });
    },

    concede: () => {
      const s = get();
      if (!s.game || s.game.phase === 'ENDED') return;
      aiLoopToken++;
      matchGen++;
      // Concede works even during the opponent's turn.
      const res = applyAction(s.game, { type: 'CONCEDE', player: HUMAN });
      if (s.config?.online === 'guest') netSession.send({ t: 'action', action: { type: 'CONCEDE', player: HUMAN } });
      if (s.config?.online === 'host' && !res.error) netSession.send({ t: 'state', state: guestView(res.state), events: guestEvents(res.events) });
      if (!res.error) {
        set({ game: res.state, version: s.version + 1, busy: false, cast: null });
        setLastMatchLog(res.state.log);
        void finishMatch(res.state);
      }
    },

    nextTutorialStep: () => set((s) => ({ tutorialStep: Math.min(TUTORIAL_STEPS.length, s.tutorialStep + 1) })),

    leave: () => {
      aiLoopToken++;
      matchGen++;
      if (get().config?.online) netSession.close();
      useMatchLaunch.getState().setConfig(null);
      set({ config: null, game: null, phase: 'idle', rewards: null, fx: [], ghosts: [], selection: null, targets: [], turnDeadline: null });
    },
  };
});
