import { REDEEM_CODES, type RedeemCodeDef } from '@/config/redeemCodes';
import { err, ok, type Result } from '@/core/utils';
import { addCards, pushReward, type GameSave } from './save';

/** SHA-256 hex digest via Web Crypto (browser and Node 20+). */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function findCode(code: string): Promise<RedeemCodeDef | undefined> {
  const trimmed = code.trim();
  if (!trimmed) return undefined;
  const hash = await sha256Hex(trimmed);
  return REDEEM_CODES.find((c) => c.sha256 === hash);
}

/** Applies a code's reward once per account. */
export function applyRedeem(save: GameSave, def: RedeemCodeDef | undefined, now: number): Result<{ save: GameSave; def: RedeemCodeDef }> {
  if (!def) return err('That code isn’t valid. Check the spelling — codes are case-sensitive.');
  if (def.expiresAt && now > def.expiresAt) return err('That code has expired.');
  if (save.redeemedCodes.includes(def.id)) return err('You have already redeemed this code.');
  const r = def.reward;
  let next: GameSave = {
    ...save,
    redeemedCodes: [...save.redeemedCodes, def.id],
    profile: { ...save.profile, gold: save.profile.gold + (r.gold ?? 0), essence: save.profile.essence + (r.essence ?? 0) },
  };
  if (r.packs) {
    next = { ...next, economy: { ...next.economy, packs: { ...next.economy.packs, [r.packs.setId]: (next.economy.packs[r.packs.setId] ?? 0) + r.packs.amount } } };
  }
  if (r.cards?.length) next = { ...next, collection: addCards(next.collection, r.cards) };
  next = pushReward(next, { source: `Code: ${def.label}`, gold: r.gold, essence: r.essence, packs: r.packs, cards: r.cards }, now);
  return ok({ save: next, def });
}
