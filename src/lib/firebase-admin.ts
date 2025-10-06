// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// In a managed environment like App Hosting, the SDK can automatically discover the project credentials.
// This check ensures we only initialize the app once, preventing errors.
if (!admin.apps.length) {
  admin.initializeApp();
}

const auth = getAuth();
const db = getFirestore();

// Export the initialized services for other server-side modules to use.
export { auth, db };
