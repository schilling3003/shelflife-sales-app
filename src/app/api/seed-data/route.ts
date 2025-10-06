
import { seedProductsData } from '@/lib/admin-actions';
import { NextResponse } from 'next/server';

// This API route is protected by App Hosting's authentication.
// Only authenticated users of your app can call it.

export async function POST() {
  try {
    const count = await seedProductsData();
    return NextResponse.json({ message: 'Seeding successful', count });
  } catch (error) {
    console.error('API Error Seeding Data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    // Return a plain text error response with a 500 status code.
    // This is more robust and prevents the client from trying to parse HTML as JSON.
    return new NextResponse(errorMessage, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
