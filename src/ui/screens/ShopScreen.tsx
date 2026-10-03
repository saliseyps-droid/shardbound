import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PACK_CONFIG, SET_INFO, SHOP_BONUS_PACKS, SHOP_OFFERS, type ShopOffer } from '@/config/economy';
import type { Rarity, SetId, Variant } from '@/game/types';
import { gameService, useAccount } from '@/state/accountStore';
import { toast } from '@/state/uiStore';
import { audio } from '@/audio/audioService';
import { confirmDialog, Gold, ScreenHeader } from '@/ui/components/common';
import { GoldIcon } from '@/ui/components/Icons';
import { BoosterPack } from '@/ui/components/packs/BoosterPack';
import { CardBackGrid } from '@/ui/components/CardBackGrid';
import { t, tn } from '@/i18n';
import '@/ui/styles/shop.css';

/** Newest set first. */
const SETS = (Object.keys(SET_INFO) as SetId[]).sort((a, b) => SET_INFO[b].releaseOrder - SET_INFO[a].releaseOrder);
const RARITY_LABEL: Record<Rarity, string> = { COMMON: 'Common', RARE: 'Rare', EPIC: 'Epic', LEGENDARY: 'Legendary' };
const VARIANT_LABEL: Record<Variant, string> = { NORMAL: 'Normal', FOIL: 'Foil', PRISMATIC: 'Prismatic' };

function pct(weights: Record<string, number>, key: string) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const v = (weights[key] / total) * 100;
  return `${v < 1 ? v.toFixed(1) : v.toFixed(v % 1 ? 1 : 0)}%`;
}

/** Chance that a pack holds at least one card of this variant. */
function perPackPct(v: Variant): string {
  const total = Object.values(PACK_CONFIG.variantWeights).reduce((a, b) => a + b, 0);
  const p = 1 - (1 - PACK_CONFIG.variantWeights[v] / total) ** PACK_CONFIG.cardsPerPack;
  return `${(p * 100).toFixed(1)}%`;
}

