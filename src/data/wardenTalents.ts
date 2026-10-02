import type { Ability, Effect, PlayableFaction, TargetRequirement } from '@/game/types';
import { PLAYABLE_FACTIONS } from '@/game/types';
import type { AiPersonality } from '@/ai/config';

/**
 * Warden talents: every faction has 5 abilities with ranks I → II → III.
 * A deck learns exactly 2 of them and spends all 5 talent points (one at III, one at II).
 * `level` is the rank index: 0 = I, 1 = II, 2 = III. Each rank is a complete definition.
 */

export type TalentLevel = 0 | 1 | 2;
export const TALENT_POINTS = 5;
export const TALENT_PICKS = 2;
export const RANK_LABEL = ['I', 'II', 'III'] as const;

export interface ActiveLevel {
  cost: number;
  target?: TargetRequirement;
  effects: Effect[];
  /** Uses per turn (default 1). */
  usesPerTurn?: number;
  description: string;
}

export interface PassiveLevel {
  abilities: Ability[];
  /** Max triggers per turn; unlimited when absent. */
  limitPerTurn?: number;
  description: string;
}

interface TalentBase {
  id: string;
  faction: PlayableFaction | 'BOSS';
  name: string;
  /** What ranks II and III change (tooltips in the talent tree). */
  upgradeNotes: string[];
}
export interface ActiveTalent extends TalentBase { kind: 'ACTIVE'; levels: ActiveLevel[] }
export interface PassiveTalent extends TalentBase { kind: 'PASSIVE'; levels: PassiveLevel[] }
export type TalentAbility = ActiveTalent | PassiveTalent;

export interface TalentPick {
  abilityId: string;
  level: TalentLevel;
}

const active = (faction: TalentAbility['faction'], key: string, name: string, levels: ActiveLevel[], upgradeNotes: string[] = []): ActiveTalent => ({
  id: `wt_${faction.toLowerCase()}_${key}`, faction, name, kind: 'ACTIVE', levels, upgradeNotes,
});
const passive = (faction: TalentAbility['faction'], key: string, name: string, levels: PassiveLevel[], upgradeNotes: string[] = []): PassiveTalent => ({
  id: `wt_${faction.toLowerCase()}_${key}`, faction, name, kind: 'PASSIVE', levels, upgradeNotes,
});

// ---------------------------------------------------------------------------
// Faction abilities
// ---------------------------------------------------------------------------

