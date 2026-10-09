import type { CSSProperties } from 'react';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { useMatch, AI } from '@/state/matchStore';
import { CardView } from '@/ui/components/CardView';
import { RuneCircle } from './LegendaryEntrance';
import { t } from '@/i18n';
import '@/ui/styles/legendary.css';

const SPARKS = 16;

/** An Epic or Legendary spell being cast: the card over a turning sigil in its faction's colour. */
export function SpellFlourish() {
  const fx = useMatch((s) => s.spellFx);
  if (!fx) return null;
  const card = getCardSafe(fx.cardId);
  const faction = FACTIONS[card.faction] ?? FACTIONS.NEUTRAL;
  return (
    <div
      key={fx.id}
      className={`spell-flourish is-${fx.rarity.toLowerCase()} ${fx.player === AI ? 'from-enemy' : 'from-self'}`}
      style={{ '--f1': faction.colors.primary, '--fglow': faction.colors.glow } as CSSProperties}
      role="status"
      aria-label={t('{who} played {card}', { who: fx.player === AI ? t('Opponent') : t('You'), card: card.name })}
    >
      <div className="sf-backdrop" />
      <div className="sf-sigil">
        <RuneCircle />
      </div>
      <div className="sf-sparks">
        {Array.from({ length: SPARKS }, (_, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
      <div className="sf-card">
        <CardView card={fx.cardId} size="lg" />
      </div>
      {fx.rarity === 'LEGENDARY' && <div className="sf-burst" />}
    </div>
  );
}
