import type { CSSProperties } from 'react';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { useMatch, AI } from '@/state/matchStore';
import { cardArtUri } from '@/ui/components/cardArt';
import { legendTheme } from './legendEntrance';
import { t } from '@/i18n';
import '@/ui/styles/legendary.css';

const PAWS = 8;

function Paw() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <ellipse cx="32" cy="42" rx="15" ry="13" />
      <ellipse cx="14" cy="26" rx="6.5" ry="8.5" transform="rotate(-20 14 26)" />
      <ellipse cx="25" cy="15" rx="6.5" ry="9" />
      <ellipse cx="39" cy="15" rx="6.5" ry="9" />
      <ellipse cx="50" cy="26" rx="6.5" ry="8.5" transform="rotate(20 50 26)" />
    </svg>
  );
}

/** A short full-screen entrance when a Legendary unit is played, before it lands on the board. */
export function LegendaryEntrance() {
  const legend = useMatch((s) => s.legend);
  if (!legend) return null;
  const card = getCardSafe(legend.cardId);
  const theme = legendTheme(legend.cardId);
  const faction = FACTIONS[card.faction] ?? FACTIONS.NEUTRAL;
  return (
    <div
      key={legend.id}
      className={`legend-entrance theme-${theme} ${legend.player === AI ? 'from-enemy' : 'from-self'}`}
      style={{ '--f1': faction.colors.primary, '--fglow': faction.colors.glow } as CSSProperties}
      role="status"
      aria-label={t('{who} played {card}', { who: legend.player === AI ? t('Opponent') : t('You'), card: card.name })}
    >
      <div className="legend-backdrop" />
      <div className="legend-rays" />
      <div className="legend-stage">
        <div className="legend-portrait">
          <img src={cardArtUri(card)} alt="" draggable={false} />
        </div>
        {theme === 'meowchick' && <div className="legend-bubble">{t('Meow!')}</div>}
        <div className="legend-banner">
          <span className="legend-kicker">{t('Legendary')}</span>
          <strong>{card.name}</strong>
        </div>
      </div>
      {theme === 'meowchick' && (
        <div className="legend-paws" aria-hidden>
          {Array.from({ length: PAWS }, (_, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties}>
              <Paw />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
