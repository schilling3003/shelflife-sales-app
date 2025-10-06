import { seedProductsData } from '@/lib/admin-actions';
import { NextResponse } from 'next/server';

// This API route is protected by App Hosting's authentication.
// Only authenticated users of your app can call it.
// We can add more specific role-based checks here in the future if needed.

export async function POST() {
  try {
    const count = await seedProductsData();
    return NextResponse.json({ message: 'Seeding successful', count });
  } catch (error) {
    console.error('API Error Seeding Data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    // Return a 500 Internal Server Error response
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
