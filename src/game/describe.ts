import type {
  Ability,
  CardDefinition,
  Condition,
  Effect,
  StaticKeyword,
  TargetRequirement,
  TargetSelector,
  TriggerType,
  ValueExpr,
} from './types';
import { KEYWORDS } from '@/data/keywords';
import { FACTIONS } from '@/data/factions';

/**
 * Generates human-readable rules text from card data so text and behaviour can
 * never drift apart. Cards may still override with an explicit description.
 */

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function value(v: ValueExpr | undefined): string {
  if (v === undefined) return '0';
  if (typeof v === 'number') return String(v);
  return 'X';
}

function valueNote(v: ValueExpr | undefined): string {
  if (v === undefined || typeof v === 'number') return '';
  const labels: Record<string, string> = {
    ALLY_UNIT_COUNT: 'the number of your units',
    ENEMY_UNIT_COUNT: 'the number of enemy units',
    HAND_SIZE: 'the number of cards in your hand',
    ARMOR: 'your Armor',
    ALLY_DEATHS_THIS_GAME: 'the number of your units that died this game',
    SPELLS_CAST_THIS_TURN: 'the number of spells you cast this turn',
    SELF_ATTACK: "this unit's Attack",
    SELF_HEALTH: "this unit's Health",
    TARGET_ATTACK: "the target's Attack",
    MAX_ENERGY: 'your maximum energy',
    DAMAGED_ENEMY_COUNT: 'the number of damaged enemies',
    FROZEN_ENEMY_COUNT: 'the number of Frozen enemies',
  };
  let note = ` X is ${labels[v.kind] ?? v.kind}`;
  if (v.times && v.times !== 1) note += ` times ${v.times}`;
  if (v.plus) note += ` plus ${v.plus}`;
  if (v.max !== undefined) note += ` (max ${v.max})`;
  return note + '.';
}

const TARGET_REQ_TEXT: Record<TargetRequirement['kind'], string> = {
  ANY: 'a character',
  ANY_UNIT: 'a unit',
  ENEMY_UNIT: 'an enemy unit',
  ALLY_UNIT: 'a friendly unit',
  OTHER_ALLY_UNIT: 'another friendly unit',
  ENEMY: 'an enemy',
  ALLY: 'a friendly character',
};

function targetText(sel: TargetSelector | undefined, card: CardDefinition): string {
  switch (sel ?? 'TARGET') {
    case 'SELF':
      return card.cardType === 'UNIT' ? 'this unit' : 'your Warden';
    case 'TARGET': {
      const req = card.target;
      if (!req) return 'the target';
      let base = TARGET_REQ_TEXT[req.kind];
      const f = req.filter;
      if (f?.damaged) base = base.replace(/(a|an) /, 'a damaged ');
      if (f?.frozen) base = base.replace(/(a|an) /, 'a Frozen ');
      if (f?.tag) base = base.replace('unit', f.tag);
      if (f?.maxAttack !== undefined) base += ` with ${f.maxAttack} or less Attack`;
      if (f?.minAttack !== undefined) base += ` with ${f.minAttack} or more Attack`;
      if (f?.maxCost !== undefined) base += ` that costs ${f.maxCost} or less`;
      return base;
    }
    case 'TRIGGER_UNIT':
      return 'it';
    case 'ALLY_HERO':
      return 'your Warden';
    case 'ENEMY_HERO':
      return 'the enemy Warden';
    case 'BOTH_HEROES':
      return 'both Wardens';
    case 'ALL_ALLY_UNITS':
      return 'your units';
    case 'OTHER_ALLY_UNITS':
      return 'your other units';
    case 'ALL_ENEMY_UNITS':
      return 'all enemy units';
    case 'ALL_UNITS':
      return 'all units';
    case 'ALL_OTHER_UNITS':
      return 'all other units';
    case 'ALL_ENEMIES':
      return 'all enemies';
    case 'ALL_ALLIES':
      return 'all friendly characters';
    case 'EVERYONE':
      return 'all characters';
    case 'RANDOM_ENEMY_UNIT':
      return 'a random enemy unit';
    case 'RANDOM_ENEMY':
      return 'a random enemy';
    case 'RANDOM_ALLY_UNIT':
      return 'a random friendly unit';
    case 'RANDOM_OTHER_ALLY_UNIT':
      return 'another random friendly unit';
    case 'ADJACENT':
      return card.cardType === 'UNIT' ? 'adjacent units' : "the target's neighbours";
    case 'TARGET_AND_ADJACENT':
      return `${targetText('TARGET', card)} and its neighbours`;
  }
}

/** Tags whose plural is the same word ("2 Fae", not "2 Faes"). */
const INVARIANT_PLURALS = new Set(['Fae']);

function plural(n: string, word: string) {
  return n === '1' || INVARIANT_PLURALS.has(word) ? `${word}` : `${word}s`;
}

