import { useUi } from '@/state/uiStore';
import { useAccount } from '@/state/accountStore';
import { getCard } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { KEYWORDS } from '@/data/keywords';
import { SET_INFO } from '@/config/economy';
import { craftCost, recycleValue } from '@/domain/economy';
import { maxCopiesFor } from '@/domain/decks';
import type { KeywordId, Variant } from '@/game/types';
import { VARIANTS } from '@/game/types';
import { CardView } from './CardView';
import { Modal } from './common';
import { t } from '@/i18n';

const VARIANT_LABEL: Record<Variant, string> = { NORMAL: 'Normal', FOIL: 'Foil', PRISMATIC: 'Prismatic' };

/** Keywords referenced by a card (static + trigger + status). */
export function cardKeywords(cardId: string): KeywordId[] {
  const card = getCard(cardId);
  if (!card) return [];
  const set = new Set<KeywordId>(card.keywords ?? []);
  for (const a of card.abilities ?? []) {
    if (a.trigger === 'ON_DEPLOY') set.add('ON_DEPLOY');
    if (a.trigger === 'LAST_BREATH') set.add('LAST_BREATH');
    if (a.overcharge) set.add('OVERCHARGE');
    for (const e of a.effects) {
      if (e.type === 'APPLY_STATUS' && e.status === 'FROZEN') set.add('FREEZE');
      if (e.type === 'APPLY_STATUS' && e.status === 'BURN') set.add('BURN');
      if (e.type === 'GRANT_KEYWORD') set.add(e.keyword);
    }
  }
  if (card.aura?.keyword) set.add(card.aura.keyword);
  return [...set];
}

/** Global large card view with full details. Opened via useUi().inspectCard(id). */
export function CardInspector() {
  const inspect = useUi((s) => s.inspect);
  const close = useUi((s) => s.inspectCard);
  const counts = useAccount((s) => (inspect ? s.save?.collection.cards[inspect.cardId] : undefined));
  const card = inspect ? getCard(inspect.cardId) : undefined;
  if (!inspect || !card) return null;
  const faction = FACTIONS[card.faction];
  const variant = inspect.variant ?? (counts?.PRISMATIC ? 'PRISMATIC' : counts?.FOIL ? 'FOIL' : 'NORMAL');
  const owned = counts ? counts.NORMAL + counts.FOIL + counts.PRISMATIC : 0;
  const keywords = cardKeywords(card.id);
  return (
    <Modal open onClose={() => close(null)} title={card.name} wide labelledBy="inspector-title" className="inspector">
      <div className="inspector-body">
        <div className="inspector-card">
          <CardView card={card} size="xl" variant={variant} silenced={inspect.silenced} />
        </div>
        <div className="inspector-info">
          <dl className="info-grid">
            <dt>{t('Faction')}</dt>
            <dd style={{ color: faction.colors.primary }}>{faction.name}</dd>
            <dt>{t('Type')}</dt>
            <dd>{t(card.cardType.charAt(0) + card.cardType.slice(1).toLowerCase())}{card.tags?.length ? ` — ${card.tags.map((tag) => t(tag)).join(', ')}` : ''}</dd>
            <dt>{t('Rarity')}</dt>
            <dd className={`rarity-text-${card.rarity.toLowerCase()}`}>{t(card.rarity.charAt(0) + card.rarity.slice(1).toLowerCase())}</dd>
            <dt>{t('Cost')}</dt>
            <dd className="num">{t('{n} energy', { n: card.manaCost })}</dd>
            {card.cardType === 'UNIT' && (
              <>
                <dt>{t('Stats')}</dt>
                <dd className="num">
                  {t('{attack} Attack / {health} Health', { attack: String(card.attack), health: String(card.health) })}
                </dd>
              </>
            )}
            <dt>{t('Set')}</dt>
            <dd>{SET_INFO[card.set].name}</dd>
            {card.collectible && (
              <>
                <dt>{t('Owned')}</dt>
                <dd className="num">
                  {owned} / {maxCopiesFor(card)}
                  {counts && (
                    <span className="faint">
                      {' '}
                      ({VARIANTS.filter((v) => counts[v] > 0).map((v) => `${counts[v]} ${t(VARIANT_LABEL[v])}`).join(', ') || t('none')})
                    </span>
                  )}
                </dd>
                <dt>{t('Craft')}</dt>
                <dd className="num">{t('{n} Essence', { n: craftCost(card.id) })}</dd>
                <dt>{t('Recycle')}</dt>
                <dd className="num">{t('{n} Essence', { n: recycleValue(card.id) })}</dd>
              </>
            )}
            <dt>{t('Artist')}</dt>
            <dd>{card.artist ?? t('Shardbound procedural atelier')}</dd>
          </dl>
          <div className="inspector-text">
            <p>{card.description}</p>
            {card.flavorText && <p className="card-flavor-lg">“{card.flavorText}”</p>}
          </div>
          {keywords.length > 0 && (
            <ul className="keyword-list">
              {keywords.map((k) => (
                <li key={k}>
                  <strong>
                    {KEYWORDS[k].icon} {KEYWORDS[k].name}
                  </strong>
                  <span>{KEYWORDS[k].definition}</span>
                </li>
              ))}
            </ul>
          )}
          {card.archetypes && <p className="faint">{t('Archetypes:')} {card.archetypes.map((a) => t(a)).join(', ')}</p>}
        </div>
      </div>
    </Modal>
  );
}
