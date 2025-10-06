import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { setAdminClaim } from '@/lib/admin-actions';

export async function POST(request: Request) {
  const auth = getAdminAuth();
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
        return new NextResponse('Unauthorized: No token provided.', { status: 401 });
    }

    // Verify the ID token using the imported auth instance
    const callingUser = await auth.verifyIdToken(token);

    if (!callingUser) {
        return new NextResponse('Unauthorized: Invalid token.', { status: 401 });
    }
    
    const body = await request.json();
    const { uid } = body;

    if (!uid) {
      return new NextResponse('Bad Request: Missing uid in request body.', { status: 400 });
    }

    // Use the imported action which now also uses the centralized admin instance
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
