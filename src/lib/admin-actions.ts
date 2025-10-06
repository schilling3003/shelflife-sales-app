// IMPORTANT: This file should only be imported and used in server-side code.

import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { products } from './data'; 
import { Product } from './types';

// When running in a Google Cloud environment like App Hosting, the Admin SDK 
// can automatically discover the correct credentials and project configuration.
// We ensure we only initialize the app once.
if (!getApps().length) {
  // Initialize with application default credentials.
  initializeApp();
}

const db = getFirestore();

export async function seedProductsData() {
  console.log('Starting to seed product data via Admin SDK...');

  if (!products || products.length === 0) {
    throw new Error('No product data to seed.');
  }

  const batch = db.batch();

  products.forEach((product: Product) => {
    const docRef = db.collection('products').doc(product.id);
    
    // Convert date strings back to Date objects for Firestore
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
