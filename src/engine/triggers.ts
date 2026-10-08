import { getCard, getCardSafe } from '@/data/cards';
import type { Ability, TriggerType } from '@/game/types';
import { getTalent } from '@/data/wardenTalents';
import { GAME_RULES } from '@/config/gameRules';
import type { AbilitySource, EngineContext, PendingAbility } from './context';
import { pushEvent } from './context';
import type { GameEvent, NewGameEvent, PlayerId, TargetRef } from './types';
import { isEnded, other } from './types';
import { findUnit } from './queries';
import { checkConditions, evalValue, executeEffect } from './effects';
import { checkDeaths, checkGameOver } from './ops';

/** Emits an event and collects every trigger that listens for it. */
export function emit(ctx: EngineContext, event: NewGameEvent): GameEvent {
  const full = pushEvent(ctx, event);
  collectTriggers(ctx, full);
  return full;
}

interface Listener {
  source: AbilitySource;
  abilities: Ability[];
  /** Passive Warden abilities: max triggers per turn. */
  limitPerTurn?: number;
}

/** All permanent ability sources controlled by a player, in board order. */
function listenersFor(ctx: EngineContext, playerId: PlayerId): Listener[] {
  const p = ctx.state.players[playerId];
  const out: Listener[] = [];
  for (const u of p.board) {
    if (u.silenced || u.pendingDestroy) continue;
    out.push({ source: { kind: 'unit', uid: u.uid, cardId: u.cardId, controller: playerId }, abilities: u.abilities });
  }
  for (const r of p.relics) {
    out.push({ source: { kind: 'relic', uid: r.uid, cardId: r.cardId, controller: playerId }, abilities: getCard(r.cardId)?.abilities ?? [] });
  }
  for (const r of p.rules ?? []) {
    out.push({ source: { kind: 'rule', uid: r.uid, cardId: r.cardId, controller: playerId }, abilities: getCard(r.cardId)?.abilities ?? [] });
  }
  if (p.location) {
    const l = p.location;
    out.push({ source: { kind: 'location', uid: l.uid, cardId: l.cardId, controller: playerId }, abilities: getCard(l.cardId)?.abilities ?? [] });
  }
  p.hero.abilities.forEach((a, slot) => {
    const talent = getTalent(a.id);
    if (talent?.kind !== 'PASSIVE') return;
    const level = talent.levels[a.level];
    if (!level) return;
    out.push({ source: { kind: 'hero', uid: null, cardId: a.id, controller: playerId, talentSlot: slot, passive: true }, abilities: level.abilities, limitPerTurn: level.limitPerTurn });
  });
  return out;
}

function queueFor(
  ctx: EngineContext,
  playerId: PlayerId,
  trigger: TriggerType,
  event: GameEvent,
  opts: { triggerUnitUid?: number; excludeUid?: number; tagCheckCardId?: string } = {},
) {
  const filterCard = opts.tagCheckCardId ? getCardSafe(opts.tagCheckCardId) : undefined;
  for (const l of listenersFor(ctx, playerId)) {
    if (opts.excludeUid !== undefined && l.source.uid === opts.excludeUid) continue;
    l.abilities.forEach((ability, index) => {
      if (ability.trigger !== trigger) return;
      if (ability.filter && filterCard) {
        if (ability.filter.tag && !(filterCard.tags ?? []).includes(ability.filter.tag)) return;
        if (ability.filter.cardType && ability.filter.cardType !== filterCard.cardType) return;
      }
      const key = `${event.seq}:${l.source.kind}:${l.source.uid ?? `slot${l.source.talentSlot}`}:${index}`;
      if (l.limitPerTurn !== undefined) {
        const slotState = ctx.state.players[playerId].hero.abilities[l.source.talentSlot!];
        if (ctx.seenKeys.has(key) || slotState.uses >= l.limitPerTurn) return;
        slotState.uses++;
      }
      enqueue(ctx, {
        source: l.source,
        ability,
        triggerUnitUid: opts.triggerUnitUid,
        key,
        depth: ctx.depth + 1,
      });
    });
  }
}

export function collectTriggers(ctx: EngineContext, event: GameEvent) {
  if (isEnded(ctx.state)) return;
  switch (event.type) {
    case 'UNIT_SUMMONED':
      queueFor(ctx, event.player, 'ALLY_SUMMONED', event, { triggerUnitUid: event.uid, excludeUid: event.uid, tagCheckCardId: event.cardId });
      break;
    case 'UNIT_DIED':
      queueFor(ctx, event.player, 'ALLY_DIED', event, { triggerUnitUid: event.uid, excludeUid: event.uid, tagCheckCardId: event.cardId });
      queueFor(ctx, other(event.player), 'ENEMY_DIED', event, { triggerUnitUid: event.uid, tagCheckCardId: event.cardId });
      break;
    case 'SPELL_CAST':
      queueFor(ctx, event.player, 'FRIENDLY_SPELL_CAST', event, { tagCheckCardId: event.cardId });
      break;
    case 'CARD_DRAWN':
      queueFor(ctx, event.player, 'CARD_DRAWN', event, { tagCheckCardId: event.cardId });
      break;
    case 'HEALED': {
      const owner = event.target.type === 'hero' ? event.target.player : findUnit(ctx.state, event.target.uid)?.owner;
      if (owner !== undefined) {
        queueFor(ctx, owner, 'ALLY_HEALED', event, { triggerUnitUid: event.target.type === 'unit' ? event.target.uid : undefined });
      }
      break;
    }
    case 'HERO_DAMAGED':
      queueFor(ctx, other(event.player), 'ENEMY_HERO_DAMAGED', event);
      break;
    case 'ARMOR_GAINED':
      queueFor(ctx, event.player, 'ARMOR_GAINED', event);
      break;
    case 'DAMAGE_DEALT': {
      if (event.target.type !== 'unit' || event.amount <= 0) break;
      const unit = findUnit(ctx.state, event.target.uid);
      if (!unit || unit.silenced) break;
      unit.abilities.forEach((ability, index) => {
        if (ability.trigger !== 'ON_DAMAGED') return;
        enqueue(ctx, {
          source: { kind: 'unit', uid: unit.uid, cardId: unit.cardId, controller: unit.owner },
          ability,
          triggerUnitUid: unit.uid,
          key: `${event.seq}:dmg:${unit.uid}:${index}`,
          depth: ctx.depth + 1,
        });
      });
      break;
    }
    default:
      break;
  }
}

