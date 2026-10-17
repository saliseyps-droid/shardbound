import { GAME_RULES } from '@/config/gameRules';
import type { SetId } from '@/game/types';
import type { GameSave } from '@/domain/save';
import { campaignOf, findEncounter, nightmareBase, type OpponentDef, type OpponentReward } from './opponents';

/**
 * Nightmare: a beaten campaign boss can be fought again, harder. Nightmare I is the same boss at
 * Expert with the full card pool, half again as much Health and 1 more Energy; Nightmare II adds
 * the boss's own curse (one-sided match rules, src/data/cards/tokens.ts `nm_curse_*`, and a few
 * board or Armor extras). First wins pay the boss's card in Foil (I) or Prismatic (II), or packs
 * for bosses without a card. Clears are kept in pve.completed under `${bossId}_n${tier}`.
 * Texts here are English source, translated at display time (src/i18n/cs/ui/meta.ts).
 */
export type NightmareTier = 1 | 2;
export const NIGHTMARE_TIERS: NightmareTier[] = [1, 2];
export const NIGHTMARE_HEALTH = 1.5;

export interface NightmareCurse {
  rules?: string[];
  startingBoard?: string[];
  startingArmor?: number;
  extraCards?: string[];
}

/** The curse of a card-giving fight that is not a boss, by its faction. */
export const FACTION_CURSES: Record<string, NightmareCurse> = {
  EMBER: { rules: ['nm_curse_crown_fire'] },
  VERDANT: { rules: ['nm_curse_wellspring'] },
  IRON: { rules: ['nm_curse_assembly'] },
  ASTRAL: { rules: ['nm_curse_starfall'] },
  VOID: { rules: ['nm_curse_hymn'] },
  TIDE: { rules: ['brawl_rule_long_winter'] },
};

export const NIGHTMARE_CURSES: Record<string, NightmareCurse> = {
  // The Shattering of Aethra
  c1_boss: { startingArmor: 10, startingBoard: ['token_brawl_wall', 'token_brawl_wall'] },
  c2_boss: { rules: ['brawl_rule_long_winter'] },
  c3_b1: { rules: ['nm_curse_crown_fire'] },
  c3_b2: { rules: ['brawl_rule_last_breath'] },
  c3_final: { rules: ['brawl_rule_spell_storm'] },
  c4_boss: { rules: ['brawl_rule_munitions'] },
  c5_b1: { rules: ['nm_curse_tide_ward'] },
  c5_b2: { rules: ['nm_curse_pyre'] },
  c5_final: { rules: ['brawl_rule_treasury'] },
  c6_boss: { rules: ['brawl_rule_dragon_nest'] },
  c7_boss: { rules: ['nm_curse_assembly'] },
  c8_boss: { rules: ['brawl_rule_long_winter'], startingArmor: 10 },
  c9_b1: { rules: ['nm_curse_starfall'] },
  c9_b2: { rules: ['nm_curse_wellspring'] },
  c9_b3: { rules: ['brawl_rule_blood_arena'] },
  c9_final: { rules: ['nm_curse_insight'], startingArmor: 10 },
  // The Black Sun
  v1_boss: { rules: ['nm_curse_hymn'] },
  v2_b1: { rules: ['nm_curse_rot'] },
  v2_boss: { rules: ['nm_curse_predator'] },
  v3_b1: { startingBoard: ['token_sentry', 'token_sentry'], startingArmor: 10 },
  v3_b2: { rules: ['brawl_rule_long_winter'] },
  v3_b3: { rules: ['nm_curse_toll'] },
  v3_final: { rules: ['nm_curse_insight'], extraCards: ['neu_sali_the_creator'] },
  // The Lamplighters' Road
  l1_boss: { rules: ['brawl_rule_spell_storm'] },
  l2_boss: { rules: ['nm_curse_rot'] },
  l3_boss: { rules: ['nm_curse_insight'] },
  // The Wraithwood Inn
  w1_boss: { rules: ['nm_curse_hymn'] },
  w2_boss: { rules: ['brawl_rule_blood_arena'] },
  w3_boss: { rules: ['brawl_rule_long_winter'] },
  w4_boss: { rules: ['nm_curse_toll'] },
  // The Underflame
  u1_boss: { rules: ['nm_curse_hymn'] },
  u2_boss: { rules: ['nm_curse_assembly'], startingArmor: 10 },
  u3_boss: { rules: ['brawl_rule_long_winter'] },
  u4_boss: { rules: ['nm_curse_crown_fire'], startingArmor: 10 },
  // The Twin Oath (co-op)
  hv1_boss: { rules: ['nm_curse_starfall'] },
  hv2_boss: { rules: ['nm_curse_crown_fire'] },
  hv3_final: { rules: ['nm_curse_toll'], startingArmor: 10 },
};

