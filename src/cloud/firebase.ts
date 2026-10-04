import type { Auth, User } from 'firebase/auth';
import { FIREBASE_CONFIG } from '@/config/firebase';
import { createFirestoreBackend } from './firestore';
import type { CloudBackend } from './sync';
import type { SocialBackend } from '@/social/backend';

/** Firebase is only downloaded when cloud save is configured (see src/config/firebase.ts). */
export interface CloudServices {
  auth: Auth;
  backend: CloudBackend;
  /** Leaderboards, friends, presence and invites (src/cloud/social.ts). */
  social: SocialBackend;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  onUser: (cb: (user: User | null) => void) => () => void;
}

let services: Promise<CloudServices> | null = null;

export function loadCloud(): Promise<CloudServices> {
  if (!services) {
    services = (async () => {
      const [{ initializeApp }, authMod, { getFirestore }] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
      const app = initializeApp(FIREBASE_CONFIG);
      const auth = authMod.getAuth(app);
      const db = getFirestore(app);
      const [backend, social] = await Promise.all([createFirestoreBackend(db), import('./social').then((m) => m.createSocialBackend(db))]);
      return {
        auth,
        backend,
        social,
        signInWithGoogle: async () => {
          await authMod.signInWithPopup(auth, new authMod.GoogleAuthProvider());
        },
        signInWithEmail: async (email, password) => {
          await authMod.signInWithEmailAndPassword(auth, email, password);
        },
        createAccount: async (email, password) => {
          await authMod.createUserWithEmailAndPassword(auth, email, password);
        },
        resetPassword: (email) => authMod.sendPasswordResetEmail(auth, email),
        signOut: () => authMod.signOut(auth),
        onUser: (cb) => authMod.onAuthStateChanged(auth, cb),
      };
    })();
    services.catch(() => (services = null));
  }
  return services;
}

/** Firebase error codes → readable English (translated by t()). */
export function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong e-mail or password.';
    case 'auth/email-already-in-use':
      return 'An account with this e-mail already exists. Sign in instead.';
    case 'auth/weak-password':
      return 'The password must have at least 6 characters.';
    case 'auth/invalid-email':
      return 'That e-mail address is not valid.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'The browser blocked the sign-in window. Allow pop-ups for this site and try again.';
    case 'auth/network-request-failed':
      return 'No connection to the sign-in service. Check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled yet.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    default:
      return 'Sign-in failed. Try again.';
  }
}