/** Plural of a tag or card type used as a noun ("Dragons", "Fae", "spells"). */
const pluralOf = (word: string) => plural('2', word);

function cardName(id: string, lookup?: (id: string) => CardDefinition | undefined): string {
  const c = lookup?.(id);
  if (!c) return 'a token';
  if (c.cardType === 'UNIT') return `a ${c.attack}/${c.health} ${c.name}`;
  return c.name;
}

export function describeEffect(effect: Effect, card: CardDefinition, lookup?: (id: string) => CardDefinition | undefined): string {
  const t = targetText(effect.target, card);
  let text = '';
  switch (effect.type) {
    case 'DEAL_DAMAGE':
      text = `deal ${value(effect.amount)} damage to ${t}.${valueNote(effect.amount)}`;
      if (effect.bonus) text += ` ${cap(conditionText(effect.bonus.condition, card))}, deal ${effect.bonus.amount} more.`;
      break;
    case 'HEAL':
      text = `restore ${value(effect.amount)} Health to ${t}.${valueNote(effect.amount)}`;
      break;
    case 'BUFF': {
      const a = effect.attack !== undefined ? value(effect.attack) : '0';
      const h = effect.health !== undefined ? value(effect.health) : '0';
      const sign = (s: string) => (s.startsWith('-') ? s : `+${s}`);
      const who = effect.target === 'SELF' && card.cardType === 'UNIT' ? 'gain' : `give ${t}`;
      text = `${who} ${sign(a)}/${sign(h)}${effect.temporary ? ' this turn' : ''}.${valueNote(effect.attack ?? effect.health)}`;
      break;
    }
    case 'SET_STATS':
      text = `set ${t}'s ${effect.attack !== undefined && effect.health !== undefined ? `stats to ${effect.attack}/${effect.health}` : effect.attack !== undefined ? `Attack to ${effect.attack}` : `Health to ${effect.health}`}.`;
      break;
    case 'DRAW_CARDS': {
      const n = value(effect.amount);
      const who = effect.opponent ? 'your opponent draws' : 'draw';
      let what = plural(n, 'card');
      if (effect.filter?.cardType) what = plural(n, effect.filter.cardType.toLowerCase());
      if (effect.filter?.tag) what = plural(n, effect.filter.tag);
      if (effect.filter?.maxCost !== undefined) what += ` that costs ${effect.filter.maxCost} or less`;
      text = `${who} ${n === '1' ? 'a' : n} ${what}.${valueNote(effect.amount)}`;
      break;
    }
    case 'SUMMON': {
      const count = effect.count ?? 1;
      const token = lookup?.(effect.cardId);
      const many = token && token.cardType === 'UNIT' ? `${count} ${token.name}s (${token.attack}/${token.health})` : `${count} tokens`;
      text = `summon ${count > 1 ? many : cardName(effect.cardId, lookup)}${effect.forOpponent ? ' for your opponent' : ''}.`;
      break;
    }
    case 'DESTROY':
      text = `destroy ${t}.`;
      break;
    case 'DISCARD':
      text = effect.opponent
        ? `your opponent discards ${effect.amount === 1 ? 'a random card' : `${effect.amount} random cards`}.`
        : `discard ${effect.amount === 1 ? 'a random card' : `${effect.amount} random cards`}.`;
      break;
    case 'GAIN_ENERGY':
      text = `gain ${effect.amount} energy this turn.`;
      break;
    case 'GAIN_MAX_ENERGY':
      text = `gain ${effect.amount === 1 ? 'an' : effect.amount}${effect.empty ? ' empty' : ''} energy crystal${effect.amount === 1 ? '' : 's'}.`;
      break;
    case 'DESTROY_ENERGY':
      text = `your opponent loses ${effect.amount === 1 ? 'an' : effect.amount} energy crystal${effect.amount === 1 ? '' : 's'}.`;
      break;
    case 'REDUCE_COST': {
      const kind = effect.filter?.cardType ? effect.filter.cardType.toLowerCase() : effect.filter?.tag ?? 'card';
      const scope =
        effect.scope === 'HAND' ? `${pluralOf(kind)} currently in your hand cost` : effect.scope === 'RANDOM_HAND_CARD' ? `a random ${kind} in your hand costs` : `the most expensive ${kind} in your hand costs`;
      text = `${scope} (${effect.amount}) less.`;
      break;
    }
    case 'RETURN_TO_HAND':
      text = `return ${t} to its owner's hand${effect.costReduction ? `. It costs (${effect.costReduction}) less` : ''}.`;
      break;
    case 'APPLY_STATUS':
      if (effect.status === 'FROZEN') text = `Freeze ${t}.`;
      else if (effect.status === 'BURN') text = `apply Burn ${effect.amount ?? 1} to ${t}.`;
      else if (effect.status === 'BARRIER') text = `give ${t} Barrier.`;
      else text = `give ${t} Ambush.`;
      break;
    case 'GRANT_KEYWORD':
      text = `${effect.target === 'SELF' && card.cardType === 'UNIT' ? 'gain' : `give ${t}`} ${KEYWORDS[effect.keyword].name}.`;
      break;
    case 'SILENCE':
      text = `Silence ${t} (remove its text and buffs).`;
      break;
    case 'CREATE_CARD': {
      const count = effect.count ?? 1;
      let what: string;
      if (effect.cardId) what = lookup?.(effect.cardId)?.name ?? 'a card';
      else {
        const p = effect.pool ?? {};
        const parts = ['random'];
        if (p.rarity) parts.push(p.rarity.toLowerCase());
        // The faction's player-facing name (e.g. Lumen Conclave), never the internal id (ASTRAL).
        if (p.faction) parts.push(p.faction === 'NEUTRAL' ? 'Neutral' : FACTIONS[p.faction]?.name ?? cap(p.faction.toLowerCase()));
        parts.push(p.tag ?? (p.cardType ? p.cardType.toLowerCase() : 'card'));
        what = `${count > 1 ? count : 'a'} ${parts.join(' ')}${count > 1 ? 's' : ''}`;
        if (p.maxCost !== undefined) what += ` that costs ${p.maxCost} or less`;
      }
      if (effect.cardId && count > 1) what = `${count} ${what}s`;
      const dest = effect.destination === 'HAND' ? 'to your hand' : 'into your deck';
      const verb = effect.destination === 'HAND' ? 'add' : 'shuffle';
      text = `${verb} ${what} ${dest}${effect.fleeting ? '. It is Fleeting' : ''}${effect.costReduction ? `. It costs (${effect.costReduction}) less` : ''}.`;
      break;
    }
    case 'COPY_CARD':
      text = `add a copy of ${t} to your hand.`;
      break;
    case 'STEAL_CARD':
      text =
        effect.from === 'DECK'
          ? `steal ${effect.amount === 1 ? 'a random card' : `${effect.amount} random cards`} from your opponent's deck.`
          : `steal ${effect.amount === 1 ? 'a random card' : `${effect.amount} random cards`} from your opponent's hand.`;
      break;
    case 'TAKE_CONTROL':
      text = `take control of ${t}.`;
      break;
    case 'GAIN_ARMOR':
      text = `gain ${value(effect.amount)} Armor.${valueNote(effect.amount)}`;
      break;
    case 'REMOVE_ARMOR':
      text = 'your Warden loses all Armor.';
      break;
    case 'TRANSFORM':
      text = `transform ${t} into ${cardName(effect.cardId, lookup)}.`;
      break;
    case 'RESURRECT':
      text = `resurrect ${effect.count === 1 ? 'a random friendly unit' : `${effect.count} random friendly units`}${effect.maxCost !== undefined ? ` that cost ${effect.maxCost} or less` : ''} that died this game.`;
      break;
    case 'READY_UNIT':
      text = `${t === 'this unit' ? 'this unit' : t} can attack again this turn.`;
      break;
    case 'MILL':
      text = `${effect.opponent ? 'your opponent destroys' : 'destroy'} the top ${effect.amount === 1 ? 'card' : `${effect.amount} cards`} of ${effect.opponent ? 'their' : 'your'} deck.`;
      break;
  }
  if (typeof effect.repeat === 'number' && effect.repeat > 1) text = text.replace(/\.$/, '') + `, ${effect.repeat} times.`;
  else if (typeof effect.repeat === 'object') text = text.replace(/\.$/, '') + `, X times.${valueNote(effect.repeat)}`;
  if (effect.condition) text = `${conditionText(effect.condition, card)}, ${text}`;
  return text;
}

