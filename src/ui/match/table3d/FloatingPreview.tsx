import { useEffect, useRef } from 'react';
import type { Variant } from '@/game/types';
import { CardView } from '@/ui/components/CardView';
import { previewPlace } from './previewPlace';

const WIDTH = 220;
const HEIGHT = Math.round(WIDTH * 1.4);

/**
 * On the 3D table the units show only their art and icons: pointing at one shows its whole card
 * beside it (screen space, following the unit while the camera or the card moves).
 */
export function FloatingPreview({ uid, cardId, variant, silenced }: { uid: number; cardId: string; variant?: Variant; silenced?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const place = () => {
      frame = requestAnimationFrame(place);
      const box = ref.current;
      const unit = document.querySelector(`.table3d-plane [data-entity="u:${uid}"]`);
      const table = document.querySelector('.table3d');
      if (!box || !unit || !table) return;
      const p = previewPlace(unit.getBoundingClientRect(), { w: WIDTH, h: HEIGHT }, { w: table.getBoundingClientRect().right, h: window.innerHeight });
      box.style.transform = `translate(${p.left}px, ${p.top}px)`;
      box.style.opacity = '1';
    };
    place();
    return () => cancelAnimationFrame(frame);
  }, [uid]);
  return (
    <div className="table3d-preview" ref={ref} aria-hidden>
      <CardView card={cardId} variant={variant} width={WIDTH} silenced={silenced} />
    </div>
  );
}
