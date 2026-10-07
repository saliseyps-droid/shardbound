import { collectibleCards, getCard } from '@/data/cards';
import { GAME_RULES } from '@/config/gameRules';
import { pickOne } from '@/core/rng';
import type { Condition, Effect, TargetSelector, ValueExpr } from '@/game/types';
import type { AbilitySource, EngineContext } from './context';
import { emit } from './triggers';
import type { PlayerId, TargetRef, UnitInstance } from './types';
import { other } from './types';
import { currentHealth, empower, findUnit, isAlive, targetExists, unitAttack } from './queries';
import {
  addToHand,
  dealDamage,
  drawCards,
  gainArmor,
  heal,
  makeCardInstance,
  randomIndex,
  removeUnitFromBoard,
  silenceUnit,
  summonUnit,
  transformUnit,
} from './ops';

// ---------------------------------------------------------------------------
// Values & conditions
// ---------------------------------------------------------------------------

function sourceUnit(ctx: EngineContext, source: AbilitySource): UnitInstance | undefined {
  return source.kind === 'unit' && source.uid !== null ? findUnit(ctx.state, source.uid) : undefined;
}

export function evalValue(ctx: EngineContext, v: ValueExpr | undefined, source: AbilitySource, target?: TargetRef): number {
  if (v === undefined) return 0;
  if (typeof v === 'number') return v;
  const me = ctx.state.players[source.controller];
  const them = ctx.state.players[other(source.controller)];
  let base = 0;
  switch (v.kind) {
    case 'ALLY_UNIT_COUNT':
      base = me.board.filter(isAlive).length;
      break;
    case 'ENEMY_UNIT_COUNT':
      base = them.board.filter(isAlive).length;
      break;
    case 'HAND_SIZE':
      base = me.hand.length;
      break;
    case 'ARMOR':
      base = me.hero.armor;
      break;
    case 'ALLY_DEATHS_THIS_GAME':
      base = me.allyDeathsThisGame;
      break;
    case 'SPELLS_CAST_THIS_TURN':
      base = me.spellsCastThisTurn;
      break;
    case 'SELF_ATTACK': {
      const u = sourceUnit(ctx, source);
      base = u ? unitAttack(ctx.state, u) : 0;
      break;
    }
    case 'SELF_HEALTH': {
      const u = sourceUnit(ctx, source);
      base = u ? currentHealth(u) : 0;
      break;
    }
    case 'TARGET_ATTACK': {
      const u = target?.type === 'unit' ? findUnit(ctx.state, target.uid) : undefined;
      base = u ? unitAttack(ctx.state, u) : 0;
      break;
    }
    case 'MAX_ENERGY':
      base = me.maxEnergy;
      break;
    case 'DAMAGED_ENEMY_COUNT':
      base = them.board.filter((u) => isAlive(u) && u.damage > 0).length;
      break;
    case 'FROZEN_ENEMY_COUNT':
      base = them.board.filter((u) => isAlive(u) && u.frozen).length;
      break;
  }
  let result = base * (v.times ?? 1) + (v.plus ?? 0);
  if (v.max !== undefined) result = Math.min(result, v.max);
  return Math.max(0, Math.floor(result));
}

export function checkConditions(ctx: EngineContext, c: Condition, source: AbilitySource, target?: TargetRef): boolean {
  const me = ctx.state.players[source.controller];
  const them = ctx.state.players[other(source.controller)];
  const targetUnit = target?.type === 'unit' ? findUnit(ctx.state, target.uid) : undefined;
  switch (c.kind) {
    case 'ALLY_UNITS_GTE':
      return me.board.filter(isAlive).length >= c.n;
    case 'ENEMY_UNITS_GTE':
      return them.board.filter(isAlive).length >= c.n;
    case 'HAND_SIZE_LTE':
      return me.hand.length <= c.n;
    case 'HERO_HEALTH_LTE':
      return me.hero.health <= c.n;
    case 'HAS_ARMOR':
      return me.hero.armor > 0;
    case 'ALLY_DIED_THIS_TURN':
      return me.allyDiedThisTurn;
    case 'SPELLS_CAST_THIS_TURN_GTE':
      return me.spellsCastThisTurn >= c.n;
    case 'CONTROLS_TAG':
      return me.board.some((u) => u.uid !== source.uid && isAlive(u) && (getCard(u.cardId)?.tags ?? []).includes(c.tag));
    case 'ALLY_DEATHS_GTE':
      return me.allyDeathsThisGame >= c.n;
    case 'TARGET_DAMAGED':
      return !!targetUnit && targetUnit.damage > 0;
    case 'TARGET_FROZEN':
      return !!targetUnit && targetUnit.frozen;
    case 'TARGET_IS_UNIT':
      return !!targetUnit;
    case 'MAX_ENERGY_GTE':
      return me.maxEnergy >= c.n;
    case 'CARDS_PLAYED_THIS_TURN_GTE':
      // The source card itself counts as played already.
      return me.cardsPlayedThisTurn - 1 >= c.n;
  }
}

