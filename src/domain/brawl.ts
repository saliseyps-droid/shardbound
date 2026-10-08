import { createRng, hashString, nextInt, pickOne, shuffleInPlace } from '@/core/rng';
import { collectibleCards } from '@/data/cards';
import { BRAWL_MODIFIERS, type BrawlModifier, type BrawlSideMods } from '@/data/brawl';
import { PRACTICE_OPPONENTS, type OpponentDef } from '@/data/opponents';
import { SET_INFO } from '@/config/economy';
import { PLAYABLE_FACTIONS, type Rarity, type SetId } from '@/game/types';
import type { AiPersonality } from '@/ai/config';
import type { SideSetup } from '@/engine/types';

/**
 * Brawl: two fights against the AI (Expert) with special rules, played with your own deck.
 * Every three days (counted from Monday 5 October 2026, 00:00 UTC) two new fights replace the old ones. Each fight
 * combines two modifiers (src/data/brawl.ts) and the two fights never share one. The first win
 * in each fight of a rotation pays a pack of the newest set.
 */

const DAY_MS = 86_400_000;
export const BRAWL_ROTATION_DAYS = 3;
/** Monday 5 October 2026, 00:00 UTC: rotation 0 starts here. */
export const BRAWL_EPOCH = Date.UTC(2026, 9, 5);
export const BRAWL_FIGHTS_PER_ROTATION = 2;

const ALL: Rarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
const PERSONALITIES: AiPersonality[] = ['BALANCED', 'AGGRESSIVE', 'CONTROL', 'SWARM'];

export interface BrawlFight {
  /** `${rotation}-${index}` */
  id: string;
  rotation: number;
  index: number;
  modifiers: BrawlModifier[];
  opponent: OpponentDef;
}

/** Saved Brawl progress: fights won in the current rotation. */
export interface BrawlState {
  rotation: number;
  won: string[];
}

export function brawlRotation(now: number): number {
  return Math.max(0, Math.floor((now - BRAWL_EPOCH) / (BRAWL_ROTATION_DAYS * DAY_MS)));
}

export function brawlRotationEnds(rotation: number): number {
  return BRAWL_EPOCH + (rotation + 1) * BRAWL_ROTATION_DAYS * DAY_MS;
}

/** Brawl packs come from the newest set. */
export function brawlPackSet(): SetId {
  return (Object.keys(SET_INFO) as SetId[]).reduce((a, b) => (SET_INFO[b].releaseOrder > SET_INFO[a].releaseOrder ? b : a));
}

const compatible = (a: BrawlModifier, b: BrawlModifier) => a.id !== b.id && !(a.groups ?? []).some((g) => (b.groups ?? []).includes(g));

/** Two pairs of compatible modifiers, all four different; deterministic for the rotation. */
export function brawlModifierPairs(rotation: number): [BrawlModifier, BrawlModifier][] {
  for (let attempt = 0; ; attempt++) {
    const rng = createRng(hashString(`brawl:${rotation}:${attempt}`));
    const pool = shuffleInPlace(rng, [...BRAWL_MODIFIERS]);
    const pairs: [BrawlModifier, BrawlModifier][] = [];
    while (pairs.length < BRAWL_FIGHTS_PER_ROTATION && pool.length >= 2) {
      const a = pool.shift()!;
      const j = pool.findIndex((b) => compatible(a, b));
      if (j < 0) continue;
      pairs.push([a, pool.splice(j, 1)[0]]);
    }
    if (pairs.length === BRAWL_FIGHTS_PER_ROTATION) return pairs;
  }
}

function mergeMods(list: (BrawlSideMods | undefined)[]): BrawlSideMods {
  const out: BrawlSideMods = {};
  for (const m of list) {
    if (!m) continue;
    if (m.heroHealth !== undefined) out.heroHealth = m.heroHealth;
    if (m.bonusStartingEnergy) out.bonusStartingEnergy = (out.bonusStartingEnergy ?? 0) + m.bonusStartingEnergy;
    if (m.startingArmor) out.startingArmor = (out.startingArmor ?? 0) + m.startingArmor;
    if (m.rules) out.rules = [...(out.rules ?? []), ...m.rules];
    if (m.startingBoard) out.startingBoard = [...(out.startingBoard ?? []), ...m.startingBoard];
  }
  return out;
}

/** What the player's own side gets in this fight. */
export function brawlPlayerMods(fight: Pick<BrawlFight, 'modifiers'>): BrawlSideMods {
  return mergeMods(fight.modifiers.flatMap((m) => [m.both, m.player]));
}

export function applyBrawlMods(side: SideSetup, mods: BrawlSideMods): SideSetup {
  return {
    ...side,
    heroHealth: mods.heroHealth ?? side.heroHealth,
    bonusStartingEnergy: (side.bonusStartingEnergy ?? 0) + (mods.bonusStartingEnergy ?? 0) || undefined,
    startingArmor: (side.startingArmor ?? 0) + (mods.startingArmor ?? 0) || undefined,
    rules: [...(side.rules ?? []), ...(mods.rules ?? [])],
    startingBoard: [...(side.startingBoard ?? []), ...(mods.startingBoard ?? [])],
  };
}

export function brawlFights(rotation: number): BrawlFight[] {
  return brawlModifierPairs(rotation).map((modifiers, index) => {
    const rng = createRng(hashString(`brawl-opponent:${rotation}:${index}`));
    const faction = pickOne(rng, PLAYABLE_FACTIONS) ?? 'EMBER';
    const personality = pickOne(rng, PERSONALITIES) ?? 'BALANCED';
    const deckSeed = nextInt(rng, 0, 1_000_000);
    const opp = mergeMods(modifiers.flatMap((m) => [m.both, m.opponent]));
    if (modifiers.some((m) => m.opponentLegendary)) {
      const legends = collectibleCards().filter((c) => c.faction === faction && c.rarity === 'LEGENDARY' && c.cardType === 'UNIT');
      const legend = pickOne(rng, legends);
      if (legend) opp.startingBoard = [legend.id, ...(opp.startingBoard ?? [])];
    }
    const base = PRACTICE_OPPONENTS[faction];
    const opponent: OpponentDef = {
      ...base,
      id: `brawl_${rotation}_${index}_${deckSeed.toString(36)}`,
      personality,
      difficulty: 'EXPERT',
      rarities: ALL,
      special: { ...opp, description: modifiers.map((m) => m.description) },
    };
    return { id: `${rotation}-${index}`, rotation, index, modifiers, opponent };
  });
}

export function findBrawlFight(id: string): BrawlFight | undefined {
  const rotation = Number(id.split('-')[0]);
  if (!Number.isInteger(rotation) || rotation < 0) return undefined;
  return brawlFights(rotation).find((f) => f.id === id);
}

/** Progress for the given rotation (older rotations count as nothing won). */
export function brawlProgress(state: BrawlState | undefined, rotation: number): BrawlState {
  return state && state.rotation === rotation ? state : { rotation, won: [] };
}