const EMBER: TalentAbility[] = [
  active('EMBER', 'cinder_bolt', 'Cinder Bolt', [
    { cost: 2, target: { kind: 'ENEMY' }, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }], description: 'Deal 1 damage to an enemy.' },
    { cost: 2, target: { kind: 'ENEMY' }, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }, { type: 'APPLY_STATUS', status: 'BURN', amount: 1, target: 'TARGET' }], description: 'Deal 1 damage to an enemy and apply Burn 1.' },
    { cost: 1, target: { kind: 'ENEMY' }, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }, { type: 'APPLY_STATUS', status: 'BURN', amount: 1, target: 'TARGET' }], description: 'Deal 1 damage to an enemy and apply Burn 1.' },
  ], ['Also applies Burn 1.', 'Cost 2 → 1.']),
  passive('EMBER', 'kindled_fury', 'Kindled Fury', [
    { abilities: [{ trigger: 'TURN_START', effects: [{ type: 'BUFF', attack: 1, target: 'RANDOM_ALLY_UNIT' }] }], description: 'At the start of your turn, give a random friendly unit +1 Attack.' },
    { abilities: [{ trigger: 'TURN_START', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_ALLY_UNIT' }] }], description: 'At the start of your turn, give a random friendly unit +1/+1.' },
    { abilities: [{ trigger: 'TURN_START', effects: [{ type: 'BUFF', attack: 2, health: 1, target: 'RANDOM_ALLY_UNIT' }] }], description: 'At the start of your turn, give a random friendly unit +2/+1.' },
  ], ['+1 Attack → +1/+1.', '+1/+1 → +2/+1.']),
  active('EMBER', 'imp_summoning', 'Imp Summoning', [
    { cost: 3, effects: [{ type: 'SUMMON', cardId: 'token_ember_imp' }], description: 'Summon a 2/1 Ember Imp.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_ember_imp' }], description: 'Summon a 2/1 Ember Imp.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_ember_imp' }, { type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }], description: 'Summon a 2/1 Ember Imp and deal 1 damage to the enemy Warden.' },
  ], ['Cost 3 → 2.', 'Also deals 1 damage to the enemy Warden.']),
  passive('EMBER', 'searing_wrath', 'Searing Wrath', [
    { limitPerTurn: 1, abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }] }], description: 'Whenever you cast a spell, deal 1 damage to the enemy Warden. Once per turn.' },
    { limitPerTurn: 2, abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }] }], description: 'Whenever you cast a spell, deal 1 damage to the enemy Warden. Twice per turn.' },
    { limitPerTurn: 2, abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }, { type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY_UNIT' }] }], description: 'Whenever you cast a spell, deal 1 damage to the enemy Warden and 1 damage to a random enemy unit. Twice per turn.' },
  ], ['Triggers twice per turn.', 'Also hits a random enemy unit for 1.']),
  active('EMBER', 'warcry', 'Warcry', [
    { cost: 2, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', attack: 2, temporary: true, target: 'TARGET' }], description: 'Give a friendly unit +2 Attack this turn.' },
    { cost: 2, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', attack: 2, temporary: true, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'RUSH', target: 'TARGET' }], description: 'Give a friendly unit +2 Attack this turn and Rush.' },
    { cost: 1, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', attack: 2, temporary: true, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'RUSH', target: 'TARGET' }], description: 'Give a friendly unit +2 Attack this turn and Rush.' },
  ], ['Also grants Rush.', 'Cost 2 → 1.']),
];

const VERDANT: TalentAbility[] = [
  active('VERDANT', 'sap_of_the_root', 'Sap of the Root', [
    { cost: 2, target: { kind: 'ALLY' }, effects: [{ type: 'HEAL', amount: 2, target: 'TARGET' }], description: 'Restore 2 Health to a friendly character.' },
    { cost: 2, target: { kind: 'ALLY' }, effects: [{ type: 'HEAL', amount: 3, target: 'TARGET' }], description: 'Restore 3 Health to a friendly character.' },
    { cost: 2, target: { kind: 'ALLY' }, effects: [{ type: 'HEAL', amount: 4, target: 'TARGET' }], description: 'Restore 4 Health to a friendly character.' },
  ], ['Restores 3 instead of 2.', 'Restores 4 instead of 3.']),
  active('VERDANT', 'sprout', 'Sprout', [
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_sapling' }], description: 'Summon a 1/2 Sapling.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_sapling' }, { type: 'HEAL', amount: 1, target: 'ALLY_HERO' }], description: 'Summon a 1/2 Sapling and restore 1 Health to your Warden.' },
    { cost: 1, effects: [{ type: 'SUMMON', cardId: 'token_sapling' }, { type: 'HEAL', amount: 1, target: 'ALLY_HERO' }], description: 'Summon a 1/2 Sapling and restore 1 Health to your Warden.' },
  ], ['Also restores 1 Health to your Warden.', 'Cost 2 → 1.']),
  passive('VERDANT', 'wellspring', 'Wellspring', [
    { abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 1, target: 'ALL_ALLIES' }] }], description: 'At the end of your turn, restore 1 Health to all friendly characters.' },
    { abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 1, target: 'ALL_ALLIES' }, { type: 'HEAL', amount: 1, target: 'ALLY_HERO' }] }], description: 'At the end of your turn, restore 1 Health to all friendly characters and 1 more to your Warden.' },
    { abilities: [{ trigger: 'TURN_END', effects: [{ type: 'HEAL', amount: 2, target: 'ALL_ALLIES' }] }], description: 'At the end of your turn, restore 2 Health to all friendly characters.' },
  ], ['Your Warden gets 1 extra Health.', 'Restores 2 to everyone.']),
  passive('VERDANT', 'barkskin', 'Barkskin', [
    { limitPerTurn: 1, abilities: [{ trigger: 'ALLY_SUMMONED', effects: [{ type: 'BUFF', health: 1, target: 'TRIGGER_UNIT' }] }], description: 'The first time you summon a unit each turn, give it +0/+1.' },
    { limitPerTurn: 1, abilities: [{ trigger: 'ALLY_SUMMONED', effects: [{ type: 'BUFF', health: 2, target: 'TRIGGER_UNIT' }] }], description: 'The first time you summon a unit each turn, give it +0/+2.' },
    { limitPerTurn: 2, abilities: [{ trigger: 'ALLY_SUMMONED', effects: [{ type: 'BUFF', attack: 1, health: 2, target: 'TRIGGER_UNIT' }] }], description: 'The first two times you summon a unit each turn, give it +1/+2.' },
  ], ['+0/+1 → +0/+2.', '+1/+2, and works twice per turn.']),
  active('VERDANT', 'thornguard', 'Thornguard', [
    { cost: 3, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', health: 2, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'GUARD', target: 'TARGET' }], description: 'Give a friendly unit +0/+2 and Guard.' },
    { cost: 2, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', health: 2, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'GUARD', target: 'TARGET' }], description: 'Give a friendly unit +0/+2 and Guard.' },
    { cost: 2, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', attack: 1, health: 3, target: 'TARGET' }, { type: 'GRANT_KEYWORD', keyword: 'GUARD', target: 'TARGET' }], description: 'Give a friendly unit +1/+3 and Guard.' },
  ], ['Cost 3 → 2.', '+0/+2 → +1/+3.']),
];

const IRON: TalentAbility[] = [
  active('IRON', 'rivet_plating', 'Rivet Plating', [
    { cost: 2, effects: [{ type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }], description: 'Gain 2 Armor.' },
    { cost: 2, effects: [{ type: 'GAIN_ARMOR', amount: 3, target: 'ALLY_HERO' }], description: 'Gain 3 Armor.' },
    { cost: 2, effects: [{ type: 'GAIN_ARMOR', amount: 3, target: 'ALLY_HERO' }, { type: 'GAIN_ARMOR', amount: 1, target: 'ALLY_HERO', condition: { kind: 'CONTROLS_TAG', tag: 'Construct' } }], description: 'Gain 3 Armor, or 4 if you control a Construct.' },
  ], ['Gain 3 Armor instead of 2.', '+1 Armor while you control a Construct.']),
  active('IRON', 'assemble', 'Assemble', [
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_scrapbot' }], description: 'Summon a 1/1 Scrapbot.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_scrapbot' }, { type: 'GAIN_ARMOR', amount: 1, target: 'ALLY_HERO' }], description: 'Summon a 1/1 Scrapbot and gain 1 Armor.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_scrapbot', count: 2 }], description: 'Summon two 1/1 Scrapbots.' },
  ], ['Also gain 1 Armor.', 'Summon two Scrapbots instead (no Armor).']),
  passive('IRON', 'reinforced_hull', 'Reinforced Hull', [
    { abilities: [{ trigger: 'TURN_END', effects: [{ type: 'GAIN_ARMOR', amount: 1, target: 'ALLY_HERO' }] }], description: 'At the end of your turn, gain 1 Armor.' },
    { abilities: [{ trigger: 'TURN_END', effects: [{ type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }] }], description: 'At the end of your turn, gain 2 Armor.' },
    { abilities: [{ trigger: 'TURN_END', effects: [{ type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }, { type: 'GAIN_ARMOR', amount: 1, target: 'ALLY_HERO', condition: { kind: 'CONTROLS_TAG', tag: 'Construct' } }] }], description: 'At the end of your turn, gain 2 Armor, or 3 if you control a Construct.' },
  ], ['Gain 2 Armor instead of 1.', '+1 Armor while you control a Construct.']),
  passive('IRON', 'assembly_protocol', 'Assembly Protocol', [
    { limitPerTurn: 2, abilities: [{ trigger: 'ALLY_SUMMONED', filter: { tag: 'Construct' }, effects: [{ type: 'BUFF', attack: 1, target: 'TRIGGER_UNIT' }] }], description: 'Whenever you summon a Construct, give it +1/+0. Twice per turn.' },
    { limitPerTurn: 2, abilities: [{ trigger: 'ALLY_SUMMONED', filter: { tag: 'Construct' }, effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TRIGGER_UNIT' }] }], description: 'Whenever you summon a Construct, give it +1/+1. Twice per turn.' },
    { limitPerTurn: 2, abilities: [{ trigger: 'ALLY_SUMMONED', filter: { tag: 'Construct' }, effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TRIGGER_UNIT' }, { type: 'GAIN_ARMOR', amount: 1, target: 'ALLY_HERO' }] }], description: 'Whenever you summon a Construct, give it +1/+1 and gain 1 Armor. Twice per turn.' },
  ], ['+1/+0 → +1/+1.', 'Also gain 1 Armor.']),
  active('IRON', 'overclock', 'Overclock', [
    { cost: 3, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TARGET' }], description: 'Give a friendly unit +1/+1.' },
    { cost: 2, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'TARGET' }], description: 'Give a friendly unit +1/+1.' },
    { cost: 2, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'BUFF', attack: 2, health: 1, target: 'TARGET' }], description: 'Give a friendly unit +2/+1.' },
  ], ['Cost 3 → 2.', '+1/+1 → +2/+1.']),
];

const ASTRAL: TalentAbility[] = [
  active('ASTRAL', 'starlit_insight', 'Starlit Insight', [
    { cost: 2, effects: [{ type: 'CREATE_CARD', cardId: 'token_mote_insight', destination: 'HAND' }], description: 'Add a Mote of Insight to your hand.' },
    { cost: 1, effects: [{ type: 'CREATE_CARD', cardId: 'token_mote_insight', destination: 'HAND' }], description: 'Add a Mote of Insight to your hand.' },
    { cost: 1, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY' }, { type: 'CREATE_CARD', cardId: 'token_mote_insight', destination: 'HAND' }], description: 'Deal 1 damage to a random enemy. Add a Mote of Insight to your hand.' },
  ], ['Cost 2 → 1.', 'Also deals 1 damage to a random enemy.']),
  active('ASTRAL', 'arcane_volley', 'Arcane Volley', [
    { cost: 2, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY', repeat: 2 }], description: 'Deal 1 damage to a random enemy twice.' },
    { cost: 2, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY', repeat: 3 }], description: 'Deal 1 damage to a random enemy three times.' },
    { cost: 2, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY', repeat: 4 }], description: 'Deal 1 damage to a random enemy four times.' },
  ], ['Three bolts instead of two.', 'Four bolts instead of three.']),
  passive('ASTRAL', 'spellweave', 'Spellweave', [
    { abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_ALLY_UNIT' }] }], description: 'Whenever you cast a spell, give a random friendly unit +1/+1.' },
    { abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_ALLY_UNIT' }, { type: 'HEAL', amount: 1, target: 'ALLY_HERO' }] }], description: 'Whenever you cast a spell, give a random friendly unit +1/+1 and restore 1 Health to your Warden.' },
    { abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'BUFF', attack: 1, health: 1, target: 'RANDOM_ALLY_UNIT', repeat: 2 }, { type: 'HEAL', amount: 1, target: 'ALLY_HERO' }] }], description: 'Whenever you cast a spell, give a random friendly unit +1/+1 twice and restore 1 Health to your Warden.' },
  ], ['Also restores 1 Health to your Warden.', 'The +1/+1 happens twice.']),
  passive('ASTRAL', 'foresight', 'Foresight', [
    { abilities: [{ trigger: 'TURN_END', condition: { kind: 'HAND_SIZE_LTE', n: 1 }, effects: [{ type: 'DRAW_CARDS', amount: 1 }] }], description: 'At the end of your turn, draw a card if you have 1 or fewer cards in hand.' },
    { abilities: [{ trigger: 'TURN_END', condition: { kind: 'HAND_SIZE_LTE', n: 2 }, effects: [{ type: 'DRAW_CARDS', amount: 1 }] }], description: 'At the end of your turn, draw a card if you have 2 or fewer cards in hand.' },
    { abilities: [{ trigger: 'TURN_END', condition: { kind: 'HAND_SIZE_LTE', n: 3 }, effects: [{ type: 'DRAW_CARDS', amount: 1 }] }], description: 'At the end of your turn, draw a card if you have 3 or fewer cards in hand.' },
  ], ['Works with up to 2 cards in hand.', 'Works with up to 3 cards in hand.']),
  active('ASTRAL', 'star_fragment', 'Star Fragment', [
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_star_fragment' }], description: 'Summon a 1/1 Star Fragment with Empower 1.' },
    { cost: 1, effects: [{ type: 'SUMMON', cardId: 'token_star_fragment' }], description: 'Summon a 1/1 Star Fragment with Empower 1.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_star_fragment', count: 2 }], description: 'Summon two 1/1 Star Fragments with Empower 1.' },
  ], ['Cost 2 → 1.', 'Summon two Fragments (cost back to 2).']),
];

const VOID: TalentAbility[] = [
  active('VOID', 'hollow_summons', 'Hollow Summons', [
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp' }], description: 'Summon a 1/1 Hollow Wisp.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_skeleton' }], description: 'Summon 2/2 Risen Bones.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_skeleton' }, { type: 'SUMMON', cardId: 'token_hollow_wisp', condition: { kind: 'ALLY_DIED_THIS_TURN' } }], description: 'Summon 2/2 Risen Bones. If a friendly unit died this turn, also summon a 1/1 Hollow Wisp.' },
  ], ['Summon 2/2 Risen Bones instead.', 'Also a Hollow Wisp if a friendly unit died this turn.']),
  passive('VOID', 'soul_harvest', 'Soul Harvest', [
    { limitPerTurn: 2, abilities: [{ trigger: 'ALLY_DIED', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }] }], description: 'Whenever a friendly unit dies, deal 1 damage to the enemy Warden. Twice per turn.' },
    { limitPerTurn: 2, abilities: [{ trigger: 'ALLY_DIED', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }, { type: 'HEAL', amount: 1, target: 'ALLY_HERO' }] }], description: 'Whenever a friendly unit dies, deal 1 damage to the enemy Warden and restore 1 Health to yours. Twice per turn.' },
    { limitPerTurn: 3, abilities: [{ trigger: 'ALLY_DIED', effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ENEMY_HERO' }, { type: 'HEAL', amount: 1, target: 'ALLY_HERO' }] }], description: 'Whenever a friendly unit dies, deal 1 damage to the enemy Warden and restore 1 Health to yours. Up to 3 times per turn.' },
  ], ['Also restores 1 Health to your Warden.', 'Up to 3 times per turn.']),
  active('VOID', 'blood_price', 'Blood Price', [
    { cost: 1, effects: [{ type: 'DEAL_DAMAGE', amount: 3, target: 'ALLY_HERO' }, { type: 'DRAW_CARDS', amount: 1 }], description: 'Deal 3 damage to your Warden. Draw a card.' },
    { cost: 1, effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALLY_HERO' }, { type: 'DRAW_CARDS', amount: 1 }], description: 'Deal 2 damage to your Warden. Draw a card.' },
    { cost: 0, effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'ALLY_HERO' }, { type: 'DRAW_CARDS', amount: 1 }], description: 'Deal 2 damage to your Warden. Draw a card.' },
  ], ['Self-damage 3 → 2.', 'Cost 1 → 0.']),
  active('VOID', 'grave_pact', 'Grave Pact', [
    { cost: 2, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'DESTROY', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }], description: 'Destroy a friendly unit. Draw a card.' },
    { cost: 2, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'DESTROY', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }, { type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }], description: 'Destroy a friendly unit. Draw a card and deal 2 damage to a random enemy.' },
    { cost: 1, target: { kind: 'ALLY_UNIT' }, effects: [{ type: 'DESTROY', target: 'TARGET' }, { type: 'DRAW_CARDS', amount: 1 }, { type: 'DEAL_DAMAGE', amount: 2, target: 'RANDOM_ENEMY' }], description: 'Destroy a friendly unit. Draw a card and deal 2 damage to a random enemy.' },
  ], ['Also deals 2 damage to a random enemy.', 'Cost 2 → 1.']),
  passive('VOID', 'unending', 'Unending', [
    { abilities: [{ trigger: 'TURN_END', condition: { kind: 'ALLY_DIED_THIS_TURN' }, effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp' }] }], description: 'At the end of your turn, if a friendly unit died this turn, summon a 1/1 Hollow Wisp.' },
    { abilities: [{ trigger: 'TURN_END', condition: { kind: 'ALLY_DIED_THIS_TURN' }, effects: [{ type: 'SUMMON', cardId: 'token_skeleton' }] }], description: 'At the end of your turn, if a friendly unit died this turn, summon 2/2 Risen Bones.' },
    { abilities: [{ trigger: 'TURN_END', condition: { kind: 'ALLY_DIED_THIS_TURN' }, effects: [{ type: 'SUMMON', cardId: 'token_skeleton' }, { type: 'HEAL', amount: 2, target: 'ALLY_HERO' }] }], description: 'At the end of your turn, if a friendly unit died this turn, summon 2/2 Risen Bones and restore 2 Health to your Warden.' },
  ], ['Summon Risen Bones instead of a Wisp.', 'Also restores 2 Health to your Warden.']),
];

const TIDE: TalentAbility[] = [
  active('TIDE', 'rime_touch', 'Rime Touch', [
    { cost: 2, target: { kind: 'ENEMY_UNIT' }, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }, { type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }], description: 'Deal 1 damage to an enemy unit and Freeze it.' },
    { cost: 1, target: { kind: 'ENEMY_UNIT' }, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'TARGET' }, { type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }], description: 'Deal 1 damage to an enemy unit and Freeze it.' },
    { cost: 1, target: { kind: 'ENEMY_UNIT' }, effects: [{ type: 'DEAL_DAMAGE', amount: 2, target: 'TARGET' }, { type: 'APPLY_STATUS', status: 'FROZEN', target: 'TARGET' }], description: 'Deal 2 damage to an enemy unit and Freeze it.' },
  ], ['Cost 2 → 1.', 'Deals 2 damage instead of 1.']),
  active('TIDE', 'undertow', 'Undertow', [
    { cost: 3, target: { kind: 'ENEMY_UNIT', filter: { maxCost: 3 } }, effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }], description: "Return an enemy unit that costs 3 or less to its owner's hand." },
    { cost: 2, target: { kind: 'ENEMY_UNIT', filter: { maxCost: 3 } }, effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }], description: "Return an enemy unit that costs 3 or less to its owner's hand." },
    { cost: 2, target: { kind: 'ENEMY_UNIT', filter: { maxCost: 4 } }, effects: [{ type: 'RETURN_TO_HAND', target: 'TARGET' }], description: "Return an enemy unit that costs 4 or less to its owner's hand." },
  ], ['Cost 3 → 2.', 'Reaches units costing up to 4.']),
  passive('TIDE', 'cold_snap', 'Cold Snap', [
    { abilities: [{ trigger: 'TURN_START', condition: { kind: 'HAND_SIZE_LTE', n: 3 }, effects: [{ type: 'CREATE_CARD', cardId: 'token_ice_shard', destination: 'HAND', fleeting: true }] }], description: 'At the start of your turn, if you have 3 or fewer cards in hand, add a Fleeting Rime Shard to your hand.' },
    { abilities: [{ trigger: 'TURN_START', condition: { kind: 'HAND_SIZE_LTE', n: 4 }, effects: [{ type: 'CREATE_CARD', cardId: 'token_ice_shard', destination: 'HAND' }] }], description: 'At the start of your turn, if you have 4 or fewer cards in hand, add a Rime Shard to your hand.' },
    { abilities: [{ trigger: 'TURN_START', condition: { kind: 'HAND_SIZE_LTE', n: 6 }, effects: [{ type: 'CREATE_CARD', cardId: 'token_ice_shard', destination: 'HAND' }] }], description: 'At the start of your turn, if you have 6 or fewer cards in hand, add a Rime Shard to your hand.' },
  ], ['Up to 4 cards in hand, and the Shard is no longer Fleeting.', 'Works with up to 6 cards in hand.']),
  active('TIDE', 'tidepool', 'Tidepool', [
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_tidepup' }], description: 'Summon a 1/2 Tidepup.' },
    { cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_tidepup' }, { type: 'HEAL', amount: 2, target: 'ALLY_HERO' }, { type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }], description: 'Summon a 1/2 Tidepup, restore 2 Health to your Warden and Freeze a random enemy unit.' },
    { cost: 1, effects: [{ type: 'SUMMON', cardId: 'token_tidepup' }, { type: 'HEAL', amount: 2, target: 'ALLY_HERO' }, { type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }], description: 'Summon a 1/2 Tidepup, restore 2 Health to your Warden and Freeze a random enemy unit.' },
  ], ['Also restores 2 Health and Freezes a random enemy unit.', 'Cost 2 → 1.']),
  passive('TIDE', 'whirlpool', 'Whirlpool', [
    { limitPerTurn: 1, abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }] }], description: 'Whenever you cast a spell, Freeze a random enemy unit. Once per turn.' },
    { limitPerTurn: 1, abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }, { type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY_UNIT' }] }], description: 'Whenever you cast a spell, Freeze a random enemy unit and deal 1 damage to a random enemy unit. Once per turn.' },
    { limitPerTurn: 2, abilities: [{ trigger: 'FRIENDLY_SPELL_CAST', effects: [{ type: 'APPLY_STATUS', status: 'FROZEN', target: 'RANDOM_ENEMY_UNIT' }, { type: 'DEAL_DAMAGE', amount: 1, target: 'RANDOM_ENEMY_UNIT' }] }], description: 'Whenever you cast a spell, Freeze a random enemy unit and deal 1 damage to a random enemy unit. Twice per turn.' },
  ], ['Also deals 1 damage to a random enemy unit.', 'Triggers twice per turn.']),
];

