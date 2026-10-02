import { getCard } from '@/data/cards';
import { getTalent } from '@/data/wardenTalents';
import { GAME_RULES } from '@/config/gameRules';
import { createRng, nextInt, shuffleInPlace } from '@/core/rng';
import type { EngineContext } from './context';
import { createContext, pushEvent } from './context';
import { emit, queuePlayerTrigger, resolveQueue, runAbility } from './triggers';
import type { ActionResult, GameAction, GameState, MatchSetup, PlayerId, PlayerState, SideSetup, TargetRef, UnitInstance } from './types';
import { isEnded, other } from './types';
import {
  attackTargets,
  canAttack,
  canPlayCard,
  activeLevelOf,
  canUseHeroPower,
  currentHealth,
  effectiveCost,
  findUnit,
  isAlive,
  isValidTarget,
  sameTarget,
  unitAttack,
  validTargets,
} from './queries';
import {
  addToHand,
  checkDeaths,
  checkGameOver,
  dealDamage,
  drawCards,
  endGame,
  makeCardInstance,
  makeUnit,
  summonUnit,
} from './ops';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function emptyStats() {
  return { damageDealt: 0, heroDamageDealt: 0, cardsPlayed: 0, unitsPlayed: 0, spellsPlayed: 0, unitsDestroyed: 0, healingDone: 0, cardsDrawn: 0 };
}

function createPlayer(id: PlayerId, side: SideSetup): PlayerState {
  const health = side.heroHealth ?? GAME_RULES.heroStartingHealth;
  return {
    id,
    hero: { name: side.name, avatar: side.avatar, faction: side.faction ?? null, health, maxHealth: health, armor: 0, abilities: (side.talents ?? []).filter((t) => getTalent(t.abilityId)?.levels[t.level]).map((t) => ({ id: t.abilityId, level: t.level, uses: 0 })) },
    energy: 0,
    maxEnergy: GAME_RULES.startingMaxEnergy + (side.bonusStartingEnergy ?? 0),
    deck: [],
    hand: [],
    board: [],
    relics: [],
    location: null,
    graveyard: [],
    fatigue: 0,
    mulliganDone: false,
    spellsCastThisTurn: 0,
    cardsPlayedThisTurn: 0,
    allyDiedThisTurn: false,
    allyDeathsThisGame: 0,
    stats: emptyStats(),
    bonusStartingEnergy: side.bonusStartingEnergy ?? 0,
  };
}

export function createGame(setup: MatchSetup): { state: GameState; events: ActionResult['events'] } {
  const rng = createRng(setup.seed);
  const state: GameState = {
    rng,
    turn: 0,
    activePlayer: 0,
    firstPlayer: 0,
    phase: 'MULLIGAN',
    players: [createPlayer(0, setup.players[0]), createPlayer(1, setup.players[1])],
    nextUid: 1,
    winner: null,
    endReason: null,
    eventSeq: 0,
    log: [],
  };
  const ctx = createContext(state);

  setup.players.forEach((side, i) => {
    const p = state.players[i as PlayerId];
    // Unknown card ids are skipped instead of crashing the match.
    p.deck = side.deck.filter((id) => !!getCard(id)).map((id) => makeCardInstance(ctx, id));
    if (!side.keepDeckOrder) shuffleInPlace(state.rng, p.deck);
    for (const id of side.startingBoard ?? []) {
      const u = summonUnit(ctx, p.id, id);
      if (u) u.summonedThisTurn = false;
    }
    for (const id of side.startingRelics ?? []) {
      if (getCard(id)?.cardType === 'RELIC') p.relics.push({ uid: state.nextUid++, cardId: id, owner: p.id, charges: getCard(id)?.charges ?? null });
    }
    if (side.startingLocation && getCard(side.startingLocation)?.cardType === 'LOCATION') {
      p.location = { uid: state.nextUid++, cardId: side.startingLocation, owner: p.id, turnsRemaining: null };
    }
  });

  state.firstPlayer = setup.firstPlayer ?? (nextInt(state.rng, 0, 1) as PlayerId);
  state.activePlayer = state.firstPlayer;
  const second = other(state.firstPlayer);
  drawCards(ctx, state.firstPlayer, GAME_RULES.startingHandFirst);
  drawCards(ctx, second, GAME_RULES.startingHandSecond);
  ctx.queue.length = 0; // no triggers during the opening draw

  if (setup.skipMulligan) {
    state.players[0].mulliganDone = true;
    state.players[1].mulliganDone = true;
    beginMainPhase(ctx);
  }
  return { state, events: ctx.events };
}

