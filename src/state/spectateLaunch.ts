import { onlineOpponent } from '@/net/lobby';
import { launchMatch } from './matchLaunch';

/** Opens the board as a spectator of the match in watch room `watchCode` (src/net/spectate.ts). */
export function spectate(watchCode: string, navigate: (path: string) => void) {
  launchMatch({ mode: 'SPECTATE', online: 'spectator', watchCode, deckId: null, opponent: onlineOpponent('', 'compass', 'EMBER') }, navigate);
}
