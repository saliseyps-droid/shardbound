import { lazy, Suspense, useMemo, useState } from 'react';
import { OPTIONAL_KINDS, SLOTS, SLOT_KIND, SLOT_NAME, decorFor, inSeason, ownsDecor, type DecorItem, type DecorStyle, type RoomLayout, type SlotId } from '@/data/lounge';
import { activeRoom, roomInfoOf } from '@/domain/lounge';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { getCard } from '@/data/cards';
import { RARITIES } from '@/game/types';
import { cardArtUri } from '@/ui/components/cardArt';
import { confirmDialog, Gold, Spinner } from '@/ui/components/common';
import { GoldIcon } from '@/ui/components/Icons';
import { pickBoardBackground } from '@/ui/match/boardBackgrounds';
import { portraitUrl } from '@/ui/components/WardenPortrait';
import type { Faction } from '@/game/types';
import { currentLocale, t } from '@/i18n';
import '@/ui/styles/lounge.css';

const LoungeView = lazy(() => import('@/ui/lounge/LoungeView'));

const STYLE_LABEL: Record<DecorStyle, string> = { base: 'Starter', general: 'Classic', fantasy: 'Fantasy', faction: 'Faction', arcade: 'Arcade', modern: 'Modern', neon: 'Neon', halloween: 'Halloween' };

/**
 * The Lounge: the player's game room in 3D. Every numbered place takes one kind of decor; pick a place,
 * then place a piece you own or try one on and buy it. The room surrounds the 3D table in matches.
 */