function OddsTable() {
  const rarities: Rarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  return (
    <details className="odds panel panel-tight">
      <summary>{t('Odds and guarantees')}</summary>
      <div className="odds-body">
        <table className="odds-table">
          <caption className="sr-only">{t('Card rarity chances per slot')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('Rarity')}</th>
              <th scope="col">{t('Cards 1–{n}', { n: PACK_CONFIG.cardsPerPack - 1 })}</th>
              <th scope="col">{t('Card {n}', { n: PACK_CONFIG.cardsPerPack })}</th>
            </tr>
          </thead>
          <tbody>
            {rarities.map((r) => (
              <tr key={r}>
                <th scope="row" className={`rarity-text-${r.toLowerCase()}`}>
                  {t(RARITY_LABEL[r])}
                </th>
                <td className="num">{pct(PACK_CONFIG.standardSlotWeights, r)}</td>
                <td className="num">{pct(PACK_CONFIG.guaranteedSlotWeights, r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="odds-table">
          <caption className="sr-only">{t('Foil and Prismatic chances')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('Variant')}</th>
              <th scope="col">{t('Each card')}</th>
              <th scope="col">{t('At least one per pack')}</th>
            </tr>
          </thead>
          <tbody>
            {(['FOIL', 'PRISMATIC'] as Variant[]).map((v) => (
              <tr key={v}>
                <th scope="row" className={`variant-name v-${v.toLowerCase()}`}>
                  {t(VARIANT_LABEL[v])}
                </th>
                <td className="num">{pct(PACK_CONFIG.variantWeights, v)}</td>
                <td className="num">{perPackPct(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="odds-notes">
          <li>{t('Every pack holds at least one Rare or better card.')}</li>
          {PACK_CONFIG.pity.EPIC && <li>{t('An Epic or better is guaranteed at least once every {n} packs.', { n: PACK_CONFIG.pity.EPIC })}</li>}
          {PACK_CONFIG.pity.LEGENDARY && <li>{t('A Legendary is guaranteed at least once every {n} packs.', { n: PACK_CONFIG.pity.LEGENDARY })}</li>}
          <li>{t('Rare, Epic and Legendary cards favour ones you don’t own a full playset of yet.')}</li>
          <li>{t('Foil and Prismatic are cosmetic: they never change how a card plays.')}</li>
        </ul>
      </div>
    </details>
  );
}

function OfferButton({ offer, gold, busy, onBuy }: { offer: ShopOffer; gold: number; busy: boolean; onBuy: (o: ShopOffer) => void }) {
  const affordable = gold >= offer.price;
  const bonus = SHOP_BONUS_PACKS[offer.id] ?? 0;
  const perPack = Math.round(offer.price / (offer.packs + bonus));
  return (
    <div className={`offer ${affordable ? '' : 'offer-locked'}`}>
      <div className="offer-head">
        <span className="offer-label">{t(offer.label)}</span>
        {offer.badge && <span className="offer-badge">{t(offer.badge)}</span>}
      </div>
      <span className="faint offer-per">{t('{n} Gold per pack', { n: perPack })}</span>
      <button
        className="btn btn-primary offer-buy"
        disabled={!affordable || busy}
        onClick={() => onBuy(offer)}
        aria-label={t('Buy {offer} of {set} for {price} Gold', { offer: t(offer.label), set: SET_INFO[offer.setId].name, price: offer.price })}
      >
        <GoldIcon size={18} />
        <span className="num">{offer.price.toLocaleString()}</span>
      </button>
      <span className="offer-reason">{!affordable && t('Need {n} more Gold', { n: (offer.price - gold).toLocaleString() })}</span>
    </div>
  );
}

/** Cosmetic card backs: buy with Gold, then equip one. */
function CardBackShop() {
  return (
    <section className="panel cardback-shop" aria-labelledby="cardbacks-title">
      <div className="cardback-shop-head">
        <h3 id="cardbacks-title">{t('Card Backs')}</h3>
        <p className="muted">{t('Show off in every match: your deck on the table and the cards in your hand, as your opponent sees them, wear the back you choose. Switch between your backs under Card Backs in the menu.')}</p>
      </div>
      <CardBackGrid mode="shop" />
    </section>
  );
}

export default function ShopScreen() {
  const navigate = useNavigate();
  const gold = useAccount((s) => s.save?.profile.gold ?? 0);
  const packs = useAccount((s) => s.save?.economy.packs ?? {});
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<SetId | null>(null);

  const buy = async (offer: ShopOffer) => {
    const total = offer.packs + (SHOP_BONUS_PACKS[offer.id] ?? 0);
    const setName = SET_INFO[offer.setId].name;
    if (offer.packs > 1) {
      const ok = await confirmDialog({
        title: t('Buy {n} {set} packs?', { n: total, set: setName }),
        message: (
          <p>
            {t('This spends')} <Gold amount={offer.price} /> {t('of your')} <Gold amount={gold} />. {t('The packs go to your inventory, ready to open.')}
          </p>
        ),
        confirmLabel: t('Buy for {n} Gold', { n: offer.price.toLocaleString() }),
      });
      if (!ok) return;
    }
    setBusy(true);
    const res = gameService.buy(offer.id);
    setBusy(false);
    if (res.ok) {
      audio.play('coin');
      toast(tn(total, 'Bought {n} {set} pack.', 'Bought {n} {set} packs.', { set: setName }), 'success');
      setFlash(offer.setId);
      window.setTimeout(() => setFlash(null), 900);
    } else {
      audio.play('error');
      toast(res.error, 'error');
    }
  };

  return (
    <div className="screen shop-screen">
      <ScreenHeader
        title={t('Shop')}
        subtitle={t('Trade Gold for booster packs and card backs. Every pack holds five cards.')}
        actions={
          <>
            <span className="shop-wallet">
              <Gold amount={gold} size={22} />
            </span>
            <button className="btn btn-cyan" onClick={() => navigate('/packs')}>
              {t('Open packs')}
            </button>
          </>
        }
      />
      <div className="shop-sets">
        {SETS.map((setId) => {
          const info = SET_INFO[setId];
          const owned = packs[setId] ?? 0;
          return (
            <section key={setId} className={`shop-set panel set-${setId.toLowerCase()} ${flash === setId ? 'just-bought' : ''}`} aria-labelledby={`set-${setId}`}>
              <div className="shop-set-art">
                <BoosterPack setId={setId} width={190} className="shop-pack" />
                {owned > 0 && (
                  <span className="shop-owned num" aria-label={t('{n} unopened', { n: owned })}>
                    {owned}
                  </span>
                )}
              </div>
              <div className="shop-set-body">
                <h3 id={`set-${setId}`}>{info.name}</h3>
                <p className="muted">{info.tagline}</p>
                <div className="offers">
                  {SHOP_OFFERS.filter((o) => o.setId === setId).map((o) => (
                    <OfferButton key={o.id} offer={o} gold={gold} busy={busy} onBuy={buy} />
                  ))}
                </div>
                <div className="shop-set-foot">
                  <span className="muted">
                    {owned > 0 ? tn(owned, 'You have {n} unopened pack.', 'You have {n} unopened packs.') : t('No unopened packs of this set.')}
                  </span>
                  {owned > 0 && (
                    <button className="btn btn-sm" onClick={() => navigate(`/packs?set=${setId}`)}>
                      {t('Open now')}
                    </button>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <OddsTable />
      <CardBackShop />
      {gold < 100 && <p className="muted shop-hint">{t('Earn Gold by winning matches, completing quests and claiming daily rewards.')}</p>}
    </div>
  );
}
