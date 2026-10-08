import { create } from 'zustand';
import type { AiTuning } from '@/ai/config';
import type { OpponentDef } from '@/data/opponents';

export interface MatchConfig {
  mode: 'PRACTICE' | 'PVE' | 'TUTORIAL' | 'ONLINE' | 'RANKED' | 'TOURNAMENT' | 'ARENA' | 'AI_RANKED' | 'BRAWL';
  /** Brawl: the fight being played (src/domain/brawl.ts). */
  brawlFightId?: string;
  /** Ranked: the opponent's rating when the match was found. */
  opponentRating?: number;
  /** Tournament: which bracket match this is. */
  tournamentMatchId?: string;
  /** Online role: the host runs the authoritative engine. */
  online?: 'host' | 'guest';
  deckId: string | null;
  opponent: OpponentDef;
  encounterId?: string;
  /** Overrides of the opponent's difficulty preset (Ranked vs AI divisions). */
  aiTuning?: AiTuning;
  /** Debug: force a seed. */
  seed?: number;
}

interface LaunchStore {
  config: MatchConfig | null;
  setConfig: (c: MatchConfig | null) => void;
}

export const useMatchLaunch = create<LaunchStore>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
}));

/** Queue a match and navigate to the board. */
export function launchMatch(config: MatchConfig, navigate: (path: string) => void) {
  useMatchLaunch.getState().setConfig(config);
  navigate('/match');
}
