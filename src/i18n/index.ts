import { useSettings } from '@/state/settingsStore';

/**
 * Localization.
 *
 * UI text is written in English in the source and wrapped in `t('…')`. Other languages map the
 * exact English text to a translation (src/i18n/<locale>/ui/*.ts). Entries may contain {placeholders}:
 * `t('You need {n} more Gold', { n })` looks the template up, and an already-built English string such
 * as an error message from the domain layer is matched against the templates as well.
 *
 * Game data (cards, talents, keywords, factions, opponents, …) is localized by overlays applied at boot
 * (src/i18n/applyLocale.ts). Changing the language reloads the app so everything switches at once.
 */

export type Locale = 'en' | 'cs';
export const LANGUAGES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'cs', label: 'Čeština' },
];

/** Legacy keys still used by a few components. */
const KEYS = {
  'nav.home': 'Home',
  'nav.play': 'Play',
  'nav.campaign': 'Campaign',
  'nav.collection': 'Collection',
  'nav.decks': 'Decks',
  'nav.packs': 'Packs',
  'nav.shop': 'Shop',
  'nav.arena': 'Arena',
  'nav.cardBacks': 'Card Backs',
  'nav.quests': 'Quests',
  'nav.profile': 'Profile',
  'nav.patchNotes': 'Patch notes',
  'match.endTurn': 'End turn',
  'match.enemyTurn': 'Enemy turn',
  'match.thinking': 'Thinking…',
  'match.yourTurn': 'Your turn',
  'match.theirTurn': '{name}’s turn',
  'match.concede': 'Concede',
  'match.dragHere': 'Drag units here',
} as const;
export type MessageKey = keyof typeof KEYS;

type Dict = Record<string, string>;
const UI_CS = import.meta.glob('./cs/ui/*.ts', { eager: true, import: 'default' }) as Record<string, Dict>;
const DICTS: Record<Locale, Dict> = { en: {}, cs: Object.assign({}, ...Object.values(UI_CS)) };

/** Templates (entries with {placeholders}) compiled to regexes, for already-interpolated text. */
const TEMPLATES: Record<Locale, { re: RegExp; names: string[]; out: string }[]> = { en: [], cs: [] };
for (const locale of Object.keys(DICTS) as Locale[]) {
  for (const [src, out] of Object.entries(DICTS[locale])) {
    if (!src.includes('{')) continue;
    const names: string[] = [];
    const pattern = src.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{(\w+)\}/g, (_, n: string) => {
      names.push(n);
      return '([\\s\\S]+?)';
    });
    TEMPLATES[locale].push({ re: new RegExp(`^${pattern}$`), names, out });
  }
  // Longer templates first so the most specific one wins.
  TEMPLATES[locale].sort((a, b) => b.re.source.length - a.re.source.length);
}

function readLocale(): Locale {
  try {
    const lang = useSettings.getState().language;
    return lang === 'cs' ? 'cs' : 'en';
  } catch {
    return 'en';
  }
}

/** Fixed for the lifetime of the page: switching languages reloads. */
let ACTIVE: Locale = readLocale();
export const currentLocale = (): Locale => ACTIVE;
/** Tests and tools only. */
export function setLocaleForTests(locale: Locale) {
  ACTIVE = locale;
}

const fill = (text: string, vars?: Record<string, string | number>) => (vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text);

/** Translates English source text (or a legacy key) into the active language. */
export function tr(text: string, vars?: Record<string, string | number>, locale: Locale = ACTIVE): string {
  const source = (KEYS as Record<string, string>)[text] ?? text;
  if (locale === 'en') return fill(source, vars);
  const dict = DICTS[locale];
  const direct = dict[source];
  if (direct !== undefined) return fill(direct, vars);
  if (!vars) {
    for (const tpl of TEMPLATES[locale]) {
      const m = tpl.re.exec(source);
      if (!m) continue;
      const values: Record<string, string> = {};
      tpl.names.forEach((n, i) => (values[n] = tr(m[i + 1], undefined, locale)));
      return fill(tpl.out, values);
    }
  }
  return fill(source, vars);
}

export const t = (text: string, vars?: Record<string, string | number>) => tr(text, vars);

/** Hook form (kept for components that already use it). */
export function useT() {
  return t;
}

/** Saves the language and reloads so game data and UI switch together. */
export function setLanguage(code: Locale) {
  if (code === ACTIVE) return;
  useSettings.getState().update({ language: code });
  setTimeout(() => location.reload(), 50);
}

/** Czech plural: one / few (2–4) / many. */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  if (ACTIVE !== 'cs') return abs === 1 ? one : many;
  if (abs === 1) return one;
  if (abs >= 2 && abs <= 4) return few;
  return many;
}

/**
 * Count-dependent text. English picks `one` for 1, otherwise `other`.
 * Czech looks up `other` in the dictionary; the entry holds three forms "one|few|many"
 * (1 / 2–4 / 0 and 5+), e.g. '{n} cards' → '{n} karta|{n} karty|{n} karet'.
 */
export function tn(n: number, one: string, other: string, vars?: Record<string, string | number>, locale: Locale = ACTIVE): string {
  const v = { n, ...vars };
  if (locale === 'en') return fill(n === 1 ? one : other, v);
  const entry = DICTS[locale][other];
  if (entry?.includes('|')) {
    const [o, f, m] = entry.split('|');
    const abs = Math.abs(n);
    return fill(abs === 1 ? o : abs >= 2 && abs <= 4 ? f : m, v);
  }
  return tr(n === 1 ? one : other, v, locale);
}

/** BCP 47 tag of the app language, for dates (the browser's own locale may differ from the app's). */
export const dateLocale = (): string => (ACTIVE === 'cs' ? 'cs-CZ' : 'en-GB');

/** A date in the app language, e.g. "4 Oct 2026" / "4. 10. 2026". */
export function formatDate(date: Date | number | string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  return new Date(date).toLocaleDateString(dateLocale(), options);
}

/** A date and time in the app language. */
export function formatDateTime(date: Date | number | string, options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' }): string {
  return new Date(date).toLocaleString(dateLocale(), options);
}
