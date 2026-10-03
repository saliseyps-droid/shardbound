/**
 * Card & effect domain model. Everything a card can do is expressed as data
 * interpreted by the rules engine (src/engine) — never hardcoded in UI.
 */

export type Faction = 'EMBER' | 'VERDANT' | 'IRON' | 'ASTRAL' | 'VOID' | 'TIDE' | 'NEUTRAL';
export const PLAYABLE_FACTIONS = ['EMBER', 'VERDANT', 'IRON', 'ASTRAL', 'VOID', 'TIDE'] as const;
export type PlayableFaction = (typeof PLAYABLE_FACTIONS)[number];
export const ALL_FACTIONS: readonly Faction[] = [...PLAYABLE_FACTIONS, 'NEUTRAL'];

export type CardType = 'UNIT' | 'SPELL' | 'RELIC' | 'LOCATION';
export const CARD_TYPES: readonly CardType[] = ['UNIT', 'SPELL', 'RELIC', 'LOCATION'];

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export const RARITIES: readonly Rarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

export type Variant = 'NORMAL' | 'FOIL' | 'PRISMATIC';
export const VARIANTS: readonly Variant[] = ['NORMAL', 'FOIL', 'PRISMATIC'];

export type SetId = 'CORE' | 'DEEP' | 'ABYSS';

/** Static keywords live on units/cards. Trigger keywords are derived from abilities. */
export type KeywordId =
  | 'GUARD'
  | 'RUSH'
  | 'SWIFT'
  | 'DRAIN'
  | 'BARRIER'
  | 'AMBUSH'
  | 'WARD'
  | 'FRENZY'
  | 'VENOM'
  | 'REGENERATE'
  | 'EMPOWER'
  | 'ECHO'
  | 'FLEETING'
  // Trigger / status keywords (glossary + tooltips)
  | 'ON_DEPLOY'
  | 'LAST_BREATH'
  | 'OVERCHARGE'
  | 'BURN'
  | 'FREEZE';

export type StaticKeyword =
  | 'GUARD'
  | 'RUSH'
  | 'SWIFT'
  | 'DRAIN'
  | 'BARRIER'
  | 'AMBUSH'
  | 'WARD'
  | 'FRENZY'
  | 'VENOM'
  | 'REGENERATE'
  | 'EMPOWER'
  | 'ECHO'
  | 'FLEETING';

export type StatusId = 'FROZEN' | 'BURN' | 'BARRIER' | 'AMBUSH';

// ---------------------------------------------------------------------------
// Targeting
// ---------------------------------------------------------------------------

/** What a player may choose when a card/power requires a target. */
export type TargetKind =
  | 'ANY' // any unit or hero
  | 'ANY_UNIT'
  | 'ENEMY_UNIT'
  | 'ALLY_UNIT'
  | 'OTHER_ALLY_UNIT'
  | 'ENEMY' // enemy unit or enemy hero
  | 'ALLY'; // ally unit or own hero

export interface TargetFilter {
  damaged?: boolean;
  maxAttack?: number;
  minAttack?: number;
  maxCost?: number;
  tag?: string;
  frozen?: boolean;
}

export interface TargetRequirement {
  kind: TargetKind;
  /** When true the card can be played with no valid target (effect then fizzles). Units default to optional. */
  optional?: boolean;
  filter?: TargetFilter;
}

/** Where an effect lands at resolution time. */
export type TargetSelector =
  | 'SELF' // the source unit / relic
  | 'TARGET' // the chosen target
  | 'TRIGGER_UNIT' // the unit that caused the trigger (summoned, damaged, died, attacked...)
  | 'ALLY_HERO'
  | 'ENEMY_HERO'
  | 'BOTH_HEROES'
  | 'ALL_ALLY_UNITS'
  | 'OTHER_ALLY_UNITS'
  | 'ALL_ENEMY_UNITS'
  | 'ALL_UNITS'
  | 'ALL_OTHER_UNITS'
  | 'ALL_ENEMIES' // enemy units + enemy hero
  | 'ALL_ALLIES' // ally units + own hero
  | 'EVERYONE'
  | 'RANDOM_ENEMY_UNIT'
  | 'RANDOM_ENEMY'
  | 'RANDOM_ALLY_UNIT'
  | 'RANDOM_OTHER_ALLY_UNIT'
  | 'ADJACENT' // units next to SELF (or next to TARGET when source is a spell)
  | 'TARGET_AND_ADJACENT';

