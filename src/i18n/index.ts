import { useSettings } from '@/state/settingsStore';

/**
 * Localization architecture. UI strings are looked up by key; missing keys fall
 * back to English, then to the key itself. Card text is generated from data in
 * src/game/describe.ts and can be localized there per locale in the future.
 */
const en = {
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

export type MessageKey = keyof typeof en;
type Dictionary = Partial<Record<MessageKey, string>>;

const DICTIONARIES: Record<string, Dictionary> = { en };

export const LANGUAGES: { code: string; label: string }[] = [{ code: 'en', label: 'English' }];

export function translate(locale: string, key: MessageKey, vars?: Record<string, string | number>): string {
  let text = DICTIONARIES[locale]?.[key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
  return text;
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  return translate(useSettings.getState().language, key, vars);
}

/** Hook form so components re-render when the language changes. */
export function useT() {
  const locale = useSettings((s) => s.language);
  return (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
}
