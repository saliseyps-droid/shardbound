import type { SetId } from '@/game/types';

/** The news on the Home screen: the newest set, a few of its Legendaries and its patch notes. */
export const NEWS: { setId: SetId; version: string; highlights: string[]; mechanics: string[]; image?: string } = {
  setId: 'RECKONING',
  version: '0.40.0',
  highlights: ['vod_simba_ultimate_predator', 'neu_sali_the_creator', 'ast_archmage_elinka'],
  mechanics: ['Consume', 'Corrupt'],
  /** A cinematic painting behind the banner (src/assets/cinematics). */
  image: 'bs_vortex',
};
