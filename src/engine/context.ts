import type { Ability } from '@/game/types';
import type { GameEvent, GameState, NewGameEvent, PlayerId, TargetRef } from './types';

/** Where an ability comes from. `hero` = Warden ability (no board object). */
export interface AbilitySource {
  kind: 'unit' | 'relic' | 'location' | 'spell' | 'hero';
  uid: number | null;
  cardId: string;
  controller: PlayerId;
  /** For Last Breath triggers the source is gone; resolve anyway. */
  fromGraveyard?: boolean;
  /** Board position of the source when it died (Last Breath summons). */
  position?: number;
  /** Warden ability slot, for hero sources. */
  talentSlot?: number;
  /** Passive Warden ability (emits HERO_ABILITY_TRIGGERED when it resolves). */
  passive?: boolean;
}

export interface PendingAbility {
  source: AbilitySource;
  ability: Ability;
  target?: TargetRef;
  triggerUnitUid?: number;
  /** Dedupe key so the same trigger cannot fire twice for one event. */
  key: string;
  depth: number;
}

export interface EngineContext {
  state: GameState;
  events: GameEvent[];
  queue: PendingAbility[];
  seenKeys: Set<string>;
  resolutions: number;
  depth: number;
  aborted: boolean;
}

export const LOG_LIMIT = 400;

export function createContext(state: GameState): EngineContext {
  return { state, events: [], queue: [], seenKeys: new Set(), resolutions: 0, depth: 0, aborted: false };
}

/** Low-level event push; trigger collection is layered on top in triggers.ts. */
export function pushEvent(ctx: EngineContext, event: NewGameEvent): GameEvent {
  const full = { ...event, seq: ++ctx.state.eventSeq } as GameEvent;
  ctx.events.push(full);
  ctx.state.log.push(full);
  if (ctx.state.log.length > LOG_LIMIT) ctx.state.log.splice(0, ctx.state.log.length - LOG_LIMIT);
  return full;
}
