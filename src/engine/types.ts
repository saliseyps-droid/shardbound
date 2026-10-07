import type { RngState } from '@/core/rng';
import type { Ability, StaticKeyword } from '@/game/types';

export type PlayerId = 0 | 1;
export const other = (p: PlayerId): PlayerId => (p === 0 ? 1 : 0);

export type TargetRef = { type: 'unit'; uid: number } | { type: 'hero'; player: PlayerId };

export interface CardInstance {
  uid: number;
  cardId: string;
  /** Permanent cost modifier (negative = cheaper). */
  costMod: number;
  /** Discarded at end of controller's turn. */
  fleeting?: boolean;
  /** Echo copies don't echo again. */
  echoCopy?: boolean;
  /** Visible to the opponent (e.g. stolen/returned cards). */
  revealed?: boolean;
}

export interface UnitInstance {
  uid: number;
  cardId: string;
  owner: PlayerId;
  baseAttack: number;
  baseHealth: number;
  /** Permanent stat modifiers from buffs. */
  attackBuff: number;
  healthBuff: number;
  /** Until end of turn. */
  tempAttack: number;
  damage: number;
  keywords: StaticKeyword[];
  keywordValues: Partial<Record<StaticKeyword, number>>;
  abilities: Ability[];
  frozen: boolean;
  thawPending: boolean;
  burn: number;
  barrier: boolean;
  ambush: boolean;
  silenced: boolean;
  summonedThisTurn: boolean;
  attacksThisTurn: number;
  /** Marked for destruction by Venom/Destroy; removed at the next death check. */
  pendingDestroy: boolean;
  /** Sequence number to order simultaneous deaths. */
  playOrder: number;
}

export interface RelicInstance {
  uid: number;
  cardId: string;
  owner: PlayerId;
  charges: number | null;
}

export interface LocationInstance {
  uid: number;
  cardId: string;
  owner: PlayerId;
  turnsRemaining: number | null;
}

export interface HeroAbilityState {
  /** Talent ability id (src/data/wardenTalents.ts). */
  id: string;
  /** Rank index: 0 = I, 1 = II, 2 = III. */
  level: 0 | 1 | 2;
  /** Activations (active) or triggers (passive) this turn. */
  uses: number;
  /** Active abilities with a cooldown: owner's turns left before it can be used again. */
  cooldown?: number;
}

export interface HeroState {
  name: string;
  avatar: string;
  /** Warden faction (drives the portrait); null for special encounters without one. */
  faction: string | null;
  health: number;
  maxHealth: number;
  armor: number;
  /** The Warden's talent abilities, by slot. */
  abilities: HeroAbilityState[];
  /** Cosmetic card back (src/data/cardBacks.ts). */
  cardBack: string | null;
  /** Cosmetic Warden portrait (src/data/portraits.ts); null = the faction's default. */
  portrait?: string | null;
}

export interface MatchStats {
  damageDealt: number;
  heroDamageDealt: number;
  cardsPlayed: number;
  unitsPlayed: number;
  spellsPlayed: number;
  unitsDestroyed: number;
  healingDone: number;
  cardsDrawn: number;
}

export interface PlayerState {
  id: PlayerId;
  hero: HeroState;
  energy: number;
  maxEnergy: number;
  deck: CardInstance[];
  hand: CardInstance[];
  board: UnitInstance[];
  relics: RelicInstance[];
  location: LocationInstance | null;
  /** Card ids of friendly units that died, in order. */
  graveyard: string[];
  fatigue: number;
  mulliganDone: boolean;
  spellsCastThisTurn: number;
  cardsPlayedThisTurn: number;
  allyDiedThisTurn: boolean;
  allyDeathsThisGame: number;
  stats: MatchStats;
  /** Extra permanent energy crystals granted by special rules (bosses). */
  bonusStartingEnergy: number;
}

export type GamePhase = 'MULLIGAN' | 'MAIN' | 'ENDED';

