import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PACK_CONFIG, SET_INFO } from '@/config/economy';
import type { SetId } from '@/game/types';
import { useAccount } from '@/state/accountStore';
import { audio } from '@/audio/audioService';
import { ProgressBar, ScreenHeader } from '@/ui/components/common';
import { BoosterPack } from '@/ui/components/packs/BoosterPack';
import { PackOpening } from '@/ui/components/packs/PackOpening';
import { t, tn } from '@/i18n';
import '@/ui/styles/shop.css';
import '@/ui/styles/packs.css';

/** Newest set first, like the shop. */
const SETS = (Object.keys(SET_INFO) as SetId[]).sort((a, b) => SET_INFO[b].releaseOrder - SET_INFO[a].releaseOrder);

export default function PacksScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const packs = useAccount((s) => s.save?.economy.packs ?? {});
  const pity = useAccount((s) => s.save?.economy.pity ?? {});
  const opened = useAccount((s) => s.save?.profile.packsOpened ?? 0);
  const [opening, setOpening] = useState<{ setId: SetId; n: number } | null>(null);
  const highlight = params.get('set') as SetId | null;
  const total = SETS.reduce((a, s) => a + (packs[s] ?? 0), 0);

  const start = (setId: SetId) => {
    audio.play('click');
    setOpening((o) => ({ setId, n: (o?.n ?? 0) + 1 }));
  };

  return (
    <div className="screen packs-screen">
      <ScreenHeader
        title={t('Booster packs')}
        subtitle={`${total > 0 ? tn(total, 'You have {n} unopened pack.', 'You have {n} unopened packs.') : t('No unopened packs.')} ${t('{n} opened so far.', { n: opened })}`}
        actions={
          <button className="btn" onClick={() => navigate('/shop')}>
            {t('Buy packs')}
          </button>
        }
      />

      <div className="pack-inventory">
        {SETS.map((setId) => {
          const count = packs[setId] ?? 0;
          const p = pity[setId] ?? { EPIC: 0, LEGENDARY: 0 };
          const epicIn = Math.max(1, (PACK_CONFIG.pity.EPIC ?? 10) - p.EPIC);
          const legIn = Math.max(1, (PACK_CONFIG.pity.LEGENDARY ?? 30) - p.LEGENDARY);
          return (
            <section key={setId} className={`inventory-set panel ${count === 0 ? 'is-empty' : ''} ${highlight === setId ? 'is-highlight' : ''}`} aria-labelledby={`inv-${setId}`}>
              <button className="inventory-stack" onClick={() => count > 0 && start(setId)} disabled={count === 0} aria-label={count > 0 ? t('Open a {name} pack', { name: SET_INFO[setId].name }) : t('No {name} packs', { name: SET_INFO[setId].name })}>
                <BoosterPack setId={setId} width={190} className="stack-layer stack-0" />
                <span className="stack-count num">×{count}</span>
              </button>
              <div className="inventory-info">
                <h3 id={`inv-${setId}`}>{SET_INFO[setId].name}</h3>
                <p className="muted">{SET_INFO[setId].tagline}</p>
                <div className="pity">
                  <div className="pity-row">
                    <span>
                      {t('Epic guaranteed within')} <strong className="num">{epicIn}</strong> {tn(epicIn, 'pack', 'packs')}
                    </span>
                    <ProgressBar value={p.EPIC} max={PACK_CONFIG.pity.EPIC ?? 10} label={t('Epic pity progress')} />
                  </div>
                  <div className="pity-row">
                    <span>
                      {t('Legendary guaranteed within')} <strong className="num">{legIn}</strong> {tn(legIn, 'pack', 'packs')}
                    </span>
                    <ProgressBar value={p.LEGENDARY} max={PACK_CONFIG.pity.LEGENDARY ?? 30} gold label={t('Legendary pity progress')} />
                  </div>
                </div>
                {count > 0 ? (
                  <button className="btn btn-primary btn-lg" onClick={() => start(setId)}>
                    {t('Open a pack')}
                  </button>
                ) : (
                  <button className="btn" onClick={() => navigate('/shop')}>
                    {t('Get {name} packs in the shop', { name: SET_INFO[setId].name })}
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {opening && (
        <PackOpening
          key={opening.n}
          setId={opening.setId}
          onClose={() => setOpening(null)}
          onOpenAnother={() => ((packs[opening.setId] ?? 0) > 0 ? start(opening.setId) : setOpening(null))}
        />
      )}
    </div>
  );
}
