import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DECK_RULES } from '@/config/gameRules';
import { collectibleCards, getCard } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { FACTION_HERO_POWER, getHeroPower } from '@/data/heroPowers';
import { PLAYABLE_FACTIONS, type CardDefinition, type Faction, type PlayableFaction } from '@/game/types';
import { autoBuildDeck, canAddCard, deckFactions, deckSize, deckStats, maxCopiesFor, validateDeck, type Deck } from '@/domain/decks';
import { ownedCopies } from '@/domain/save';
import { gameService, useAccount } from '@/state/accountStore';
import { toast, useUi } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { CardView } from '@/ui/components/CardView';
import { confirmDialog, ScreenHeader } from '@/ui/components/common';
import { Glyph } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { VirtualCardGrid } from '@/ui/components/collection/VirtualCardGrid';
import { CardFilterBar } from '@/ui/components/collection/CardFilterBar';
import { DEFAULT_FILTERS, filterCards, type CardFilterState } from '@/ui/components/collection/cardFilters';
import { bestVariant } from '@/ui/components/collection/CardDetailPanel';
import { useCardWidth } from '@/ui/components/collection/useCardWidth';
import '@/ui/styles/collection.css';
import '@/ui/styles/decks.css';

const TYPE_LABEL: Record<string, string> = { UNIT: 'Units', SPELL: 'Spells', RELIC: 'Relics', LOCATION: 'Locations' };

function sameCards(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  return true;
}

function ManaCurve({ curve }: { curve: number[] }) {
  const max = Math.max(4, ...curve);
  return (
    <div className="mana-curve" role="img" aria-label={`Mana curve: ${curve.map((n, i) => `${n} at cost ${i === 7 ? '7+' : i}`).join(', ')}`}>
      {curve.map((n, i) => (
        <div key={i} className="curve-col">
          <span className="curve-n num">{n || ''}</span>
          <span className="curve-track">
            <span className="curve-bar" style={{ height: `${(n / max) * 100}%` }} />
          </span>
          <span className="curve-cost num">{i === 7 ? '7+' : i}</span>
        </div>
      ))}
    </div>
  );
}

