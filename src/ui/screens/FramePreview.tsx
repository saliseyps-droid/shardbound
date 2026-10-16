import { useEffect, useRef, useState } from 'react';
import { FACTIONS } from '@/data/factions';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { WardenFrame } from '@/ui/components/WardenFrame';
import { WardenPortrait } from '@/ui/components/WardenPortrait';

import { SHOP_FRAMES } from '@/data/shopFrames';

const SHOP: [string, string, string][] = SHOP_FRAMES.map((f) => [f.id, f.name, f.animated ? 'animated' : 'still']);

/** DEV ONLY (#/frames): the faction and shop Warden frames, animated or still, at two sizes. */
export default function FramePreview() {
  const [still, setStill] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  // The fire's churn is SVG animation (SMIL): pause it too in the still view.
  useEffect(() => {
    root.current?.querySelectorAll('svg').forEach((s) => (still ? s.pauseAnimations() : s.unpauseAnimations()));
  }, [still]);
  return (
    <div ref={root} className={`screen ${still ? 'wf-static' : ''}`} style={{ display: 'grid', gap: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2 style={{ margin: 0 }}>Warden frames — 100 wins with the faction</h2>
        <button className={`btn btn-sm ${still ? '' : 'btn-primary'}`} onClick={() => setStill(false)}>
          Animated
        </button>
        <button className={`btn btn-sm ${still ? 'btn-primary' : ''}`} onClick={() => setStill(true)}>
          Still
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 150, rowGap: 160, justifyContent: 'center', padding: '70px 0 30px' }}>
        {PLAYABLE_FACTIONS.map((f) => (
          <div key={f} style={{ display: 'grid', justifyItems: 'center', gap: 60 }}>
            <WardenFrame faction={f} size={240}>
              <WardenPortrait faction={f} size={240} />
            </WardenFrame>
            <strong style={{ color: FACTIONS[f].colors.primary }}>{FACTIONS[f].name}</strong>
          </div>
        ))}
      </div>
      <h2 style={{ margin: 0 }}>Shop frames — any faction</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 150, rowGap: 160, justifyContent: 'center', padding: '70px 0 30px' }}>
        {SHOP.map(([id, name, kind], i) => (
          <div key={id} data-frame={id} style={{ display: 'grid', justifyItems: 'center', gap: 60 }}>
            <WardenFrame faction={id} size={240}>
              <WardenPortrait faction={PLAYABLE_FACTIONS[i % 6]} size={240} />
            </WardenFrame>
            <strong>
              {name} <span className="faint">({kind})</span>
            </strong>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 60, justifyContent: 'center', padding: '20px 0 60px' }}>
        {PLAYABLE_FACTIONS.map((f) => (
          <WardenFrame key={f} faction={f} size={64}>
            <WardenPortrait faction={f} size={64} />
          </WardenFrame>
        ))}
      </div>
    </div>
  );
}