function beginMainPhase(ctx: EngineContext) {
  const state = ctx.state;
  state.phase = 'MAIN';
  const second = other(state.firstPlayer);
  if (getCard(GAME_RULES.secondPlayerBonusCardId)) {
    addToHand(ctx, second, makeCardInstance(ctx, GAME_RULES.secondPlayerBonusCardId));
  }
  emit(ctx, { type: 'GAME_STARTED', firstPlayer: state.firstPlayer });
  startTurn(ctx, state.firstPlayer);
}

// ---------------------------------------------------------------------------
// Turn structure
// ---------------------------------------------------------------------------

function startTurn(ctx: EngineContext, playerId: PlayerId) {
  const state = ctx.state;
  const p = state.players[playerId];
  // Each turn gets a fresh trigger budget.
  ctx.resolutions = 0;
  ctx.aborted = false;
  state.activePlayer = playerId;
  state.turn += 1;
  if (state.turn > GAME_RULES.maxTurns) {
    endGame(ctx, 'DRAW', 'TURN_LIMIT');
    return;
  }
  p.maxEnergy = Math.min(GAME_RULES.maxEnergy, p.maxEnergy + GAME_RULES.energyPerTurn);
  p.energy = p.maxEnergy;
  // Per-turn ability counters reset for both Wardens: passives can also trigger on the opponent's turn.
  for (const pl of state.players) for (const a of pl.hero.abilities) a.uses = 0;
  p.spellsCastThisTurn = 0;
  p.cardsPlayedThisTurn = 0;
  p.allyDiedThisTurn = false;
  for (const u of p.board) {
    u.summonedThisTurn = false;
    u.attacksThisTurn = 0;
    if (u.frozen) u.thawPending = true;
  }
  const started = emit(ctx, { type: 'TURN_STARTED', player: playerId, turn: state.turn });
  emit(ctx, { type: 'ENERGY_CHANGED', player: playerId, energy: p.energy, maxEnergy: p.maxEnergy });

  drawCards(ctx, playerId, GAME_RULES.cardsDrawnPerTurn);

  // Burn ticks.
  for (const u of [...p.board]) {
    if (u.burn > 0 && isAlive(u)) {
      dealDamage(ctx, { player: other(playerId) }, { type: 'unit', uid: u.uid }, u.burn);
      u.burn = Math.max(0, u.burn - 1);
    }
  }
  checkDeaths(ctx);

  queuePlayerTrigger(ctx, playerId, 'TURN_START', started);
  resolveQueue(ctx);

  // Location duration counts down on its controller's turns.
  if (p.location && p.location.turnsRemaining !== null) {
    p.location.turnsRemaining -= 1;
    if (p.location.turnsRemaining <= 0) {
      const loc = p.location;
      p.location = null;
      emit(ctx, { type: 'LOCATION_EXPIRED', player: playerId, uid: loc.uid, cardId: loc.cardId });
    }
  }
  checkGameOver(ctx);
}

