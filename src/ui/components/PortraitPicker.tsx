import { getPortrait, portraitsOf } from '@/data/portraits';
import { usePortraitPress } from './PortraitInspector';
import type { PlayableFaction } from '@/game/types';
import { t } from '@/i18n';
import { WardenPortrait } from './WardenPortrait';
import '@/ui/styles/meta.css';

export interface PortraitOption {
  /** Value passed to onChange. */
  value: string | null;
  /** Portrait to show (null = faction default). */
  portrait: string | null;
  label: string;
}

/** Owned portraits of one faction as a row of hexagons; the selected one is highlighted. */
export function PortraitPicker({
  faction,
  owned,
  value,
  onChange,
  leading = [],
}: {
  faction: PlayableFaction;
  owned: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Extra options before the default (e.g. "follow the Profile" in the deck editor). */
  leading?: PortraitOption[];
}) {
  const options: PortraitOption[] = [
    ...leading,
    { value: null, portrait: null, label: t('Default Warden') },
    ...portraitsOf(faction)
      .filter((p) => owned.includes(p.id))
      .map((p) => ({ value: p.id, portrait: p.id, label: t(p.name) })),
  ];
  return (
    <div className="portrait-picker" role="radiogroup" aria-label={t('Warden portrait')}>
      {options.map((o) => (
        <PortraitOptionButton key={o.value ?? 'default'} faction={faction} option={o} selected={value === o.value} onPick={() => onChange(o.value)} />
      ))}
    </div>
  );
}

/** One option; right-click or a long press shows the portrait large. */
function PortraitOptionButton({ faction, option, selected, onPick }: { faction: PlayableFaction; option: PortraitOption; selected: boolean; onPick: () => void }) {
  const { swallowClick, ...press } = usePortraitPress({ faction, portrait: option.portrait });
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`portrait-option ${selected ? 'is-selected' : ''}`}
      title={option.label}
      {...press}
      onClick={() => {
        if (swallowClick()) return;
        onPick();
      }}
    >
      <WardenPortrait faction={faction} portrait={option.portrait} size={46} />
      <span className="portrait-option-label">{option.label}</span>
    </button>
  );
}

export function portraitName(id: string | null | undefined): string {
  const p = getPortrait(id);
  return p ? t(p.name) : t('Default Warden');
}