export default function DeckEditorScreen() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const saved = useAccount((s) => s.save?.decks.find((d) => d.id === deckId));
  const collection = useAccount((s) => s.save?.collection);
  const [draft, setDraft] = useState<Deck | null>(saved ?? null);
  const [filters, setFilters] = useState<CardFilterState>({ ...DEFAULT_FILTERS, ownership: 'OWNED' });
  const cardWidth = useCardWidth(0.86);

  // Adopt the saved deck when it first becomes available (or after a save elsewhere).
  useEffect(() => {
    if (saved && (!draft || draft.id !== saved.id)) setDraft(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.id]);

  const owned = useCallback((id: string) => (collection ? ownedCopies(collection, id) : 0), [collection]);
  const second = draft ? deckFactions(draft).find((f) => f !== draft.heroFaction) ?? null : null;
  const allowed: Faction[] = useMemo(() => {
    if (!draft) return [];
    return second ? [draft.heroFaction, second, 'NEUTRAL'] : [...PLAYABLE_FACTIONS, 'NEUTRAL'];
  }, [draft?.heroFaction, second]); // eslint-disable-line react-hooks/exhaustive-deps
  const pool = useMemo(() => filterCards(collectibleCards(), filters, owned, allowed), [filters, owned, allowed]);
  const issues = useMemo(() => (draft ? validateDeck(draft, owned) : []), [draft, owned]);
  const stats = useMemo(() => deckStats(draft ?? { cards: {} }), [draft]);

  const dirty = !!draft && !!saved && (draft.name !== saved.name || draft.heroFaction !== saved.heroFaction || !sameCards(draft.cards, saved.cards));

  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  if (!saved || !draft || !collection) {
    return (
      <div className="screen">
        <div className="panel empty">
          <p>This deck no longer exists.</p>
          <button className="btn" onClick={() => navigate('/decks')}>
            Back to decks
          </button>
        </div>
      </div>
    );
  }

  const size = deckSize(draft);
  const factionsOrder: Faction[] = [draft.heroFaction, ...PLAYABLE_FACTIONS.filter((f) => f !== draft.heroFaction), 'NEUTRAL'];
  const disabledFactions = second ? PLAYABLE_FACTIONS.filter((f) => f !== draft.heroFaction && f !== second) : [];

  const add = (card: CardDefinition) => {
    const reason = canAddCard(draft, card.id, owned(card.id));
    if (reason) {
      audio.play('error');
      toast(`${card.name}: ${reason}.`, 'error');
      return;
    }
    audio.play('draw');
    setDraft({ ...draft, cards: { ...draft.cards, [card.id]: (draft.cards[card.id] ?? 0) + 1 } });
  };

  const remove = (id: string) => {
    const n = (draft.cards[id] ?? 0) - 1;
    const cards = { ...draft.cards };
    if (n <= 0) delete cards[id];
    else cards[id] = n;
    audio.play('click');
    setDraft({ ...draft, cards });
  };

  const save = () => {
    const res = gameService.updateDeck(draft);
    if (res.ok) {
      audio.play('coin');
      setDraft(res.value);
      toast(issues.length === 0 ? `Saved ${res.value.name}.` : `Saved ${res.value.name}. It can't be played until it's complete.`, issues.length === 0 ? 'success' : 'info');
    } else toast(res.error, 'error');
    return res.ok;
  };

  const leave = async (to: string) => {
    if (dirty) {
      const discard = await confirmDialog({
        title: 'Leave without saving?',
        message: <p>You have unsaved changes to {draft.name}.</p>,
        confirmLabel: 'Discard changes',
        cancelLabel: 'Keep editing',
        danger: true,
      });
      if (!discard) return;
    }
    navigate(to);
  };

  const autoComplete = () => {
    if (size >= DECK_RULES.deckSize) return toast('The deck is already full.');
    const cards = autoBuildDeck({ heroFaction: draft.heroFaction, secondFaction: second, owned, base: draft.cards, seed: Date.now() >>> 0 });
    const added = deckSize({ cards }) - size;
    setDraft({ ...draft, cards });
    audio.play('buff');
    toast(added > 0 ? `Added ${added} card${added === 1 ? '' : 's'} from your collection.` : 'No more owned cards fit this deck.');
  };

  const clear = async () => {
    const ok = await confirmDialog({ title: 'Remove all cards?', message: <p>The deck list will be emptied. Nothing is saved until you choose Save.</p>, confirmLabel: 'Clear deck', danger: true });
    if (ok) setDraft({ ...draft, cards: {} });
  };

  const playWith = async () => {
    if (dirty && !save()) return;
    if (validateDeck({ ...draft }, owned).length > 0) {
      toast('Finish the deck before playing with it.', 'error');
      return;
    }
    gameService.selectDeck(draft.id);
    navigate('/play');
  };

  const rows = Object.entries(draft.cards)
    .map(([id, n]) => ({ card: getCard(id), n }))
    .filter((r): r is { card: CardDefinition; n: number } => !!r.card && r.n > 0)
    .sort((a, b) => a.card.manaCost - b.card.manaCost || a.card.name.localeCompare(b.card.name));

  const renderPoolCard = (card: CardDefinition) => {
    const inDeck = draft.cards[card.id] ?? 0;
    const have = owned(card.id);
    const limit = Math.min(maxCopiesFor(card), have);
    const blocked = canAddCard(draft, card.id, have);
    return (
      <div className="coll-item">
        <CardView
          card={card}
          width={cardWidth}
          variant={bestVariant(collection.cards[card.id])}
          dimmed={have === 0 || (!!blocked && blocked !== 'Deck is full' && inDeck === 0)}
          onClick={() => add(card)}
          onContextMenu={(e) => {
            e.preventDefault();
            useUi.getState().inspectCard(card.id);
          }}
          ariaLabel={`Add ${card.name}. ${inDeck} in deck, ${have} owned.${blocked ? ` ${blocked}.` : ''}`}
        />
        <div className={`owned-badge ${inDeck > 0 ? 'full' : have === 0 ? 'none' : ''}`} aria-hidden>
          <span className="num">
            {inDeck} / {limit}
          </span>{" "}
          in deck
        </div>
      </div>
    );
  };

  const hero = FACTIONS[draft.heroFaction];

  return (
    <div className="screen deck-editor-screen" style={{ '--fc': hero.colors.primary } as CSSProperties}>
      <ScreenHeader
        title={draft.name || 'Untitled deck'}
        subtitle={
          <>
            Click a card to add it, click a list entry to remove it, right-click to inspect.
            {dirty && <span className="unsaved"> Unsaved changes</span>}
          </>
        }
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => void leave('/decks')}>
              Back to decks
            </button>
            <button className="btn btn-cyan" onClick={() => void playWith()}>
              Play with this deck
            </button>
            <button className="btn btn-primary" onClick={save} disabled={!dirty}>
              Save
            </button>
          </>
        }
      />
      <div className="editor-body">
        <section className="editor-pool" aria-label="Card pool">
          <CardFilterBar
            value={filters}
            onChange={setFilters}
            factions={factionsOrder}
            disabledFactions={disabledFactions}
            ownershipLabels={{ ALL: 'All cards', OWNED: 'Owned only', MISSING: 'Missing only' }}
            compact
          />
          <VirtualCardGrid
            items={pool}
            itemWidth={cardWidth}
            itemHeight={Math.round(cardWidth * 1.4) + 32}
            gap={16}
            getKey={(c) => c.id}
            renderItem={renderPoolCard}
            className="collection-grid"
            ariaLabel="Available cards"
            empty={
              <div className="empty">
                <p>No cards match. Try showing all cards or clearing filters.</p>
              </div>
            }
          />
        </section>

        <aside className="editor-side panel" aria-label="Deck list">
          <label className="field">
            <span>Name</span>
            <input className="input" value={draft.name} maxLength={DECK_RULES.maxDeckNameLength} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label className="field">
            <span>Warden faction</span>
            <select className="select" value={draft.heroFaction} onChange={(e) => setDraft({ ...draft, heroFaction: e.target.value as PlayableFaction })}>
              {PLAYABLE_FACTIONS.map((f) => (
                <option key={f} value={f}>
                  {FACTIONS[f].name}
                </option>
              ))}
            </select>
          </label>
          <WardenSigilInfo faction={draft.heroFaction} />
          <div className="deck-meta">
            <span className={`deck-size ${size === DECK_RULES.deckSize ? 'ok' : ''}`}>
              <span className="num">
                {size} / {DECK_RULES.deckSize}
              </span>{" "}
              cards
            </span>
            <span className="faint">
              Average cost <span className="num">{stats.averageCost.toFixed(1)}</span>
            </span>
          </div>
          <div className="bar gold" aria-hidden>
            <span style={{ width: `${Math.min(100, (size / DECK_RULES.deckSize) * 100)}%` }} />
          </div>

          {issues.length > 0 ? (
            <ul className="issue-list" aria-live="polite">
              {issues.map((i) => (
                <li key={i.code + (i.cardId ?? '')}>
                  <span aria-hidden>!</span> {i.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="valid-line" aria-live="polite">
              <Glyph name="shield" size={14} /> Ready to play
            </p>
          )}

          <ManaCurve curve={stats.curve} />
          <div className="type-stats">
            {Object.entries(TYPE_LABEL).map(([t, label]) => (
              <span key={t} className="chip">
                {label} <strong className="num">{stats.types[t] ?? 0}</strong>
              </span>
            ))}
          </div>

          <ol className="deck-rows">
            {rows.length === 0 && <li className="empty small">Add cards from the pool to build your deck.</li>}
            {rows.map(({ card, n }) => (
              <li key={card.id}>
                <button
                  className={`deck-row rarity-${card.rarity.toLowerCase()}`}
                  style={{ '--rc': FACTIONS[card.faction].colors.primary } as CSSProperties}
                  onClick={() => remove(card.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    useUi.getState().inspectCard(card.id);
                  }}
                  aria-label={`Remove one ${card.name}, ${n} in deck`}
                >
                  <span className="row-cost num">{card.manaCost}</span>
                  <span className="row-name">{card.name}</span>
                  {n > owned(card.id) && <span className="row-warn" title="Not enough copies owned">!</span>}
                  <span className="row-count num">×{n}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="editor-actions">
            <button className="btn btn-sm" onClick={autoComplete} disabled={size >= DECK_RULES.deckSize}>
              Auto-complete
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => void clear()} disabled={size === 0}>
              Clear
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setDraft(saved)} disabled={!dirty}>
              Revert
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Shows the Warden Sigil (hero power) that the chosen Warden faction grants. */
function WardenSigilInfo({ faction }: { faction: PlayableFaction }) {
  const power = getHeroPower(FACTION_HERO_POWER[faction]);
  if (!power) return null;
  return (
    <div className="sigil-info" style={{ '--f1': FACTIONS[faction].colors.primary } as CSSProperties}>
      <WardenPortrait faction={faction} size={52} />
      <span className="sigil-gem" aria-hidden>
        <Glyph name="crystal" size={18} />
        <span className="sigil-cost num">{power.cost}</span>
      </span>
      <span className="sigil-text">
        <strong>Warden Sigil: {power.name}</strong>
        <span>
          {power.description} Costs {power.cost} energy, once per turn.
        </span>
      </span>
    </div>
  );
}
