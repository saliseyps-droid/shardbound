import { memo, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { getHeroPower } from '@/data/heroPowers';
import { KEYWORDS } from '@/data/keywords';
import type { GameState, PlayerId, UnitInstance } from '@/engine/types';
import { canAttack, canUseHeroPower, currentHealth, empower, hasKeyword, maxHealth, unitAttack } from '@/engine/queries';
import { cardArtUri } from '@/ui/components/cardArt';
import { Glyph } from '@/ui/components/Icons';
import { WardenPortrait, portraitUrl } from '@/ui/components/WardenPortrait';
import type { Faction } from '@/game/types';
import { Tip } from '@/ui/components/Tooltip';
import type { StaticKeyword } from '@/game/types';
import { useMatch, HUMAN, type Fx } from '@/state/matchStore';

// ---------------------------------------------------------------------------
// Floating combat numbers
// ---------------------------------------------------------------------------

export function FxLayer({ fx }: { fx: Fx[] }) {
  if (fx.length === 0) return null;
  return (
    <div className="fx-layer" aria-hidden>
      {fx.map((f, i) => (
        <span key={f.id} className={`fx fx-${f.kind}`} style={{ '--i': i } as CSSProperties}>
          {f.kind === 'damage' && `−${f.amount}`}
          {f.kind === 'heal' && `+${f.amount}`}
          {f.kind === 'armor' && `+${f.amount}`}
          {f.kind === 'buff' && '▲'}
          {f.kind === 'shield' && '◈'}
          {f.kind === 'freeze' && '❄'}
          {f.kind === 'burn' && '🔥'}
          {f.kind === 'silence' && '∅'}
        </span>
      ))}
    </div>
  );
}

const useFxFor = (key: string) => useMatch((s) => s.fx).filter((f) => f.target === key);

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

const KEYWORD_BADGES: StaticKeyword[] = ['DRAIN', 'VENOM', 'FRENZY', 'WARD', 'REGENERATE', 'EMPOWER', 'RUSH', 'SWIFT'];

export const UnitView = memo(function UnitView({
  unit,
  game,
  ghost,
  targetable,
  selected,
  onPointerDown,
  onHover,
}: {
  unit: UnitInstance;
  game: GameState;
  ghost?: boolean;
  targetable?: boolean;
  selected?: boolean;
  onPointerDown?: (e: RPointerEvent, uid: number) => void;
  onHover?: (cardId: string | null) => void;
}) {
  const card = getCardSafe(unit.cardId);
  const faction = FACTIONS[card.faction];
  const key = `u:${unit.uid}`;
  const fx = useFxFor(key);
  const atk = unitAttack(game, unit);
  const hp = currentHealth(unit);
  const maxHp = maxHealth(unit);
  const guard = hasKeyword(game, unit, 'GUARD');
  const ready = !ghost && unit.owner === HUMAN && game.activePlayer === HUMAN && canAttack(game, unit).ok;
  const hasLastBreath = !unit.silenced && unit.abilities.some((a) => a.trigger === 'LAST_BREATH');
  const hasTrigger = !unit.silenced && unit.abilities.some((a) => a.trigger !== 'LAST_BREATH' && a.trigger !== 'ON_DEPLOY');
  const badges = KEYWORD_BADGES.filter((k) => hasKeyword(game, unit, k));
  const classes = [
    'unit',
    guard ? 'has-guard' : '',
    unit.barrier ? 'has-barrier' : '',
    unit.ambush ? 'has-ambush' : '',
    unit.frozen ? 'is-frozen' : '',
    unit.silenced ? 'is-silenced' : '',
    ready ? 'is-ready' : '',
    targetable ? 'is-targetable' : '',
    selected ? 'is-selected' : '',
    ghost ? 'is-dying' : '',
    fx.some((f) => f.kind === 'damage') ? 'is-hit' : '',
    fx.some((f) => f.kind === 'summon') ? 'is-summoned' : '',
  ].join(' ');
  const status = [
    `${card.name}, ${atk} attack, ${hp} of ${maxHp} health`,
    guard && 'Guard',
    unit.barrier && 'Barrier',
    unit.ambush && 'Ambush',
    unit.frozen && 'Frozen',
    unit.burn > 0 && `Burn ${unit.burn}`,
    ready && 'ready to attack',
    targetable && 'valid target',
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <div
      className={classes}
      data-entity={ghost ? undefined : key}
      role="button"
      tabIndex={ghost ? -1 : 0}
      aria-label={status}
      style={{ '--f1': faction.colors.primary, '--fglow': faction.colors.glow, '--fdark': faction.colors.dark } as CSSProperties}
      onPointerDown={(e) => !ghost && onPointerDown?.(e, unit.uid)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), useMatch.getState().clickUnit(unit.uid))}
      onMouseEnter={() => onHover?.(unit.cardId)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="unit-body">
        <img className="unit-art" src={cardArtUri(card)} alt="" draggable={false} />
        {unit.frozen && <div className="unit-ice" aria-hidden />}
        {unit.barrier && <div className="unit-barrier" aria-hidden />}
        <div className="unit-name">{card.name}</div>
      </div>
      {guard && <div className="unit-guard-plate" aria-hidden />}
      <div className="unit-badges">
        {badges.map((k) => (
          <Tip key={k} title={KEYWORDS[k].name} body={KEYWORDS[k].definition} className="unit-badge">
            {KEYWORDS[k].icon}
          </Tip>
        ))}
        {hasLastBreath && (
          <Tip title="Last Breath" body={KEYWORDS.LAST_BREATH.definition} className="unit-badge">
            ✝
          </Tip>
        )}
        {hasTrigger && (
          <Tip title="Triggered ability" body={card.description ?? ''} className="unit-badge">
            ϟ
          </Tip>
        )}
        {unit.burn > 0 && (
          <Tip title={`Burn ${unit.burn}`} body={KEYWORDS.BURN.definition} className="unit-badge badge-burn">
            🔥{unit.burn}
          </Tip>
        )}
      </div>
      <div className={`unit-stat unit-atk ${atk > card.attack! ? 'up' : atk < card.attack! ? 'down' : ''}`}>{atk}</div>
      <div className={`unit-stat unit-hp ${hp < maxHp ? 'down' : maxHp > card.health! ? 'up' : ''}`}>{hp}</div>
      {ready && <span className="ready-mark" aria-hidden>⚔</span>}
      {targetable && <span className="target-mark" aria-hidden>◎</span>}
      <FxLayer fx={fx} />
    </div>
  );
});