export const FACTION_TALENTS: Record<PlayableFaction, TalentAbility[]> = { EMBER, VERDANT, IRON, ASTRAL, VOID, TIDE };

// ---------------------------------------------------------------------------
// Boss abilities (single rank, not bound by the talent-point rules)
// ---------------------------------------------------------------------------

export const BOSS_TALENTS: TalentAbility[] = [
  active('BOSS', 'caldera_eruption', 'Caldera Eruption', [{ cost: 2, effects: [{ type: 'DEAL_DAMAGE', amount: 1, target: 'ALL_ENEMIES' }], description: 'Deal 1 damage to all enemies.' }]),
  active('BOSS', 'crushing_depths', 'Crushing Depths', [{ cost: 3, effects: [{ type: 'RETURN_TO_HAND', target: 'RANDOM_ENEMY_UNIT' }], description: "Return a random enemy unit to its owner's hand." }]),
  active('BOSS', 'requiem_chorus', 'Requiem Chorus', [{ cost: 2, effects: [{ type: 'SUMMON', cardId: 'token_hollow_wisp', count: 2 }], description: 'Summon two 1/1 Hollow Wisps.' }]),
  active('BOSS', 'crown_fragment', 'Crown Fragment', [{ cost: 1, effects: [{ type: 'DRAW_CARDS', amount: 1 }, { type: 'GAIN_ARMOR', amount: 2, target: 'ALLY_HERO' }], description: 'Draw a card and gain 2 Armor.' }]),
];

