// IMPORTANT: This file should only be imported and used in server-side code.

import { getAdminAuth } from '@/lib/firebase-admin';

export async function setAdminClaim(uid: string): Promise<void> {
  const auth = getAdminAuth();
  try {
    await auth.setCustomUserClaims(uid, { isAdmin: true });
    console.log(`Successfully set isAdmin claim for user: ${uid}`);
  } catch (error) {
    console.error(`Error setting custom claim for ${uid}:`, error);
    // It's better to throw the original error for more detailed logs
    throw error;
  }
}
