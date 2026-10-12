import { err, ok, type Result } from '@/core/utils';
import { CAMPAIGNS, type Chapter } from '@/data/opponents';
import { pushReward, type GameSave } from './save';

/** A chapter with a price stays closed until the player buys it with Gold. */
export function isChapterBought(save: GameSave, ch: Chapter): boolean {
  return !ch.price || (save.pve.unlockedChapters ?? []).includes(ch.id);
}

/** The chapter before this one in its campaign (null for the first). */
function previousChapter(chapterId: string): Chapter | null {
  for (const c of CAMPAIGNS) {
    const i = c.chapters.findIndex((ch) => ch.id === chapterId);
    if (i >= 0) return i > 0 ? c.chapters[i - 1] : null;
  }
  return null;
}

/** A chapter can be bought once every fight of the chapter before it is cleared. */
export function canBuyChapter(save: GameSave, ch: Chapter): boolean {
  const prev = previousChapter(ch.id);
  return !prev || prev.encounters.every((e) => !!save.pve.completed[e.id]);
}

export function buyChapter(save: GameSave, chapterId: string, now: number): Result<GameSave> {
  const ch = CAMPAIGNS.flatMap((c) => c.chapters).find((c) => c.id === chapterId);
  if (!ch?.price) return err('This chapter is not for sale.');
  if (isChapterBought(save, ch)) return err('You already unlocked this chapter.');
  if (!canBuyChapter(save, ch)) return err('Clear the previous chapter first.');
  if (save.profile.gold < ch.price) return err('Not enough Gold.');
  const next: GameSave = {
    ...save,
    profile: { ...save.profile, gold: save.profile.gold - ch.price },
    pve: { ...save.pve, unlockedChapters: [...(save.pve.unlockedChapters ?? []), ch.id] },
  };
  return ok(pushReward(next, { source: `Unlocked ${ch.name}` }, now));
}