export default function LoungeScreen() {
  const profile = useAccount((s) => s.save?.profile);
  const firstFaction = useAccount((s) => s.save?.decks[0]?.heroFaction);
  const [selected, setSelected] = useState<SlotId | null>(null);
  const [trying, setTrying] = useState<{ slot: SlotId; id: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const board = useMemo(() => pickBoardBackground({}), []);
  const saved = useMemo(() => (profile ? activeRoom(profile) : null), [profile]);
  const save = useAccount((s) => s.save);
  const owner = useMemo(() => ({ faction: firstFaction ?? undefined, info: save ? roomInfoOf(save) : undefined }), [save, firstFaction]);

  // The room as shown: the saved one, with the piece being tried on in its place.
  const shown = useMemo<RoomLayout | null>(() => {
    if (!saved) return null;
    if (!trying) return saved;
    const next = { ...saved, [trying.slot]: trying.id };
    for (const s of SLOTS) if (s !== trying.slot && next[s] === trying.id) next[s] = null;
    return next;
  }, [saved, trying]);

  if (!profile || !saved || !shown) return null;
  const owned = profile.ownedDecor ?? [];
  const portrait = firstFaction ? portraitUrl(firstFaction as Faction, profile.factionPortraits?.[firstFaction as keyof typeof profile.factionPortraits]) : undefined;

  const pick = (slot: SlotId | null) => {
    setTrying(null);
    setSelected(slot);
  };

  const place = (slot: SlotId, id: string | null) => {
    const res = gameService.placeDecor(slot, id);
    if (!res.ok) {
      audio.play('error');
      toast(t(res.error), 'error');
      return;
    }
    setTrying(null);
    audio.play('click');
  };

  const buy = async (slot: SlotId, d: DecorItem) => {
    const ok = await confirmDialog({
      title: t('Buy {name}?', { name: t(d.name) }),
      message: (
        <p>
          {t('This spends')} <Gold amount={d.price} /> {t('of your')} <Gold amount={profile.gold} />. {t('Lounge decor is cosmetic.')}
        </p>
      ),
      confirmLabel: t('Buy for {n} Gold', { n: d.price.toLocaleString() }),
    });
    if (!ok) return;
    const res = gameService.buyDecor(d.id);
    if (!res.ok) {
      audio.play('error');
      toast(t(res.error), 'error');
      return;
    }
    audio.play('coin');
    gameService.placeDecor(slot, d.id);
    setTrying(null);
    toast(t('{name} now stands in your Lounge.', { name: t(d.name) }), 'success');
  };

  return (
    <div className="screen lounge-screen">
      <div className="lounge-stage">
        {failed ? (
          <div className="lounge-fallback panel">
            <p>{t('The Lounge needs 3D graphics, which this device or browser could not start.')}</p>
          </div>
        ) : (
          <Suspense fallback={<div className="lounge-loading"><Spinner /></div>}>
            {board && <LoungeView boardUrl={board.url} room={shown} portraitUrl={portrait} owner={owner} selected={selected} onPick={pick} onUnavailable={() => setFailed(true)} />}
          </Suspense>
        )}
      </div>
      <aside className="lounge-panel panel" aria-label={t('Lounge')}>
        <header className="lounge-panel-head">
          <div>
            <h2>{t('Lounge')}</h2>
            <p className="muted">{t('Your game room. It surrounds the 3D table in your matches; online, both players see the host’s.')}</p>
          </div>
          <span className="lounge-gold">
            <GoldIcon size={16} /> {profile.gold.toLocaleString()}
          </span>
        </header>
        {!selected ? (
          <>
            <p className="faint">{t('Pick a numbered place in the room, or one from this list.')}</p>
            <ol className="lounge-slots">
              {SLOTS.map((slot, i) => {
                const id = saved[slot];
                const item = id ? decorFor(slot).find((d) => d.id === id) : undefined;
                return (
                  <li key={slot}>
                    <button className="lounge-slot" onClick={() => pick(slot)}>
                      <b>{i + 1}</b>
                      <span className="lounge-slot-name">{t(SLOT_NAME[slot])}</span>
                      <span className="lounge-slot-piece faint">{item ? t(item.name) : t('Empty')}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </>
        ) : (
          <SlotPanel
            slot={selected}
            saved={saved}
            owned={owned}
            gold={profile.gold}
            trying={trying?.slot === selected ? trying.id : null}
            onBack={() => pick(null)}
            onTry={(id) => setTrying(id ? { slot: selected, id } : null)}
            onPlace={(id) => place(selected, id)}
            onBuy={(d) => buy(selected, d)}
          />
        )}
      </aside>
    </div>
  );
}

function SlotPanel({
  slot,
  saved,
  owned,
  gold,
  trying,
  onBack,
  onTry,
  onPlace,
  onBuy,
}: {
  slot: SlotId;
  saved: RoomLayout;
  owned: string[];
  gold: number;
  trying: string | null;
  onBack: () => void;
  onTry: (id: string | null) => void;
  onPlace: (id: string | null) => void;
  onBuy: (d: DecorItem) => void;
}) {
  // Seasonal pieces show while on sale, and always once owned.
  const now = new Date();
  const items = decorFor(slot).filter((d) => inSeason(d, now) || ownsDecor(owned, d.id));
  const optional = OPTIONAL_KINDS.has(SLOT_KIND[slot]);
  const elsewhere = (id: string) => SLOTS.find((s) => s !== slot && saved[s] === id);
  return (
    <div className="lounge-slot-panel">
      <div className="lounge-slot-title">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← {t('All places')}
        </button>
        <h3>{t(SLOT_NAME[slot])}</h3>
      </div>
      {saved[slot] === 'po_card_frame' && <FramedCardPicker />}
      <ul className="lounge-items">
        {optional && (
          <li className={`lounge-item ${saved[slot] === null ? 'is-placed' : ''}`}>
            <div className="lounge-item-text">
              <strong>{t('Nothing')}</strong>
              <span className="faint">{t('Leave this place empty.')}</span>
            </div>
            <div className="lounge-item-actions">{saved[slot] === null ? <span className="lounge-badge">{t('In the room')}</span> : <button className="btn btn-sm" onClick={() => onPlace(null)}>{t('Clear')}</button>}</div>
          </li>
        )}
        {items.map((d) => {
          const has = ownsDecor(owned, d.id);
          const placed = saved[slot] === d.id;
          const other = elsewhere(d.id);
          const isTrying = trying === d.id;
          return (
            <li key={d.id} className={`lounge-item style-${d.style} ${placed ? 'is-placed' : ''} ${isTrying ? 'is-trying' : ''}`}>
              <div className="lounge-item-text">
                <strong>{t(d.name)}</strong>
                <span className="faint">{t(d.description)}</span>
                <span className={`lounge-style lounge-style-${d.style}`}>{t(STYLE_LABEL[d.style])}</span>
                {d.season && !has && <span className="lounge-style lounge-season">{t('Only until {date}', { date: seasonEnd(d.season.to) })}</span>}
              </div>
              <div className="lounge-item-actions">
                {placed ? (
                  <span className="lounge-badge">{t('In the room')}</span>
                ) : has ? (
                  <button className="btn btn-sm btn-cyan" onClick={() => onPlace(d.id)}>
                    {other ? t('Move here') : t('Place')}
                  </button>
                ) : (
                  <>
                    <button className="btn btn-sm btn-ghost" onClick={() => onTry(isTrying ? null : d.id)} aria-pressed={isTrying}>
                      {isTrying ? t('Stop trying') : t('Try it')}
                    </button>
                    <button className="btn btn-sm btn-primary" disabled={gold < d.price} onClick={() => onBuy(d)}>
                      <GoldIcon size={14} /> {d.price.toLocaleString()}
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A season's last day ('MM-DD') as the locale writes a day and month. */
function seasonEnd(mmdd: string) {
  const [m, d] = mmdd.split('-').map(Number);
  return new Date(2000, m - 1, d).toLocaleDateString(currentLocale(), { day: 'numeric', month: 'long' });
}

/** The card in the card frame: any card the player owns, rarest first, found by name. */
function FramedCardPicker() {
  const save = useAccount((s) => s.save);
  const [query, setQuery] = useState('');
  const current = save ? roomInfoOf(save).cardId : undefined;
  const cards = useMemo(() => {
    const owned = Object.entries(save?.collection.cards ?? {})
      .filter(([, c]) => Object.values(c ?? {}).some((n) => (n ?? 0) > 0))
      .map(([id]) => getCard(id))
      .filter((c): c is NonNullable<typeof c> => !!c && c.collectible);
    return owned.sort((a, b) => RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) || t(a.name).localeCompare(t(b.name)));
  }, [save?.collection]);
  const q = query.trim().toLowerCase();
  const shown = (q ? cards.filter((c) => t(c.name).toLowerCase().includes(q)) : cards).slice(0, 60);
  const pick = (id: string) => {
    const res = gameService.setLoungeCard(id);
    if (!res.ok) return toast(t(res.error), 'error');
    audio.play('click');
  };
  return (
    <section className="lounge-card-picker">
      <h4>{t('Card in the frame')}</h4>
      <input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Search your cards')} aria-label={t('Search your cards')} />
      <ul>
        {shown.map((c) => (
          <li key={c.id}>
            <button className={`lounge-card-pick rarity-${c.rarity.toLowerCase()} ${c.id === current ? 'is-current' : ''}`} onClick={() => pick(c.id)} aria-pressed={c.id === current} title={t(c.name)}>
              <img src={cardArtUri(c)} alt="" loading="lazy" />
              <span>{t(c.name)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
