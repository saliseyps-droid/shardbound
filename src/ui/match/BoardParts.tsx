import { memo, useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { getCardSafe } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { RANK_LABEL, getTalent } from '@/data/wardenTalents';
import { KEYWORDS } from '@/data/keywords';
import type { GameState, PlayerId, UnitInstance } from '@/engine/types';
import { canAttack, canUseHeroPower, currentHealth, empower, hasKeyword, maxHealth, unitAttack } from '@/engine/queries';
import { cardArtUri } from '@/ui/components/cardArt';
import { CardBack } from '@/ui/components/CardView';
import { Glyph } from '@/ui/components/Icons';
import { WardenPortrait, portraitUrl } from '@/ui/components/WardenPortrait';
import type { Faction } from '@/game/types';
import { Tip } from '@/ui/components/Tooltip';
import { Modal } from '@/ui/components/common';
import type { StaticKeyword } from '@/game/types';
import { useMatch, HUMAN, type Fx } from '@/state/matchStore';
import { t } from '@/i18n';

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

/** 'in' just after a unit freezes, 'out' just after it thaws (for ~0.8s), so the ice can grow or shatter. */
function useFreezeChange(frozen: boolean): 'in' | 'out' | null {
  const prev = useRef(frozen);
  const [change, setChange] = useState<'in' | 'out' | null>(null);
  useEffect(() => {
    if (prev.current === frozen) return;
    prev.current = frozen;
    setChange(frozen ? 'in' : 'out');
    const id = setTimeout(() => setChange(null), 800);
    return () => clearTimeout(id);
  }, [frozen]);
  return change;
}

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
  onHover?: (cardId: string | null, uid?: number) => void;
}) {
  const card = getCardSafe(unit.cardId);
  const faction = FACTIONS[card.faction];
  const key = `u:${unit.uid}`;
  const fx = useFxFor(key);
  const freeze = useFreezeChange(unit.frozen);
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
    unit.variant === 'PRISMATIC' ? 'is-prismatic' : unit.variant === 'FOIL' ? 'is-foil' : '',
  ].join(' ');
  const status = [
    t('{name}, {atk} attack, {hp} of {max} health', { name: card.name, atk, hp, max: maxHp }),
    guard && KEYWORDS.GUARD.name,
    unit.barrier && KEYWORDS.BARRIER.name,
    unit.ambush && KEYWORDS.AMBUSH.name,
    unit.frozen && t('Frozen'),
    unit.silenced && t('Silenced'),
    unit.burn > 0 && `${KEYWORDS.BURN.name} ${unit.burn}`,
    ready && t('ready to attack'),
    targetable && t('valid target'),
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
      onMouseEnter={() => onHover?.(unit.cardId, unit.uid)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="unit-body">
        {unit.variant === 'PRISMATIC' && <div className="unit-prism-frame" aria-hidden />}
        <img className="unit-art" src={cardArtUri(card)} alt="" draggable={false} />
        {unit.variant && <div className="unit-shine" aria-hidden />}
        {unit.frozen && <div className="unit-ice" aria-hidden />}
        <div className="unit-name">{card.name}</div>
      </div>
      {guard && <div className="unit-guard-plate" aria-hidden />}
      {unit.frozen && (
        <div className={`unit-frost ${freeze === 'in' ? 'is-new' : ''}`} aria-hidden />
      )}
      {freeze === 'out' && (
        <div className="unit-thaw" aria-hidden>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
      )}
      {unit.barrier && (
        <div className="unit-barrier" aria-hidden>
          <span className="barrier-glint" />
        </div>
      )}
      <div className="unit-badges">
        {badges.map((k) => (
          <Tip key={k} title={KEYWORDS[k].name} body={KEYWORDS[k].definition} className="unit-badge">
            {KEYWORDS[k].icon}
          </Tip>
        ))}
        {hasLastBreath && (
          <Tip title={KEYWORDS.LAST_BREATH.name} body={KEYWORDS.LAST_BREATH.definition} className="unit-badge">
            ✝
          </Tip>
        )}
        {hasTrigger && (
          <Tip title={t('Triggered ability')} body={card.description ?? ''} className="unit-badge">
            ϟ
          </Tip>
        )}
        {unit.burn > 0 && (
          <Tip title={`${KEYWORDS.BURN.name} ${unit.burn}`} body={KEYWORDS.BURN.definition} className="unit-badge badge-burn">
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
      aria-label={`${t('{name}, {hp} health', { name: p.hero.name, hp: p.hero.health })}${p.hero.armor ? `, ${t('{n} armor', { n: p.hero.armor })}` : ''}${targetable ? `, ${t('valid target')}` : ''}`}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
    >
      {portraitUrl(p.hero.faction as Faction, p.hero.portrait) ? (
        <WardenPortrait faction={p.hero.faction as Faction} portrait={p.hero.portrait} fill inset={4} />
      ) : (
        <div className="hero-portrait">
          <Glyph name={p.hero.avatar} size={44} />
        </div>
      )}
      <div className="hero-health num" title={t('Health')}>
        {p.hero.health}
      </div>
      {p.hero.armor > 0 && (
        <div className="hero-armor num" title={t('Armor')}>
          {p.hero.armor}
        </div>
      )}
      <div className="hero-name">{p.hero.name}</div>
      {targetable && <span className="target-mark" aria-hidden>◎</span>}
      <FxLayer fx={fx} />
    </div>
  );
}

/** Right-click / long press on a Warden: its name, faction, health and both abilities. */
export function HeroInspector({ game, player, onClose }: { game: GameState; player: PlayerId; onClose: () => void }) {
  const hero = game.players[player].hero;
  const faction = hero.faction ? FACTIONS[hero.faction as Faction] : undefined;
  return (
    <Modal open onClose={onClose} title={hero.name} labelledBy="hero-inspector-title" className="hero-inspector">
      <div className="hero-inspector-body">
        <WardenPortrait faction={hero.faction as Faction} portrait={hero.portrait} size={96} />
        <dl className="info-grid">
          {faction && (
            <>
              <dt>{t('Faction')}</dt>
              <dd style={{ color: faction.colors.primary }}>{faction.name}</dd>
            </>
          )}
          <dt>{t('Health')}</dt>
          <dd className="num">
            {hero.health} / {hero.maxHealth}
          </dd>
          {hero.armor > 0 && (
            <>
              <dt>{t('Armor')}</dt>
              <dd className="num">{hero.armor}</dd>
            </>
          )}
        </dl>
      </div>
      {hero.abilities.length > 0 && (
        <>
          <h4 className="hero-inspector-sub">{t('Warden abilities')}</h4>
          <ul className="keyword-list">
            {hero.abilities.map((a, i) => {
              const talent = getTalent(a.id);
              const level = talent?.levels[a.level];
              if (!talent || !level) return null;
              return (
                <li key={i}>
                  <strong>
                    {`${talent.name} ${RANK_LABEL[a.level] ?? ''}`.trim()} · {talent.kind === 'PASSIVE' ? t('Passive') : t('Active ({cost})', { cost: 'cost' in level ? level.cost : 0 })}
                  </strong>
                  <span>{level.description}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Modal>
  );
}

export function EnergyBar({ game, player }: { game: GameState; player: PlayerId }) {
  const p = game.players[player];
  const crystals = Array.from({ length: Math.max(p.maxEnergy, p.energy) }, (_, i) => i < p.energy);
  return (
    <div className="energy" data-tutorial={player === HUMAN ? 'energy' : undefined} aria-label={t('Energy {n} of {max}', { n: p.energy, max: p.maxEnergy })}>
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

/** The Warden's two talent abilities: active ones are clicked and aimed like a spell, passive ones only glow when they trigger. */
export function HeroAbilities({ game, player, slots }: { game: GameState; player: PlayerId; slots?: number[] }) {
  const abilities = game.players[player].hero.abilities;
  const shown = (slots ?? abilities.map((_, i) => i)).filter((i) => abilities[i]);
  if (shown.length === 0) return null;
  const firstActive = abilities.findIndex((a) => getTalent(a.id)?.kind === 'ACTIVE');
  // Faction colour for the soft tint behind the ability buttons.
  const tint = FACTIONS[game.players[player].hero.faction as Faction]?.colors.primary;
  return (
    <div className="hero-abilities" style={tint ? ({ '--ability-tint': tint } as CSSProperties) : undefined}>
      {shown.map((slot) => (
        <HeroAbilitySlot key={slot} game={game} player={player} slot={slot} tutorial={player === HUMAN && slot === firstActive} />
      ))}
    </div>
  );
}

function HeroAbilitySlot({ game, player, slot, tutorial }: { game: GameState; player: PlayerId; slot: number; tutorial: boolean }) {
  const p = game.players[player];
  const state = p.hero.abilities[slot];
  const talent = getTalent(state.id);
  const level = talent?.levels[state.level];
  const selected = useMatch((s) => s.selection?.kind === 'power' && s.selection.slot === slot && player === HUMAN);
  const click = useMatch((s) => s.clickHeroPower);
  // Passive glow: the newest trigger event of this slot.
  const lastTrigger = [...game.log].reverse().find((e) => e.type === 'HERO_ABILITY_TRIGGERED' && e.player === player && e.slot === slot)?.seq;
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (lastTrigger === undefined) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 900);
    return () => clearTimeout(t);
  }, [lastTrigger]);
  if (!talent || !level) return null;
  const glyph = (p.hero.faction && FACTIONS[p.hero.faction as Faction]?.sigil) || 'crystal';
  const title = `${talent.name} ${RANK_LABEL[state.level] ?? ''}`.trim();
  if (talent.kind === 'PASSIVE') {
    return (
      <Tip title={`${title} · ${t('Passive')}`} body={level.description}>
        <span className={`hero-power is-passive ${flash ? 'is-flash' : ''}`} data-slot={slot} role="img" aria-label={`${t('Passive Warden ability: {title}.', { title })} ${level.description}`}>
          <Glyph name={glyph} size={20} />
        </span>
      </Tip>
    );
  }
  const active = talent.levels[state.level];
  const usable = player === HUMAN && canUseHeroPower(game, player, slot).ok;
  const recharging = (state.cooldown ?? 0) > 0;
  const used = state.uses >= (active.usesPerTurn ?? 1) || recharging;
  return (
    <Tip title={`${title} · ${t('Active ({cost})', { cost: active.cost })}`} body={active.description}>
      <button
        data-tutorial={tutorial ? 'sigil' : undefined}
        data-slot={slot}
        className={`hero-power ${usable ? 'is-usable' : ''} ${used ? 'is-used' : ''} ${selected ? 'is-selected' : ''}`}
        onClick={player === HUMAN ? () => click(slot) : undefined}
        disabled={player !== HUMAN}
        aria-label={`${t('Warden ability: {title}, costs {cost}.', { title, cost: active.cost })} ${active.description}${recharging ? ` ${t('Recharging: usable again next turn')}.` : used ? ` ${t('Already used this turn.')}` : ''}`}
      >
        <Glyph name={glyph} size={22} />
        <span className="hero-power-cost num">{active.cost}</span>
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
          <div className="permanent location" data-card-id={p.location.cardId} onMouseEnter={() => onHover(p.location!.cardId)} onMouseLeave={() => onHover(null)}>
            <img src={cardArtUri(getCardSafe(p.location.cardId))} alt="" />
            {p.location.turnsRemaining !== null && <span className="perm-count num">{p.location.turnsRemaining}</span>}
          </div>
        </Tip>
      )}
      {p.relics.map((r) => (
        <Tip key={r.uid} title={getCardSafe(r.cardId).name} body={getCardSafe(r.cardId).description ?? ''}>
          <div className="permanent relic" data-card-id={r.cardId} onMouseEnter={() => onHover(r.cardId)} onMouseLeave={() => onHover(null)}>
            <img src={cardArtUri(getCardSafe(r.cardId))} alt="" />
            {r.charges !== null && <span className="perm-count num">{r.charges}</span>}
          </div>
        </Tip>
      ))}
    </div>
  );
}

/** The draw pile: a stack of card backs that gets thinner as cards are drawn from it. */
export function DrawPile({ count, label, player, width, design }: { count: number; label: string; player: PlayerId; width: number; design?: string | null }) {
  // One visible layer per ~3 cards, so the stack visibly shrinks over the game.
  const layers = count === 0 ? 0 : Math.min(10, Math.ceil(count / 3));
  return (
    <div className={`draw-pile ${count === 0 ? 'is-empty' : ''}`} data-draw-pile={player} title={t(`{count} cards in ${label}`, { count })} aria-label={t(`{count} cards in ${label}`, { count })} style={{ '--pile-w': `${width}px`, '--layers': layers } as CSSProperties}>
      <div className="draw-pile-stack" aria-hidden>
        {count === 0 && <span className="draw-pile-slot">{t('Empty')}</span>}
        {Array.from({ length: layers }, (_, i) => (
          <CardBack key={i} width={width} design={design} className="draw-pile-card" style={{ '--layer': i } as CSSProperties} />
        ))}
        <span className="draw-pile-count num">{count}</span>
      </div>
    </div>
  );
}

export function EmpowerBadge({ game, player }: { game: GameState; player: PlayerId }) {
  const n = empower(game, player);
  if (!n) return null;
  return (
    <Tip title={`${KEYWORDS.EMPOWER.name} ${n}`} body={KEYWORDS.EMPOWER.definition} className="chip empower-chip">
      ✦ +{n}
    </Tip>
  );
}

export function useHoverCard() {
  return useState<string | null>(null);
}
