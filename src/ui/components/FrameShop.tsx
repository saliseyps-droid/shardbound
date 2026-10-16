import { SHOP_FRAMES, type ShopFrameDef } from '@/data/shopFrames';
import { effectivePortrait } from '@/domain/portraits';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { confirmDialog } from './common';
import { GoldIcon } from './Icons';
import { WardenFrame } from './WardenFrame';
import { WardenPortrait } from './WardenPortrait';
import { t } from '@/i18n';

/** Your Warden (the selected deck's faction and portrait) inside a frame, for previews. */
export function FramedWarden({ frame, size }: { frame: string; size: number }) {
  const save = useAccount((s) => s.save);
  const deck = save ? (save.decks.find((d) => d.id === save.profile.selectedDeckId) ?? save.decks[0]) : undefined;
  const faction = deck?.heroFaction ?? 'EMBER';
  const portrait = deck && save ? effectivePortrait(deck, save.profile) : null;
  return (
    <WardenFrame faction={frame} size={size}>
      <WardenPortrait faction={faction} portrait={portrait} size={size} />
    </WardenFrame>
  );
}

/** Shop section: Warden frames for any faction, bought with Gold. */
export function FrameShop() {
  const gold = useAccount((s) => s.save?.profile.gold ?? 0);
  const owned = useAccount((s) => s.save?.profile.ownedFrames ?? []);
  const inUse = useAccount((s) => s.save?.profile.wardenFrame ?? null);
  const buy = async (f: ShopFrameDef) => {
    const ok = await confirmDialog({
      title: t('Buy the {name} frame?', { name: t(f.name) }),
      message: <p>{t('It costs {n} Gold and goes on your Warden straight away. It fits every faction and every deck; switch frames any time in Customization.', { n: f.price.toLocaleString() })}</p>,
      confirmLabel: t('Buy for {n} Gold', { n: f.price.toLocaleString() }),
    });
    if (!ok) return;
    const res = gameService.buyFrame(f.id);
    if (res.ok) {
      audio.play('coin');
      toast(t('Frame unlocked: {name}', { name: t(f.name) }), 'reward');
    } else {
      audio.play('error');
      toast(res.error, 'error');
    }
  };
  const use = (id: string | null) => {
    const res = gameService.chooseFrame(id);
    if (!res.ok) toast(res.error, 'error');
  };
  return (
    <section className="panel frame-shop" aria-labelledby="frames-title">
      <div className="cardback-shop-head">
        <h3 id="frames-title">{t('Warden frames')}</h3>
        <p className="muted">{t('Frames for every faction: they go around your Warden in every match (online opponents see them too), on Home and in your Profile, whatever deck you play.')}</p>
      </div>
      <div className="frame-shop-grid">
        {SHOP_FRAMES.map((f) => {
          const have = owned.includes(f.id);
          return (
            <div key={f.id} className={`frame-shop-tile ${have ? 'is-owned' : ''}`}>
              <div className="frame-shop-art">
                <FramedWarden frame={f.id} size={124} />
              </div>
              <strong>{t(f.name)}</strong>
              <span className={`chip ${f.animated ? 'chip-animated' : ''}`}>{f.animated ? t('Animated') : t('Still')}</span>
              <p className="faint small">{t(f.description)}</p>
              {have ? (
                <button type="button" className={`btn btn-sm ${inUse === f.id ? 'btn-primary' : ''}`} onClick={() => use(inUse === f.id ? null : f.id)}>
                  {inUse === f.id ? t('In use (click to remove)') : t('Use this frame')}
                </button>
              ) : (
                <button className="btn btn-sm btn-primary" disabled={gold < f.price} onClick={() => void buy(f)} aria-label={t('Buy the {name} frame for {n} Gold', { name: t(f.name), n: f.price })}>
                  <GoldIcon size={14} /> <span className="num">{f.price.toLocaleString()}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
