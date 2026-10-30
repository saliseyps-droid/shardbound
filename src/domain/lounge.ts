import { err, ok, type Result } from '@/core/utils';
import { DECOR_BY_ID, OPTIONAL_KINDS, SLOT_KIND, inSeason, ownsDecor, sanitizeRoom, slotOf, type RoomLayout, type SlotId } from '@/data/lounge';
import { pushReward, type GameSave, type PlayerProfile } from './save';
import { getCard } from '@/data/cards';
import { RARITIES } from '@/game/types';

/**
 * The Lounge (src/data/lounge.ts): decor is bought with Gold and placed in the room's slots. The room
 * surrounds the 3D table in matches (online the host's).
 */

/** The room to build: the placed pieces the player still owns, defaults elsewhere. */
export const activeRoom = (profile: Pick<PlayerProfile, 'room' | 'ownedDecor'>): RoomLayout => sanitizeRoom(profile.room, profile.ownedDecor ?? []);

export function buyDecor(save: GameSave, id: string, now: number): Result<GameSave> {
  const def = DECOR_BY_ID[id];
  if (!def) return err('This piece is not available.');
  if (ownsDecor(save.profile.ownedDecor ?? [], id)) return err('You already own this piece.');
  if (!inSeason(def, new Date(now))) return err('This piece is not on sale now.');
  if (save.profile.gold < def.price) return err('Not enough Gold.');
  const next: GameSave = { ...save, profile: { ...save.profile, gold: save.profile.gold - def.price, ownedDecor: [...(save.profile.ownedDecor ?? []), id] } };
  return ok(pushReward(next, { source: `Purchased ${def.name} for the Lounge` }, now));
}

/** Puts an owned piece in a slot (moving it there if it stood elsewhere), or empties an optional slot. */
export function placeDecor(save: GameSave, slot: SlotId, id: string | null): Result<GameSave> {
  const room = activeRoom(save.profile);
  if (id === null) {
    if (!OPTIONAL_KINDS.has(SLOT_KIND[slot])) return err('This place cannot stay empty.');
    return ok({ ...save, profile: { ...save.profile, room: { ...room, [slot]: null } } });
  }
  const def = DECOR_BY_ID[id];
  if (!def || def.kind !== SLOT_KIND[slot]) return err('This piece does not fit here.');
  if (!ownsDecor(save.profile.ownedDecor ?? [], id)) return err('Buy this piece first.');
  const next = { ...room, [slot]: id };
  const from = slotOf(room, id);
  if (from && from !== slot) next[from] = null;
  return ok({ ...save, profile: { ...save.profile, room: next } });
}

/** A trophy on the Lounge's shelf: what it is for and how far the player got (1 bronze, 2 silver, 3 gold). */
export interface Trophy {
  id: 'wins' | 'streak' | 'tournament' | 'ladder' | 'achievements' | 'packs';
  tier: 1 | 2 | 3;
}

/** What the room shows of its owner: wins for the neon counter, trophies earned, the card in the frame. Cosmetic only. */
export interface RoomInfo {
  wins: number;
  trophies: Trophy[];
  /** The card hung in the card frame (src/data/cards.ts id). */
  cardId?: string;
}

/** Bronze, silver and gold thresholds per trophy. */
export const TROPHY_TIERS: Record<Trophy['id'], [number, number, number]> = {
  wins: [10, 100, 500],
  streak: [5, 10, 20],
  tournament: [1, 5, 20],
  // The Ranked vs AI ladder: 6 = Silver III, 12 = Diamond III (roughly), 15 = Crown.
  ladder: [6, 12, 15],
  achievements: [10, 25, 50],
  packs: [10, 100, 500],
};

type InfoSource = Pick<PlayerProfile, 'wins' | 'bestWinStreak' | 'tournamentsWon' | 'aiRanked' | 'achievements' | 'packsOpened' | 'loungeCard'>;

export function earnedTrophies(p: InfoSource): Trophy[] {
  const value: Record<Trophy['id'], number> = {
    wins: p.wins ?? 0,
    streak: p.bestWinStreak ?? 0,
    tournament: p.tournamentsWon ?? 0,
    ladder: p.aiRanked?.rank ?? 0,
    achievements: Object.keys(p.achievements ?? {}).length,
    packs: p.packsOpened ?? 0,
  };
  const out: Trophy[] = [];
  for (const id of Object.keys(TROPHY_TIERS) as Trophy['id'][]) {
    const tier = TROPHY_TIERS[id].filter((n) => value[id] >= n).length;
    if (tier > 0) out.push({ id, tier: tier as Trophy['tier'] });
  }
  return out;
}

export const roomInfo = (p: InfoSource): RoomInfo => ({ wins: p.wins ?? 0, trophies: earnedTrophies(p), cardId: p.loungeCard ?? undefined });

/**
 * The room's info from a save: the framed card is the one the player chose, or else the rarest card they
 * own (the most copies among equals), so the frame is never empty.
 */
export function roomInfoOf(save: Pick<GameSave, 'profile' | 'collection'>): RoomInfo {
  const info = roomInfo(save.profile);
  if (info.cardId && getCard(info.cardId)) return info;
  let best: { id: string; rank: number; n: number } | null = null;
  for (const [id, counts] of Object.entries(save.collection?.cards ?? {})) {
    const card = getCard(id);
    const n = Object.values(counts ?? {}).reduce((a, b) => a + (b ?? 0), 0);
    if (!card || n <= 0 || !card.collectible) continue;
    const rank = RARITIES.indexOf(card.rarity);
    if (!best || rank > best.rank || (rank === best.rank && n > best.n)) best = { id, rank, n };
  }
  return { ...info, cardId: best?.id };
}

/** Hangs a card the player owns in the Lounge's card frame. */
export function setLoungeCard(save: GameSave, cardId: string): Result<GameSave> {
  const counts = save.collection.cards[cardId];
  if (!getCard(cardId) || !counts || !Object.values(counts).some((n) => (n ?? 0) > 0)) return err('You do not own this card.');
  return ok({ ...save, profile: { ...save.profile, loungeCard: cardId } });
}
