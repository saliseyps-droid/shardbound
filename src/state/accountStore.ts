import { create } from 'zustand';
import type { GameSave } from '@/domain/save';
import { ownedCopies } from '@/domain/save';
import { GameService, type InitStatus } from '@/services/gameService';
import { toast } from './uiStore';

/**
 * Account state: a read-only mirror of the service's save. All mutations go
 * through `gameService` methods; the store just re-renders subscribers.
 * Components should select narrow slices (profile, collection, decks...).
 */
export const gameService = GameService.createDefault();

interface AccountStore {
  status: 'BOOTING' | 'NEW' | 'READY' | 'CORRUPTED';
  initError?: string;
  migrationNotes: string[];
  save: GameSave | null;
  boot: () => Promise<InitStatus>;
}

export const useAccount = create<AccountStore>((set, get) => ({
  status: 'BOOTING',
  migrationNotes: [],
  save: null,
  boot: async () => {
    const result = await gameService.init();
    if (result.kind === 'NEW') set({ status: 'NEW', save: null });
    else if (result.kind === 'LOADED') set({ status: 'READY', save: gameService.current, migrationNotes: result.notes });
    else set({ status: 'CORRUPTED', initError: result.error });
    void get;
    return result;
  },
}));

gameService.subscribe((save) => {
  useAccount.setState({ save, status: save ? 'READY' : 'NEW' });
});
gameService.onError((message) => toast(message, 'error'));

// Narrow selectors -----------------------------------------------------------

export const useProfile = () => useAccount((s) => s.save?.profile);
export const useCollection = () => useAccount((s) => s.save?.collection);
export const useDecks = () => useAccount((s) => s.save?.decks ?? EMPTY);
export const useEconomy = () => useAccount((s) => s.save?.economy);
export const useQuests = () => useAccount((s) => s.save?.quests);
const EMPTY: never[] = [];

export function useOwnedCount(cardId: string): number {
  return useAccount((s) => (s.save ? ownedCopies(s.save.collection, cardId) : 0));
}

export function requireSave(): GameSave {
  const s = useAccount.getState().save;
  if (!s) throw new Error('No save loaded');
  return s;
}
