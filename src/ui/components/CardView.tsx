import { memo, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import type { CardDefinition, Variant } from '@/game/types';
import { cardArtPosition, cardArtUri } from './cardArt';
import { Glyph } from './Icons';
import { KeywordText } from './Tooltip';
import { DEFAULT_CARD_BACK } from '@/data/cardBacks';
import { t } from '@/i18n';

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
  /** A unit on the board that was Silenced: its rules text no longer applies. */
  silenced?: boolean;
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
    <div className={`card card-back ${url ? 'has-art' : ''} ${className}`} style={{ '--card-w': `${width}px`, ...style } as CSSProperties} aria-label={t('Face-down card')}>
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

/** Phones and tablets: no mouse to hover or right-click with. */
export const isTouchScreen = () =>
  (typeof document !== 'undefined' && document.documentElement.dataset.input === 'touch') || (typeof matchMedia !== 'undefined' && matchMedia('(hover: none)').matches);

/**
 * Touch: holding a finger on a card for half a second does what a right-click does (inspect).
 * Android fires `contextmenu` on a long press by itself but iOS Safari never does, so it is timed here;
 * the tap that ends a long press is swallowed so it doesn't also select or add the card.
 */
function useLongPress(onContextMenu: ((e: MouseEvent) => void) | undefined, onPointerDown: ((e: PointerEvent) => void) | undefined) {
  const timer = useRef<number | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  const cancel = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
  };
  if (!onContextMenu) return { onPointerDown, fired };
  return {
    fired,
    onPointerDown: (e: PointerEvent) => {
      onPointerDown?.(e);
      fired.current = false;
      if (e.pointerType !== 'touch') return;
      cancel();
      start.current = { x: e.clientX, y: e.clientY };
      timer.current = window.setTimeout(() => {
        timer.current = null;
        fired.current = true;
        onContextMenu({ preventDefault() {}, stopPropagation() {} } as unknown as MouseEvent);
      }, 500);
    },
    onPointerMove: (e: PointerEvent) => {
      if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
  };
}

/** Steps the rules text may shrink to (fraction of the normal size) before it is clipped. */
const FIT_STEPS = [0.94, 0.88, 0.82, 0.76, 0.7];

/**
 * Keeps the rules text inside its panel: when it overflows, the flavor text goes first, then the rules
 * text shrinks step by step. Measured after layout and again once web fonts have loaded.
 */
function useTextFit(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fit = () => {
      const el = ref.current;
      if (!el) return;
      el.style.removeProperty('--fit');
      el.classList.remove('no-flavor');
      const fits = () => el.scrollHeight <= el.clientHeight + 1;
      if (fits()) return;
      if (el.querySelector('.card-flavor')) {
        el.classList.add('no-flavor');
        if (fits()) return;
      }
      for (const step of FIT_STEPS) {
        el.style.setProperty('--fit', String(step));
        if (fits()) return;
      }
    };
    fit();
    let live = true;
    void document.fonts?.ready.then(() => live && fit());
    return () => {
      live = false;
    };
  }, deps);
  return ref;
}

export const CardView = memo(function CardView(props: CardViewProps) {
  const card = typeof props.card === 'string' ? getCardSafe(props.card) : props.card;
  const width = props.width ?? CARD_WIDTH[props.size ?? 'md'];
  const { fired: longPressed, ...pressHandlers } = useLongPress(props.onContextMenu, props.onPointerDown);
  const showFlavor = props.size !== 'xs' && props.size !== 'sm' && !!card.flavorText && width >= 220;
  const textRef = useTextFit([card.id, card.description, showFlavor && card.flavorText, width, props.silenced, props.faceDown]);
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
    props.silenced ? 'is-silenced' : '',
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
    `${card.name}, ${t('{n} energy {type}', { n: cost, type: t(TYPE_LABEL[card.cardType]) })}${card.cardType === 'UNIT' ? t(', {attack} attack {health} health', { attack: String(card.attack), health: String(card.health) }) : ''}. ${card.description ?? ''}`;

  return (
    <div
      className={classes}
      style={style}
      onClick={
        props.onClick &&
        ((e) => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          props.onClick?.(e);
        })
      }
      onContextMenu={
        props.onContextMenu &&
        ((e) => {
          // A long press already inspected the card (Android also sends contextmenu for it).
          if (longPressed.current) return e.preventDefault();
          props.onContextMenu?.(e);
        })
      }
      {...pressHandlers}
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
          <span>{t(TYPE_LABEL[card.cardType])}</span>
          <span className="rarity-gem" title={t(card.rarity.toLowerCase())} />
          <span className="card-tags">{card.tags?.[0] ? t(card.tags[0]) : faction.short}</span>
        </div>
        <span className="card-textbox" aria-hidden />
        {/* Faction emblem watermark behind the rules text (below it in z-order). */}
        <span className="card-watermark" aria-hidden>
          <Glyph name={faction.sigil} size={Math.round(width * 0.36)} />
        </span>
        <div className="card-text" ref={textRef}>
          {props.silenced && <span className="card-silenced-tag">{t('Silenced')}</span>}
          <p className="card-rules">
            <KeywordText text={card.description ?? ''} />
          </p>
          {showFlavor && <p className="card-flavor">{card.flavorText}</p>}
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
          <div className="card-stat stat-charges" aria-hidden title={t('Charges')}>
            <span>{card.charges}</span>
          </div>
        )}
        {card.cardType === 'LOCATION' && card.duration && (
          <div className="card-stat stat-duration" aria-hidden title={t('Duration')}>
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
