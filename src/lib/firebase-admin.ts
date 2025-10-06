// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.app();
}

// Initialize the app once
const adminApp = initializeAdminApp();

// Lazily get the services to prevent race conditions
const getAdminAuth = (): Auth => getAuth(adminApp);
const getAdminDb = (): Firestore => getFirestore(adminApp);

export { getAdminAuth, getAdminDb };