// ---------------------------------------------------------------------------
// Target resolution
// ---------------------------------------------------------------------------

const unitRef = (u: UnitInstance): TargetRef => ({ type: 'unit', uid: u.uid });

function targetOwner(ctx: EngineContext, t: TargetRef): PlayerId | undefined {
  return t.type === 'hero' ? t.player : findUnit(ctx.state, t.uid)?.owner;
}
const heroRef = (p: PlayerId): TargetRef => ({ type: 'hero', player: p });

function liveUnits(ctx: EngineContext, p: PlayerId): UnitInstance[] {
  return ctx.state.players[p].board.filter(isAlive);
}

function adjacentTo(ctx: EngineContext, uid: number | undefined): UnitInstance[] {
  if (uid === undefined) return [];
  const u = findUnit(ctx.state, uid);
  if (!u) return [];
  const board = ctx.state.players[u.owner].board;
  const i = board.findIndex((x) => x.uid === uid);
  return [board[i - 1], board[i + 1]].filter((x): x is UnitInstance => !!x && isAlive(x));
}

export function resolveTargets(
  ctx: EngineContext,
  selector: TargetSelector,
  source: AbilitySource,
  chosen: TargetRef | undefined,
  triggerUnitUid: number | undefined,
): TargetRef[] {
  const me = source.controller;
  const them = other(me);
  const selfUid = source.kind === 'unit' ? source.uid ?? undefined : undefined;
  switch (selector) {
    case 'SELF':
      if (source.kind === 'unit' && source.uid !== null) {
        const u = findUnit(ctx.state, source.uid);
        return u && isAlive(u) ? [unitRef(u)] : [];
      }
      return [heroRef(me)];
    case 'TARGET':
      return chosen && targetExists(ctx.state, chosen) ? [chosen] : [];
    case 'TRIGGER_UNIT': {
      if (triggerUnitUid === undefined) return [];
      const u = findUnit(ctx.state, triggerUnitUid);
      return u && isAlive(u) ? [unitRef(u)] : [];
    }
    case 'ALLY_HERO':
      return [heroRef(me)];
    case 'ENEMY_HERO':
      return [heroRef(them)];
    case 'BOTH_HEROES':
      return [heroRef(me), heroRef(them)];
    case 'ALL_ALLY_UNITS':
      return liveUnits(ctx, me).map(unitRef);
    case 'OTHER_ALLY_UNITS':
      return liveUnits(ctx, me).filter((u) => u.uid !== selfUid).map(unitRef);
    case 'ALL_ENEMY_UNITS':
      return liveUnits(ctx, them).map(unitRef);
    case 'ALL_UNITS':
      return [...liveUnits(ctx, me), ...liveUnits(ctx, them)].map(unitRef);
    case 'ALL_OTHER_UNITS':
      return [...liveUnits(ctx, me), ...liveUnits(ctx, them)].filter((u) => u.uid !== selfUid).map(unitRef);
    case 'ALL_ENEMIES':
      return [...liveUnits(ctx, them).map(unitRef), heroRef(them)];
    case 'ALL_ALLIES':
      return [...liveUnits(ctx, me).map(unitRef), heroRef(me)];
    case 'EVERYONE':
      return [...liveUnits(ctx, me).map(unitRef), ...liveUnits(ctx, them).map(unitRef), heroRef(me), heroRef(them)];
    case 'RANDOM_ENEMY_UNIT': {
      const pick = pickOne(ctx.state.rng, liveUnits(ctx, them));
      return pick ? [unitRef(pick)] : [];
    }
    case 'RANDOM_ENEMY': {
      const options: TargetRef[] = [...liveUnits(ctx, them).map(unitRef), heroRef(them)];
      return [pickOne(ctx.state.rng, options)!];
    }
    case 'RANDOM_ALLY_UNIT': {
      const pick = pickOne(ctx.state.rng, liveUnits(ctx, me));
      return pick ? [unitRef(pick)] : [];
    }
    case 'RANDOM_OTHER_ALLY_UNIT': {
      const pick = pickOne(ctx.state.rng, liveUnits(ctx, me).filter((u) => u.uid !== selfUid));
      return pick ? [unitRef(pick)] : [];
    }
    case 'ADJACENT': {
      const anchor = source.kind === 'unit' && !source.fromGraveyard ? selfUid : chosen?.type === 'unit' ? chosen.uid : undefined;
      return adjacentTo(ctx, anchor).map(unitRef);
    }
    case 'TARGET_AND_ADJACENT': {
      if (!chosen || !targetExists(ctx.state, chosen)) return [];
      if (chosen.type === 'hero') return [chosen];
      return [chosen, ...adjacentTo(ctx, chosen.uid).map(unitRef)];
    }
  }
}