function endTurn(ctx: EngineContext, playerId: PlayerId) {
  const state = ctx.state;
  const p = state.players[playerId];
  const ended = pushEvent(ctx, { type: 'TURN_ENDED', player: playerId, turn: state.turn });
  queuePlayerTrigger(ctx, playerId, 'TURN_END', ended);
  resolveQueue(ctx);
  if (isEnded(state)) return;

  for (const u of p.board) {
    if (u.keywords.includes('REGENERATE') && !u.silenced && isAlive(u)) u.damage = 0;
    if (u.frozen && u.thawPending) {
      u.frozen = false;
      u.thawPending = false;
    }
  }
  for (const pl of state.players) for (const u of pl.board) u.tempAttack = 0;
  const fleeting = p.hand.filter((c) => c.fleeting);
  if (fleeting.length > 0) {
    p.hand = p.hand.filter((c) => !c.fleeting);
    for (const c of fleeting) emit(ctx, { type: 'CARD_DISCARDED', player: playerId, cardId: c.cardId });
  }
  checkDeaths(ctx);
  resolveQueue(ctx);
  if (isEnded(state)) return;
  startTurn(ctx, other(playerId));
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

class ActionError extends Error {}

function fail(msg: string): never {
  throw new ActionError(msg);
}

function doMulligan(ctx: EngineContext, playerId: PlayerId, replaceUids: number[]) {
  const state = ctx.state;
  if (state.phase !== 'MULLIGAN') fail('Not in mulligan phase');
  const p = state.players[playerId];
  if (p.mulliganDone) fail('Mulligan already done');
  const replace = p.hand.filter((c) => replaceUids.includes(c.uid));
  p.hand = p.hand.filter((c) => !replaceUids.includes(c.uid));
  // Draw replacements first so the same cards are not redrawn.
  for (let i = 0; i < replace.length && p.deck.length > 0; i++) p.hand.push(p.deck.shift()!);
  p.deck.push(...replace);
  shuffleInPlace(state.rng, p.deck);
  p.mulliganDone = true;
  pushEvent(ctx, { type: 'MULLIGAN_DONE', player: playerId, replaced: replace.length });
  if (state.players[0].mulliganDone && state.players[1].mulliganDone) beginMainPhase(ctx);
}

function doPlayCard(ctx: EngineContext, playerId: PlayerId, cardUid: number, target: TargetRef | undefined, position: number | undefined) {
  const state = ctx.state;
  const p = state.players[playerId];
  const card = p.hand.find((c) => c.uid === cardUid);
  if (!card) fail('Card not in hand');
  const check = canPlayCard(state, playerId, card);
  if (!check.ok) fail(check.reason ?? 'Cannot play card');
  const def = getCard(card.cardId)!;

  // Validate target (spells & sigils respect Ward; units' On Deploy also count as abilities).
  if (def.target) {
    const options = validTargets(state, playerId, def.target, { spellLike: true });
    if (target) {
      if (!isValidTarget(state, playerId, def.target, target, { spellLike: true })) fail('Invalid target');
    } else if (options.length > 0) {
      fail('A target is required');
    }
  } else {
    target = undefined;
  }

  const cost = effectiveCost(state, playerId, card);
  p.energy -= cost;
  p.hand = p.hand.filter((c) => c.uid !== cardUid);
  p.stats.cardsPlayed++;
  p.cardsPlayedThisTurn++;

  // Overcharge: pay extra energy up-front for each ability that can be afforded.
  const trigger = def.cardType === 'SPELL' ? 'ON_CAST' : 'ON_DEPLOY';
  const abilities = (def.abilities ?? []).filter((a) => a.trigger === trigger).filter((a) => {
    if (!a.overcharge) return true;
    if (p.energy >= a.overcharge) {
      p.energy -= a.overcharge;
      return true;
    }
    return false;
  });

  emit(ctx, { type: 'CARD_PLAYED', player: playerId, cardId: card.cardId, cardUid, target });
  emit(ctx, { type: 'ENERGY_CHANGED', player: playerId, energy: p.energy, maxEnergy: p.maxEnergy });

  if (def.cardType === 'UNIT') {
    p.stats.unitsPlayed++;
    const unit = makeUnit(ctx, card.cardId, playerId);
    if (!unit) fail('Invalid unit');
    const placed = summonUnit(ctx, playerId, card.cardId, { fromHand: true, position, unit });
    if (placed) {
      for (const ability of abilities) {
        runAbility(ctx, { source: { kind: 'unit', uid: placed.uid, cardId: placed.cardId, controller: playerId }, ability, target });
      }
    }
  } else if (def.cardType === 'SPELL') {
    p.stats.spellsPlayed++;
    p.spellsCastThisTurn++;
    for (const ability of abilities) {
      runAbility(ctx, { source: { kind: 'spell', uid: null, cardId: card.cardId, controller: playerId }, ability, target });
    }
    emit(ctx, { type: 'SPELL_CAST', player: playerId, cardId: card.cardId, target });
  } else if (def.cardType === 'RELIC') {
    const relic = { uid: ctx.state.nextUid++, cardId: card.cardId, owner: playerId, charges: def.charges ?? null };
    p.relics.push(relic);
    emit(ctx, { type: 'RELIC_PLAYED', player: playerId, uid: relic.uid, cardId: relic.cardId });
    for (const ability of abilities) {
      runAbility(ctx, { source: { kind: 'relic', uid: relic.uid, cardId: relic.cardId, controller: playerId }, ability, target });
    }
  } else if (def.cardType === 'LOCATION') {
    if (p.location) emit(ctx, { type: 'LOCATION_EXPIRED', player: playerId, uid: p.location.uid, cardId: p.location.cardId });
    const loc = { uid: ctx.state.nextUid++, cardId: card.cardId, owner: playerId, turnsRemaining: def.duration ?? null };
    p.location = loc;
    emit(ctx, { type: 'LOCATION_PLAYED', player: playerId, uid: loc.uid, cardId: loc.cardId });
    for (const ability of abilities) {
      runAbility(ctx, { source: { kind: 'location', uid: loc.uid, cardId: loc.cardId, controller: playerId }, ability, target });
    }
  }

  if (def.keywords?.includes('ECHO') && !card.echoCopy) {
    addToHand(ctx, playerId, makeCardInstance(ctx, card.cardId, { fleeting: true, echoCopy: true }));
  }

  resolveQueue(ctx);
}

function doAttack(ctx: EngineContext, playerId: PlayerId, attackerUid: number, target: TargetRef) {
  const state = ctx.state;
  if (state.phase !== 'MAIN' || state.activePlayer !== playerId) fail('Not your turn');
  const attacker = findUnit(state, attackerUid);
  if (!attacker || attacker.owner !== playerId) fail('Invalid attacker');
  const check = canAttack(state, attacker);
  if (!check.ok) fail(check.reason ?? 'Cannot attack');
  if (!attackTargets(state, attacker).some((t) => sameTarget(t, target))) fail('Invalid attack target');

  attacker.attacksThisTurn++;
  attacker.ambush = false;
  emit(ctx, { type: 'UNIT_ATTACKED', player: playerId, attackerUid, target });

  for (const ability of attacker.silenced ? [] : attacker.abilities.filter((a) => a.trigger === 'ON_ATTACK')) {
    runAbility(ctx, { source: { kind: 'unit', uid: attacker.uid, cardId: attacker.cardId, controller: playerId }, ability, target });
  }
  resolveQueue(ctx);
  if (isEnded(state)) return;

  const liveAttacker = findUnit(state, attackerUid);
  if (!liveAttacker || !isAlive(liveAttacker)) return;

  if (target.type === 'hero') {
    dealDamage(ctx, { player: playerId, unitUid: attackerUid, combat: true }, target, unitAttack(state, liveAttacker));
  } else {
    const defender = findUnit(state, target.uid);
    if (!defender || !isAlive(defender)) return;
    const atk = unitAttack(state, liveAttacker);
    const def = unitAttack(state, defender);
    dealDamage(ctx, { player: playerId, unitUid: attackerUid, combat: true }, target, atk);
    dealDamage(ctx, { player: defender.owner, unitUid: defender.uid, combat: true }, { type: 'unit', uid: attackerUid }, def);
    const defenderDies = defender.pendingDestroy || currentHealth(defender) <= 0;
    const attackerLives = !liveAttacker.pendingDestroy && currentHealth(liveAttacker) > 0;
    if (defenderDies && attackerLives && !liveAttacker.silenced) {
      queueOnKill(ctx, liveAttacker);
    }
  }
  checkDeaths(ctx);
  resolveQueue(ctx);
}

function queueOnKill(ctx: EngineContext, unit: UnitInstance) {
  unit.abilities.forEach((ability, index) => {
    if (ability.trigger !== 'ON_KILL') return;
    ctx.queue.push({
      source: { kind: 'unit', uid: unit.uid, cardId: unit.cardId, controller: unit.owner },
      ability,
      key: `kill:${ctx.state.eventSeq}:${unit.uid}:${index}`,
      depth: 1,
    });
  });
}

function doHeroPower(ctx: EngineContext, playerId: PlayerId, slot: number, target: TargetRef | undefined) {
  const state = ctx.state;
  const check = canUseHeroPower(state, playerId, slot);
  if (!check.ok) fail(check.reason ?? 'Cannot use Warden ability');
  const p = state.players[playerId];
  const ability = p.hero.abilities[slot];
  const power = activeLevelOf(state, playerId, slot)!;
  if (power.target) {
    const options = validTargets(state, playerId, power.target, { spellLike: true });
    if (target) {
      if (!isValidTarget(state, playerId, power.target, target, { spellLike: true })) fail('Invalid target');
    } else if (options.length > 0) fail('A target is required');
  } else target = undefined;
  p.energy -= power.cost;
  ability.uses++;
  emit(ctx, { type: 'HERO_POWER_USED', player: playerId, slot, abilityId: ability.id, target });
  emit(ctx, { type: 'ENERGY_CHANGED', player: playerId, energy: p.energy, maxEnergy: p.maxEnergy });
  runAbility(ctx, {
    source: { kind: 'hero', uid: null, cardId: ability.id, controller: playerId, talentSlot: slot },
    ability: { trigger: 'ON_CAST', effects: power.effects },
    target,
  });
  resolveQueue(ctx);
}

/**
 * Pure state transition: returns a new state; the input is never mutated.
 * Illegal actions return the unchanged state plus an error message.
 */
export function applyAction(state: GameState, action: GameAction): ActionResult {
  if (isEnded(state)) return { state, events: [], error: 'Game is over' };
  const draft = structuredClone(state);
  const ctx = createContext(draft);
  try {
    switch (action.type) {
      case 'MULLIGAN':
        doMulligan(ctx, action.player, action.replaceUids);
        break;
      case 'PLAY_CARD':
        doPlayCard(ctx, action.player, action.cardUid, action.target, action.position);
        break;
      case 'ATTACK':
        doAttack(ctx, action.player, action.attackerUid, action.target);
        break;
      case 'HERO_POWER':
        doHeroPower(ctx, action.player, action.slot ?? 0, action.target);
        break;
      case 'END_TURN':
        if (draft.phase !== 'MAIN' || draft.activePlayer !== action.player) fail('Not your turn');
        endTurn(ctx, action.player);
        break;
      case 'CONCEDE':
        endGame(ctx, other(action.player), 'CONCEDE');
        break;
    }
    checkDeaths(ctx);
    checkGameOver(ctx);
  } catch (e) {
    if (e instanceof ActionError) return { state, events: [], error: e.message };
    // Unexpected engine error: keep the previous state so the match can continue.
    console.error('[engine] action failed', action, e);
    return { state, events: [], error: 'Internal rules error' };
  }
  return { state: draft, events: ctx.events };
}
