import { CINEMATICS } from '@/data/cinematics';
import { CAMPAIGNS, type CampaignDef, type OpponentDef } from '@/data/opponents';
import { getCard } from '@/data/cards';
import type { Faction } from '@/game/types';
import type { GameSave } from '@/domain/save';
import { isUnlocked } from '@/ui/components/meta/campaign';

/**
 * The Codex: the whole story as a book, one spread per entry, in the order it happens. Pages open
 * as the player gets there: a cinematic's shots once it has been seen, a chapter once it is
 * reached, a boss once it is beaten. Texts are already localized (cinematic lines go through t()).
 */
export type CodexImage = { kind: 'cinematic'; id: string; focus?: string } | { kind: 'portrait'; faction: Faction | null; portrait: string | null };

export interface CodexEntry {
  id: string;
  /** Which part of the book (for the contents): 'world' or a campaign id. */
  part: string;
  kind: 'shot' | 'chapter' | 'boss';
  /** Small line above the title (campaign, chapter or cinematic name). Already localized except for cinematic titles (t() keys). */
  kicker: string;
  title: string;
  subtitle?: string;
  /** Narration line (a t() key) for shots; description for chapters. */
  text?: string;
  quote?: string;
  image: CodexImage;
  /** Shots: the cinematic they belong to (replayable from the page). */
  cinematic?: string;
  /** Bosses: the card they give, their faction, and when they were first beaten (and how often). */
  rewardCard?: string;
  faction?: Faction;
  beaten?: { at: number; wins: number };
  unlocked: boolean;
  /** What unlocks a blank page (a t() key with {name} filled in by the screen). */
  hint: { key: string; name: string };
}

export interface CodexPart {
  id: string;
  /** A t() key. */
  title: string;
  first: number;
  count: number;
  open: number;
}

function shotEntries(cinematicId: string, part: string, unlocked: boolean, hint: CodexEntry['hint']): CodexEntry[] {
  const def = CINEMATICS[cinematicId];
  if (!def) return [];
  return def.shots.map((s, i) => ({
    id: `${cinematicId}:${i}`,
    part,
    kind: 'shot' as const,
    kicker: def.title,
    title: def.title,
    text: s.text,
    image: { kind: 'cinematic' as const, id: s.image, focus: s.focus },
    cinematic: cinematicId,
    unlocked,
    hint,
  }));
}

function bossEntry(save: GameSave, camp: CampaignDef, chapterName: string, e: OpponentDef): CodexEntry {
  const reward = e.firstWinReward?.cardId;
  return {
    id: e.id,
    part: camp.id,
    kind: 'boss',
    kicker: chapterName,
    title: e.name,
    subtitle: e.title,
    quote: e.intro,
    image: { kind: 'portrait', faction: e.faction, portrait: e.portrait ?? null },
    rewardCard: reward && getCard(reward) ? reward : undefined,
    faction: e.faction,
    beaten: save.pve.completed[e.id] ? { at: save.pve.completed[e.id].firstClearAt, wins: save.pve.completed[e.id].wins } : undefined,
    unlocked: !!save.pve.completed[e.id],
    hint: { key: 'Defeat the boss of {name} to fill this page.', name: chapterName },
  };
}

/** Every page of the book, in story order. */
export function codexEntries(save: GameSave): CodexEntry[] {
  const seen = new Set(save.pve.seenCinematics ?? []);
  const out: CodexEntry[] = [...shotEntries('world_intro', 'world', seen.has('world_intro'), { key: 'Watch the world intro to fill this page.', name: '' })];
  for (const camp of CAMPAIGNS) {
    if (camp.intro) out.push(...shotEntries(camp.intro, camp.id, seen.has(camp.intro), { key: 'Open the campaign {name} to fill this page.', name: camp.name }));
    for (const ch of camp.chapters) {
      const first = ch.encounters[0];
      const reached = ch.encounters.some((e) => save.pve.completed[e.id]) || (!!first && isUnlocked(save, first.id));
      const lead = ch.encounters.find((e) => e.boss) ?? ch.encounters[ch.encounters.length - 1];
      out.push({
        id: ch.id,
        part: camp.id,
        kind: 'chapter',
        kicker: camp.name,
        title: ch.name,
        text: ch.description,
        image: { kind: 'portrait', faction: lead?.faction ?? null, portrait: lead?.portrait ?? null },
        unlocked: reached,
        hint: { key: 'Reach this chapter of {name} to fill this page.', name: camp.name },
      });
      for (const e of ch.encounters) {
        if (!e.boss) continue;
        // Also open for players who beat the boss before its cinematic existed.
        if (e.preCinematic) out.push(...shotEntries(e.preCinematic, camp.id, seen.has(e.preCinematic) || !!save.pve.completed[e.id], { key: 'Face {name} to fill this page.', name: e.name }));
        out.push(bossEntry(save, camp, ch.name, e));
      }
    }
    if (camp.outro) out.push(...shotEntries(camp.outro, camp.id, seen.has(camp.outro), { key: 'Finish the campaign {name} to fill this page.', name: camp.name }));
  }
  return out;
}

/** The contents: where each part starts (spread index, after the cover) and how much of it is open. */
export function codexParts(entries: CodexEntry[]): CodexPart[] {
  const titles: Record<string, string> = { world: 'The Shattering', ...Object.fromEntries(CAMPAIGNS.map((c) => [c.id, c.name])) };
  const parts: CodexPart[] = [];
  entries.forEach((e, i) => {
    let p = parts[parts.length - 1];
    if (!p || p.id !== e.part) {
      p = { id: e.part, title: titles[e.part] ?? e.part, first: i + 1, count: 0, open: 0 };
      parts.push(p);
    }
    p.count++;
    if (e.unlocked) p.open++;
  });
  return parts;
}

/** Ids of the pages written so far. */
export function openCodexIds(save: GameSave): string[] {
  return codexEntries(save)
    .filter((e) => e.unlocked)
    .map((e) => e.id);
}

/** How many pages are written, out of all of them (for achievements). */
export function codexProgress(save: GameSave): { open: number; total: number } {
  const entries = codexEntries(save);
  return { open: entries.filter((e) => e.unlocked).length, total: entries.length };
}
