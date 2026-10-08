import { useRef, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { create } from 'zustand';
import { FACTIONS } from '@/data/factions';
import { getPortrait } from '@/data/portraits';
import type { PlayableFaction } from '@/game/types';
import { Modal } from './common';
import { portraitUrl } from './WardenPortrait';
import { t } from '@/i18n';
import '@/ui/styles/portraitInspector.css';

interface Target {
  faction: PlayableFaction;
  /** Alternative portrait id; null = the faction's default Warden. */
  portrait: string | null;
}

const usePortraitInspect = create<{ target: Target | null; open: (t: Target | null) => void }>((set) => ({
  target: null,
  open: (target) => set({ target }),
}));

export const inspectPortrait = (target: Target | null) => usePortraitInspect.getState().open(target);

/**
 * Right-click (or a half-second press on touch screens) on a portrait opens it large.
 * The tap that ends a long press is swallowed so it does not also select or buy.
 */
export function usePortraitPress(target: Target) {
  const timer = useRef<number | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  const cancel = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
  };
  return {
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
      if (!fired.current) inspectPortrait(target);
    },
    onPointerDown: (e: PointerEvent) => {
      fired.current = false;
      if (e.pointerType !== 'touch') return;
      cancel();
      start.current = { x: e.clientX, y: e.clientY };
      timer.current = window.setTimeout(() => {
        timer.current = null;
        fired.current = true;
        inspectPortrait(target);
      }, 500);
    },
    onPointerMove: (e: PointerEvent) => {
      if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    /** Call first in onClick: true when the click only ended a long press. */
    swallowClick: () => {
      if (!fired.current) return false;
      fired.current = false;
      return true;
    },
  };
}

/** Global large portrait view. */
export function PortraitInspector() {
  const target = usePortraitInspect((s) => s.target);
  if (!target) return null;
  const url = portraitUrl(target.faction, target.portrait);
  const def = getPortrait(target.portrait);
  const faction = FACTIONS[target.faction];
  const name = def ? t(def.name) : t('Default Warden');
  return (
    <Modal open onClose={() => inspectPortrait(null)} title={name} className="portrait-inspector">
      <div className="portrait-inspector-body" style={{ '--fc': faction.colors.primary } as CSSProperties}>
        {url && <img src={url} alt={name} draggable={false} />}
        <span className="portrait-inspector-faction">{faction.name}</span>
      </div>
    </Modal>
  );
}
