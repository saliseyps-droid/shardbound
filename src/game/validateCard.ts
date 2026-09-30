import type { Ability, CardDefinition, Effect } from './types';
import { CARD_TYPES, RARITIES, ALL_FACTIONS } from './types';

/**
 * Structural validation for card data. Bad cards are excluded from the registry
 * (with a console warning) instead of crashing the application.
 */
export function validateCardDefinition(card: CardDefinition, knownIds: Set<string>): string[] {
  const errors: string[] = [];
  const where = `Card "${card?.id ?? '?'}"`;
  if (!card || typeof card !== 'object') return ['Card entry is not an object'];
  if (!card.id || typeof card.id !== 'string') errors.push(`${where}: missing id`);
  if (!card.name) errors.push(`${where}: missing name`);
  if (!CARD_TYPES.includes(card.cardType)) errors.push(`${where}: invalid cardType ${card.cardType}`);
  if (!RARITIES.includes(card.rarity)) errors.push(`${where}: invalid rarity ${card.rarity}`);
  if (!ALL_FACTIONS.includes(card.faction)) errors.push(`${where}: invalid faction ${card.faction}`);
  if (!Number.isInteger(card.manaCost) || card.manaCost < 0 || card.manaCost > 20) errors.push(`${where}: invalid manaCost`);
  if (card.cardType === 'UNIT') {
    if (!Number.isInteger(card.attack) || (card.attack ?? -1) < 0) errors.push(`${where}: unit needs attack >= 0`);
    if (!Number.isInteger(card.health) || (card.health ?? 0) < 1) errors.push(`${where}: unit needs health >= 1`);
  }
  if (card.cardType === 'SPELL' && !card.abilities?.some((a) => a.trigger === 'ON_CAST')) {
    errors.push(`${where}: spell has no ON_CAST ability`);
  }
  const visit = (effect: Effect, ability: Ability) => {
    if ((effect.type === 'SUMMON' || effect.type === 'TRANSFORM') && !knownIds.has(effect.cardId)) {
      errors.push(`${where}: references unknown card ${effect.cardId}`);
    }
    if (effect.type === 'CREATE_CARD' && effect.cardId && !knownIds.has(effect.cardId)) {
      errors.push(`${where}: references unknown card ${effect.cardId}`);
    }
    // ON_ATTACK abilities receive the attacked character as their target.
    if (effect.target === 'TARGET' && !card.target && ability.trigger !== 'ON_ATTACK') {
      errors.push(`${where}: effect ${effect.type} uses TARGET but card has no target requirement`);
    }
  };
  for (const ability of card.abilities ?? []) {
    if (!Array.isArray(ability.effects)) {
      errors.push(`${where}: ability without effects`);
      continue;
    }
    ability.effects.forEach((e) => visit(e, ability));
  }
  return errors;
}
