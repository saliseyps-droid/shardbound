/**
 * Applies translated game data (src/i18n/<locale>/*.ts) onto the in-memory definitions at boot.
 * Ids, numbers and rules never change, only display text. English is the source and the fallback.
 */
import { allCards } from '@/data/cards';
import { KEYWORDS, rebuildKeywordPattern } from '@/data/keywords';
import { BOSS_TALENTS, FACTION_TALENTS } from '@/data/wardenTalents';
import { FACTIONS, WORLD_LORE } from '@/data/factions';
import { CAMPAIGN, PRACTICE_OPPONENTS } from '@/data/opponents';
import { CARD_BACKS } from '@/data/cardBacks';
import { SET_INFO } from '@/config/economy';
import { PATCH_NOTES } from '@/data/patchNotes';
import { TUTORIAL_STEPS } from '@/ui/match/tutorial';
import { TUTORIAL_OPPONENT } from '@/ui/match/tutorialData';
import { PLAYABLE_FACTIONS } from '@/game/types';
import type { Locale } from './index';
import type { CardsOverlay, FactionsOverlay, KeywordsOverlay, MiscOverlay, OpponentsOverlay, PatchNotesOverlay, TalentsOverlay } from './overlayTypes';

type Mod<T> = Record<string, T>;
const CS_CARDS = import.meta.glob('./cs/cards/*.ts', { eager: true, import: 'default' }) as Mod<CardsOverlay>;
const CS_DATA = import.meta.glob('./cs/data/*.ts', { eager: true, import: 'default' }) as Mod<unknown>;

const pick = <T,>(mods: Mod<unknown>, name: string): T | undefined => mods[`./cs/data/${name}.ts`] as T | undefined;
const set = <T extends object, K extends keyof T>(obj: T, key: K, value: T[K] | undefined) => {
  if (value !== undefined && value !== '') obj[key] = value;
};

let applied: Locale = 'en';

export function applyLocale(locale: Locale) {
  if (locale === 'en' || applied === locale) return;
  applied = locale;

  // Cards
  const cards: CardsOverlay = Object.assign({}, ...Object.values(CS_CARDS));
  for (const card of allCards()) {
    const text = cards[card.id];
    if (!text) continue;
    set(card, 'name', text.name);
    set(card, 'description', text.description);
    set(card, 'flavorText', text.flavorText);
  }

  // Keywords (+ the highlighting pattern built from their names)
  const keywords = pick<KeywordsOverlay>(CS_DATA, 'keywords') ?? {};
  for (const [id, kw] of Object.entries(KEYWORDS)) {
    const text = keywords[id];
    if (!text) continue;
    set(kw, 'name', text.name);
    set(kw, 'definition', text.definition);
    if (text.aliases?.length) kw.aliases = text.aliases;
  }
  rebuildKeywordPattern();

  // Warden talents
  const talents = pick<TalentsOverlay>(CS_DATA, 'talents') ?? {};
  for (const talent of [...PLAYABLE_FACTIONS.flatMap((f) => FACTION_TALENTS[f]), ...BOSS_TALENTS]) {
    const text = talents[talent.id];
    if (!text) continue;
    set(talent, 'name', text.name);
    text.levels?.forEach((d, i) => talent.levels[i] && set(talent.levels[i], 'description', d));
    if (text.upgradeNotes?.length) talent.upgradeNotes = text.upgradeNotes;
  }

  // Factions & world lore
  const factions = pick<FactionsOverlay>(CS_DATA, 'factions');
  if (factions) {
    for (const [id, info] of Object.entries(FACTIONS)) {
      const text = factions.factions[id];
      if (!text) continue;
      set(info, 'name', text.name);
      set(info, 'short', text.short);
      set(info, 'motto', text.motto);
      set(info, 'identity', text.identity);
      set(info, 'lore', text.lore);
      text.archetypes?.forEach((a, i) => info.archetypes[i] && Object.assign(info.archetypes[i], a));
    }
    set(WORLD_LORE, 'title', factions.world?.title);
    if (factions.world?.paragraphs?.length) (WORLD_LORE as { paragraphs: string[] }).paragraphs = factions.world.paragraphs;
  }

  // Opponents & campaign
  const opp = pick<OpponentsOverlay>(CS_DATA, 'opponents');
  if (opp) {
    const apply = (o: { id: string; name: string; title: string; intro: string; archetype?: string; special?: { description: string[] } }) => {
      const text = opp.opponents[o.id];
      if (!text) return;
      set(o, 'name', text.name);
      set(o, 'title', text.title);
      set(o, 'intro', text.intro);
      if (text.special?.length && o.special) o.special.description = text.special;
    };
    Object.values(PRACTICE_OPPONENTS).forEach(apply);
    for (const ch of CAMPAIGN) {
      const text = opp.chapters[ch.id];
      if (text) {
        set(ch, 'name', text.name);
        set(ch, 'description', text.description);
      }
      ch.encounters.forEach(apply);
    }
  }

  // Card backs, sets, tutorial
  const misc = pick<MiscOverlay>(CS_DATA, 'misc');
  if (misc) {
    for (const b of CARD_BACKS) {
      const text = misc.cardBacks?.[b.id];
      if (text) {
        set(b, 'name', text.name);
        set(b, 'description', text.description);
      }
    }
    for (const [id, info] of Object.entries(SET_INFO)) {
      const text = misc.sets?.[id];
      if (text) {
        set(info, 'name', text.name);
        set(info, 'tagline', text.tagline);
      }
    }
    for (const step of TUTORIAL_STEPS) {
      const text = misc.tutorial?.[step.id];
      if (text) {
        set(step, 'title', text.title);
        set(step, 'text', text.text);
        set(step, 'touchText', text.touchText);
      }
    }
    const to = misc.tutorialOpponent;
    if (to) {
      set(TUTORIAL_OPPONENT, 'name', to.name);
      set(TUTORIAL_OPPONENT, 'title', to.title);
      set(TUTORIAL_OPPONENT, 'intro', to.intro);
    }
  }

  // Patch notes
  const notes = pick<PatchNotesOverlay>(CS_DATA, 'patchNotes') ?? {};
  for (const note of PATCH_NOTES) {
    const text = notes[note.version];
    if (!text) continue;
    set(note, 'title', text.title);
    set(note, 'summary', text.summary);
    text.sections?.forEach((items, i) => {
      if (note.sections[i] && items.length === note.sections[i].items.length) note.sections[i].items = items;
    });
  }
}
