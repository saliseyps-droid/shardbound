import { create } from 'zustand';
import { cloudConfigured } from '@/config/firebase';
import { authErrorMessage, loadCloud, type CloudServices } from '@/cloud/firebase';
import { CloudSync, type SaveSummary, type SyncStatus } from '@/cloud/sync';
import { gameService, saveStore } from './accountStore';
import { toast } from './uiStore';

/**
 * Cloud account (Firebase): who is signed in and how their save is syncing.
 * Hidden entirely while src/config/firebase.ts has no config.
 */
interface CloudStore {
  configured: boolean;
  ready: boolean;
  user: { uid: string; email: string | null; name: string | null } | null;
  status: SyncStatus;
  busy: boolean;
  error: string | null;
  conflict: { local: SaveSummary; cloud: SaveSummary } | null;
  init: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, create: boolean) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resolveConflict: (keep: 'local' | 'cloud') => Promise<void>;
  takeOver: () => Promise<void>;
}

let services: CloudServices | null = null;
let sync: CloudSync | null = null;

export const useCloud = create<CloudStore>((set, get) => {
  async function attach(uid: string) {
    if (!sync) return;
    try {
      // Make sure the latest local change is on disk before comparing with the cloud.
      await gameService.flush();
      const result = await sync.attach(uid);
      if (result.kind === 'conflict') set({ conflict: { local: result.local, cloud: result.cloud } });
      if (result.kind === 'uploaded') toast('Your progress is now saved to your account.', 'success');
    } catch (e) {
      console.error('[cloud] attach failed', e);
      set({ error: 'Could not reach your cloud save. Your progress is still saved on this device.' });
    }
  }

  async function run(action: () => Promise<void>) {
    set({ busy: true, error: null });
    try {
      await action();
    } catch (e) {
      set({ error: authErrorMessage(e) });
    } finally {
      set({ busy: false });
    }
  }

  return {
    configured: cloudConfigured(),
    ready: false,
    user: null,
    status: 'signed-out',
    busy: false,
    error: null,
    conflict: null,

    init: () => {
      if (!get().configured || services) return;
      void loadCloud()
        .then((s) => {
          services = s;
          sync = new CloudSync(saveStore, s.backend, { reload: () => location.reload(), onStatus: (status) => set({ status }) });
          s.onUser((user) => {
            set({ ready: true, user: user ? { uid: user.uid, email: user.email, name: user.displayName } : null });
            if (user) void attach(user.uid);
            else sync?.detach();
          });
        })
        .catch((e) => {
          console.error('[cloud] could not load Firebase', e);
          set({ ready: true, error: 'The account service is not reachable right now.' });
        });
    },

    signInWithGoogle: () =>
      run(async () => {
        await services?.signInWithGoogle();
      }),
    signInWithEmail: (email, password, createAccount) =>
      run(async () => {
        if (!services) return;
        if (createAccount) await services.createAccount(email, password);
        else await services.signInWithEmail(email, password);
      }),
    resetPassword: (email) =>
      run(async () => {
        if (!services) return;
        await services.resetPassword(email);
        toast('We sent you an e-mail with a link to set a new password.', 'success');
      }),
    signOut: () =>
      run(async () => {
        await sync?.flushNow();
        sync?.detach();
        await services?.signOut();
        set({ conflict: null });
        toast('Signed out. Your progress stays on this device.', 'info');
      }),
    resolveConflict: async (keep) => {
      set({ conflict: null, busy: true });
      try {
        await sync?.resolve(keep);
        if (keep === 'local') toast('Your progress is now saved to your account.', 'success');
      } catch (e) {
        console.error('[cloud] resolve failed', e);
        set({ error: 'Could not reach your cloud save. Your progress is still saved on this device.' });
      } finally {
        set({ busy: false });
      }
    },
    takeOver: async () => {
      set({ busy: true });
      try {
        await sync?.takeOver();
      } finally {
        set({ busy: false });
      }
    },
  };
});