export function conditionText(c: Condition, card?: CardDefinition): string {
  switch (c.kind) {
    case 'ALLY_UNITS_GTE':
      return `if you control ${c.n} or more units`;
    case 'ENEMY_UNITS_GTE':
      return `if your opponent controls ${c.n} or more units`;
    case 'HAND_SIZE_LTE':
      return `if you have ${c.n} or fewer cards in hand`;
    case 'HERO_HEALTH_LTE':
      return `if your Warden has ${c.n} or less Health`;
    case 'HAS_ARMOR':
      return 'if you have Armor';
    case 'ALLY_DIED_THIS_TURN':
      return 'if a friendly unit died this turn';
    case 'SPELLS_CAST_THIS_TURN_GTE':
      return `if you cast ${c.n} or more spells this turn`;
    case 'CONTROLS_TAG':
      // The check skips the source unit itself, so a unit with the tag needs another one.
      return card?.cardType === 'UNIT' && (card.tags ?? []).includes(c.tag) ? `if you control another ${c.tag}` : `if you control a ${c.tag}`;
    case 'ALLY_DEATHS_GTE':
      return `if ${c.n} or more of your units died this game`;
    case 'TARGET_DAMAGED':
      return 'if it is damaged';
    case 'TARGET_FROZEN':
      return 'if it is Frozen';
    case 'TARGET_IS_UNIT':
      return 'if it is a unit';
    case 'MAX_ENERGY_GTE':
      return `if you have ${c.n} or more energy crystals`;
    case 'CARDS_PLAYED_THIS_TURN_GTE':
      return `if you played ${c.n} or more other cards this turn`;
  }
}

