import type { KeywordId } from '@/game/types';

export interface KeywordInfo {
  id: KeywordId;
  name: string;
  /** Short rules definition shown in tooltips. */
  definition: string;
  category: 'static' | 'trigger' | 'status';
  icon: string;
}

export const KEYWORDS: Record<KeywordId, KeywordInfo> = {
  GUARD: { id: 'GUARD', name: 'Guard', category: 'static', icon: '🛡', definition: 'Enemies must attack units with Guard before attacking anything else.' },
  RUSH: { id: 'RUSH', name: 'Rush', category: 'static', icon: '➹', definition: 'Can attack enemy units on the turn it is deployed.' },
  SWIFT: { id: 'SWIFT', name: 'Swift', category: 'static', icon: '⚡', definition: 'Can attack anything on the turn it is deployed.' },
  DRAIN: { id: 'DRAIN', name: 'Drain', category: 'static', icon: '♥', definition: 'Damage this unit deals also restores that much Health to your Warden.' },
  BARRIER: { id: 'BARRIER', name: 'Barrier', category: 'static', icon: '◈', definition: 'The first time this unit would take damage, prevent it and remove Barrier.' },
  AMBUSH: { id: 'AMBUSH', name: 'Ambush', category: 'static', icon: '◐', definition: 'Cannot be attacked or targeted by enemies until it attacks or deals damage.' },
  WARD: { id: 'WARD', name: 'Ward', category: 'static', icon: '✧', definition: 'Cannot be targeted by enemy spells or Warden Sigils.' },
  FRENZY: { id: 'FRENZY', name: 'Frenzy', category: 'static', icon: '⚔', definition: 'Can attack twice each turn.' },
  VENOM: { id: 'VENOM', name: 'Venom', category: 'static', icon: '☠', definition: 'Any damage this unit deals to a unit destroys it.' },
  REGENERATE: { id: 'REGENERATE', name: 'Regenerate', category: 'static', icon: '✚', definition: 'At the end of your turn, this unit restores itself to full Health.' },
  EMPOWER: { id: 'EMPOWER', name: 'Empower', category: 'static', icon: '✦', definition: 'Your damaging spells deal extra damage equal to the Empower value.' },
  ECHO: { id: 'ECHO', name: 'Echo', category: 'static', icon: '↻', definition: 'After you play this, add a Fleeting copy of it (without Echo) to your hand.' },
  FLEETING: { id: 'FLEETING', name: 'Fleeting', category: 'static', icon: '⌛', definition: 'This card is discarded from your hand at the end of your turn.' },
  ON_DEPLOY: { id: 'ON_DEPLOY', name: 'On Deploy', category: 'trigger', icon: '▶', definition: 'Resolves when you play this card from your hand.' },
  LAST_BREATH: { id: 'LAST_BREATH', name: 'Last Breath', category: 'trigger', icon: '✝', definition: 'Resolves when this unit dies.' },
  OVERCHARGE: { id: 'OVERCHARGE', name: 'Overcharge', category: 'trigger', icon: 'ϟ', definition: 'If you still have at least X unspent energy after playing this, spend X to unlock the bonus effect.' },
  BURN: { id: 'BURN', name: 'Burn', category: 'status', icon: '🔥', definition: 'At the start of its controller\'s turn, a Burning unit takes damage equal to its Burn, then Burn fades by 1.' },
  FREEZE: { id: 'FREEZE', name: 'Freeze', category: 'status', icon: '❄', definition: 'A Frozen unit cannot attack during its controller\'s next turn.' },
};

export const KEYWORD_LIST = Object.values(KEYWORDS);

/** Keyword names that appear in rules text, used for tooltip highlighting. */
export const KEYWORD_NAME_PATTERN = new RegExp(
  `\\b(${KEYWORD_LIST.map((k) => k.name).sort((a, b) => b.length - a.length).join('|')}|Frozen|Freezes?|Burning)\\b`,
  'g',
);

export function keywordByName(name: string): KeywordInfo | undefined {
  const normalized = name.toLowerCase();
  if (normalized.startsWith('froz') || normalized.startsWith('freez')) return KEYWORDS.FREEZE;
  if (normalized === 'burning') return KEYWORDS.BURN;
  return KEYWORD_LIST.find((k) => k.name.toLowerCase() === normalized);
}
