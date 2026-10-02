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
import { t, tn } from '@/i18n';
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
      title: t('Recycle all surplus cards?'),
      message: (
        <p>
          {tn(surplus.cards, 'Recycles {n} card you own beyond the playable limit for', 'Recycles {n} cards you own beyond the playable limit for')} <strong>{t('{n} Essence', { n: surplus.essence })}</strong>. {t("Foil and prismatic copies are kept first. This can't be undone.")}
        </p>
      ),
      confirmLabel: t('Recycle for {n} Essence', { n: surplus.essence }),
      danger: true,
    });
    if (!ok) return;
    const res = gameService.recycleSurplus();
    audio.play('coin');
    toast(tn(res.cards, 'Recycled {n} surplus card for {essence} Essence.', 'Recycled {n} surplus cards for {essence} Essence.', { essence: res.essence }), 'success');
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
          ariaLabel={t('{name}, owned {n} of {max}', { name: card.name, n, max }) + (unseen.has(card.id) ? t(', new') : '')}
        >
          {unseen.has(card.id) && <span className="badge-new coll-new">{t('New')}</span>}
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
        title={t('Collection')}
        subtitle={`${tn(cards.length, '{n} card shown.', '{n} cards shown.')} ${t('Right-click a card to inspect it.')}`}
        actions={
          <>
            <Essence amount={save.profile.essence} />
            <button className="btn btn-sm" disabled={surplus.cards === 0} onClick={() => void recycleSurplus()} title={t('Recycle copies beyond the playable limit')}>
              {t('Recycle surplus')}{surplus.cards > 0 ? ` (${surplus.cards})` : ''}
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
          ariaLabel={t('Cards')}
          empty={
            <div className="empty">
              <p>{t('No cards match these filters.')}</p>
              <button className="btn btn-sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
                {t('Clear filters')}
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