// ---------------------------------------------------------------------------
// Values & conditions
// ---------------------------------------------------------------------------

export type ValueExpr =
  | number
  | {
      kind:
        | 'ALLY_UNIT_COUNT'
        | 'ENEMY_UNIT_COUNT'
        | 'HAND_SIZE'
        | 'ARMOR'
        | 'ALLY_DEATHS_THIS_GAME'
        | 'SPELLS_CAST_THIS_TURN'
        | 'SELF_ATTACK'
        | 'SELF_HEALTH'
        | 'TARGET_ATTACK'
        | 'MAX_ENERGY'
        | 'DAMAGED_ENEMY_COUNT'
        | 'FROZEN_ENEMY_COUNT';
      plus?: number;
      times?: number;
      max?: number;
    };

export type Condition =
  | { kind: 'ALLY_UNITS_GTE'; n: number }
  | { kind: 'ENEMY_UNITS_GTE'; n: number }
  | { kind: 'HAND_SIZE_LTE'; n: number }
  | { kind: 'HERO_HEALTH_LTE'; n: number }
  | { kind: 'HAS_ARMOR' }
  | { kind: 'ALLY_DIED_THIS_TURN' }
  | { kind: 'SPELLS_CAST_THIS_TURN_GTE'; n: number }
  | { kind: 'CONTROLS_TAG'; tag: string }
  | { kind: 'ALLY_DEATHS_GTE'; n: number }
  | { kind: 'TARGET_DAMAGED' }
  | { kind: 'TARGET_FROZEN' }
  | { kind: 'TARGET_IS_UNIT' }
  | { kind: 'MAX_ENERGY_GTE'; n: number }
  | { kind: 'CARDS_PLAYED_THIS_TURN_GTE'; n: number };

// ---------------------------------------------------------------------------
// Effects
// ---------------------------------------------------------------------------

export type EffectType =
  | 'DEAL_DAMAGE'
  | 'HEAL'
  | 'BUFF'
  | 'SET_STATS'
  | 'DRAW_CARDS'
  | 'SUMMON'
  | 'DESTROY'
  | 'DISCARD'
  | 'GAIN_ENERGY'
  | 'GAIN_MAX_ENERGY'
  | 'DESTROY_ENERGY'
  | 'REDUCE_COST'
  | 'RETURN_TO_HAND'
  | 'APPLY_STATUS'
  | 'GRANT_KEYWORD'
  | 'SILENCE'
  | 'CREATE_CARD'
  | 'COPY_CARD'
  | 'STEAL_CARD'
  | 'TAKE_CONTROL'
  | 'GAIN_ARMOR'
  | 'TRANSFORM'
  | 'RESURRECT'
  | 'READY_UNIT'
  | 'MILL';

interface EffectBase {
  target?: TargetSelector;
  /** Resolve the effect this many times (random selectors re-roll each time). */
  repeat?: number;
  /** Effect only resolves when the condition holds. */
  condition?: Condition;
}

