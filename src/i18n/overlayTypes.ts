/** Shapes of the translated game data in src/i18n/<locale>/. Every field is optional: missing ones stay English. */

export interface CardText {
  name?: string;
  /** Full rules text (replaces the generated English text). */
  description?: string;
  flavorText?: string;
}
/** cardId → text */
export type CardsOverlay = Record<string, CardText>;

export interface KeywordText {
  name?: string;
  definition?: string;
  /** Other word forms used in rules text, highlighted with the same tooltip (e.g. "Zmrazí", "zmrazenou"). */
  aliases?: string[];
}
export type KeywordsOverlay = Record<string, KeywordText>;

export interface TalentText {
  name?: string;
  /** One description per rank (I, II, III). */
  levels?: string[];
  /** What ranks II and III change. */
  upgradeNotes?: string[];
}
/** talent id → text */
export type TalentsOverlay = Record<string, TalentText>;

export interface FactionText {
  name?: string;
  short?: string;
  motto?: string;
  identity?: string;
  lore?: string;
  /** Same order as the English archetypes. */
  archetypes?: { name: string; description: string }[];
}
export interface FactionsOverlay {
  factions: Record<string, FactionText>;
  world?: { title?: string; paragraphs?: string[] };
}

export interface OpponentText {
  name?: string;
  title?: string;
  intro?: string;
  /** Boss special-rule lines, same order as English. */
  special?: string[];
  archetype?: string;
}
export interface OpponentsOverlay {
  /** opponent id (practice opponents use their id, e.g. practice_ember) → text */
  opponents: Record<string, OpponentText>;
  /** chapter id → text */
  chapters: Record<string, { name?: string; description?: string }>;
}

export interface MiscOverlay {
  cardBacks?: Record<string, { name?: string; description?: string }>;
  sets?: Record<string, { name?: string; tagline?: string }>;
  /** Level titles in order. */
  titles?: string[];
  /** Tutorial steps by id. */
  tutorial?: Record<string, { title?: string; text?: string; touchText?: string }>;
  /** Tutorial opponent and other single strings. */
  tutorialOpponent?: { name?: string; title?: string; intro?: string };
}

export interface PatchNoteText {
  title?: string;
  summary?: string;
  /** Same shape as the English sections: items per section, in order. */
  sections?: string[][];
}
/** version → text */
export type PatchNotesOverlay = Record<string, PatchNoteText>;
