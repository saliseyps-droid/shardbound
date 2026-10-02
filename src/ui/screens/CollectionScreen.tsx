import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { collectibleCards } from '@/data/cards';
import { ALL_FACTIONS, type CardDefinition } from '@/game/types';
import { maxCopiesFor } from '@/domain/decks';
import { totalSurplusValue } from '@/domain/economy';
import { ownedCopies } from '@/domain/save';
import { gameService, useAccount } from '@/state/accountStore';
import { toast, useUi } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { CardView } from '@/ui/components/CardView';
import { confirmDialog, Essence, ScreenHeader } from '@/ui/components/common';
import { VirtualCardGrid } from '@/ui/components/collection/VirtualCardGrid';
import { CardFilterBar } from '@/ui/components/collection/CardFilterBar';
import { DEFAULT_FILTERS, filterCards, type CardFilterState } from '@/ui/components/collection/cardFilters';
import { CardDetailPanel, bestVariant } from '@/ui/components/collection/CardDetailPanel';
import { CollectionStats } from '@/ui/components/collection/CollectionStats';
import { useCardWidth } from '@/ui/components/collection/useCardWidth';
import '@/ui/styles/collection.css';

const BADGE_H = 34;

export default function CollectionScreen() {
  const save = useAccount((s) => s.save);
  const collection = save?.collection;
  const [filters, setFilters] = useState<CardFilterState>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<string | null>(null);
  const cardWidth = useCardWidth();
  const cardHeight = Math.round(cardWidth * 1.4) + BADGE_H;

  // NEW badges stay visible during this visit; they are cleared when leaving.
  const unseenAtOpen = useRef<string[]>(collection?.unseen ?? []);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Deferred so StrictMode's mount/unmount/mount cycle doesn't clear badges immediately.
      setTimeout(() => {
        const seen = unseenAtOpen.current;
        if (!mounted.current && seen.length > 0 && gameService.current) gameService.markSeen(seen);
      }, 0);
    };
  }, []);
  useEffect(() => {
    for (const id of collection?.unseen ?? []) if (!unseenAtOpen.current.includes(id)) unseenAtOpen.current.push(id);
  }, [collection?.unseen]);

  const owned = useCallback((id: string) => (collection ? ownedCopies(collection, id) : 0), [collection]);
  const cards = useMemo(() => filterCards(collectibleCards(), filters, owned), [filters, owned]);
  const surplus = useMemo(() => (save ? totalSurplusValue(save) : { cards: 0, essence: 0 }), [save]);

  if (!save || !collection) return null;
  const unseen = new Set(collection.unseen);

  const select = (id: string) => {
    audio.play('click');
    setSelected(id);
    if (unseen.has(id)) gameService.markSeen([id]);
  };

  const recycleSurplus = async () => {
    const ok = await confirmDialog({
      title: 'Recycle all surplus cards?',
      message: (
        <p>
          Recycles {surplus.cards} card{surplus.cards === 1 ? '' : 's'} you own beyond the playable limit for <strong>{surplus.essence} Essence</strong>. Foil and prismatic copies are kept first. This can't be undone.
        </p>
      ),
      confirmLabel: `Recycle for ${surplus.essence} Essence`,
      danger: true,
    });
    if (!ok) return;
    const res = gameService.recycleSurplus();
    audio.play('coin');
    toast(`Recycled ${res.cards} surplus card${res.cards === 1 ? '' : 's'} for ${res.essence} Essence.`, 'success');
  };

  const renderCard = (card: CardDefinition) => {
    const counts = collection.cards[card.id];
    const n = owned(card.id);
    const max = maxCopiesFor(card);
    return (
      <div className={`coll-item ${selected === card.id ? 'is-active' : ''}`}>
        <CardView
          card={card}
          width={cardWidth}
          variant={bestVariant(counts)}
          dimmed={n === 0}
          selected={selected === card.id}
          onClick={() => select(card.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            useUi.getState().inspectCard(card.id, bestVariant(counts));
          }}
          ariaLabel={`${card.name}, owned ${n} of ${max}${unseen.has(card.id) ? ', new' : ''}`}
        >
          {unseen.has(card.id) && <span className="badge-new coll-new">New</span>}
        </CardView>
        <div className={`owned-badge ${n === 0 ? 'none' : n >= max ? 'full' : ''}`} aria-hidden>
          <span className="pips">
            {Array.from({ length: max }, (_, i) => (
              <span key={i} className={i < n ? 'pip on' : 'pip'} />
            ))}
          </span>
          <span className="num">
            {n} / {max}
          </span>
          {n > max && <span className="extra num">+{n - max}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="screen collection-screen">
      <ScreenHeader
        title="Collection"
        subtitle={`${cards.length} card${cards.length === 1 ? '' : 's'} shown. Right-click a card to inspect it.`}
        actions={
          <>
            <Essence amount={save.profile.essence} />
            <button className="btn btn-sm" disabled={surplus.cards === 0} onClick={() => void recycleSurplus()} title="Recycle copies beyond the playable limit">
              Recycle surplus{surplus.cards > 0 ? ` (${surplus.cards})` : ''}
            </button>
          </>
        }
      />
      <CardFilterBar value={filters} onChange={setFilters} factions={ALL_FACTIONS} />
      <div className="collection-body">
        <VirtualCardGrid
          items={cards}
          itemWidth={cardWidth}
          itemHeight={cardHeight}
          gap={18}
          getKey={(c) => c.id}
          renderItem={renderCard}
          className="collection-grid"
          ariaLabel="Cards"
          empty={
            <div className="empty">
              <p>No cards match these filters.</p>
              <button className="btn btn-sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </button>
            </div>
          }
        />
        <div className={`collection-side ${selected ? 'has-detail' : ''}`}>
          {selected ? <CardDetailPanel cardId={selected} onClose={() => setSelected(null)} /> : <CollectionStats collection={collection} />}
        </div>
      </div>
    </div>
  );
}
