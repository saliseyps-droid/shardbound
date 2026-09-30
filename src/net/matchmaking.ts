import type { SideSetup } from '@/engine/types';
import { netSession } from './session';
import { validateRemoteSide } from './lobby';

/**
 * Serverless ranked matchmaking. Searching players use a fixed pool of public
 * "slots" (well-known peer ids). A searcher first tries to join any slot where
 * someone is already waiting; if every slot is empty it claims a free slot and
 * waits there for a while, then scans again. Two searchers therefore always find
 * each other within one wait cycle.
 */

export const MATCHMAKING_SLOTS = 8;
const slotCode = (i: number) => `RANKED${i}`;

export class MatchmakingCancelled extends Error {
  constructor() {
    super('Search cancelled.');
  }
}

export interface MatchmakingOptions {
  name: string;
  avatar: string;
  side: SideSetup;
  deckName: string;
  rating: number;
  /** Progress messages for the UI. */
  onStatus?: (message: string) => void;
  isCancelled: () => boolean;
}

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resolves with this client's role once paired; throws MatchmakingCancelled when cancelled. */
export async function findRankedMatch(opts: MatchmakingOptions): Promise<'host' | 'guest'> {
  const meta = { ranked: true, rating: opts.rating, faction: opts.side.faction };
  const check = () => {
    if (opts.isCancelled()) {
      netSession.close();
      throw new MatchmakingCancelled();
    }
  };
  for (let cycle = 0; ; cycle++) {
    check();
    opts.onStatus?.('Looking for an opponent…');
    // 1) Join someone who is already waiting.
    for (const i of shuffled(MATCHMAKING_SLOTS)) {
      check();
      try {
        await netSession.join(slotCode(i), opts.side, opts.deckName, { meta, timeoutMs: 6000 });
        return 'guest';
      } catch {
        netSession.close();
      }
    }
    // 2) Nobody waiting: claim a free slot and wait to be found.
    for (const i of shuffled(MATCHMAKING_SLOTS)) {
      check();
      try {
        await netSession.host(
          opts.name,
          opts.avatar,
          (hello) => (hello.meta?.ranked === true ? validateRemoteSide(hello.side) : 'Not a ranked search.'),
          { code: slotCode(i), meta },
        );
      } catch {
        continue; // slot taken (someone may be waiting there: the next scan joins them)
      }
      opts.onStatus?.('Waiting for an opponent…');
      // Randomised wait so two waiting players don't rescan in lockstep.
      const until = Date.now() + 14000 + Math.random() * 12000;
      while (Date.now() < until) {
        if (netSession.status === 'connected') return 'host';
        if (opts.isCancelled()) break;
        await sleep(250);
      }
      if (netSession.status === 'connected') return 'host';
      netSession.close();
      break;
    }
    check();
    await sleep(300 + Math.random() * 700);
  }
}
