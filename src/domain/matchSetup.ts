import { aiBuild } from '@/data/wardenTalents';
import { DIFFICULTY_POOLS, type OpponentDef } from '@/data/opponents';
import type { MatchSetup, SideSetup } from '@/engine/types';
import { hashString } from '@/core/rng';
import { autoBuildDeck, deckToList, type Deck } from './decks';

/** Deterministic deck for an opponent definition (same opponent → same deck). */
export function buildOpponentDeck(opponent: OpponentDef): string[] {
  const rarities = opponent.rarities ?? DIFFICULTY_POOLS[opponent.difficulty];
  const cards = autoBuildDeck({
    heroFaction: opponent.faction,
    secondFaction: opponent.secondFaction ?? null,
    archetype: opponent.archetype,
    owned: null,
    allowedRarities: rarities,
    seed: hashString(opponent.id),
  });
  return [...deckToList({ cards }), ...(opponent.special?.extraCards ?? [])];
}

export function opponentSide(opponent: OpponentDef): SideSetup {
  const s = opponent.special;
  return {
    name: opponent.name,
    avatar: opponent.avatar,
    faction: opponent.faction,
    deck: buildOpponentDeck(opponent),
    talents: s?.talents ?? aiBuild(opponent.faction, opponent.personality),
    heroHealth: s?.heroHealth,
    bonusStartingEnergy: s?.bonusStartingEnergy,
    startingBoard: s?.startingBoard,
    startingRelics: s?.startingRelics,
    startingLocation: s?.startingLocation,
  };
}

export function playerSide(name: string, avatar: string, deck: Deck): SideSetup {
  return { name, avatar, faction: deck.heroFaction, deck: deckToList(deck), talents: deck.talents };
}

export function buildMatchSetup(player: SideSetup, opponent: SideSetup, seed: number): MatchSetup {
  return { seed, players: [player, opponent] };
}
