import { FACTIONS } from '@/data/factions';
import { portraitsOf, type PortraitDef } from '@/data/portraits';
import { PLAYABLE_FACTIONS } from '@/game/types';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { confirmDialog } from './common';
import { GoldIcon } from './Icons';
import { WardenPortrait } from './WardenPortrait';
import { t } from '@/i18n';

/** Shop section: alternative Warden portraits, grouped by faction. */
export function PortraitShop() {
  const gold = useAccount((s) => s.save?.profile.gold ?? 0);
  const owned = useAccount((s) => s.save?.profile.portraits ?? []);
  const buy = async (p: PortraitDef) => {
    const ok = await confirmDialog({
      title: t('Buy the {name} portrait?', { name: t(p.name) }),
      message: <p>{t('It costs {n} Gold. Choose it for {faction} in your Profile or for one deck in the deck editor.', { n: p.price, faction: FACTIONS[p.faction].name })}</p>,
      confirmLabel: t('Buy for {n} Gold', { n: p.price }),
    });
    if (!ok) return;
    const res = gameService.buyPortrait(p.id);
    if (res.ok) {
      audio.play('coin');
      toast(`Portrait unlocked: ${p.name}`, 'reward');
    } else toast(res.error, 'error');
  };
  return (
    <section className="panel portrait-shop" aria-labelledby="portraits-title">
      <div className="cardback-shop-head">
        <h3 id="portraits-title">{t('Warden portraits')}</h3>
        <p className="muted">{t('New faces for your Wardens. Pick one per faction in your Profile, or a different one for a single deck in the deck editor.')}</p>
      </div>
      {PLAYABLE_FACTIONS.map((f) => (
        <div key={f} className="portrait-shop-faction">
          <div className="faint" style={{ color: FACTIONS[f].colors.primary }}>
            {FACTIONS[f].name}
          </div>
          <div className="portrait-shop-row">
            {portraitsOf(f).map((p) => {
              const have = owned.includes(p.id);
              return (
                <div key={p.id} className={`portrait-tile ${have ? 'is-owned' : ''}`}>
                  <WardenPortrait faction={f} portrait={p.id} size={92} />
                  <strong>{t(p.name)}</strong>
                  {have ? (
                    <span className="portrait-owned">{t('Owned')}</span>
                  ) : (
                    <button className="btn btn-sm btn-primary" disabled={gold < p.price} onClick={() => void buy(p)} aria-label={t('Buy the {name} portrait for {n} Gold', { name: t(p.name), n: p.price })}>
                      <GoldIcon size={14} /> <span className="num">{p.price}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
