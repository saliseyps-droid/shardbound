/**
 * Firebase web config (Firebase console → Project settings → Your apps → Web app).
 * These values are public by design: access is protected by the Firestore rules
 * in firestore.rules. While apiKey is empty, cloud save is switched off and hidden.
 */
export const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
};

export const cloudConfigured = (): boolean => !!FIREBASE_CONFIG.apiKey && !!FIREBASE_CONFIG.projectId;
