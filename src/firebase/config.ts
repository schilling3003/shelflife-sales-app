import type { FirebaseOptions } from 'firebase/app';

const DEFAULT_FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: 'AIzaSyAjgQO1WD0X1QJNfj4aAB9EgJTB5kTkokY',
  authDomain: 'studio-9077984486-1342b.firebaseapp.com',
  projectId: 'studio-9077984486-1342b',
  appId: '1:751305193721:web:bc026bd9f50336a0938a28',
  messagingSenderId: '751305193721'
};

// Prefer environment variables so Firebase App Hosting and local development can
// share the same code path. We fall back to the known project defaults to keep
// the starter runnable without additional configuration in development.
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? DEFAULT_FIREBASE_CONFIG.projectId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? DEFAULT_FIREBASE_CONFIG.appId,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
};
