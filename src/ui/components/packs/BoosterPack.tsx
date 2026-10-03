import type { CSSProperties } from 'react';
import { SET_INFO } from '@/config/economy';
import type { SetId } from '@/game/types';
import { t } from '@/i18n';
import kingdomsAtWar from '@/assets/packs/kingdoms_at_war.webp';
import fantasyRealms from '@/assets/packs/fantasy_realms.webp';
import curseOfTheAbyss from '@/assets/packs/curse_of_the_abyss.webp';

/** Per-set accent colours (glows around the pack, the pack-opening stage). */
export const PACK_THEME: Record<SetId, { a: string; b: string; c: string; glow: string; emblem: string }> = {
  CORE: { a: '#e9d9b0', b: '#8a6a3a', c: '#2a1f14', glow: '#f6cf7a', emblem: '#f6cf7a' },
  DEEP: { a: '#d9b25a', b: '#1b2440', c: '#0b1020', glow: '#e0b34a', emblem: '#e0b34a' },
  ABYSS: { a: '#e0464a', b: '#2a1416', c: '#0c0708', glow: '#d8343a', emblem: '#e0464a' },
};

/** Pack artwork per set (src/assets/packs). */
const PACK_ART: Record<SetId, string> = { CORE: kingdomsAtWar, DEEP: fantasyRealms, ABYSS: curseOfTheAbyss };

export function BoosterPack({ setId, width = 180, className = '', style }: { setId: SetId; width?: number; className?: string; style?: CSSProperties }) {
  const art = PACK_ART[setId];
  return (
    <div className={`booster ${className}`} style={{ width, '--pack-art': `url(${art})`, ...style } as CSSProperties} role="img" aria-label={t('{name} booster pack', { name: SET_INFO[setId].name })}>
      <img className="booster-art" src={art} alt="" draggable={false} />
      <span className="booster-sheen" aria-hidden />
    </div>
  );
}
