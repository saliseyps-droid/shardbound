import { create } from 'zustand';
import type { Variant } from '@/game/types';

export interface Toast {
  id: number;
  message: string;
  kind: 'info' | 'success' | 'error' | 'reward';
}

interface UiStore {
  toasts: Toast[];
  inspect: { cardId: string; variant?: Variant } | null;
  pushToast: (message: string, kind?: Toast['kind']) => void;
  dismissToast: (id: number) => void;
  inspectCard: (cardId: string | null, variant?: Variant) => void;
}

let toastId = 1;

export const useUi = create<UiStore>((set) => ({
  toasts: [],
  inspect: null,
  pushToast: (message, kind = 'info') => {
    const id = toastId++;
    set((s) => ({ toasts: [...s.toasts.slice(-4), { id, message, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), kind === 'error' ? 6000 : 3500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  inspectCard: (cardId, variant) => set({ inspect: cardId ? { cardId, variant } : null }),
}));

export const toast = (message: string, kind: Toast['kind'] = 'info') => useUi.getState().pushToast(message, kind);
