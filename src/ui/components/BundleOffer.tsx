import type { CSSProperties } from 'react';
import { SET_INFO, type Bundle } from '@/config/economy';
import { getCardBack } from '@/data/cardBacks';
import { getPortrait } from '@/data/portraits';
import { bundlePrice, bundleValue } from '@/domain/bundles';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { confirmDialog } from './common';
import { CardBack } from './CardView';
import { GoldIcon } from './Icons';
import { BoosterPack, PACK_THEME } from './packs/BoosterPack';
import { WardenPortrait } from './WardenPortrait';
import { t } from '@/i18n';

/** Featured one-time bundle for a set: packs + card back + portrait at a discount. */
export function BundleOffer({ bundle }: { bundle: Bundle }) {
  const save = useAccount((s) => s.save);
  if (!save) return null;
  const bought = save.profile.bundlesBought.includes(bundle.id);
  const value = bundleValue(save, bundle);
  const price = bundlePrice(save, bundle);
  const back = getCardBack(bundle.cardBack);
  const portrait = getPortrait(bundle.portrait);
  const setName = SET_INFO[bundle.setId].name;
  const theme = PACK_THEME[bundle.setId];
  const newest = SET_INFO[bundle.setId].releaseOrder === Math.max(...Object.values(SET_INFO).map((s) => s.releaseOrder));
  const buy = async () => {
    const ok = await confirmDialog({
      title: t('Buy the {name}?', { name: t(bundle.name) }),
      message: <p>{t('{n} Gold for {packs} {set} packs, a card back and a Warden portrait.', { n: price, packs: bundle.packs, set: setName })}</p>,
      confirmLabel: t('Buy for {n} Gold', { n: price }),
    });
    if (!ok) return;
    const res = gameService.buyBundle(bundle.id);
    if (res.ok) {
      audio.play('coin');
      toast(`Bundle bought: ${bundle.packs} packs, a card back and a portrait.`, 'reward');
    } else toast(res.error, 'error');
  };
  return (
    <section className="panel bundle-offer" style={{ '--bundle-glow': theme.glow } as CSSProperties} aria-labelledby={`bundle-${bundle.id}`}>
      <div className="bundle-art" aria-hidden>
        <BoosterPack setId={bundle.setId} width={120} className="bundle-pack" />
        {back && <CardBack design={back.id} width={96} className="bundle-back" />}
        {portrait && <WardenPortrait faction={portrait.faction} portrait={portrait.id} size={84} className="bundle-portrait" />}
      </div>
      <div className="bundle-body">
        <span className="bundle-tag">{newest ? t('New set bundle') : t('Set bundle')}</span>
        <h3 id={`bundle-${bundle.id}`}>{t(bundle.name)}</h3>
        <ul className="bundle-items">
          <li>{t('{n}× {set} pack', { n: bundle.packs, set: setName })}</li>
          {back && <li>{t('Card back: {name}', { name: t(back.name) })}{save.profile.cardBacks.includes(back.id) && <span className="faint"> {t('(already yours, not charged)')}</span>}</li>}
          {portrait && <li>{t('Warden portrait: {name}', { name: t(portrait.name) })}{save.profile.portraits.includes(portrait.id) && <span className="faint"> {t('(already yours, not charged)')}</span>}</li>}
        </ul>
        {bought ? (
          <p className="bundle-bought">{t('Bought. Thank you, Warden!')}</p>
        ) : (
          <div className="bundle-buy">
            <span className="bundle-value num" aria-label={t('Worth {n} Gold', { n: value })}>
              {value.toLocaleString()}
            </span>
            <button className="btn btn-primary btn-lg" disabled={save.profile.gold < price} onClick={() => void buy()}>
              <GoldIcon size={18} /> <span className="num">{price.toLocaleString()}</span>
            </button>
            <span className="bundle-save">{t('Save {n}%', { n: Math.round(bundle.discount * 100) })}</span>
            <span className="faint">{t('One per account')}</span>
          </div>
        )}
      </div>
    </section>
  );
}
