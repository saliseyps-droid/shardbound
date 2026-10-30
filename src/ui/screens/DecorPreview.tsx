import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DECOR_BY_ID, DEFAULT_ROOM, SLOTS, SLOT_KIND, type SlotId } from '@/data/lounge';
import { TROPHY_TIERS, activeRoom, roomInfoOf, type Trophy } from '@/domain/lounge';
import { useAccount } from '@/state/accountStore';
import { pickBoardBackground } from '@/ui/match/boardBackgrounds';
import { portraitUrl } from '@/ui/components/WardenPortrait';
import type { Faction } from '@/game/types';
import { t } from '@/i18n';
import '@/ui/styles/lounge.css';

const LoungeView = lazy(() => import('@/ui/lounge/LoungeView'));

/** The slot a preview puts a piece in: `?slot=` or the first of its kind. */
const slotFor = (kind: string, want: string | null): SlotId | null =>
  (want && SLOTS.find((s) => s === want && SLOT_KIND[s] === kind)) || SLOTS.find((s) => SLOT_KIND[s] === kind) || null;

/**
 * DEV ONLY (#/decor/<id>, e.g. #/decor/fu_fireplace): the Lounge with one piece placed (owned or not)
 * and the camera on it, full screen, for showing new decor one tab at a time.
 */
export default function DecorPreview() {
  const { id = '' } = useParams();
  const save = useAccount((s) => s.save);
  const board = useMemo(() => pickBoardBackground({}), []);
  const item = DECOR_BY_ID[id];
  // Only the tab in front draws: many preview tabs at once would run out of 3D contexts.
  const [shown, setShown] = useState(() => document.visibilityState === 'visible');
  useEffect(() => {
    const onChange = () => setShown(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const slot = item ? slotFor(item.kind, params.get('slot')) : null;
  const room = useMemo(() => {
    const base = save ? activeRoom(save.profile) : { ...DEFAULT_ROOM };
    if (!slot) return base;
    const next = { ...base, [slot]: id };
    for (const s of SLOTS) if (s !== slot && next[s] === id) next[s] = null;
    return next;
  }, [save, slot, id]);
  const faction = save?.decks[0]?.heroFaction;
  // ?demo: a well-won room (every trophy, a few hundred wins), to show the pieces that count them.
  const demo = params.has('demo');
  const owner = useMemo(() => {
    const info = save ? roomInfoOf(save) : undefined;
    if (!demo) return { faction: faction ?? undefined, info };
    const trophies = (Object.keys(TROPHY_TIERS) as Trophy['id'][]).map((id, i) => ({ id, tier: (3 - (i % 3)) as Trophy['tier'] }));
    return { faction: faction ?? undefined, info: { wins: 247, trophies, cardId: info?.cardId } };
  }, [save, faction, demo]);
  if (!item || !slot) return <p className="screen">Unknown decor: {id}</p>;
  const portrait = faction ? portraitUrl(faction as Faction, save?.profile.factionPortraits?.[faction as keyof typeof save.profile.factionPortraits]) : undefined;
  return (
    <div className="decor-preview">
      <Suspense fallback={null}>{board && shown && <LoungeView boardUrl={board.url} room={room} portraitUrl={portrait} owner={owner} selected={slot} onPick={() => {}} onUnavailable={() => {}} />}</Suspense>
      <div className="decor-preview-caption panel">
        <strong>{t(item.name)}</strong>
        <span className="faint">{t(item.description)}</span>
      </div>
    </div>
  );
}