const BY_ID = new Map<string, TalentAbility>([...PLAYABLE_FACTIONS.flatMap((f) => FACTION_TALENTS[f]), ...BOSS_TALENTS].map((t) => [t.id, t]));

export function getTalent(id: string): TalentAbility | undefined {
  return BY_ID.get(id);
}

/** The definition of the picked rank (undefined for unknown ids or ranks). */
export function talentLevel(pick: { abilityId?: string; id?: string; level: number }): ActiveLevel | PassiveLevel | undefined {
  return getTalent(pick.abilityId ?? pick.id ?? '')?.levels[pick.level];
}

// ---------------------------------------------------------------------------
// Builds
// ---------------------------------------------------------------------------

const p = (faction: PlayableFaction, key: string, level: TalentLevel): TalentPick => ({ abilityId: `wt_${faction.toLowerCase()}_${key}`, level });

export const DEFAULT_BUILD: Record<PlayableFaction, TalentPick[]> = {
  EMBER: [p('EMBER', 'cinder_bolt', 2), p('EMBER', 'kindled_fury', 1)],
  VERDANT: [p('VERDANT', 'sap_of_the_root', 2), p('VERDANT', 'barkskin', 1)],
  IRON: [p('IRON', 'rivet_plating', 2), p('IRON', 'assembly_protocol', 1)],
  ASTRAL: [p('ASTRAL', 'starlit_insight', 2), p('ASTRAL', 'spellweave', 1)],
  VOID: [p('VOID', 'hollow_summons', 2), p('VOID', 'soul_harvest', 1)],
  TIDE: [p('TIDE', 'rime_touch', 2), p('TIDE', 'tidepool', 1)],
};

