import { memo, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import type { CardDefinition, Variant } from '@/game/types';
import { cardArtPosition, cardArtUri } from './cardArt';
import { Glyph } from './Icons';
import { KeywordText } from './Tooltip';
import { DEFAULT_CARD_BACK } from '@/data/cardBacks';

/** Card back artwork: src/assets/cardbacks/<id>.webp */
const BACK_ART = import.meta.glob('../../assets/cardbacks/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export function cardBackUrl(design: string | null | undefined): string | undefined {
  return BACK_ART[`../../assets/cardbacks/${design ?? DEFAULT_CARD_BACK}.webp`] ?? BACK_ART[`../../assets/cardbacks/${DEFAULT_CARD_BACK}.webp`];
}

export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const CARD_WIDTH: Record<CardSize, number> = { xs: 96, sm: 132, md: 176, lg: 240, xl: 320 };

const TYPE_LABEL: Record<string, string> = { UNIT: 'Unit', SPELL: 'Spell', RELIC: 'Relic', LOCATION: 'Location' };

export interface CardViewProps {
  card: CardDefinition | string;
  size?: CardSize;
  /** Explicit pixel width (overrides size). */
  width?: number;
  variant?: Variant;
  /** Effective cost (e.g. after reductions) shown instead of printed cost. */
  cost?: number;
  playable?: boolean;
  dimmed?: boolean;
  selected?: boolean;
  faceDown?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
  onPointerDown?: (e: PointerEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  ariaLabel?: string;
  /** Optional overlay rendered on top (owned count, craft info...). */
  children?: React.ReactNode;
}

/** A face-down card. `design` is a card back id (src/data/cardBacks.ts); the default back when missing. */
export function CardBack({ width = CARD_WIDTH.md, className = '', style, design }: { width?: number; className?: string; style?: CSSProperties; design?: string | null }) {
  const url = cardBackUrl(design);
  return (
    <div className={`card card-back ${url ? 'has-art' : ''} ${className}`} style={{ '--card-w': `${width}px`, ...style } as CSSProperties} aria-label="Face-down card">
      <div className="card-back-inner">{url ? <img className="card-back-img" src={url} alt="" draggable={false} decoding="async" /> : <Glyph name="crystal" size={width * 0.35} />}</div>
    </div>
  );
}

function CardArtImage({ card }: { card: CardDefinition }) {
  const external = card.artwork && /^(\/|https?:|data:)/.test(card.artwork) ? card.artwork : null;
  const [failed, setFailed] = useState(false);
  const src = external && !failed ? external : cardArtUri(card);
  return <img className="card-art" src={src} style={external ? undefined : { objectPosition: cardArtPosition(card) }} alt="" loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} />;
}

export const CardView = memo(function CardView(props: CardViewProps) {
  const card = typeof props.card === 'string' ? getCardSafe(props.card) : props.card;
  const width = props.width ?? CARD_WIDTH[props.size ?? 'md'];
  if (props.faceDown) return <CardBack width={width} className={props.className} style={props.style} />;
  const faction = FACTIONS[card.faction] ?? FACTIONS.NEUTRAL;
  const cost = props.cost ?? card.manaCost;
  const costClass = cost < card.manaCost ? 'cost-down' : cost > card.manaCost ? 'cost-up' : '';
  const variant = props.variant ?? 'NORMAL';
  const classes = [
    'card',
    `card-${card.cardType.toLowerCase()}`,
    `rarity-${card.rarity.toLowerCase()}`,
    variant === 'FOIL' ? 'card-foil' : '',
    variant === 'PRISMATIC' ? 'card-prismatic' : '',
    props.playable ? 'is-playable' : '',
    props.dimmed ? 'is-dimmed' : '',
    props.selected ? 'is-selected' : '',
    props.onClick ? 'is-clickable' : '',
    props.className ?? '',
  ].join(' ');
  const style = {
    '--card-w': `${width}px`,
    '--f1': faction.colors.primary,
    '--f2': faction.colors.secondary,
    '--fglow': faction.colors.glow,
    '--fdark': faction.colors.dark,
    ...props.style,
  } as CSSProperties;
  const label =
    props.ariaLabel ??
    `${card.name}, ${cost} energy ${TYPE_LABEL[card.cardType]}${card.cardType === 'UNIT' ? `, ${card.attack} attack ${card.health} health` : ''}. ${card.description ?? ''}`;

  return (
    <div
      className={classes}
      style={style}
      onClick={props.onClick}
      onContextMenu={props.onContextMenu}
      onPointerDown={props.onPointerDown}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      role={props.onClick ? 'button' : 'img'}
      tabIndex={props.onClick ? 0 : undefined}
      aria-label={label}
      onKeyDown={props.onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), props.onClick?.(e as unknown as MouseEvent)) : undefined}
    >
      <div className="card-inner">
        {variant !== 'NORMAL' && <div className="card-shine" aria-hidden />}
        {variant === 'PRISMATIC' && <div className="card-prism-frame" aria-hidden />}
        <div className="card-art-wrap">
          <CardArtImage card={card} />
        </div>
        <div className="card-name">
          <span>{card.name}</span>
        </div>
        <div className="card-typeline">
          <span>{TYPE_LABEL[card.cardType]}</span>
          <span className="rarity-gem" title={card.rarity.toLowerCase()} />
          <span className="card-tags">{card.tags?.[0] ?? faction.short}</span>
        </div>
        {/* Faction emblem watermark behind the rules text (below it in z-order). */}
        <span className="card-watermark" aria-hidden>
          <Glyph name={faction.sigil} size={Math.round(width * 0.36)} />
        </span>
        <div className="card-text">
          <p>
            <KeywordText text={card.description ?? ''} />
          </p>
          {props.size !== 'xs' && props.size !== 'sm' && card.flavorText && width >= 220 && <p className="card-flavor">{card.flavorText}</p>}
        </div>
        {card.cardType === 'UNIT' && (
          <>
            <div className="card-stat stat-attack" aria-hidden>
              <span>{card.attack}</span>
            </div>
            <div className="card-stat stat-health" aria-hidden>
              <span>{card.health}</span>
            </div>
          </>
        )}
        {card.cardType === 'RELIC' && card.charges && (
          <div className="card-stat stat-charges" aria-hidden title="Charges">
            <span>{card.charges}</span>
          </div>
        )}
        {card.cardType === 'LOCATION' && card.duration && (
          <div className="card-stat stat-duration" aria-hidden title="Duration">
            <span>{card.duration}</span>
          </div>
        )}
      </div>
      <div className={`card-cost ${costClass}`} aria-hidden>
        <span>{cost}</span>
      </div>
      {props.children}
    </div>
  );
});