/** Each curse rule as the player reads it (the rule cards are written from the boss's side). */
export const CURSE_TEXT: Record<string, string> = {
  brawl_rule_long_winter: 'At the start of the boss’s turn, a random unit of yours is Frozen.',
  brawl_rule_dragon_nest: 'At the start of its turn, the boss adds a random Dragon to its hand.',
  brawl_rule_blood_arena: 'The boss’s units get +1/+1 when they are summoned.',
  brawl_rule_spell_storm: 'At the start of its turn, the boss adds a random spell that costs 3 or less to its hand.',
  brawl_rule_munitions: 'At the start of its turn, the boss deals 1 damage to you or a random unit of yours.',
  brawl_rule_treasury: 'The boss’s cards cost 1 less (but never less than 1).',
  brawl_rule_last_breath: 'Whenever one of the boss’s units dies, the boss draws a card.',
  nm_curse_tide_ward: 'At the start of its turn, the boss gains 3 Armor.',
  nm_curse_pyre: 'Whenever one of your units dies, you take 2 damage.',
  nm_curse_assembly: 'At the start of its turn, the boss summons a Scrapbot.',
  nm_curse_starfall: 'Whenever the boss casts a spell, it deals 1 damage to you or a random unit of yours.',
  nm_curse_wellspring: 'At the start of its turn, the boss restores 3 Health.',
  nm_curse_crown_fire: 'At the start of the boss’s turn, you take 2 damage.',
  nm_curse_insight: 'At the start of its turn, the boss draws an extra card.',
  nm_curse_hymn: 'At the start of its turn, the boss gives a random unit of its own +1/+1.',
  nm_curse_predator: 'At the start of its turn, the boss gives a random unit of its own +2 Attack.',
  nm_curse_rot: 'At the start of the boss’s turn, all your units take 1 damage.',
  nm_curse_toll: 'Your cards cost 1 more.',
};

export const nightmareId = (bossId: string, tier: NightmareTier) => `${bossId}_n${tier}`;

export function parseNightmare(id: string | null | undefined): { bossId: string; tier: NightmareTier } | null {
  const base = nightmareBase(id);
  if (!id || !base || base === id) return null;
  return { bossId: base, tier: id.endsWith('_n2') ? 2 : 1 };
}

/** A fight that gives no card of its own and is no boss has no Nightmare; the others do. */
const curseOf = (e: OpponentDef): NightmareCurse | undefined => NIGHTMARE_CURSES[e.id] ?? (e.firstWinReward?.cardId ? FACTION_CURSES[e.faction] : undefined);

/**
 * Campaign fights that have a Nightmare: every boss, and every other fight that pays its own card
 * (the Wraithwood Inn's guests, the Underflame's demons), so its Foil and Prismatic copies can be won.
 * Those use their faction's curse on Nightmare II.
 */
export const hasNightmare = (e: OpponentDef) => (!!e.boss && e.id in NIGHTMARE_CURSES) || !!e.firstWinReward?.cardId;

export function nightmareCleared(save: GameSave, bossId: string, tier: NightmareTier): boolean {
  return !!save.pve.completed[nightmareId(bossId, tier)];
}

/** Nightmare I opens once the boss is beaten, Nightmare II once Nightmare I is. */
export function nightmareOpen(save: GameSave, bossId: string, tier: NightmareTier): boolean {
  return tier === 1 ? !!save.pve.completed[bossId] : nightmareCleared(save, bossId, 1);
}