/** Fixed AI builds by personality (BALANCED uses the default build). */
export const PERSONALITY_BUILD: Record<PlayableFaction, Partial<Record<AiPersonality, TalentPick[]>>> = {
  EMBER: {
    AGGRESSIVE: [p('EMBER', 'warcry', 2), p('EMBER', 'kindled_fury', 1)],
    CONTROL: [p('EMBER', 'cinder_bolt', 2), p('EMBER', 'searing_wrath', 1)],
    SWARM: [p('EMBER', 'imp_summoning', 2), p('EMBER', 'kindled_fury', 1)],
  },
  VERDANT: {
    AGGRESSIVE: [p('VERDANT', 'barkskin', 2), p('VERDANT', 'sprout', 1)],
    CONTROL: [p('VERDANT', 'wellspring', 2), p('VERDANT', 'thornguard', 1)],
    SWARM: [p('VERDANT', 'sprout', 2), p('VERDANT', 'barkskin', 1)],
  },
  IRON: {
    AGGRESSIVE: [p('IRON', 'overclock', 2), p('IRON', 'assembly_protocol', 1)],
    CONTROL: [p('IRON', 'reinforced_hull', 2), p('IRON', 'rivet_plating', 1)],
    SWARM: [p('IRON', 'assemble', 2), p('IRON', 'assembly_protocol', 1)],
  },
  ASTRAL: {
    AGGRESSIVE: [p('ASTRAL', 'arcane_volley', 2), p('ASTRAL', 'spellweave', 1)],
    CONTROL: [p('ASTRAL', 'foresight', 2), p('ASTRAL', 'starlit_insight', 1)],
    SWARM: [p('ASTRAL', 'star_fragment', 2), p('ASTRAL', 'spellweave', 1)],
  },
  VOID: {
    AGGRESSIVE: [p('VOID', 'soul_harvest', 2), p('VOID', 'hollow_summons', 1)],
    CONTROL: [p('VOID', 'blood_price', 2), p('VOID', 'unending', 1)],
    SWARM: [p('VOID', 'hollow_summons', 2), p('VOID', 'unending', 1)],
  },
  TIDE: {
    AGGRESSIVE: [p('TIDE', 'rime_touch', 2), p('TIDE', 'whirlpool', 1)],
    CONTROL: [p('TIDE', 'undertow', 2), p('TIDE', 'cold_snap', 1)],
    SWARM: [p('TIDE', 'tidepool', 2), p('TIDE', 'rime_touch', 1)],
  },
};

