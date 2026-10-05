import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { DECK_RULES } from '@/config/gameRules';
import { collectibleCards, getCard } from '@/data/cards';
import { FACTIONS } from '@/data/factions';
import { defaultBuild, talentSummary } from '@/data/wardenTalents';
import { PLAYABLE_FACTIONS, type CardDefinition, type Faction, type PlayableFaction } from '@/game/types';
import { autoBuildDeck, canAddCard, deckFactions, deckSize, deckStats, maxCopiesFor, validateDeck, type Deck } from '@/domain/decks';
import { ownedCopies } from '@/domain/save';
import { gameService, useAccount } from '@/state/accountStore';
import { toast, useUi } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { CardView, isTouchScreen } from '@/ui/components/CardView';
import { confirmDialog, Essence, ScreenHeader } from '@/ui/components/common';
import { craftCost } from '@/domain/economy';
import { Glyph } from '@/ui/components/Icons';
import { WardenPortrait } from '@/ui/components/WardenPortrait';
import { TalentTree } from '@/ui/components/TalentTree';
import { ShareDeckModal } from '@/ui/components/DeckCodeDialogs';
import { PortraitPicker, portraitName } from '@/ui/components/PortraitPicker';
import { DEFAULT_PORTRAIT, effectivePortrait } from '@/domain/portraits';
import { VirtualCardGrid } from '@/ui/components/collection/VirtualCardGrid';
import { CardFilterBar } from '@/ui/components/collection/CardFilterBar';
import { DEFAULT_FILTERS, filterCards, type CardFilterState } from '@/ui/components/collection/cardFilters';
import { bestVariant } from '@/ui/components/collection/CardDetailPanel';
import { useCardWidth } from '@/ui/components/collection/useCardWidth';
import { t, tn } from '@/i18n';
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
    <div className="mana-curve" role="img" aria-label={t('Mana curve: {list}', { list: curve.map((n, i) => t('{n} at cost {cost}', { n, cost: i === 7 ? '7+' : i })).join(', ') })}>
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

const PREVIEW_W = 240;

/** Large card shown to the left of the hovered deck-list row, kept inside the window. */
function DeckRowPreview({ id, rect, variant }: { id: string; rect: DOMRect; variant: ReturnType<typeof bestVariant> }) {
  const h = PREVIEW_W * 1.4;
  const top = Math.max(8, Math.min(window.innerHeight - h - 8, rect.top + rect.height / 2 - h / 2));
  const left = Math.max(8, rect.left - PREVIEW_W - 16);
  // Portal: the deck panel's clip-path would cut off anything drawn outside it.
  return createPortal(
    <div className="deck-row-preview" style={{ top, left }} aria-hidden>
      <CardView card={id} width={PREVIEW_W} variant={variant} />
    </div>,
    document.body,
  );
}

