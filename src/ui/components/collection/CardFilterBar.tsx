import type { CardType, Faction, Rarity, SetId } from '@/game/types';
import { CARD_TYPES, RARITIES } from '@/game/types';
import { FACTIONS } from '@/data/factions';
import { SET_INFO } from '@/config/economy';
import { Glyph } from '@/ui/components/Icons';
import type { CardFilterState, OwnershipFilter, SortKey } from './cardFilters';
import { DEFAULT_FILTERS } from './cardFilters';
import { t } from '@/i18n';

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

interface Props {
  value: CardFilterState;
  onChange: (next: CardFilterState) => void;
  /** Factions shown as tabs (plus "All"). */
  factions: readonly Faction[];
  /** Factions shown but not selectable (e.g. excluded from a deck). */
  disabledFactions?: readonly Faction[];
  ownershipLabels?: Partial<Record<OwnershipFilter, string>>;
  compact?: boolean;
}

/** Faction tabs, search and dropdown filters shared by the collection and deck editor. */
export function CardFilterBar({ value, onChange, factions, disabledFactions = [], ownershipLabels, compact }: Props) {
  const set = <K extends keyof CardFilterState>(k: K, v: CardFilterState[K]) => onChange({ ...value, [k]: v });
  const active =
    value.rarity !== 'ALL' || value.set !== 'ALL' || value.type !== 'ALL' || value.cost !== 'ALL' || value.search !== '' || value.ownership !== 'ALL' || value.faction !== 'ALL';
  return (
    <div className={`filter-bar ${compact ? 'compact' : ''}`}>
      <div className="faction-tabs" role="tablist" aria-label={t('Faction')}>
        <button role="tab" aria-selected={value.faction === 'ALL'} className="faction-tab" onClick={() => set('faction', 'ALL')}>
          <Glyph name="crystal" size={16} />
          <span>{t('All')}</span>
        </button>
        {factions.map((f) => {
          const info = FACTIONS[f];
          const disabled = disabledFactions.includes(f);
          return (
            <button
              key={f}
              role="tab"
              aria-selected={value.faction === f}
              disabled={disabled}
              title={disabled ? t("{name} can't be added to this deck", { name: info.name }) : info.name}
              className="faction-tab"
              style={{ '--tab-color': info.colors.primary } as React.CSSProperties}
              onClick={() => set('faction', f)}
            >
              <Glyph name={info.sigil} size={16} />
              <span>{info.short}</span>
            </button>
          );
        })}
      </div>
      <div className="filter-row">
        <label className="search-field">
          <span className="sr-only">{t('Search cards')}</span>
          <Glyph name="eye" size={16} />
          <input className="input" type="search" placeholder={t('Search name, text or tag')} value={value.search} onChange={(e) => set('search', e.target.value)} />
        </label>
        <div className="segmented cost-filter" role="group" aria-label={t('Energy cost')}>
          {Array.from({ length: 8 }, (_, i) => (
            <button key={i} aria-pressed={value.cost === i} aria-label={i === 7 ? t('Cost 7 or more') : t('Cost {n}', { n: i })} onClick={() => set('cost', value.cost === i ? 'ALL' : i)}>
              {i === 7 ? '7+' : i}
            </button>
          ))}
        </div>
        <select className="select" aria-label={t('Rarity')} value={value.rarity} onChange={(e) => set('rarity', e.target.value as Rarity | 'ALL')}>
          <option value="ALL">{t('Any rarity')}</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {t(cap(r))}
            </option>
          ))}
        </select>
        <select className="select" aria-label={t('Card type')} value={value.type} onChange={(e) => set('type', e.target.value as CardType | 'ALL')}>
          <option value="ALL">{t('Any type')}</option>
          {CARD_TYPES.map((ct) => (
            <option key={ct} value={ct}>
              {t(cap(ct))}
            </option>
          ))}
        </select>
        {!compact && (
          <select className="select" aria-label={t('Set')} value={value.set} onChange={(e) => set('set', e.target.value as SetId | 'ALL')}>
            <option value="ALL">{t('Any set')}</option>
            {(Object.keys(SET_INFO) as SetId[]).map((s) => (
              <option key={s} value={s}>
                {SET_INFO[s].name}
              </option>
            ))}
          </select>
        )}
        <select className="select" aria-label={t('Ownership')} value={value.ownership} onChange={(e) => set('ownership', e.target.value as OwnershipFilter)}>
          <option value="ALL">{ownershipLabels?.ALL ?? t('Owned and missing')}</option>
          <option value="OWNED">{ownershipLabels?.OWNED ?? t('Owned only')}</option>
          <option value="MISSING">{ownershipLabels?.MISSING ?? t('Missing only')}</option>
        </select>
        <select className="select" aria-label={t('Sort by')} value={value.sort} onChange={(e) => set('sort', e.target.value as SortKey)}>
          <option value="cost">{t('Sort by cost')}</option>
          <option value="name">{t('Sort by name')}</option>
          <option value="rarity">{t('Sort by rarity')}</option>
          <option value="faction">{t('Sort by faction')}</option>
        </select>
        {active && (
          <button className="btn btn-ghost btn-sm" onClick={() => onChange({ ...DEFAULT_FILTERS, sort: value.sort })}>
            {t('Clear filters')}
          </button>
        )}
      </div>
    </div>
  );
}
