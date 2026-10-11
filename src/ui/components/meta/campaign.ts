import { CAMPAIGN, campaignOf, type Chapter, type OpponentDef } from '@/data/opponents';
import type { GameSave } from '@/domain/save';

/** An encounter unlocks when the previous one (across chapters of its own campaign) has been cleared. */
export function isUnlocked(save: GameSave, encounterId: string): boolean {
  const flat = campaignOf(encounterId).chapters.flatMap((c) => c.encounters);
  const idx = flat.findIndex((e) => e.id === encounterId);
  if (idx <= 0) return true;
  return !!save.pve.completed[flat[idx - 1].id];
}

export function isCleared(save: GameSave, encounterId: string): boolean {
  return !!save.pve.completed[encounterId];
}

/** The first uncleared encounter of a campaign (the main one by default). */
export function nextEncounter(save: GameSave, chapters: Chapter[] = CAMPAIGN): { encounter: OpponentDef; chapterIndex: number } | null {
  for (let c = 0; c < chapters.length; c++) {
    for (const e of chapters[c].encounters) if (!isCleared(save, e.id)) return { encounter: e, chapterIndex: c };
  }
  return null;
}

export function campaignProgress(save: GameSave, chapters: Chapter[] = CAMPAIGN) {
  const flat = chapters.flatMap((c) => c.encounters);
  const cleared = flat.filter((e) => isCleared(save, e.id)).length;
  return { cleared, total: flat.length };
}
