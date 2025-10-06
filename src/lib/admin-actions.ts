// IMPORTANT: This file should only be imported and used in server-side code.

import { auth, db } from '@/lib/firebase-admin'; // ✅ IMPORT from the new module
import { products } from './data'; 
import type { Product } from './types';


export async function setAdminClaim(uid: string): Promise<void> {
  try {
    await auth.setCustomUserClaims(uid, { isAdmin: true });
    console.log(`Successfully set isAdmin claim for user: ${uid}`);
  } catch (error) {
    console.error(`Error setting custom claim for ${uid}:`, error);
    throw new Error('Failed to set admin claim.');
  }
}

export async function seedProductsData() {
  console.log('Starting to seed product data via Admin SDK...');

  if (!products || products.length === 0) {
    throw new Error('No product data to seed.');
  }

  const batch = db.batch();

  products.forEach((product: Product) => {
    const docRef = db.collection('products').doc(product.id);
    
    // Convert date strings from the data file into native Date objects for Firestore.
    // This is a more robust way to handle timestamps.
    const firestoreProduct = {
      ...product,
      minExpiry: new Date(product.minExpiry),
      maxExpiry: new Date(product.maxExpiry),
      projectedSellOut: new Date(product.projectedSellOut),
    };

    // The Admin SDK bypasses security rules, so this will succeed.
    batch.set(docRef, firestoreProduct);
  });

  await batch.commit();

  console.log(`✅ Successfully seeded ${products.length} products!`);
  return products.length;
}
