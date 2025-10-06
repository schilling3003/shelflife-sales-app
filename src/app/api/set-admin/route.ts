
import { setAdminClaim } from '@/lib/admin-actions';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

// This API route is protected by App Hosting's authentication.
// It will only execute if the request is made by an authenticated user of your app.
// However, it does NOT automatically check for admin privileges.
// For a production app, you would add a check here to ensure the CALLER is an admin.
// For this development setup, we are trusting the client for simplicity.

// Initialize the Firebase Admin SDK ONCE at the module level.
if (!getApps().length) {
  initializeApp();
}

export async function POST(request: Request) {
  try {
    // The 'auth' object from the Admin SDK that made the request.
    // This is how we verify the caller is a valid Firebase user.
    const callingUser = await getAuth().verifyIdToken(request.headers.get('Authorization')?.split('Bearer ')[1] || '');

    if (!callingUser) {
        return new NextResponse('Unauthorized: No valid user token provided.', { status: 401 });
    }
    
    const body = await request.json();
    const { uid } = body;

    if (!uid) {
      return new NextResponse('Bad Request: Missing uid in request body.', { status: 400 });
    }

    // This is the core logic: set the custom claim using the Admin SDK
    await setAdminClaim(uid);

    return NextResponse.json({ message: `Successfully set admin claim for user ${uid}` });
    
  } catch (error) {
    console.error('API Error in /api/set-admin:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return new NextResponse(errorMessage, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
