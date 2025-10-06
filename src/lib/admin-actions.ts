
// IMPORTANT: This file should only be imported and used in server-side code.

import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { products } from './data'; 

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

  products.forEach((product) => {
    const docRef = db.collection('products').doc(product.id);
    // The Admin SDK bypasses security rules, so this will succeed.
    batch.set(docRef, product);
  });

  await batch.commit();

  console.log(`✅ Successfully seeded ${products.length} products!`);
  return products.length;
}