export default function DeckEditorScreen() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const saved = useAccount((s) => s.save?.decks.find((d) => d.id === deckId));
  const collection = useAccount((s) => s.save?.collection);
  const [draft, setDraft] = useState<Deck | null>(saved ?? null);
  const [filters, setFilters] = useState<CardFilterState>({ ...DEFAULT_FILTERS, ownership: 'OWNED' });
  const [tab, setTab] = useState<'cards' | 'talents'>('cards');
  const [sharing, setSharing] = useState(false);
  /** Deck-list row under the mouse: shown as a large card beside the list (mouse only). */
  const [hoverRow, setHoverRow] = useState<{ id: string; rect: DOMRect } | null>(null);
  const profileForPortraits = useAccount((st) => st.save!.profile);
  const cardWidth = useCardWidth(0.86);

  // Adopt the saved deck when it first becomes available (or after a save elsewhere).
  useEffect(() => {
    if (saved && (!draft || draft.id !== saved.id)) setDraft(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.id]);

  const owned = useCallback((id: string) => (collection ? ownedCopies(collection, id) : 0), [collection]);
  const essence = useAccount((s) => s.save?.profile.essence ?? 0);
  const second = draft ? deckFactions(draft).find((f) => f !== draft.heroFaction) ?? null : null;
  const allowed: Faction[] = useMemo(() => {
    if (!draft) return [];
    // Only the Warden faction and Neutral cards can go into a deck.
    return [draft.heroFaction, 'NEUTRAL'];
  }, [draft?.heroFaction, second]); // eslint-disable-line react-hooks/exhaustive-deps
  const pool = useMemo(() => filterCards(collectibleCards(), filters, owned, allowed), [filters, owned, allowed]);
  const issues = useMemo(() => (draft ? validateDeck(draft, owned) : []), [draft, owned]);
  const stats = useMemo(() => deckStats(draft ?? { cards: {} }), [draft]);

  const dirty = !!draft && !!saved && (draft.name !== saved.name || draft.heroFaction !== saved.heroFaction || !sameCards(draft.cards, saved.cards) || JSON.stringify(draft.talents) !== JSON.stringify(saved.talents));

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
          <p>{t('This deck no longer exists.')}</p>
          <button className="btn" onClick={() => navigate('/decks')}>
            {t('Back to decks')}
          </button>
        </div>
      </div>
    );
  }

  const size = deckSize(draft);
  const factionsOrder: Faction[] = [draft.heroFaction, ...PLAYABLE_FACTIONS.filter((f) => f !== draft.heroFaction), 'NEUTRAL'];
  const disabledFactions = second ? PLAYABLE_FACTIONS.filter((f) => f !== draft.heroFaction && f !== second) : [];

  /** Crafts one normal copy without leaving the editor, then adds it to the deck if it fits. */
  const craftAndAdd = (card: CardDefinition) => {
    const res = gameService.craft(card.id, 'NORMAL');
    if (!res.ok) {
      audio.play('error');
      toast(t(res.error), 'error');
      return;
    }
    const fits = !canAddCard(draft, card.id, owned(card.id) + 1);
    if (fits) setDraft({ ...draft, cards: { ...draft.cards, [card.id]: (draft.cards[card.id] ?? 0) + 1 } });
    toast(fits ? t('Crafted {name} and added it to the deck.', { name: card.name }) : t('Crafted normal {name}.', { name: card.name }), 'success');
  };

  const add = (card: CardDefinition) => {
    const reason = canAddCard(draft, card.id, owned(card.id));
    if (reason) {
      audio.play('error');
      toast(t('{name}: {reason}.', { name: card.name, reason: t(reason) }), 'error');
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
      toast(issues.length === 0 ? t('Saved {name}.', { name: res.value.name }) : t("Saved {name}. It can't be played until it's complete.", { name: res.value.name }), issues.length === 0 ? 'success' : 'info');
    } else toast(res.error, 'error');
    return res.ok;
  };

  const leave = async (to: string) => {
    if (dirty) {
      const discard = await confirmDialog({
        title: t('Leave without saving?'),
        message: <p>{t('You have unsaved changes to {name}.', { name: draft.name })}</p>,
        confirmLabel: t('Discard changes'),
        cancelLabel: t('Keep editing'),
        danger: true,
      });
      if (!discard) return;
    }
    navigate(to);
  };

  const autoComplete = () => {
    if (size >= DECK_RULES.deckSize) return toast(t('The deck is already full.'));
    const cards = autoBuildDeck({ heroFaction: draft.heroFaction, owned, base: draft.cards, seed: Date.now() >>> 0 });
    const added = deckSize({ cards }) - size;
    setDraft({ ...draft, cards });
    audio.play('buff');
    toast(added > 0 ? tn(added, 'Added {n} card from your collection.', 'Added {n} cards from your collection.') : t('No more owned cards fit this deck.'));
  };

  const clear = async () => {
    const ok = await confirmDialog({ title: t('Remove all cards?'), message: <p>{t('The deck list will be emptied. Nothing is saved until you choose Save.')}</p>, confirmLabel: t('Clear deck'), danger: true });
    if (ok) setDraft({ ...draft, cards: {} });
  };

  const playWith = async () => {
    if (dirty && !save()) return;
    if (validateDeck({ ...draft }, owned).length > 0) {
      toast(t('Finish the deck before playing with it.'), 'error');
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
          ariaLabel={t('Add {name}. {inDeck} in deck, {have} owned.', { name: card.name, inDeck, have }) + (blocked ? ` ${t(blocked)}.` : '')}
        />
        <div className={`owned-badge ${inDeck > 0 ? 'full' : have === 0 ? 'none' : ''}`} aria-hidden>
          <span className="num">
            {inDeck} / {limit}
          </span>{" "}
          {t('in deck')}
        </div>
        {/* Missing copies can be crafted right here instead of going back to the collection. */}
        {have < maxCopiesFor(card) && Number.isFinite(craftCost(card.id)) && (
          <button
            type="button"
            className={`btn btn-sm deck-craft-btn ${have === 0 ? 'is-missing' : ''}`}
            style={{ top: Math.round(cardWidth * 1.4) - 40 }}
            disabled={essence < craftCost(card.id)}
            title={essence < craftCost(card.id) ? t('Not enough Essence') : t('Craft one copy and add it to the deck')}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              craftAndAdd(card);
            }}
          >
            {t('Craft')} <Essence amount={craftCost(card.id)} size={13} />
          </button>
        )}
      </div>
    );
  };

  const hero = FACTIONS[draft.heroFaction];

  return (
    <div className="screen deck-editor-screen" style={{ '--fc': hero.colors.primary } as CSSProperties}>
      {sharing && <ShareDeckModal deck={draft} onClose={() => setSharing(false)} />}
      <ScreenHeader
        title={draft.name || t('Untitled deck')}
        subtitle={
          <>
            {isTouchScreen()
              ? t('Tap a card to add it, tap a list entry to remove it, long-press a card to inspect it.')
              : t('Click a card to add it, click a list entry to remove it, right-click to inspect.')}
            {dirty && <span className="unsaved"> {t('Unsaved changes')}</span>}
          </>
        }
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => void leave('/decks')}>
              {t('Back to decks')}
            </button>
            <button className="btn" onClick={() => setSharing(true)}>
              {t('Share')}
            </button>
            <button className="btn btn-cyan" onClick={() => void playWith()}>
              {t('Play with this deck')}
            </button>
            <button className="btn btn-primary" onClick={save} disabled={!dirty}>
              {t('Save')}
            </button>
          </>
        }
      />
      <div className="editor-body">
        <section className={`editor-pool ${tab === 'talents' ? 'is-talents' : ''}`} aria-label={tab === 'cards' ? t('Card pool') : t('Warden talents')}>
          <div className="editor-tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'cards'} className={`editor-tab ${tab === 'cards' ? 'is-active' : ''}`} onClick={() => setTab('cards')}>
              {t('Cards')}
            </button>
            <button role="tab" aria-selected={tab === 'talents'} className={`editor-tab ${tab === 'talents' ? 'is-active' : ''}`} onClick={() => setTab('talents')}>
              {t('Talents')} {issues.some((i) => i.code === 'TALENTS') && <span className="tab-warn" aria-label={t('incomplete')}>!</span>}
            </button>
          </div>
          {tab === 'talents' ? (
            <TalentTree faction={draft.heroFaction} build={draft.talents} onChange={(talents) => setDraft({ ...draft, talents })} />
          ) : (
          <>
          <CardFilterBar
            value={filters}
            onChange={setFilters}
            factions={factionsOrder}
            disabledFactions={disabledFactions}
            ownershipLabels={{ ALL: t('All cards'), OWNED: t('Owned only'), MISSING: t('Missing only') }}
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
            ariaLabel={t('Available cards')}
            empty={
              <div className="empty">
                <p>{t('No cards match. Try showing all cards or clearing filters.')}</p>
              </div>
            }
          />
          </>
          )}
        </section>

        <aside className="editor-side panel" aria-label={t('Deck list')}>
          <label className="field">
            <span>{t('Name')}</span>
            <input className="input" value={draft.name} maxLength={DECK_RULES.maxDeckNameLength} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label className="field">
            <span>{t('Warden faction')}</span>
            <select className="select" value={draft.heroFaction} onChange={(e) => setDraft({ ...draft, heroFaction: e.target.value as PlayableFaction, talents: defaultBuild(e.target.value as PlayableFaction) })}>
              {PLAYABLE_FACTIONS.map((f) => (
                <option key={f} value={f}>
                  {FACTIONS[f].name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="talent-summary" style={{ '--f1': hero.colors.primary } as CSSProperties} onClick={() => setTab('talents')}>
            <WardenPortrait faction={draft.heroFaction} portrait={effectivePortrait(draft, profileForPortraits)} size={44} />
            <span className="talent-summary-text">
              <strong>{t('Warden abilities')}</strong>
              <span>{draft.talents.length ? talentSummary(draft.talents) : t('None chosen yet')}</span>
            </span>
          </button>
          <details className="deck-portrait">
            <summary>
              {t('Portrait')}: <strong>{portraitName(effectivePortrait(draft, profileForPortraits))}</strong>
            </summary>
            <PortraitPicker
              faction={draft.heroFaction}
              owned={profileForPortraits.portraits}
              value={draft.portrait === DEFAULT_PORTRAIT ? null : (draft.portrait ?? 'profile')}
              leading={[{ value: 'profile', portrait: profileForPortraits.factionPortraits[draft.heroFaction] ?? null, label: t('Same as in Profile') }]}
              onChange={(v) => setDraft({ ...draft, portrait: v === 'profile' ? null : v === null ? DEFAULT_PORTRAIT : v })}
            />
          </details>
          <div className="deck-meta">
            <span className={`deck-size ${size === DECK_RULES.deckSize ? 'ok' : ''}`}>
              <span className="num">
                {size} / {DECK_RULES.deckSize}
              </span>{" "}
              {t('cards')}
            </span>
            <span className="faint">
              {t('Average cost')} <span className="num">{stats.averageCost.toFixed(1)}</span>
            </span>
          </div>
          <div className="bar gold" aria-hidden>
            <span style={{ width: `${Math.min(100, (size / DECK_RULES.deckSize) * 100)}%` }} />
          </div>

          {issues.length > 0 ? (
            <ul className="issue-list" aria-live="polite">
              {issues.map((i) => (
                <li key={i.code + (i.cardId ?? '')}>
                  <span aria-hidden>!</span> {t(i.message)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="valid-line" aria-live="polite">
              <Glyph name="shield" size={14} /> {t('Ready to play')}
            </p>
          )}

          <ManaCurve curve={stats.curve} />
          <div className="type-stats">
            {Object.entries(TYPE_LABEL).map(([type, label]) => (
              <span key={type} className="chip">
                {t(label)} <strong className="num">{stats.types[type] ?? 0}</strong>
              </span>
            ))}
          </div>

          <ol className="deck-rows">
            {rows.length === 0 && <li className="empty small">{t('Add cards from the pool to build your deck.')}</li>}
            {rows.map(({ card, n }) => (
              <li key={card.id}>
                <button
                  className={`deck-row rarity-${card.rarity.toLowerCase()}`}
                  style={{ '--rc': FACTIONS[card.faction].colors.primary } as CSSProperties}
                  onClick={() => remove(card.id)}
                  onMouseEnter={(e) => !isTouchScreen() && setHoverRow({ id: card.id, rect: e.currentTarget.getBoundingClientRect() })}
                  onMouseLeave={() => setHoverRow(null)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    useUi.getState().inspectCard(card.id);
                  }}
                  aria-label={t('Remove one {name}, {n} in deck', { name: card.name, n })}
                >
                  <span className="row-cost num">{card.manaCost}</span>
                  <span className="row-name">{card.name}</span>
                  {n > owned(card.id) && <span className="row-warn" title={t('Not enough copies owned')}>!</span>}
                  <span className="row-count num">×{n}</span>
                </button>
              </li>
            ))}
          </ol>

          {hoverRow && rows.some((r) => r.card.id === hoverRow.id) && <DeckRowPreview id={hoverRow.id} rect={hoverRow.rect} variant={bestVariant(collection.cards[hoverRow.id])} />}

          <div className="editor-actions">
            <button className="btn btn-sm" onClick={autoComplete} disabled={size >= DECK_RULES.deckSize}>
              {t('Auto-complete')}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => void clear()} disabled={size === 0}>
              {t('Clear')}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setDraft(saved)} disabled={!dirty}>
              {t('Revert')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