export function defaultBuild(faction: PlayableFaction): TalentPick[] {
  return DEFAULT_BUILD[faction].map((x) => ({ ...x }));
}

export function aiBuild(faction: PlayableFaction, personality: AiPersonality): TalentPick[] {
  return (PERSONALITY_BUILD[faction][personality] ?? DEFAULT_BUILD[faction]).map((x) => ({ ...x }));
}

/** "Cinder Bolt III · Kindled Fury II" */
export function talentSummary(build: TalentPick[]): string {
  return build.map((x) => `${getTalent(x.abilityId)?.name ?? '?'} ${RANK_LABEL[x.level] ?? ''}`.trim()).join(' · ');
}

/** Talent points a build spends: rank I costs 1, II costs 2, III costs 3. */
export function buildPoints(build: TalentPick[]): number {
  return build.reduce((sum, x) => sum + x.level + 1, 0);
}

/** A build the talent tree could have produced for this faction (possibly unfinished). */
export function isWellFormedBuild(faction: PlayableFaction, build: unknown): build is TalentPick[] {
  if (!Array.isArray(build) || build.length > TALENT_PICKS) return false;
  const ids = new Set<string>();
  for (const x of build) {
    if (!x || typeof x !== 'object' || typeof x.abilityId !== 'string' || ![0, 1, 2].includes(x.level)) return false;
    if (getTalent(x.abilityId)?.faction !== faction || ids.has(x.abilityId)) return false;
    ids.add(x.abilityId);
  }
  return buildPoints(build as TalentPick[]) <= TALENT_POINTS;
}