function defaultSelector(effect: Effect): TargetSelector {
  switch (effect.type) {
    case 'GAIN_ARMOR':
    case 'REMOVE_ARMOR':
    case 'DRAW_CARDS':
    case 'GAIN_ENERGY':
    case 'GAIN_MAX_ENERGY':
    case 'DESTROY_ENERGY':
    case 'REDUCE_COST':
    case 'CREATE_CARD':
    case 'STEAL_CARD':
    case 'DISCARD':
    case 'RESURRECT':
    case 'MILL':
    case 'SUMMON':
      return 'ALLY_HERO';
    default:
      return 'TARGET';
  }
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

function unitsOnly(ctx: EngineContext, targets: TargetRef[]): UnitInstance[] {
  return targets
    .map((t) => (t.type === 'unit' ? findUnit(ctx.state, t.uid) : undefined))
    .filter((u): u is UnitInstance => !!u && isAlive(u));
}

function randomPoolCard(ctx: EngineContext, pool: NonNullable<Extract<Effect, { type: 'CREATE_CARD' }>['pool']>): string | undefined {
  const candidates = collectibleCards().filter(
    (c) =>
      (!pool.faction || c.faction === pool.faction) &&
      (!pool.cardType || c.cardType === pool.cardType) &&
      (!pool.tag || (c.tags ?? []).includes(pool.tag)) &&
      (pool.maxCost === undefined || c.manaCost <= pool.maxCost) &&
      (!pool.rarity || c.rarity === pool.rarity),
  );
  return pickOne(ctx.state.rng, candidates)?.id;
}

export function executeEffect(
  ctx: EngineContext,
  effect: Effect,
  source: AbilitySource,
  chosen: TargetRef | undefined,
  triggerUnitUid: number | undefined,
): boolean {
  const state = ctx.state;
  const me = source.controller;
  const them = other(me);
  const selector = effect.target ?? defaultSelector(effect);
  const srcUnitUid = source.kind === 'unit' && !source.fromGraveyard ? source.uid ?? undefined : undefined;
  const damageSource = { player: me, unitUid: srcUnitUid, isSpell: source.kind === 'spell' };

  switch (effect.type) {
    case 'DEAL_DAMAGE': {
      const targets = resolveTargets(ctx, selector, source, chosen, triggerUnitUid);
      let amount = evalValue(ctx, effect.amount, source, chosen);
      // "If ..., deal N more" is part of the same hit, so Empower and Barrier apply once.
      if (effect.bonus && checkConditions(ctx, effect.bonus.condition, source, chosen)) amount += effect.bonus.amount;
      // Empower boosts spell damage to enemies only, never to your own side.
      const bonus = source.kind === 'spell' ? empower(state, me) : 0;
      // Area damage is dealt simultaneously: snapshot targets first.
      for (const t of targets) dealDamage(ctx, damageSource, t, amount + (bonus > 0 && targetOwner(ctx, t) === them ? bonus : 0));
      return targets.length > 0;
    }
    case 'HEAL': {
      const amount = evalValue(ctx, effect.amount, source, chosen);
      const targets = resolveTargets(ctx, selector, source, chosen, triggerUnitUid);
      for (const t of targets) heal(ctx, t, amount, me);
      return targets.length > 0;
    }
    case 'BUFF': {
      // Literal numbers may be negative (debuffs); expressions are always non-negative.
      const signed = (v: ValueExpr | undefined) => (typeof v === 'number' ? v : evalValue(ctx, v, source, chosen));
      const realAtk = signed(effect.attack);
      const realHp = signed(effect.health);
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) {
        if (effect.temporary) u.tempAttack += realAtk;
        else u.attackBuff += realAtk;
        u.healthBuff += realHp;
        emit(ctx, { type: 'UNIT_BUFFED', uid: u.uid, attack: realAtk, health: realHp });
      }
      return units.length > 0;
    }
    case 'SET_STATS': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) {
        if (effect.attack !== undefined) {
          u.baseAttack = effect.attack;
          u.attackBuff = 0;
          u.tempAttack = 0;
        }
        if (effect.health !== undefined) {
          u.baseHealth = effect.health;
          u.healthBuff = 0;
          u.damage = 0;
        }
        emit(ctx, { type: 'UNIT_BUFFED', uid: u.uid, attack: 0, health: 0 });
      }
      return units.length > 0;
    }
    case 'DRAW_CARDS': {
      const who = effect.opponent ? them : me;
      drawCards(ctx, who, evalValue(ctx, effect.amount, source, chosen), effect.filter);
      return true;
    }
    case 'SUMMON': {
      const who = effect.forOpponent ? them : me;
      const count = effect.count ?? 1;
      let position = source.kind === 'unit' && source.position !== undefined && who === me ? source.position : undefined;
      if (source.kind === 'unit' && !source.fromGraveyard && srcUnitUid !== undefined && who === me) {
        const idx = state.players[me].board.findIndex((u) => u.uid === srcUnitUid);
        if (idx >= 0) position = idx + 1;
      }
      let summoned = false;
      for (let i = 0; i < count; i++) {
        const unit = summonUnit(ctx, who, effect.cardId, { position });
        if (unit) summoned = true;
        if (unit && position !== undefined) position++;
      }
      return summoned;
    }
    case 'DESTROY': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) u.pendingDestroy = true;
      return units.length > 0;
    }
    case 'DISCARD': {
      const who = state.players[effect.opponent ? them : me];
      for (let i = 0; i < effect.amount && who.hand.length > 0; i++) {
        const [card] = who.hand.splice(randomIndex(ctx, who.hand.length), 1);
        emit(ctx, { type: 'CARD_DISCARDED', player: who.id, cardId: card.cardId });
      }
      return true;
    }
    case 'GAIN_ENERGY': {
      const p = state.players[me];
      p.energy = Math.min(GAME_RULES.maxEnergy, p.energy + effect.amount);
      emit(ctx, { type: 'ENERGY_CHANGED', player: me, energy: p.energy, maxEnergy: p.maxEnergy });
      return true;
    }
    case 'GAIN_MAX_ENERGY': {
      const p = state.players[me];
      const before = p.maxEnergy;
      p.maxEnergy = Math.min(GAME_RULES.maxEnergy, p.maxEnergy + effect.amount);
      if (!effect.empty) p.energy = Math.min(GAME_RULES.maxEnergy, p.energy + (p.maxEnergy - before));
      emit(ctx, { type: 'ENERGY_CHANGED', player: me, energy: p.energy, maxEnergy: p.maxEnergy });
      return true;
    }
    case 'DESTROY_ENERGY': {
      const p = state.players[them];
      p.maxEnergy = Math.max(0, p.maxEnergy - effect.amount);
      p.energy = Math.min(p.energy, p.maxEnergy);
      emit(ctx, { type: 'ENERGY_CHANGED', player: them, energy: p.energy, maxEnergy: p.maxEnergy });
      return true;
    }
    case 'REDUCE_COST': {
      const hand = state.players[me].hand.filter((c) => {
        const def = getCard(c.cardId);
        if (!def) return false;
        if (effect.filter?.cardType && def.cardType !== effect.filter.cardType) return false;
        if (effect.filter?.tag && !(def.tags ?? []).includes(effect.filter.tag)) return false;
        return true;
      });
      if (hand.length === 0) return false;
      if (effect.scope === 'HAND') hand.forEach((c) => (c.costMod -= effect.amount));
      else if (effect.scope === 'RANDOM_HAND_CARD') hand[randomIndex(ctx, hand.length)].costMod -= effect.amount;
      else {
        const top = [...hand].sort((a, b) => (getCard(b.cardId)?.manaCost ?? 0) + b.costMod - ((getCard(a.cardId)?.manaCost ?? 0) + a.costMod))[0];
        top.costMod -= effect.amount;
      }
      return true;
    }
    case 'RETURN_TO_HAND': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) {
        removeUnitFromBoard(ctx, u);
        emit(ctx, { type: 'UNIT_RETURNED', player: u.owner, uid: u.uid, cardId: u.cardId });
        if (getCard(u.cardId)?.collectible !== false) {
          addToHand(ctx, u.owner, makeCardInstance(ctx, u.cardId, { costMod: -(effect.costReduction ?? 0), revealed: true }));
        }
      }
      return units.length > 0;
    }
    case 'APPLY_STATUS': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) {
        if (effect.status === 'FROZEN') {
          u.frozen = true;
          u.thawPending = false;
        } else if (effect.status === 'BURN') u.burn += effect.amount ?? 1;
        else if (effect.status === 'BARRIER') u.barrier = true;
        else if (effect.status === 'AMBUSH') u.ambush = true;
        emit(ctx, { type: 'STATUS_APPLIED', uid: u.uid, status: effect.status, amount: effect.amount });
      }
      return units.length > 0;
    }
    case 'GRANT_KEYWORD': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) {
        if (!u.keywords.includes(effect.keyword)) u.keywords.push(effect.keyword);
        if (effect.keyword === 'BARRIER') u.barrier = true;
        if (effect.keyword === 'AMBUSH') u.ambush = true;
        emit(ctx, { type: 'STATUS_APPLIED', uid: u.uid, status: effect.keyword });
      }
      return units.length > 0;
    }
    case 'SILENCE': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) silenceUnit(ctx, u);
      return units.length > 0;
    }
    case 'CREATE_CARD': {
      const count = effect.count ?? 1;
      for (let i = 0; i < count; i++) {
        const cardId = effect.cardId ?? (effect.pool ? randomPoolCard(ctx, effect.pool) : undefined);
        if (!cardId || !getCard(cardId)) continue;
        const inst = makeCardInstance(ctx, cardId, { fleeting: effect.fleeting, costMod: -(effect.costReduction ?? 0) });
        if (effect.destination === 'HAND') {
          if (addToHand(ctx, me, inst)) emit(ctx, { type: 'CARD_CREATED', player: me, cardId, destination: 'HAND' });
        } else {
          const deck = state.players[me].deck;
          deck.splice(randomIndex(ctx, deck.length + 1), 0, inst);
          emit(ctx, { type: 'CARD_CREATED', player: me, cardId, destination: 'DECK' });
        }
      }
      return true;
    }
    case 'COPY_CARD': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) {
        if (addToHand(ctx, me, makeCardInstance(ctx, u.cardId))) emit(ctx, { type: 'CARD_CREATED', player: me, cardId: u.cardId, destination: 'HAND' });
      }
      return units.length > 0;
    }
    case 'STEAL_CARD': {
      const victim = state.players[them];
      const pile = effect.from === 'DECK' ? victim.deck : victim.hand;
      for (let i = 0; i < effect.amount && pile.length > 0; i++) {
        const [card] = pile.splice(randomIndex(ctx, pile.length), 1);
        card.revealed = true;
        if (addToHand(ctx, me, card)) emit(ctx, { type: 'CARD_STOLEN', player: me, cardId: card.cardId });
      }
      return true;
    }
    case 'TAKE_CONTROL': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) {
        if (u.owner === me) continue;
        if (state.players[me].board.length >= GAME_RULES.maxBoardSize) {
          u.pendingDestroy = true;
          continue;
        }
        removeUnitFromBoard(ctx, u);
        u.owner = me;
        u.summonedThisTurn = true;
        u.attacksThisTurn = 0;
        state.players[me].board.push(u);
        emit(ctx, { type: 'CONTROL_CHANGED', uid: u.uid, newOwner: me });
      }
      return units.length > 0;
    }
    case 'GAIN_ARMOR':
      gainArmor(ctx, me, evalValue(ctx, effect.amount, source, chosen));
      return true;
    case 'REMOVE_ARMOR': {
      const hero = state.players[me].hero;
      if (hero.armor <= 0) return false;
      hero.armor = 0;
      return true;
    }
    case 'TRANSFORM': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) transformUnit(ctx, u, effect.cardId);
      return units.length > 0;
    }
    case 'RESURRECT': {
      const p = state.players[me];
      const pool = p.graveyard.filter((id) => {
        const def = getCard(id);
        return !!def && def.cardType === 'UNIT' && (effect.maxCost === undefined || def.manaCost <= effect.maxCost);
      });
      for (let i = 0; i < effect.count && pool.length > 0; i++) {
        const [cardId] = pool.splice(randomIndex(ctx, pool.length), 1);
        summonUnit(ctx, me, cardId);
      }
      return true;
    }
    case 'READY_UNIT': {
      const units = unitsOnly(ctx, resolveTargets(ctx, selector, source, chosen, triggerUnitUid));
      for (const u of units) {
        u.attacksThisTurn = 0;
        u.summonedThisTurn = false;
      }
      return units.length > 0;
    }
    case 'MILL': {
      const p = state.players[effect.opponent ? them : me];
      for (let i = 0; i < effect.amount && p.deck.length > 0; i++) {
        const [card] = p.deck.splice(0, 1);
        emit(ctx, { type: 'CARD_BURNED', player: p.id, cardId: card.cardId });
      }
      return true;
    }
  }
}