export interface DealDamageEffect extends EffectBase {
  type: 'DEAL_DAMAGE';
  amount: ValueExpr;
}
export interface HealEffect extends EffectBase {
  type: 'HEAL';
  amount: ValueExpr;
}
export interface BuffEffect extends EffectBase {
  type: 'BUFF';
  attack?: ValueExpr;
  health?: ValueExpr;
  /** Expires at end of turn. */
  temporary?: boolean;
}
export interface SetStatsEffect extends EffectBase {
  type: 'SET_STATS';
  attack?: number;
  health?: number;
}
export interface DrawCardsEffect extends EffectBase {
  type: 'DRAW_CARDS';
  amount: ValueExpr;
  /** Draw only cards matching the filter (searches the deck). */
  filter?: { cardType?: CardType; tag?: string; maxCost?: number };
  /** Draw for the opponent instead of the controller. */
  opponent?: boolean;
}
export interface SummonEffect extends EffectBase {
  type: 'SUMMON';
  cardId: string;
  count?: number;
  /** Summon for the opponent. */
  forOpponent?: boolean;
}
export interface DestroyEffect extends EffectBase {
  type: 'DESTROY';
}
export interface DiscardEffect extends EffectBase {
  type: 'DISCARD';
  amount: number;
  /** Discard from the opponent's hand. */
  opponent?: boolean;
}
export interface GainEnergyEffect extends EffectBase {
  type: 'GAIN_ENERGY';
  amount: number;
}
export interface GainMaxEnergyEffect extends EffectBase {
  type: 'GAIN_MAX_ENERGY';
  amount: number;
  /** The gained crystal arrives empty. */
  empty?: boolean;
}
export interface DestroyEnergyEffect extends EffectBase {
  type: 'DESTROY_ENERGY';
  amount: number;
}
export interface ReduceCostEffect extends EffectBase {
  type: 'REDUCE_COST';
  amount: number;
  scope: 'HAND' | 'RANDOM_HAND_CARD' | 'HIGHEST_COST_IN_HAND';
  filter?: { cardType?: CardType; tag?: string };
}
export interface ReturnToHandEffect extends EffectBase {
  type: 'RETURN_TO_HAND';
  /** Reduce the returned card's cost. */
  costReduction?: number;
}
export interface ApplyStatusEffect extends EffectBase {
  type: 'APPLY_STATUS';
  status: StatusId;
  amount?: number;
}
export interface GrantKeywordEffect extends EffectBase {
  type: 'GRANT_KEYWORD';
  keyword: StaticKeyword;
}
export interface SilenceEffect extends EffectBase {
  type: 'SILENCE';
}
export interface CreateCardEffect extends EffectBase {
  type: 'CREATE_CARD';
  /** Specific card, or a random collectible card from the pool. */
  cardId?: string;
  pool?: { faction?: Faction; cardType?: CardType; tag?: string; maxCost?: number; rarity?: Rarity };
  count?: number;
  destination: 'HAND' | 'DECK';
  /** Created cards vanish at end of turn. */
  fleeting?: boolean;
  costReduction?: number;
}
export interface CopyCardEffect extends EffectBase {
  type: 'COPY_CARD';
  /** Copy the targeted unit's card into your hand. */
  destination: 'HAND';
}
export interface StealCardEffect extends EffectBase {
  type: 'STEAL_CARD';
  from: 'DECK' | 'HAND';
  amount: number;
}
export interface TakeControlEffect extends EffectBase {
  type: 'TAKE_CONTROL';
}
export interface GainArmorEffect extends EffectBase {
  type: 'GAIN_ARMOR';
  amount: ValueExpr;
}
export interface TransformEffect extends EffectBase {
  type: 'TRANSFORM';
  cardId: string;
}
export interface ResurrectEffect extends EffectBase {
  type: 'RESURRECT';
  count: number;
  /** Only resurrect units with at most this cost. */
  maxCost?: number;
}
export interface ReadyUnitEffect extends EffectBase {
  type: 'READY_UNIT';
}
export interface MillEffect extends EffectBase {
  type: 'MILL';
  amount: number;
  opponent?: boolean;
}

