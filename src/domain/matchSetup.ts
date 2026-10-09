import { aiBuild } from '@/data/wardenTalents';
import { randomCardBack } from '@/data/cardBacks';
import { randomPortrait } from '@/data/portraits';
import { effectivePortrait } from './portraits';
import type { CollectionState, PlayerProfile } from './save';
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

/** `random` picks the opponent's card back (a new one every match). */
export function opponentSide(opponent: OpponentDef, random: () => number = Math.random): SideSetup {
  const s = opponent.special;
  return {
    name: opponent.name,
    avatar: opponent.avatar,
    faction: opponent.faction,
    deck: buildOpponentDeck(opponent),
    talents: s?.talents ?? aiBuild(opponent.faction, opponent.personality),
    cardBack: randomCardBack(random),
    portrait: opponent.portrait !== undefined ? opponent.portrait : randomPortrait(opponent.faction, random),
    heroHealth: s?.heroHealth,
    bonusStartingEnergy: s?.bonusStartingEnergy,
    startingBoard: s?.startingBoard,
    startingRelics: s?.startingRelics,
    startingLocation: s?.startingLocation,
    rules: s?.rules,
    startingArmor: s?.startingArmor,
  };
}

/**
 * Which copies of a deck show as Prismatic or Foil: the best variants you own go in first.
 * Decks only count copies, so every deck (old ones too) gets its variants from the collection.
 */
export function deckVariants(collection: CollectionState, deck: Pick<Deck, 'cards'>): NonNullable<SideSetup['variants']> {
  const out: NonNullable<SideSetup['variants']> = {};
  for (const [id, count] of Object.entries(deck.cards)) {
    const owned = collection.cards[id];
    if (!owned || count <= 0) continue;
    const prismatic = Math.min(count, owned.PRISMATIC);
    const foil = Math.min(count - prismatic, owned.FOIL);
    if (prismatic + foil === 0) continue;
    out[id] = { ...(prismatic ? { PRISMATIC: prismatic } : {}), ...(foil ? { FOIL: foil } : {}) };
  }
  return out;
}

/** `collection` shows your Prismatic and Foil copies in the match (left out for borrowed decks). */
export function playerSide(profile: Pick<PlayerProfile, 'username' | 'avatar' | 'cardBack' | 'portraits' | 'factionPortraits'>, deck: Deck, collection?: CollectionState): SideSetup {
  return {
    name: profile.username,
    avatar: profile.avatar,
    faction: deck.heroFaction,
    deck: deckToList(deck),
    ...(collection ? { variants: deckVariants(collection, deck) } : {}),
    talents: deck.talents,
    cardBack: profile.cardBack ?? null,
    portrait: effectivePortrait(deck, profile),
  };
}

export function buildMatchSetup(player: SideSetup, opponent: SideSetup, seed: number): MatchSetup {
  return { seed, players: [player, opponent] };
}
