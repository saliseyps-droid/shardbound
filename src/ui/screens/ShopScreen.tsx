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
import '@/ui/styles/shop.css';

const SETS = (Object.keys(SET_INFO) as SetId[]).sort((a, b) => SET_INFO[a].releaseOrder - SET_INFO[b].releaseOrder);
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
      <summary>Odds and guarantees</summary>
      <div className="odds-body">
        <table className="odds-table">
          <caption className="sr-only">Card rarity chances per slot</caption>
          <thead>
            <tr>
              <th scope="col">Rarity</th>
              <th scope="col">Cards 1–{PACK_CONFIG.cardsPerPack - 1}</th>
              <th scope="col">Card {PACK_CONFIG.cardsPerPack}</th>
            </tr>
          </thead>
          <tbody>
            {rarities.map((r) => (
              <tr key={r}>
                <th scope="row" className={`rarity-text-${r.toLowerCase()}`}>
                  {RARITY_LABEL[r]}
                </th>
                <td className="num">{pct(PACK_CONFIG.standardSlotWeights, r)}</td>
                <td className="num">{pct(PACK_CONFIG.guaranteedSlotWeights, r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="odds-table">
          <caption className="sr-only">Foil and Prismatic chances</caption>
          <thead>
            <tr>
              <th scope="col">Variant</th>
              <th scope="col">Each card</th>
              <th scope="col">At least one per pack</th>
            </tr>
          </thead>
          <tbody>
            {(['FOIL', 'PRISMATIC'] as Variant[]).map((v) => (
              <tr key={v}>
                <th scope="row" className={`variant-name v-${v.toLowerCase()}`}>
                  {VARIANT_LABEL[v]}
                </th>
                <td className="num">{pct(PACK_CONFIG.variantWeights, v)}</td>
                <td className="num">{perPackPct(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="odds-notes">
          <li>Every pack holds at least one Rare or better card.</li>
          {PACK_CONFIG.pity.EPIC && <li>An Epic or better is guaranteed at least once every {PACK_CONFIG.pity.EPIC} packs.</li>}
          {PACK_CONFIG.pity.LEGENDARY && <li>A Legendary is guaranteed at least once every {PACK_CONFIG.pity.LEGENDARY} packs.</li>}
          <li>Rare, Epic and Legendary cards favour ones you don’t own a full playset of yet.</li>
          <li>Foil and Prismatic are cosmetic: they never change how a card plays.</li>
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
        <span className="offer-label">{offer.label}</span>
        {offer.badge && <span className="offer-badge">{offer.badge}</span>}
      </div>
      <span className="faint offer-per">{perPack} Gold per pack</span>
      <button
        className="btn btn-primary offer-buy"
        disabled={!affordable || busy}
        onClick={() => onBuy(offer)}
        aria-label={`Buy ${offer.label} of ${SET_INFO[offer.setId].name} for ${offer.price} Gold`}
      >
        <GoldIcon size={18} />
        <span className="num">{offer.price.toLocaleString()}</span>
      </button>
      <span className="offer-reason">{!affordable && `Need ${(offer.price - gold).toLocaleString()} more Gold`}</span>
    </div>
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
        title: `Buy ${total} ${setName} packs?`,
        message: (
          <p>
            This spends <Gold amount={offer.price} /> of your <Gold amount={gold} />. The packs go to your inventory, ready to open.
          </p>
        ),
        confirmLabel: `Buy for ${offer.price.toLocaleString()} Gold`,
      });
      if (!ok) return;
    }
    setBusy(true);
    const res = gameService.buy(offer.id);
    setBusy(false);
    if (res.ok) {
      audio.play('coin');
      toast(`Bought ${total} ${setName} pack${total > 1 ? 's' : ''}.`, 'success');
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
        title="Shop"
        subtitle="Trade Gold for booster packs. Every pack holds five cards."
        actions={
          <>
            <span className="shop-wallet">
              <Gold amount={gold} size={22} />
            </span>
            <button className="btn btn-cyan" onClick={() => navigate('/packs')}>
              Open packs
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
                  <span className="shop-owned num" aria-label={`${owned} unopened`}>
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
                    {owned > 0 ? `You have ${owned} unopened ${owned === 1 ? 'pack' : 'packs'}.` : 'No unopened packs of this set.'}
                  </span>
                  {owned > 0 && (
                    <button className="btn btn-sm" onClick={() => navigate(`/packs?set=${setId}`)}>
                      Open now
                    </button>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <OddsTable />
      {gold < 100 && <p className="muted shop-hint">Earn Gold by winning matches, completing quests and claiming daily rewards.</p>}
    </div>
  );
}
