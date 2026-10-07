import { getCard, getCardSafe } from '@/data/cards';
import type { CardDefinition, StaticKeyword, TargetFilter, TargetKind, TargetRequirement } from '@/game/types';
import { getTalent, type ActiveLevel } from '@/data/wardenTalents';
import { GAME_RULES } from '@/config/gameRules';
import type { CardInstance, GameState, PlayerId, PlayerState, TargetRef, UnitInstance } from './types';
import { other } from './types';

export function player(state: GameState, id: PlayerId): PlayerState {
  return state.players[id];
}

export function findUnit(state: GameState, uid: number): UnitInstance | undefined {
  return state.players[0].board.find((u) => u.uid === uid) ?? state.players[1].board.find((u) => u.uid === uid);
}

export function unitIndex(state: GameState, unit: UnitInstance): number {
  return state.players[unit.owner].board.findIndex((u) => u.uid === unit.uid);
}

export function isAlive(u: UnitInstance): boolean {
  return currentHealth(u) > 0 && !u.pendingDestroy;
}

// ---------------------------------------------------------------------------
// Auras
// ---------------------------------------------------------------------------

interface AuraBonus {
  attack: number;
  keywords: StaticKeyword[];
}

/** Collects continuous aura bonuses from units, relics and locations. */
export function auraBonus(state: GameState, unit: UnitInstance): AuraBonus {
  const bonus: AuraBonus = { attack: 0, keywords: [] };
  const unitTags = getCardSafe(unit.cardId).tags ?? [];
  const consider = (sourceOwner: PlayerId, sourceUid: number, cardId: string, silenced: boolean) => {
    if (silenced) return;
    const aura = getCard(cardId)?.aura;
    if (!aura) return;
    const friendly = sourceOwner === unit.owner;
    if (aura.target === 'ENEMY_UNITS' ? friendly : !friendly) return;
    if (aura.target === 'OTHER_ALLY_UNITS' && sourceUid === unit.uid) return;
    if (aura.tag && !unitTags.includes(aura.tag)) return;
    bonus.attack += aura.attack ?? 0;
    if (aura.keyword) bonus.keywords.push(aura.keyword);
  };
  for (const p of state.players) {
    for (const u of p.board) consider(u.owner, u.uid, u.cardId, u.silenced);
    for (const r of p.relics) consider(r.owner, r.uid, r.cardId, false);
    if (p.location) consider(p.location.owner, p.location.uid, p.location.cardId, false);
  }
  return bonus;
}

export function unitAttack(state: GameState, unit: UnitInstance): number {
  return Math.max(0, unit.baseAttack + unit.attackBuff + unit.tempAttack + auraBonus(state, unit).attack);
}

export function maxHealth(unit: UnitInstance): number {
  return Math.max(0, unit.baseHealth + unit.healthBuff);
}

export function currentHealth(unit: UnitInstance): number {
  return maxHealth(unit) - unit.damage;
}

export function hasKeyword(state: GameState, unit: UnitInstance, keyword: StaticKeyword): boolean {
  if (unit.keywords.includes(keyword)) return true;
  return auraBonus(state, unit).keywords.includes(keyword);
}

export function keywordValue(unit: UnitInstance, keyword: StaticKeyword): number {
  return unit.keywordValues[keyword] ?? (unit.keywords.includes(keyword) ? 1 : 0);
}

/** Total spell damage bonus for a player. */
export function empower(state: GameState, playerId: PlayerId): number {
  let total = 0;
  // hasKeyword so aura-granted Empower counts too (worth 1 unless the unit has its own value).
  for (const u of state.players[playerId].board) if (!u.silenced && hasKeyword(state, u, 'EMPOWER')) total += u.keywordValues.EMPOWER ?? 1;
  for (const r of state.players[playerId].relics) total += getCard(r.cardId)?.keywordValues?.EMPOWER ?? 0;
  const loc = state.players[playerId].location;
  if (loc) total += getCard(loc.cardId)?.keywordValues?.EMPOWER ?? 0;
  return total;
}

// ---------------------------------------------------------------------------
// Costs
// ---------------------------------------------------------------------------

