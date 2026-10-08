import type { CSSProperties } from 'react';
import { packInfo, type PackId } from '@/config/economy';
import { t } from '@/i18n';
import '@/ui/styles/prismaticPack.css';
import kingdomsAtWar from '@/assets/packs/kingdoms_at_war.webp';
import fantasyRealms from '@/assets/packs/fantasy_realms.webp';
import legionsOfShadow from '@/assets/packs/legions_of_shadow.webp';
import dragonRealm from '@/assets/packs/dragon_realm.webp';
import prismaticArt from '@/assets/packs/prismatic.webp';
import prismaticLegendArt from '@/assets/packs/prismatic_legend.webp';

/** Per-set accent colours (glows around the pack, the pack-opening stage). */
export const PACK_THEME: Record<PackId, { a: string; b: string; c: string; glow: string; emblem: string }> = {
  CORE: { a: '#e9d9b0', b: '#8a6a3a', c: '#2a1f14', glow: '#f6cf7a', emblem: '#f6cf7a' },
  DEEP: { a: '#d9b25a', b: '#1b2440', c: '#0b1020', glow: '#e0b34a', emblem: '#e0b34a' },
  ABYSS: { a: '#e0464a', b: '#2a1416', c: '#0c0708', glow: '#d8343a', emblem: '#e0464a' },
  DRAGON: { a: '#f39a45', b: '#3a1a10', c: '#120806', glow: '#ff8a2a', emblem: '#f39a45' },
  PRISMATIC: { a: '#9ff3ff', b: '#3a1f6a', c: '#0d0820', glow: '#c99bff', emblem: '#9ff3ff' },
  PRISMATIC_LEGEND: { a: '#ffe08a', b: '#4a2a6a', c: '#120a20', glow: '#ff9bea', emblem: '#ffe08a' },
};

export const isPrismaticPack = (id: PackId) => id === 'PRISMATIC' || id === 'PRISMATIC_LEGEND';

/** Pack artwork per set (src/assets/packs). */
const PACK_ART: Record<PackId, string> = { CORE: kingdomsAtWar, DEEP: fantasyRealms, ABYSS: legionsOfShadow, DRAGON: dragonRealm, PRISMATIC: prismaticArt, PRISMATIC_LEGEND: prismaticLegendArt };

export function BoosterPack({ setId, width = 180, className = '', style }: { setId: PackId; width?: number; className?: string; style?: CSSProperties }) {
  const art = PACK_ART[setId];
  return (
    <div className={`booster ${setId === 'PRISMATIC' || setId === 'PRISMATIC_LEGEND' ? 'is-prismatic is-gold' : ''} ${className}`} style={{ width, '--pack-art': `url(${art})`, ...style } as CSSProperties} role="img" aria-label={t('{name} booster pack', { name: t(packInfo(setId).name) })}>
      <img className="booster-art" src={art} alt="" draggable={false} />
      <span className="booster-sheen" aria-hidden />
      {isPrismaticPack(setId) && <span className="booster-prism" aria-hidden />}
      {isPrismaticPack(setId) && <span className="booster-sparkles" aria-hidden />}
    </div>
  );
}
