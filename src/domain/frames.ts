import { err, ok, type Result } from '@/core/utils';
import { PLAYABLE_FACTIONS, type PlayableFaction } from '@/game/types';
import { getShopFrame } from '@/data/shopFrames';
import { pushReward, type GameSave, type PlayerProfile } from './save';

/**
 * Warden frames (src/ui/components/WardenFrame.tsx). A faction frame is earned with that many wins
 * with the faction; a shop frame (src/data/shopFrames.ts) is bought with Gold. The chosen frame
 * shows around your Warden in matches (also to online opponents), on Home and in the Profile; any
 * frame you have goes with any deck.
 */
export const FRAME_WINS = 100;

export const isFrameFaction = (v: unknown): v is PlayableFaction => typeof v === 'string' && (PLAYABLE_FACTIONS as readonly string[]).includes(v);
/** A faction frame or a shop frame. */
export const isFrameId = (v: unknown): v is string => isFrameFaction(v) || !!getShopFrame(v);

/** Whether this profile has the frame (won it, or bought it). */
export function frameOwnedBy(profile: Partial<Pick<PlayerProfile, 'factionWins' | 'ownedFrames'>>, id: unknown): boolean {
  if (isFrameFaction(id)) return (profile.factionWins?.[id] ?? 0) >= FRAME_WINS;
  return !!getShopFrame(id) && !!profile.ownedFrames?.includes(id as string);
}

export function frameUnlocked(save: GameSave, id: string): boolean {
  return frameOwnedBy(save.profile, id);
}

/** The frame to show: the chosen one while you still have it. */
export function activeFrame(save: GameSave): string | null {
  const f = save.profile.wardenFrame;
  return isFrameId(f) && frameUnlocked(save, f) ? f : null;
}

export function chooseFrame(save: GameSave, f: string | null): Result<GameSave> {
  if (f !== null && !isFrameId(f)) return err('Unknown frame.');
  if (f !== null && !frameUnlocked(save, f)) return err(isFrameFaction(f) ? 'Win {n} matches with this faction to earn its frame.' : 'Buy this frame in the Shop first.');
  return ok({ ...save, profile: { ...save.profile, wardenFrame: f } });
}

/** Buys a shop frame and puts it on straight away. */
export function buyFrame(save: GameSave, id: string, now: number): Result<GameSave> {
  const def = getShopFrame(id);
  if (!def) return err('This frame is not available.');
  if (save.profile.ownedFrames?.includes(id)) return err('You already own this frame.');
  if (save.profile.gold < def.price) return err('Not enough Gold.');
  const next: GameSave = { ...save, profile: { ...save.profile, gold: save.profile.gold - def.price, ownedFrames: [...(save.profile.ownedFrames ?? []), id], wardenFrame: id } };
  return ok(pushReward(next, { source: `Purchased the ${def.name} frame` }, now));
}