export function effectiveCost(state: GameState, playerId: PlayerId, card: CardInstance): number {
  const def = getCard(card.cardId);
  if (!def) return 99;
  let cost = def.manaCost + card.costMod;
  const apply = (sourceOwner: PlayerId, cardId: string, silenced = false) => {
    if (silenced) return;
    const aura = getCard(cardId)?.costAura;
    if (!aura) return;
    const applies = aura.side === 'ALLY' ? sourceOwner === playerId : sourceOwner !== playerId;
    if (!applies) return;
    if (aura.cardType && aura.cardType !== def.cardType) return;
    if (aura.tag && !(def.tags ?? []).includes(aura.tag)) return;
    cost += aura.amount;
  };
  for (const p of state.players) {
    for (const u of p.board) apply(u.owner, u.cardId, u.silenced);
    for (const r of p.relics) apply(r.owner, r.cardId);
    if (p.location) apply(p.location.owner, p.location.cardId);
  }
  return Math.max(0, cost);
}

// ---------------------------------------------------------------------------
// Targeting
// ---------------------------------------------------------------------------

export function sameTarget(a: TargetRef | undefined, b: TargetRef | undefined): boolean {
  if (!a || !b) return false;
  if (a.type === 'hero' && b.type === 'hero') return a.player === b.player;
  if (a.type === 'unit' && b.type === 'unit') return a.uid === b.uid;
  return false;
}

export function targetExists(state: GameState, ref: TargetRef): boolean {
  if (ref.type === 'hero') return state.players[ref.player].hero.health > 0;
  const u = findUnit(state, ref.uid);
  return !!u && isAlive(u);
}

function matchesFilter(state: GameState, unit: UnitInstance, filter: TargetFilter | undefined): boolean {
  if (!filter) return true;
  const def = getCardSafe(unit.cardId);
  if (filter.damaged && unit.damage <= 0) return false;
  if (filter.frozen && !unit.frozen) return false;
  if (filter.maxAttack !== undefined && unitAttack(state, unit) > filter.maxAttack) return false;
  if (filter.minAttack !== undefined && unitAttack(state, unit) < filter.minAttack) return false;
  if (filter.maxCost !== undefined && def.manaCost > filter.maxCost) return false;
  if (filter.tag && !(def.tags ?? []).includes(filter.tag)) return false;
  return true;
}

/**
 * Valid choices for a targeted card or power.
 * @param spellLike spells and warden sigils cannot target enemy Ward units.
 */
export function validTargets(
  state: GameState,
  playerId: PlayerId,
  req: TargetRequirement,
  opts: { spellLike: boolean; sourceUid?: number },
): TargetRef[] {
  const enemy = other(playerId);
  const out: TargetRef[] = [];
  const kind: TargetKind = req.kind;
  const includeHeroes = kind === 'ANY' || kind === 'ENEMY' || kind === 'ALLY';
  const includeAllyUnits = kind === 'ANY' || kind === 'ANY_UNIT' || kind === 'ALLY_UNIT' || kind === 'OTHER_ALLY_UNIT' || kind === 'ALLY';
  const includeEnemyUnits = kind === 'ANY' || kind === 'ANY_UNIT' || kind === 'ENEMY_UNIT' || kind === 'ENEMY';

  if (includeAllyUnits) {
    for (const u of state.players[playerId].board) {
      if (!isAlive(u)) continue;
      if (kind === 'OTHER_ALLY_UNIT' && u.uid === opts.sourceUid) continue;
      if (matchesFilter(state, u, req.filter)) out.push({ type: 'unit', uid: u.uid });
    }
  }
  if (includeEnemyUnits) {
    for (const u of state.players[enemy].board) {
      if (!isAlive(u)) continue;
      if (u.ambush && !u.silenced) continue;
      if (opts.spellLike && hasKeyword(state, u, 'WARD')) continue;
      if (matchesFilter(state, u, req.filter)) out.push({ type: 'unit', uid: u.uid });
    }
  }
  if (includeHeroes && !req.filter) {
    if (kind !== 'ENEMY') out.push({ type: 'hero', player: playerId });
    if (kind !== 'ALLY') out.push({ type: 'hero', player: enemy });
  }
  return out;
}

export function isValidTarget(state: GameState, playerId: PlayerId, req: TargetRequirement, target: TargetRef, opts: { spellLike: boolean; sourceUid?: number }) {
  return validTargets(state, playerId, req, opts).some((t) => sameTarget(t, target));
}

// ---------------------------------------------------------------------------
// Playability
// ---------------------------------------------------------------------------

export function targetRequirementFor(def: CardDefinition): TargetRequirement | undefined {
  return def.target;
}

/** A target is mandatory for spells unless marked optional; units/relics always optional. */
export function targetIsMandatory(def: CardDefinition): boolean {
  if (!def.target) return false;
  if (def.cardType !== 'SPELL') return false;
  return !def.target.optional;
}