/** Queues abilities of a specific trigger for all of a player's sources (turn start/end). */
export function queuePlayerTrigger(ctx: EngineContext, playerId: PlayerId, trigger: 'TURN_START' | 'TURN_END', event: GameEvent) {
  queueFor(ctx, playerId, trigger, event);
}

export function enqueue(ctx: EngineContext, pending: PendingAbility) {
  if (ctx.seenKeys.has(pending.key)) return; // duplicated trigger protection
  if (pending.depth > GAME_RULES.maxTriggerDepth) return; // recursion protection
  ctx.seenKeys.add(pending.key);
  ctx.queue.push(pending);
}

function sourceStillValid(ctx: EngineContext, source: AbilitySource): boolean {
  if (source.fromGraveyard || source.kind === 'spell' || source.kind === 'hero' || source.kind === 'rule') return true;
  const p = ctx.state.players[source.controller];
  if (source.kind === 'unit') {
    const u = findUnit(ctx.state, source.uid!);
    return !!u && !u.silenced && !u.pendingDestroy && u.damage < u.baseHealth + u.healthBuff;
  }
  if (source.kind === 'relic') return p.relics.some((r) => r.uid === source.uid);
  return p.location?.uid === source.uid;
}

/** Resolves one ability immediately (all its effects, with death checks between effects). */
export function runAbility(ctx: EngineContext, pending: Omit<PendingAbility, 'key' | 'depth'> & { depth?: number }): boolean {
  const { source, ability } = pending;
  if (isEnded(ctx.state) || ctx.aborted) return false;
  if (ability.condition && !checkConditions(ctx, ability.condition, source, pending.target)) return false;
  const prevDepth = ctx.depth;
  ctx.depth = pending.depth ?? ctx.depth;
  /** Whether any effect found a target / did something (relics only spend a charge then). */
  let acted = false;
  try {
    for (const effect of ability.effects) {
      if (isEnded(ctx.state)) break;
      if (effect.condition && !checkConditions(ctx, effect.condition, source, pending.target)) continue;
      // A literal repeat always resolves at least once; an expression may resolve to 0 times.
      const times =
        typeof effect.repeat === 'object'
          ? Math.min(evalValue(ctx, effect.repeat, source, pending.target), 20)
          : Math.max(1, Math.min(effect.repeat ?? 1, 20));
      for (let i = 0; i < times; i++) {
        if (executeEffect(ctx, effect, source, pending.target, pending.triggerUnitUid)) acted = true;
        checkDeaths(ctx);
        if (checkGameOver(ctx)) break;
      }
    }
  } finally {
    ctx.depth = prevDepth;
  }
  if (source.kind !== 'spell' && source.kind !== 'hero') {
    pushEvent(ctx, { type: 'TRIGGER_RESOLVED', player: source.controller, sourceCardId: source.cardId, trigger: ability.trigger });
  }
  if (source.passive && source.talentSlot !== undefined) {
    pushEvent(ctx, { type: 'HERO_ABILITY_TRIGGERED', player: source.controller, slot: source.talentSlot, abilityId: source.cardId });
  }
  if (acted) consumeRelicCharge(ctx, source);
  return true;
}

function consumeRelicCharge(ctx: EngineContext, source: AbilitySource) {
  if (source.kind !== 'relic') return;
  const p = ctx.state.players[source.controller];
  const relic = p.relics.find((r) => r.uid === source.uid);
  if (!relic || relic.charges === null) return;
  relic.charges -= 1;
  if (relic.charges <= 0) {
    p.relics = p.relics.filter((r) => r.uid !== relic.uid);
    emit(ctx, { type: 'RELIC_BROKEN', player: p.id, uid: relic.uid, cardId: relic.cardId });
  }
}

/** Drains the trigger queue FIFO with loop protection. */
export function resolveQueue(ctx: EngineContext) {
  while (ctx.queue.length > 0 && !isEnded(ctx.state)) {
    if (ctx.resolutions >= GAME_RULES.maxTriggerResolutionsPerAction) {
      ctx.queue.length = 0;
      ctx.aborted = true;
      pushEvent(ctx, { type: 'TRIGGER_LIMIT_REACHED' });
      break;
    }
    const next = ctx.queue.shift()!;
    if (!sourceStillValid(ctx, next.source)) continue;
    ctx.resolutions++;
    runAbility(ctx, next);
  }
  checkDeaths(ctx);
  checkGameOver(ctx);
  if (ctx.queue.length > 0 && !isEnded(ctx.state)) resolveQueue(ctx);
}

export function targetFromTrigger(uid: number | undefined): TargetRef | undefined {
  return uid === undefined ? undefined : { type: 'unit', uid };
}