const TRIGGER_PREFIX: Record<TriggerType, (card: CardDefinition, a: Ability) => string> = {
  ON_DEPLOY: () => 'On Deploy:',
  ON_CAST: () => '',
  LAST_BREATH: () => 'Last Breath:',
  TURN_START: () => 'At the start of your turn,',
  TURN_END: () => 'At the end of your turn,',
  ON_ATTACK: () => 'Whenever this attacks,',
  ON_DAMAGED: () => 'Whenever this takes damage and survives,',
  ON_KILL: () => 'Whenever this destroys a unit,',
  ALLY_SUMMONED: (_c, a) => `Whenever you summon ${a.filter?.tag ? `a ${a.filter.tag}` : 'another unit'},`,
  ALLY_DIED: (_c, a) => `Whenever ${a.filter?.tag ? `a friendly ${a.filter.tag}` : 'another friendly unit'} dies,`,
  ENEMY_DIED: () => 'Whenever an enemy unit dies,',
  FRIENDLY_SPELL_CAST: () => 'After you cast a spell,',
  CARD_DRAWN: () => 'Whenever you draw a card,',
  ALLY_HEALED: () => 'Whenever a friendly character is healed,',
  ENEMY_HERO_DAMAGED: () => 'Whenever the enemy Warden takes damage,',
  ARMOR_GAINED: () => 'Whenever you gain Armor,',
};

export function describeAbility(ability: Ability, card: CardDefinition, lookup?: (id: string) => CardDefinition | undefined): string {
  const effects = ability.effects.map((e) => describeEffect(e, card, lookup));
  let body = effects.map((e, i) => (i === 0 ? e : cap(e))).join(' ');
  if (ability.condition) body = `${conditionText(ability.condition, card)}, ${body}`;
  const prefix = TRIGGER_PREFIX[ability.trigger](card, ability);
  if (ability.overcharge) {
    return `Overcharge ${ability.overcharge}: ${cap(body)}`;
  }
  if (!prefix) return cap(body);
  return prefix.endsWith(':') ? `${prefix} ${cap(body)}` : `${prefix} ${body}`;
}

function keywordLine(card: CardDefinition): string {
  return (card.keywords ?? [])
    .map((k: StaticKeyword) => {
      const name = KEYWORDS[k].name;
      const v = card.keywordValues?.[k];
      return v !== undefined ? `${name} ${v}` : name;
    })
    .join(', ');
}

export function describeCard(card: CardDefinition, lookup?: (id: string) => CardDefinition | undefined): string {
  const parts: string[] = [];
  const kw = keywordLine(card);
  if (kw) parts.push(kw + '.');
  if (card.aura) {
    const who = card.aura.target === 'ENEMY_UNITS' ? 'Enemy units' : card.aura.target === 'OTHER_ALLY_UNITS' ? 'Your other' : 'Your';
    const noun = card.aura.tag ? pluralOf(card.aura.tag) : 'units';
    const subject = card.aura.target === 'ENEMY_UNITS' ? who : `${who} ${noun}`;
    const bits: string[] = [];
    if (card.aura.attack) bits.push(`have ${card.aura.attack > 0 ? '+' : ''}${card.aura.attack} Attack`);
    if (card.aura.keyword) bits.push(`have ${KEYWORDS[card.aura.keyword].name}`);
    parts.push(`${subject} ${bits.join(' and ')}.`);
  }
  if (card.costAura) {
    const who = card.costAura.side === 'ALLY' ? 'Your' : "Your opponent's";
    const noun = card.costAura.tag ? pluralOf(card.costAura.tag) : card.costAura.cardType ? `${card.costAura.cardType.toLowerCase()}s` : 'cards';
    const n = Math.abs(card.costAura.amount);
    parts.push(`${who} ${noun} cost (${n}) ${card.costAura.amount < 0 ? 'less' : 'more'}.`);
  }
  for (const ability of card.abilities ?? []) parts.push(describeAbility(ability, card, lookup));
  if (card.charges) parts.push(`Charges: ${card.charges}.`);
  if (card.duration) parts.push(`Lasts ${card.duration} turns.`);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
