import type { SetId, Variant } from '@/game/types';

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
  reward: { gold?: number; essence?: number; packs?: { setId: SetId; amount: number }; cards?: { cardId: string; variant: Variant }[] };
  /** Card ids taken out of the collection (every copy and variant). */
  removeCards?: string[];
  /** Optional expiry (epoch ms). */
  expiresAt?: number;
}

export const REDEEM_CODES: RedeemCodeDef[] = [
  { id: 'gift-1000-gold', sha256: '43adb0a56a8bd5f68b568c45eaf4c3feeff594a68ae56229052e9083be41ac73', label: 'Gift: 1000 Gold', reward: { gold: 1000 } },
  { id: 'gift-prismatic-meowchick', sha256: '06a03d2991c0fa77efa6314b19243ebaaa05316aadb986340ac1942242201a74', label: 'Gift: Prismatic Meowchick', reward: { cards: [{ cardId: 'neu_meowchick', variant: 'PRISMATIC' }] } },
  { id: 'remove-meowchick', sha256: '3f58c94ce2a97f940e4a4be8dff06530b00bc19597adcff44260aad6a5a3049c', label: 'Meowchick removed from your collection', reward: {}, removeCards: ['neu_meowchick'] },
  { id: 'gift-1000-essence', sha256: 'b662b889a409094a02c82ca00325056c2f6a5c02098ef64b667a16ea4b14a729', label: 'Gift: 1000 Essence', reward: { essence: 1000 } },
];