export interface GameState {
  rng: RngState;
  turn: number;
  activePlayer: PlayerId;
  firstPlayer: PlayerId;
  phase: GamePhase;
  players: [PlayerState, PlayerState];
  nextUid: number;
  winner: PlayerId | 'DRAW' | null;
  /** DISCONNECT: online link lost while both players were still online (a draw, set by the client). */
  endReason: 'HERO_DEFEATED' | 'CONCEDE' | 'TURN_LIMIT' | 'DISCONNECT' | null;
  /** Monotonic event counter. */
  eventSeq: number;
  /** Rolling event log (bounded) for debugging and UI. */
  log: GameEvent[];
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type GameAction =
  | { type: 'MULLIGAN'; player: PlayerId; replaceUids: number[] }
  | { type: 'PLAY_CARD'; player: PlayerId; cardUid: number; target?: TargetRef; position?: number }
  | { type: 'ATTACK'; player: PlayerId; attackerUid: number; target: TargetRef }
  | { type: 'HERO_POWER'; player: PlayerId; slot: number; target?: TargetRef }
  | { type: 'END_TURN'; player: PlayerId }
  | { type: 'CONCEDE'; player: PlayerId };

// ---------------------------------------------------------------------------
// Events — emitted for triggers, UI animation, audio, stats and logs
// ---------------------------------------------------------------------------

export type GameEvent =
  | { seq: number; type: 'GAME_STARTED'; firstPlayer: PlayerId }
  | { seq: number; type: 'MULLIGAN_DONE'; player: PlayerId; replaced: number }
  | { seq: number; type: 'TURN_STARTED'; player: PlayerId; turn: number }
  | { seq: number; type: 'TURN_ENDED'; player: PlayerId; turn: number }
  | { seq: number; type: 'ENERGY_CHANGED'; player: PlayerId; energy: number; maxEnergy: number }
  | { seq: number; type: 'CARD_DRAWN'; player: PlayerId; cardUid: number; cardId: string }
  | { seq: number; type: 'CARD_BURNED'; player: PlayerId; cardId: string }
  | { seq: number; type: 'FATIGUE'; player: PlayerId; damage: number }
  | { seq: number; type: 'CARD_PLAYED'; player: PlayerId; cardId: string; cardUid: number; target?: TargetRef }
  | { seq: number; type: 'SPELL_CAST'; player: PlayerId; cardId: string; target?: TargetRef }
  | { seq: number; type: 'UNIT_SUMMONED'; player: PlayerId; uid: number; cardId: string; fromHand: boolean }
  | { seq: number; type: 'RELIC_PLAYED'; player: PlayerId; uid: number; cardId: string }
  | { seq: number; type: 'RELIC_BROKEN'; player: PlayerId; uid: number; cardId: string }
  | { seq: number; type: 'LOCATION_PLAYED'; player: PlayerId; uid: number; cardId: string }
  | { seq: number; type: 'LOCATION_EXPIRED'; player: PlayerId; uid: number; cardId: string }
  | { seq: number; type: 'UNIT_ATTACKED'; player: PlayerId; attackerUid: number; target: TargetRef }
  | { seq: number; type: 'DAMAGE_DEALT'; target: TargetRef; amount: number; sourcePlayer: PlayerId; sourceUid?: number; combat: boolean }
  | { seq: number; type: 'HERO_DAMAGED'; player: PlayerId; amount: number }
  | { seq: number; type: 'ARMOR_GAINED'; player: PlayerId; amount: number }
  | { seq: number; type: 'HEALED'; target: TargetRef; amount: number }
  | { seq: number; type: 'BARRIER_BROKEN'; uid: number }
  | { seq: number; type: 'STATUS_APPLIED'; uid: number; status: string; amount?: number }
  | { seq: number; type: 'UNIT_BUFFED'; uid: number; attack: number; health: number }
  | { seq: number; type: 'UNIT_SILENCED'; uid: number }
  | { seq: number; type: 'UNIT_DIED'; player: PlayerId; uid: number; cardId: string }
  | { seq: number; type: 'UNIT_RETURNED'; player: PlayerId; uid: number; cardId: string }
  | { seq: number; type: 'UNIT_TRANSFORMED'; uid: number; cardId: string }
  | { seq: number; type: 'CONTROL_CHANGED'; uid: number; newOwner: PlayerId }
  | { seq: number; type: 'CARD_CREATED'; player: PlayerId; cardId: string; destination: 'HAND' | 'DECK' }
  | { seq: number; type: 'CARD_DISCARDED'; player: PlayerId; cardId: string }
  | { seq: number; type: 'CARD_STOLEN'; player: PlayerId; cardId: string }
  | { seq: number; type: 'HERO_POWER_USED'; player: PlayerId; slot: number; abilityId: string; target?: TargetRef }
  | { seq: number; type: 'HERO_ABILITY_TRIGGERED'; player: PlayerId; slot: number; abilityId: string }
  | { seq: number; type: 'TRIGGER_RESOLVED'; player: PlayerId; sourceCardId: string; trigger: string }
  | { seq: number; type: 'TRIGGER_LIMIT_REACHED' }
  | { seq: number; type: 'GAME_ENDED'; winner: PlayerId | 'DRAW'; reason: string };

export type GameEventType = GameEvent['type'];

/** Distributive Omit so each union member keeps its own shape. */
export type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
export type NewGameEvent = DistributiveOmit<GameEvent, 'seq'>;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export interface SideSetup {
  name: string;
  avatar: string;
  faction?: string | null;
  /** Card ids; order is shuffled by the engine unless `keepDeckOrder`. */
  deck: string[];
  /** Cosmetic card back id. */
  cardBack?: string | null;
  /** Cosmetic Warden portrait id. */
  portrait?: string | null;
  /** Warden talent abilities (slot order). */
  talents?: { abilityId: string; level: 0 | 1 | 2 }[];
  heroHealth?: number;
  /** Boss rule: extra permanent energy from turn 1. */
  bonusStartingEnergy?: number;
  startingBoard?: string[];
  startingRelics?: string[];
  startingLocation?: string;
  keepDeckOrder?: boolean;
}

export interface MatchSetup {
  seed: number;
  players: [SideSetup, SideSetup];
  /** Force who goes first (tutorial); otherwise random. */
  firstPlayer?: PlayerId;
  skipMulligan?: boolean;
}

export interface ActionResult {
  state: GameState;
  events: GameEvent[];
  error?: string;
}

/** Function form avoids TypeScript narrowing across mutating calls. */
export function isEnded(state: GameState): boolean {
  return state.phase === 'ENDED';
}