export function canPlayCard(state: GameState, playerId: PlayerId, card: CardInstance): { ok: boolean; reason?: string } {
  if (state.phase !== 'MAIN') return { ok: false, reason: 'Not in main phase' };
  if (state.activePlayer !== playerId) return { ok: false, reason: 'Not your turn' };
  const def = getCard(card.cardId);
  if (!def) return { ok: false, reason: 'Unknown card' };
  const p = state.players[playerId];
  if (effectiveCost(state, playerId, card) > p.energy) return { ok: false, reason: 'Not enough energy' };
  if (def.cardType === 'UNIT' && p.board.length >= GAME_RULES.maxBoardSize) return { ok: false, reason: 'Battlefield is full' };
  if (def.cardType === 'RELIC' && p.relics.length >= GAME_RULES.maxRelics) return { ok: false, reason: 'Relic slots are full' };
  if (targetIsMandatory(def) && def.target) {
    if (validTargets(state, playerId, def.target, { spellLike: true }).length === 0) return { ok: false, reason: 'No valid targets' };
  }
  return { ok: true };
}

/** The rank definition of an active Warden ability in a slot (undefined for passives / empty slots). */
export function activeLevelOf(state: GameState, playerId: PlayerId, slot: number): ActiveLevel | undefined {
  const a = state.players[playerId].hero.abilities[slot];
  const talent = a ? getTalent(a.id) : undefined;
  return talent?.kind === 'ACTIVE' ? talent.levels[a.level] : undefined;
}

export function canUseHeroPower(state: GameState, playerId: PlayerId, slot: number): { ok: boolean; reason?: string } {
  if (state.phase !== 'MAIN' || state.activePlayer !== playerId) return { ok: false, reason: 'Not your turn' };
  const power = activeLevelOf(state, playerId, slot);
  if (!power) return { ok: false, reason: 'No Warden ability to use' };
  if (state.players[playerId].hero.abilities[slot].uses >= (power.usesPerTurn ?? 1)) return { ok: false, reason: 'Already used this turn' };
  if ((state.players[playerId].hero.abilities[slot].cooldown ?? 0) > 0) return { ok: false, reason: 'Recharging: usable again next turn' };
  if (state.players[playerId].energy < power.cost) return { ok: false, reason: 'Not enough energy' };
  if (power.target && !power.target.optional && validTargets(state, playerId, power.target, { spellLike: true }).length === 0) {
    return { ok: false, reason: 'No valid targets' };
  }
  return { ok: true };
}

export function hasActiveGuard(state: GameState, playerId: PlayerId): UnitInstance[] {
  return state.players[playerId].board.filter((u) => isAlive(u) && hasKeyword(state, u, 'GUARD') && !(u.ambush && !u.silenced));
}

export function canAttack(state: GameState, unit: UnitInstance): { ok: boolean; reason?: string } {
  if (state.phase !== 'MAIN') return { ok: false, reason: 'Not in main phase' };
  if (state.activePlayer !== unit.owner) return { ok: false, reason: 'Not your turn' };
  if (!isAlive(unit)) return { ok: false, reason: 'Unit is dead' };
  if (unit.frozen) return { ok: false, reason: 'Frozen' };
  if (unitAttack(state, unit) <= 0) return { ok: false, reason: 'No Attack' };
  const maxAttacks = hasKeyword(state, unit, 'FRENZY') ? 2 : 1;
  if (unit.attacksThisTurn >= maxAttacks) return { ok: false, reason: 'Already attacked' };
  if (unit.summonedThisTurn && !hasKeyword(state, unit, 'SWIFT') && !hasKeyword(state, unit, 'RUSH')) {
    return { ok: false, reason: 'Deployed this turn' };
  }
  return { ok: true };
}

export function attackTargets(state: GameState, unit: UnitInstance): TargetRef[] {
  if (!canAttack(state, unit).ok) return [];
  const enemy = other(unit.owner);
  const guards = hasActiveGuard(state, enemy);
  const heroAllowed = !unit.summonedThisTurn || hasKeyword(state, unit, 'SWIFT');
  if (guards.length > 0) return guards.map((g) => ({ type: 'unit' as const, uid: g.uid }));
  const out: TargetRef[] = state.players[enemy].board
    .filter((u) => isAlive(u) && !(u.ambush && !u.silenced))
    .map((u) => ({ type: 'unit' as const, uid: u.uid }));
  if (heroAllowed) out.push({ type: 'hero', player: enemy });
  return out;
}

export function describeTarget(state: GameState, ref: TargetRef | undefined): string {
  if (!ref) return 'nothing';
  if (ref.type === 'hero') return state.players[ref.player].hero.name;
  const u = findUnit(state, ref.uid);
  return u ? getCardSafe(u.cardId).name : 'a removed unit';
}
