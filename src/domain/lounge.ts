import { err, ok, type Result } from '@/core/utils';
import { DECOR_BY_ID, OPTIONAL_KINDS, SLOT_KIND, inSeason, ownsDecor, sanitizeRoom, slotOf, type RoomLayout, type SlotId } from '@/data/lounge';
import { pushReward, type GameSave, type PlayerProfile } from './save';

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

/** What the room shows of its owner (their wins, on the neon counter). Cosmetic only. */
export interface RoomInfo {
  wins: number;
}

export const roomInfoOf = (save: Pick<GameSave, 'profile'>): RoomInfo => ({ wins: save.profile.wins ?? 0 });
