import { getCard, getCardSafe } from '@/data/cards';
import { GAME_RULES } from '@/config/gameRules';
import { nextInt } from '@/core/rng';
import type { EngineContext } from './context';
import { emit, enqueue } from './triggers';
import type { CardInstance, PlayerId, TargetRef, UnitInstance } from './types';
import { isEnded, other } from './types';
import { currentHealth, findUnit, hasKeyword, maxHealth } from './queries';

export function newUid(ctx: EngineContext): number {
  return ctx.state.nextUid++;
}

export function makeCardInstance(ctx: EngineContext, cardId: string, extra: Partial<CardInstance> = {}): CardInstance {
  return { uid: newUid(ctx), cardId, costMod: 0, ...extra };
}

export function makeUnit(ctx: EngineContext, cardId: string, owner: PlayerId): UnitInstance | null {
  const def = getCard(cardId);
  if (!def || def.cardType !== 'UNIT') return null;
  const keywords = [...(def.keywords ?? [])];
  return {
    uid: newUid(ctx),
    cardId,
    owner,
    baseAttack: def.attack ?? 0,
    baseHealth: def.health ?? 1,
    attackBuff: 0,
    healthBuff: 0,
    tempAttack: 0,
    damage: 0,
    keywords,
    keywordValues: { ...(def.keywordValues ?? {}) },
    abilities: structuredClone(def.abilities ?? []),
    frozen: false,
    thawPending: false,
    burn: 0,
    barrier: keywords.includes('BARRIER'),
    ambush: keywords.includes('AMBUSH'),
    silenced: false,
    summonedThisTurn: true,
    attacksThisTurn: 0,
    pendingDestroy: false,
    playOrder: ctx.state.nextUid,
  };
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export function addToHand(ctx: EngineContext, playerId: PlayerId, card: CardInstance): boolean {
  const p = ctx.state.players[playerId];
  if (p.hand.length >= GAME_RULES.maxHandSize) {
    emit(ctx, { type: 'CARD_BURNED', player: playerId, cardId: card.cardId });
    return false;
  }
  p.hand.push(card);
  return true;
}

export function drawCards(
  ctx: EngineContext,
  playerId: PlayerId,
  count: number,
  filter?: { cardType?: string; tag?: string; maxCost?: number },
) {
  const p = ctx.state.players[playerId];
  for (let i = 0; i < count; i++) {
    if (isEnded(ctx.state)) return;
    let index = 0;
    if (filter) {
      index = p.deck.findIndex((c) => {
        const def = getCard(c.cardId);
        if (!def) return false;
        if (filter.cardType && def.cardType !== filter.cardType) return false;
        if (filter.tag && !(def.tags ?? []).includes(filter.tag)) return false;
        if (filter.maxCost !== undefined && def.manaCost > filter.maxCost) return false;
        return true;
      });
      if (index < 0) return; // filtered draws never fatigue
    }
    if (p.deck.length === 0) {
      p.fatigue += 1;
      emit(ctx, { type: 'FATIGUE', player: playerId, damage: p.fatigue });
      damageHero(ctx, playerId, p.fatigue, playerId, false);
      continue;
    }
    const [card] = p.deck.splice(index, 1);
    if (addToHand(ctx, playerId, card)) {
      p.stats.cardsDrawn++;
      emit(ctx, { type: 'CARD_DRAWN', player: playerId, cardUid: card.uid, cardId: card.cardId });
    }
  }
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

export function summonUnit(
  ctx: EngineContext,
  playerId: PlayerId,
  cardId: string,
  opts: { fromHand?: boolean; position?: number; unit?: UnitInstance } = {},
): UnitInstance | null {
  const p = ctx.state.players[playerId];
  if (p.board.length >= GAME_RULES.maxBoardSize) return null;
  const unit = opts.unit ?? makeUnit(ctx, cardId, playerId);
  if (!unit) return null;
  unit.owner = playerId;
  const pos = opts.position === undefined ? p.board.length : Math.max(0, Math.min(p.board.length, opts.position));
  p.board.splice(pos, 0, unit);
  emit(ctx, { type: 'UNIT_SUMMONED', player: playerId, uid: unit.uid, cardId: unit.cardId, fromHand: !!opts.fromHand });
  return unit;
}

export function removeUnitFromBoard(ctx: EngineContext, unit: UnitInstance): number {
  const board = ctx.state.players[unit.owner].board;
  const idx = board.findIndex((u) => u.uid === unit.uid);
  if (idx >= 0) board.splice(idx, 1);
  return idx;
}

// ---------------------------------------------------------------------------
// Damage & healing
// ---------------------------------------------------------------------------

export interface DamageSource {
  player: PlayerId;
  unitUid?: number;
  isSpell?: boolean;
  combat?: boolean;
}

function creditDamage(ctx: EngineContext, source: DamageSource, targetOwner: PlayerId, amount: number, hero: boolean) {
  if (amount <= 0 || source.player === targetOwner) return;
  const stats = ctx.state.players[source.player].stats;
  stats.damageDealt += amount;
  if (hero) stats.heroDamageDealt += amount;
}

export function damageHero(ctx: EngineContext, playerId: PlayerId, amount: number, sourcePlayer: PlayerId, combat: boolean, sourceUid?: number) {
  if (amount <= 0) return 0;
  const hero = ctx.state.players[playerId].hero;
  const absorbed = Math.min(hero.armor, amount);
  hero.armor -= absorbed;
  const lost = amount - absorbed;
  hero.health -= lost;
  creditDamage(ctx, { player: sourcePlayer }, playerId, amount, true);
  emit(ctx, { type: 'DAMAGE_DEALT', target: { type: 'hero', player: playerId }, amount, sourcePlayer, sourceUid, combat });
  if (lost > 0) emit(ctx, { type: 'HERO_DAMAGED', player: playerId, amount: lost });
  return amount;
}

/** Deals damage and applies Barrier, Venom, Drain and Ambush rules. Returns damage actually dealt. */
export function dealDamage(ctx: EngineContext, source: DamageSource, target: TargetRef, amount: number): number {
  if (amount <= 0 || isEnded(ctx.state)) return 0;
  const sourceUnit = source.unitUid !== undefined ? findUnit(ctx.state, source.unitUid) : undefined;
  let dealt = 0;
  if (target.type === 'hero') {
    dealt = damageHero(ctx, target.player, amount, source.player, !!source.combat, source.unitUid);
  } else {
    const unit = findUnit(ctx.state, target.uid);
    if (!unit || currentHealth(unit) <= 0) return 0;
    if (unit.barrier) {
      unit.barrier = false;
      emit(ctx, { type: 'BARRIER_BROKEN', uid: unit.uid });
      return 0;
    }
    unit.damage += amount;
    dealt = amount;
    creditDamage(ctx, source, unit.owner, amount, false);
    if (sourceUnit && !sourceUnit.silenced && hasKeyword(ctx.state, sourceUnit, 'VENOM')) unit.pendingDestroy = true;
    emit(ctx, { type: 'DAMAGE_DEALT', target, amount, sourcePlayer: source.player, sourceUid: source.unitUid, combat: !!source.combat });
  }
  if (sourceUnit && dealt > 0) {
    sourceUnit.ambush = false;
    if (hasKeyword(ctx.state, sourceUnit, 'DRAIN')) heal(ctx, { type: 'hero', player: sourceUnit.owner }, dealt, sourceUnit.owner);
  }
  return dealt;
}

export function heal(ctx: EngineContext, target: TargetRef, amount: number, sourcePlayer: PlayerId): number {
  if (amount <= 0) return 0;
  let healed = 0;
  if (target.type === 'hero') {
    const hero = ctx.state.players[target.player].hero;
    if (hero.health <= 0) return 0;
    healed = Math.min(amount, hero.maxHealth - hero.health);
    hero.health += healed;
  } else {
    const unit = findUnit(ctx.state, target.uid);
    if (!unit || currentHealth(unit) <= 0) return 0;
    healed = Math.min(amount, unit.damage);
    unit.damage -= healed;
  }
  if (healed > 0) {
    ctx.state.players[sourcePlayer].stats.healingDone += healed;
    emit(ctx, { type: 'HEALED', target, amount: healed });
  }
  return healed;
}

export function gainArmor(ctx: EngineContext, playerId: PlayerId, amount: number) {
  if (amount <= 0) return;
  ctx.state.players[playerId].hero.armor += amount;
  emit(ctx, { type: 'ARMOR_GAINED', player: playerId, amount });
}

// ---------------------------------------------------------------------------
// State-based actions
// ---------------------------------------------------------------------------

/** Removes dead units, queues Last Breath and death listeners. Loops until stable. */
export function checkDeaths(ctx: EngineContext) {
  for (let guard = 0; guard < 20; guard++) {
    const dead: UnitInstance[] = [];
    for (const p of ctx.state.players) {
      for (const u of p.board) if (u.pendingDestroy || currentHealth(u) <= 0) dead.push(u);
    }
    if (dead.length === 0) return;
    dead.sort((a, b) => a.playOrder - b.playOrder);
    for (const unit of dead) {
      const owner = ctx.state.players[unit.owner];
      const position = removeUnitFromBoard(ctx, unit);
      owner.graveyard.push(unit.cardId);
      owner.allyDiedThisTurn = true;
      owner.allyDeathsThisGame++;
      ctx.state.players[other(unit.owner)].stats.unitsDestroyed++;
      if (!unit.silenced) {
        unit.abilities.forEach((ability, index) => {
          if (ability.trigger !== 'LAST_BREATH') return;
          enqueue(ctx, {
            source: { kind: 'unit', uid: unit.uid, cardId: unit.cardId, controller: unit.owner, fromGraveyard: true, position },
            ability,
            triggerUnitUid: unit.uid,
            key: `lb:${unit.uid}:${index}`,
            depth: ctx.depth + 1,
          });
        });
      }
      emit(ctx, { type: 'UNIT_DIED', player: unit.owner, uid: unit.uid, cardId: unit.cardId });
    }
  }
}

export function endGame(ctx: EngineContext, winner: PlayerId | 'DRAW', reason: 'HERO_DEFEATED' | 'CONCEDE' | 'TURN_LIMIT') {
  if (isEnded(ctx.state)) return;
  ctx.state.phase = 'ENDED';
  ctx.state.winner = winner;
  ctx.state.endReason = reason;
  ctx.queue.length = 0;
  emit(ctx, { type: 'GAME_ENDED', winner, reason });
}

export function checkGameOver(ctx: EngineContext): boolean {
  if (isEnded(ctx.state)) return true;
  const dead0 = ctx.state.players[0].hero.health <= 0;
  const dead1 = ctx.state.players[1].hero.health <= 0;
  if (dead0 && dead1) endGame(ctx, 'DRAW', 'HERO_DEFEATED');
  else if (dead0) endGame(ctx, 1, 'HERO_DEFEATED');
  else if (dead1) endGame(ctx, 0, 'HERO_DEFEATED');
  return isEnded(ctx.state);
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

export function randomIndex(ctx: EngineContext, length: number): number {
  return nextInt(ctx.state.rng, 0, length - 1);
}

export function silenceUnit(ctx: EngineContext, unit: UnitInstance) {
  unit.silenced = true;
  unit.keywords = [];
  unit.keywordValues = {};
  unit.abilities = [];
  unit.attackBuff = 0;
  unit.healthBuff = 0;
  unit.tempAttack = 0;
  unit.frozen = false;
  unit.thawPending = false;
  unit.burn = 0;
  unit.barrier = false;
  unit.ambush = false;
  emit(ctx, { type: 'UNIT_SILENCED', uid: unit.uid });
}

export function transformUnit(ctx: EngineContext, unit: UnitInstance, cardId: string) {
  const fresh = makeUnit(ctx, cardId, unit.owner);
  if (!fresh) return;
  const keepSick = unit.summonedThisTurn;
  Object.assign(unit, { ...fresh, uid: unit.uid, owner: unit.owner, playOrder: unit.playOrder, summonedThisTurn: keepSick });
  emit(ctx, { type: 'UNIT_TRANSFORMED', uid: unit.uid, cardId });
}

export function unitSnapshotHealth(unit: UnitInstance) {
  return { health: currentHealth(unit), max: maxHealth(unit) };
}

export function cardName(cardId: string) {
  return getCardSafe(cardId).name;
}
