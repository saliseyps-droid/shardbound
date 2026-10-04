import type { OpponentDef } from '@/data/opponents';
import type { PlayableFaction } from '@/game/types';
import { factionOfList, validateDeck } from '@/domain/decks';
import type { SideSetup } from '@/engine/types';
import { validateBuild } from '@/data/wardenTalents';
import { getCardBack } from '@/data/cardBacks';
import { getPortrait } from '@/data/portraits';
import { PLAYABLE_FACTIONS } from '@/game/types';

/** Display-only opponent definition for an online match. */
export function onlineOpponent(name: string, avatar: string, faction: PlayableFaction): OpponentDef {
  return {
    id: `online:${name}`,
    name,
    title: 'Online Warden',
    avatar,
    faction,
    difficulty: 'NORMAL',
    personality: 'BALANCED',
    rarities: [],
    intro: '',
  };
}

/**
 * The host checks the guest's deck against the game rules. Ownership can't be
 * verified peer-to-peer (that needs a server), so only the rules are enforced.
 */
export function validateRemoteSide(side: SideSetup): string | null {
  if (!side || typeof side !== 'object' || !Array.isArray(side.deck) || !side.deck.every((id) => typeof id === 'string')) return 'Invalid deck.';
  if (typeof side.name !== 'string' || typeof side.avatar !== 'string') return 'Invalid match setup.';
  // The engine would skip the shuffle: the guest could choose their own draws.
  if (side.keepDeckOrder) return 'Invalid match setup.';
  const cards: Record<string, number> = {};
  for (const id of side.deck) cards[id] = (cards[id] ?? 0) + 1;
  const faction = factionOfList(side.deck);
  const issues = validateDeck({ cards, heroFaction: faction, name: 'deck' });
  if (issues.length) return `Your friend's deck is not valid: ${issues[0].message}`;
  // Bosses' special rules are not allowed in PvP.
  if (side.heroHealth || side.bonusStartingEnergy || side.startingBoard?.length || side.startingRelics?.length || side.startingLocation) return 'Invalid match setup.';
  if (validateBuild(faction, side.talents) !== null) return 'Invalid Warden abilities.';
  if (side.cardBack != null && !getCardBack(side.cardBack)) return 'Invalid card back.';
  if (side.portrait != null && getPortrait(side.portrait)?.faction !== faction) return 'Invalid Warden portrait.';
  if (side.faction != null && (!(PLAYABLE_FACTIONS as readonly string[]).includes(side.faction) || side.faction !== faction)) return 'Invalid Warden.';
  return null;
}

/**
 * The fields the host actually uses from a validated guest side. Anything else the
 * guest sent (boss rules, keepDeckOrder, unknown keys) is dropped, and the deck is
 * always shuffled.
 */
export function sanitizeRemoteSide(side: SideSetup): SideSetup {
  return {
    name: String(side.name).slice(0, 20),
    avatar: String(side.avatar),
    faction: factionOfList(side.deck),
    deck: [...side.deck],
    talents: Array.isArray(side.talents) ? side.talents.map((t) => ({ abilityId: t.abilityId, level: t.level })) : undefined,
    cardBack: side.cardBack ?? null,
    portrait: side.portrait ?? null,
    keepDeckOrder: false,
  };
}