/** Null when the build is legal for the faction, otherwise the reason. */
export function validateBuild(faction: PlayableFaction, build: unknown): string | null {
  if (!Array.isArray(build)) return 'Choose your Warden abilities.';
  if (build.length !== TALENT_PICKS) return `Choose exactly ${TALENT_PICKS} Warden abilities.`;
  const ids = new Set<string>();
  for (const x of build) {
    if (!x || typeof x !== 'object' || typeof x.abilityId !== 'string') return 'Invalid Warden ability.';
    if (![0, 1, 2].includes(x.level)) return 'Invalid ability rank.';
    const t = getTalent(x.abilityId);
    if (!t || t.faction !== faction) return 'That ability belongs to another Warden.';
    if (ids.has(x.abilityId)) return 'Choose two different abilities.';
    ids.add(x.abilityId);
  }
  if (buildPoints(build as TalentPick[]) !== TALENT_POINTS) return `Spend all ${TALENT_POINTS} talent points.`;
  return null;
}

/**
 * Talent-tree click on `rank` of an ability: learns the next rank, or unlearns the
 * clicked rank and everything above it. Returns the new build or why it can't be done.
 */
export function toggleNode(build: TalentPick[], abilityId: string, rank: TalentLevel): TalentPick[] | string {
  const current = build.find((x) => x.abilityId === abilityId);
  if (current && rank <= current.level) {
    return rank === 0 ? build.filter((x) => x !== current) : build.map((x) => (x === current ? { ...x, level: (rank - 1) as TalentLevel } : x));
  }
  const have = current ? current.level : -1;
  if (rank > have + 1) return `Learn rank ${RANK_LABEL[have + 1]} first.`;
  if (!current && build.length >= TALENT_PICKS) return `You can learn only ${TALENT_PICKS} abilities.`;
  if (buildPoints(build) >= TALENT_POINTS) return 'No talent points left.';
  return current ? build.map((x) => (x === current ? { ...x, level: rank } : x)) : [...build, { abilityId, level: rank }];
}