export type Effect =
  | DealDamageEffect
  | HealEffect
  | BuffEffect
  | SetStatsEffect
  | DrawCardsEffect
  | SummonEffect
  | DestroyEffect
  | DiscardEffect
  | GainEnergyEffect
  | GainMaxEnergyEffect
  | DestroyEnergyEffect
  | ReduceCostEffect
  | ReturnToHandEffect
  | ApplyStatusEffect
  | GrantKeywordEffect
  | SilenceEffect
  | CreateCardEffect
  | CopyCardEffect
  | StealCardEffect
  | TakeControlEffect
  | GainArmorEffect
  | TransformEffect
  | ResurrectEffect
  | ReadyUnitEffect
  | MillEffect;

// ---------------------------------------------------------------------------
// Abilities (trigger + effects)
// ---------------------------------------------------------------------------

export type TriggerType =
  | 'ON_DEPLOY' // unit/relic/location enters play from hand
  | 'ON_CAST' // spell resolution
  | 'LAST_BREATH' // this unit dies
  | 'TURN_START' // controller's turn starts
  | 'TURN_END' // controller's turn ends
  | 'ON_ATTACK' // this unit attacks
  | 'ON_DAMAGED' // this unit takes damage and survives
  | 'ON_KILL' // this unit destroys a unit in combat
  | 'ALLY_SUMMONED' // another friendly unit enters play
  | 'ALLY_DIED' // another friendly unit dies
  | 'ENEMY_DIED' // an enemy unit dies
  | 'FRIENDLY_SPELL_CAST' // controller casts a spell (after it resolves)
  | 'CARD_DRAWN' // controller draws a card
  | 'ALLY_HEALED' // a friendly character is healed
  | 'ENEMY_HERO_DAMAGED' // the enemy hero takes damage
  | 'ARMOR_GAINED'; // controller gains armor

export interface TriggerFilter {
  tag?: string;
  cardType?: CardType;
}

export interface Ability {
  trigger: TriggerType;
  effects: Effect[];
  condition?: Condition;
  /** Filters the unit that caused the trigger (e.g. only Constructs). */
  filter?: TriggerFilter;
  /** Overcharge: if you have this much unspent energy after paying, spend it to resolve. */
  overcharge?: number;
}

export interface StatAura {
  /** ALLY_UNITS includes the source; OTHER_ALLY_UNITS excludes it. */
  target: 'ALLY_UNITS' | 'OTHER_ALLY_UNITS' | 'ENEMY_UNITS';
  tag?: string;
  attack?: number;
  keyword?: StaticKeyword;
}

export interface CostAura {
  side: 'ALLY' | 'ENEMY';
  cardType?: CardType;
  tag?: string;
  amount: number; // negative reduces
}

// ---------------------------------------------------------------------------
// Card definition
// ---------------------------------------------------------------------------

export interface CardDefinition {
  id: string;
  name: string;
  /** Human rules text. Auto-generated from abilities when omitted. */
  description?: string;
  flavorText?: string;
  cardType: CardType;
  faction: Faction;
  rarity: Rarity;
  manaCost: number;
  attack?: number;
  health?: number;
  keywords?: StaticKeyword[];
  /** Amount for numeric keywords, e.g. EMPOWER: 1. */
  keywordValues?: Partial<Record<StaticKeyword, number>>;
  abilities?: Ability[];
  target?: TargetRequirement;
  aura?: StatAura;
  costAura?: CostAura;
  /** Relic charges: loses one each time one of its abilities resolves; breaks at 0. */
  charges?: number;
  /** Location duration in its controller's turns. */
  duration?: number;
  tags?: string[];
  set: SetId;
  collectible: boolean;
  /** Art seed / key for the procedural art generator. */
  artwork?: string;
  artist?: string;
  /** Optional overrides of configured rarity economy. */
  craftingCost?: number;
  disenchantValue?: number;
  /** Starter-pool cards granted to new accounts. */
  starter?: boolean;
  /** Archetype labels used for deck-building hints and AI. */
  archetypes?: string[];
}

export interface HeroPowerDefinition {
  id: string;
  name: string;
  description: string;
  cost: number;
  target?: TargetRequirement;
  effects: Effect[];
  /** Uses per turn (default 1). */
  usesPerTurn?: number;
}
