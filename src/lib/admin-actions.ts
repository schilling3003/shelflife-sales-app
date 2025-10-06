// IMPORTANT: This file should only be imported and used in server-side code.

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { products } from './data'; // Assuming your product data is here

// Firebase App Hosting provides GOOGLE_APPLICATION_CREDENTIALS automatically.
// For local development, you would need to set this environment variable
// to the path of your service account key file.
// Example: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/key.json"

const adminApp =
  getApps().find((app) => app.name === 'firebase-admin-app') ||
  initializeApp(
    {
      // projectId is automatically inferred from service account credentials
    },
    'firebase-admin-app'
  );

const db = getFirestore(adminApp);

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