/** The best Nightmare tier beaten (0 for none). */
export function nightmareBest(save: GameSave, bossId: string): 0 | NightmareTier {
  return nightmareCleared(save, bossId, 2) ? 2 : nightmareCleared(save, bossId, 1) ? 1 : 0;
}

const DEFAULT_PACKS: Record<string, SetId> = { main: 'CORE', void: 'RECKONING', lamp: 'RECKONING', inn: 'RECKONING', inferno: 'RECKONING', heaven: 'RECKONING' };

/** First-win reward: the boss's card in Foil / Prismatic, or 1 / 3 packs when it gives no card. */
export function nightmareReward(boss: OpponentDef, tier: NightmareTier): OpponentReward {
  // Bosses pay twice the Gold and XP of the other card-giving fights.
  const k = boss.boss ? 1 : 0.5;
  const base = { gold: (tier === 1 ? 400 : 800) * k, xp: (tier === 1 ? 300 : 600) * k };
  const card = boss.firstWinReward?.cardId;
  if (card) return { ...base, cardId: card, variant: tier === 1 ? 'FOIL' : 'PRISMATIC' };
  const setId = boss.firstWinReward?.packs?.setId ?? DEFAULT_PACKS[campaignOf(boss.id).id] ?? 'CORE';
  return { ...base, packs: { setId, amount: tier === 1 ? 1 : 3 } };
}

/** The boss as it is fought on this Nightmare tier. */
export function nightmareOpponent(boss: OpponentDef, tier: NightmareTier): OpponentDef {
  const s = boss.special;
  const curse = tier === 2 ? curseOf(boss) : undefined;
  const list = (a?: string[], b?: string[]) => (a?.length || b?.length ? [...(a ?? []), ...(b ?? [])] : undefined);
  const armor = (s?.startingArmor ?? 0) + (curse?.startingArmor ?? 0);
  return {
    ...boss,
    id: nightmareId(boss.id, tier),
    difficulty: 'EXPERT',
    rarities: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'],
    preCinematic: undefined,
    special: {
      ...s,
      heroHealth: nightmareHealth(boss),
      bonusStartingEnergy: (s?.bonusStartingEnergy ?? 0) + 1,
      rules: list(s?.rules, curse?.rules),
      startingBoard: list(s?.startingBoard, curse?.startingBoard),
      extraCards: list(s?.extraCards, curse?.extraCards),
      startingArmor: armor || undefined,
      description: [],
    },
    firstWinReward: nightmareReward(boss, tier),
  };
}

export const nightmareHealth = (boss: OpponentDef) => Math.round((boss.special?.heroHealth ?? GAME_RULES.heroStartingHealth) * NIGHTMARE_HEALTH);

/** What changes on this tier, as t() keys with their values (the campaign screen lists them). */
export function nightmareLines(boss: OpponentDef, tier: NightmareTier): { key: string; params?: Record<string, string | number>; card?: string[] }[] {
  const out: { key: string; params?: Record<string, string | number>; card?: string[] }[] = [
    { key: 'Plays at Expert level with the full card pool.' },
    { key: 'Starts with {hp} Health and +{n} Energy.', params: { hp: nightmareHealth(boss), n: (boss.special?.bonusStartingEnergy ?? 0) + 1 } },
  ];
  if (tier === 2) {
    const c = curseOf(boss) ?? {};
    for (const r of c.rules ?? []) out.push({ key: CURSE_TEXT[r] ?? r });
    if (c.startingArmor) out.push({ key: 'The boss starts with {n} more Armor.', params: { n: c.startingArmor } });
    if (c.startingBoard?.length) out.push({ key: 'The boss starts with units on the board: {cards}.', card: c.startingBoard });
    if (c.extraCards?.length) out.push({ key: 'The boss’s deck holds more: {cards}.', card: c.extraCards });
  }
  out.push({ key: 'Its Warden abilities and signature cards stay.' });
  return out;
}

/** Every boss with a Nightmare (for achievements). */
export function nightmareBosses(): OpponentDef[] {
  return Object.keys(NIGHTMARE_CURSES)
    .map((id) => findEncounter(id)?.encounter)
    .filter((e): e is OpponentDef => !!e && !!e.boss);
}
