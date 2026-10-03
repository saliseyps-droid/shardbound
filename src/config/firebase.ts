/**
 * Firebase web config (Firebase console → Project settings → Your apps → Web app).
 * These values are public by design: access is protected by the Firestore rules
 * in firestore.rules. While apiKey is empty, cloud save is switched off and hidden.
 */
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyA1xdOj6srXojdA_jj-b37mlPm5_I1YAH0',
  authDomain: 'shardbound-5f033.firebaseapp.com',
  projectId: 'shardbound-5f033',
  appId: '1:772886854781:web:3070b3ac3fde0e89b90514',
};

export const cloudConfigured = (): boolean => !!FIREBASE_CONFIG.apiKey && !!FIREBASE_CONFIG.projectId;
