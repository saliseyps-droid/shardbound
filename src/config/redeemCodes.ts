import type { SetId } from '@/game/types';

export interface RedeemCodeDef {
  /** Stable id stored in the save once redeemed (one use per account). */
  id: string;
  /**
   * SHA-256 (hex) of the exact, case-sensitive code. The plain code is never
   * stored in the (public) source. Generate with:
   *   node -e "console.log(require('crypto').createHash('sha256').update('CODE').digest('hex'))"
   */
  sha256: string;
  label: string;
  reward: { gold?: number; essence?: number; packs?: { setId: SetId; amount: number } };
  /** Optional expiry (epoch ms). */
  expiresAt?: number;
}

export const REDEEM_CODES: RedeemCodeDef[] = [
  { id: 'gift-1000-gold', sha256: '43adb0a56a8bd5f68b568c45eaf4c3feeff594a68ae56229052e9083be41ac73', label: 'Gift: 1000 Gold', reward: { gold: 1000 } },
];