// ---------------------------------------------------------------------------
// Heroes
// ---------------------------------------------------------------------------

export function HeroPanel({
  game,
  player,
  targetable,
  onClick,
}: {
  game: GameState;
  player: PlayerId;
  targetable: boolean;
  onClick: () => void;
}) {
  const p = game.players[player];
  const key = `h:${player}`;
  const fx = useFxFor(key);
  const lowHealth = p.hero.health <= 10;
  return (
    <div
      className={`hero ${player === HUMAN ? 'hero-self' : 'hero-enemy'} ${targetable ? 'is-targetable' : ''} ${fx.some((f) => f.kind === 'damage') ? 'is-hit' : ''} ${lowHealth ? 'is-low' : ''}`}
      data-entity={key}
      role="button"
      tabIndex={0}
      aria-label={`${p.hero.name}, ${p.hero.health} health${p.hero.armor ? `, ${p.hero.armor} armor` : ''}${targetable ? ', valid target' : ''}`}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
    >
      {portraitUrl(p.hero.faction as Faction) ? (
        <WardenPortrait faction={p.hero.faction as Faction} fill inset={4} />
      ) : (
        <div className="hero-portrait">
          <Glyph name={p.hero.avatar} size={44} />
        </div>
      )}
      <div className="hero-health num" title="Health">
        {p.hero.health}
      </div>
      {p.hero.armor > 0 && (
        <div className="hero-armor num" title="Armor">
          {p.hero.armor}
        </div>
      )}
      <div className="hero-name">{p.hero.name}</div>
      {targetable && <span className="target-mark" aria-hidden>◎</span>}
      <FxLayer fx={fx} />
    </div>
  );
}

