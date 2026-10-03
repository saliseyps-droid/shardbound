import { BUNDLES, SHOP_OFFERS, type Bundle } from '@/config/economy';
import { err, ok, type Result } from '@/core/utils';
import { getCardBack } from '@/data/cardBacks';
import { getPortrait } from '@/data/portraits';
import { pushReward, type GameSave } from './save';

/** Gold the contents would cost bought one by one (skipping what the player already owns). */
export function bundleValue(save: GameSave, bundle: Bundle): number {
  const packPrice = SHOP_OFFERS.find((o) => o.setId === bundle.setId && o.packs === 1)?.price ?? 100;
  let value = bundle.packs * packPrice;
  if (bundle.cardBack && !save.profile.cardBacks.includes(bundle.cardBack)) value += getCardBack(bundle.cardBack)?.price ?? 0;
  if (bundle.portrait && !save.profile.portraits.includes(bundle.portrait)) value += getPortrait(bundle.portrait)?.price ?? 0;
  return value;
}

/** The bundle's discount applied to whatever the player still gets from it, rounded to 10 Gold. */
export function bundlePrice(save: GameSave, bundle: Bundle): number {
  return Math.round((bundleValue(save, bundle) * (1 - bundle.discount)) / 10) * 10;
}

export function buyBundle(save: GameSave, id: string, now: number): Result<GameSave> {
  const bundle = BUNDLES.find((b) => b.id === id);
  if (!bundle) return err('This bundle is not available.');
  if (save.profile.bundlesBought.includes(id)) return err('You already bought this bundle.');
  const price = bundlePrice(save, bundle);
  if (save.profile.gold < price) return err('Not enough Gold.');
  const p = save.profile;
  const next: GameSave = {
    ...save,
    profile: {
      ...p,
      gold: p.gold - price,
      bundlesBought: [...p.bundlesBought, id],
      cardBacks: bundle.cardBack && !p.cardBacks.includes(bundle.cardBack) ? [...p.cardBacks, bundle.cardBack] : p.cardBacks,
      portraits: bundle.portrait && !p.portraits.includes(bundle.portrait) ? [...p.portraits, bundle.portrait] : p.portraits,
    },
    economy: { ...save.economy, packs: { ...save.economy.packs, [bundle.setId]: (save.economy.packs[bundle.setId] ?? 0) + bundle.packs } },
  };
  return ok(pushReward(next, { source: `Purchased the ${bundle.name}`, packs: { setId: bundle.setId, amount: bundle.packs } }, now));
}
