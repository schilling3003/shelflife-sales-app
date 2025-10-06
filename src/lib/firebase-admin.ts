// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

type ServiceAccount = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function getServiceAccountFromEnv(): ServiceAccount | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (parsed.privateKey) {
      parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n');
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Falling back to default credentials.', error);
    return undefined;
  }
}

function initializeAdminApp() {
  if (!admin.apps.length) {
    const serviceAccount = getServiceAccountFromEnv();

    if (serviceAccount?.privateKey && serviceAccount.clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccount.projectId,
          clientEmail: serviceAccount.clientEmail,
          privateKey: serviceAccount.privateKey
        })
      });
      return admin.app();
    }

    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    } catch (error) {
      console.warn('Falling back to unauthenticated Firebase Admin initialization. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS for secure access.', error);
      admin.initializeApp();
    }
  }

  return admin.app();
}

// Initialize the app once
const adminApp = initializeAdminApp();

// Lazily get the services to prevent race conditions
const getAdminAuth = (): Auth => getAuth(adminApp);
const getAdminDb = (): Firestore => getFirestore(adminApp);

export { getAdminAuth, getAdminDb };