export function EnergyBar({ game, player }: { game: GameState; player: PlayerId }) {
  const p = game.players[player];
  const crystals = Array.from({ length: Math.max(p.maxEnergy, p.energy) }, (_, i) => i < p.energy);
  return (
    <div className="energy" data-tutorial={player === HUMAN ? 'energy' : undefined} aria-label={`Energy ${p.energy} of ${p.maxEnergy}`}>
      <span className="energy-count num">
        {p.energy}/{p.maxEnergy}
      </span>
      <span className="energy-crystals" aria-hidden>
        {crystals.map((full, i) => (
          <span key={i} className={`crystal ${full ? 'full' : ''}`} />
        ))}
      </span>
    </div>
  );
}

export function HeroPowerButton({ game, player }: { game: GameState; player: PlayerId }) {
  const p = game.players[player];
  const power = p.hero.heroPowerId ? getHeroPower(p.hero.heroPowerId) : undefined;
  const selected = useMatch((s) => s.selection?.kind === 'power');
  const click = useMatch((s) => s.clickHeroPower);
  if (!power) return null;
  const usable = player === HUMAN && canUseHeroPower(game, player).ok;
  const used = p.hero.heroPowerUses >= (power.usesPerTurn ?? 1);
  return (
    <Tip title={`${power.name} (${power.cost})`} body={power.description}>
      <button
        data-tutorial={player === HUMAN ? 'sigil' : undefined}
        className={`hero-power ${usable ? 'is-usable' : ''} ${used ? 'is-used' : ''} ${selected ? 'is-selected' : ''}`}
        onClick={player === HUMAN ? click : undefined}
        disabled={player !== HUMAN}
        aria-label={`Warden Sigil: ${power.name}, costs ${power.cost}. ${power.description}${used ? ' Already used this turn.' : ''}`}
      >
        <Glyph name="crystal" size={22} />
        <span className="hero-power-cost num">{power.cost}</span>
      </button>
    </Tip>
  );
}

export function PermanentsRow({ game, player, onHover }: { game: GameState; player: PlayerId; onHover: (id: string | null) => void }) {
  const p = game.players[player];
  if (p.relics.length === 0 && !p.location) return null;
  return (
    <div className="permanents">
      {p.location && (
        <Tip title={getCardSafe(p.location.cardId).name} body={getCardSafe(p.location.cardId).description ?? ''}>
          <div className="permanent location" onMouseEnter={() => onHover(p.location!.cardId)} onMouseLeave={() => onHover(null)}>
            <img src={cardArtUri(getCardSafe(p.location.cardId))} alt="" />
            {p.location.turnsRemaining !== null && <span className="perm-count num">{p.location.turnsRemaining}</span>}
          </div>
        </Tip>
      )}
      {p.relics.map((r) => (
        <Tip key={r.uid} title={getCardSafe(r.cardId).name} body={getCardSafe(r.cardId).description ?? ''}>
          <div className="permanent relic" onMouseEnter={() => onHover(r.cardId)} onMouseLeave={() => onHover(null)}>
            <img src={cardArtUri(getCardSafe(r.cardId))} alt="" />
            {r.charges !== null && <span className="perm-count num">{r.charges}</span>}
          </div>
        </Tip>
      ))}
    </div>
  );
}

export function DeckPile({ count, label }: { count: number; label: string }) {
  return (
    <div className="deck-pile" title={`${count} cards in ${label}`} aria-label={`${count} cards in ${label}`}>
      <span className="deck-pile-stack" aria-hidden />
      <span className="num">{count}</span>
    </div>
  );
}

export function EmpowerBadge({ game, player }: { game: GameState; player: PlayerId }) {
  const n = empower(game, player);
  if (!n) return null;
  return (
    <Tip title={`Empower ${n}`} body={KEYWORDS.EMPOWER.definition} className="chip empower-chip">
      ✦ +{n}
    </Tip>
  );
}

export function useHoverCard() {
  return useState<string | null>(null);
}
