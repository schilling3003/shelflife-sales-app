# Admin Feature Error Summary

## 1. The Goal

The objective is to create an "admin" role for a user by setting a Firebase custom claim (`isAdmin: true`). This is intended to allow the admin user to perform privileged actions, starting with seeding Firestore data from the client.

## 2. The Problem

When the user clicks the "Make Me Admin" button on the `/seed-data` page, the application consistently fails with a 500 Internal Server Error.

The Next.js error overlay on the client shows a JSON parsing error (`Unexpected token '<', ... is not valid JSON`), which indicates the server is crashing and returning an HTML error page instead of a JSON response.

The server logs show the following error:

**`Error: The default Firebase app does not exist. Make sure you call initializeApp() before using any Firebase services.`**

This error points to a critical failure in initializing the `firebase-admin` SDK on the server before its services are used. This happens within the `/api/set-admin` API route. Despite multiple attempts to correct the initialization order and placement, the error persists, indicating a fundamental issue with how the SDK is interacting with the App Hosting environment.

## 3. The Code

Here are the complete contents of the relevant files involved in this process.

---

### `src/app/seed-data/page.tsx`

This is the client-side page containing the button that triggers the API call.

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, UserCog } from 'lucide-react';
import { products } from '@/lib/data';
import { useFirestore, useUser } from '@/firebase';
import { writeBatch, doc } from 'firebase/firestore';

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { firebaseUser } = useUser();


  const handleMakeAdmin = async () => {
    if (!firebaseUser) {
      toast({ variant: "destructive", title: "Not signed in", description: "You must be signed in to become an admin." });
      return;
    }
    setIsAdminLoading(true);
    try {
      const token = await firebaseUser.getIdToken();

      const response = await fetch('/api/set-admin', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid: firebaseUser.uid }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to set admin claim.');
      }
      
      const idTokenResult = await firebaseUser.getIdTokenResult(true);

      if (idTokenResult.claims.isAdmin) {
         toast({
           title: 'Success!',
           description: "You are now an admin. You can now seed data.",
         });
      } else {
         throw new Error('Admin claim was not set correctly. Please try again.');
      }

    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
       toast({
         variant: 'destructive',
         title: 'Error Making Admin',
         description: errorMessage,
       });
    } finally {
      setIsAdminLoading(false);
    }
  }


  const handleSeedData = async () => {
    if (!firestore || !firebaseUser) {
        toast({ variant: "destructive", title: "Error", description: "Firestore or user not available." });
        return;
    }
    
    const idTokenResult = await firebaseUser.getIdTokenResult();
    if (!idTokenResult.claims.isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You must be an admin to perform this action. Click the "Make Me Admin" button first.',
      });
      return;
    }

    setIsLoading(true);
    try {
        const batch = writeBatch(firestore);
        
        products.forEach((product) => {
            const productRef = doc(firestore, "products", product.id);
            batch.set(productRef, product);
        });

        await batch.commit();

        toast({
            title: 'Success!',
            description: `${products.length} products have been seeded to your database.`,
        });

    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
       toast({
         variant: 'destructive',
         title: 'Error Seeding Data',
         description: errorMessage,
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async () => {
    toast({
        title: 'Not Implemented',
        description: 'Deleting all products requires a secure admin action.',
    })
  }

  return (
    <AuthGuard>
      <AppShell>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Admin Tasks</CardTitle>
              <CardDescription>
                Perform administrative actions like setting roles and seeding data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <Alert>
                    <UserCog className="h-4 w-4" />
                    <AlertTitle>Step 1: Become an Admin</AlertTitle>
                    <AlertDescription>
                        For development, click this button to grant your user account admin privileges. You only need to do this once.
                    </AlertDescription>
                </Alert>
                <Button
                    onClick={handleMakeAdmin}
                    disabled={isAdminLoading}
                    variant="secondary"
                >
                    {isAdminLoading ? 'Assigning Role...' : 'Make Me Admin'}
                </Button>
                
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Step 2: Seed Firestore Data</AlertTitle>
                    <AlertDescription>
                        This action will write {products.length} documents to your Firestore 'products' collection using your admin privileges.
                    </AlertDescription>
                </Alert>
              <Button
                onClick={handleSeedData}
                disabled={isLoading || isDeleting}
                className="w-full"
              >
                {isLoading ? 'Seeding...' : 'Seed Products'}
              </Button>
            </CardContent>
            <CardFooter>
                 <Button
                    onClick={handleDeleteData}
                    disabled={isLoading || isDeleting}
                    variant="destructive"
                    className="w-full"
                >
                    {isDeleting ? 'Deleting...' : 'Delete All Products (Not Implemented)'}
                </Button>
            </CardFooter>
          </Card>
        </main>
      </AppShell>
    </AuthGuard>
  );
}
```

---

### `src/app/api/set-admin/route.ts`

This is the API route that handles the request from the client.

```ts
import { setAdminClaim } from '@/lib/admin-actions';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp();
}

export async function POST(request: Request) {
  try {
    const callingUser = await getAuth().verifyIdToken(request.headers.get('Authorization')?.split('Bearer ')[1] || '');

    if (!callingUser) {
        return new NextResponse('Unauthorized: No valid user token provided.', { status: 401 });
    }
    
    const body = await request.json();
    const { uid } = body;

    if (!uid) {
      return new NextResponse('Bad Request: Missing uid in request body.', { status: 400 });
    }

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
```

---

### `src/lib/admin-actions.ts`

This server-side module contains the function that uses the `firebase-admin` SDK. This is where the error seems to originate.

```ts
// IMPORTANT: This file should only be imported and used in server-side code.

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { products } from './data'; 
import type { Product } from './types';

let db: Firestore;
let auth: Auth;

if (!getApps().length) {
  initializeApp();
}

db = getFirestore();
auth = getAuth();


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
    
    const firestoreProduct = {
      ...product,
      minExpiry: new Date(product.minExpiry),
      maxExpiry: new Date(product.maxExpiry),
      projectedSellOut: new Date(product.projectedSellOut),
    };

    batch.set(docRef, firestoreProduct);
  });

  await batch.commit();

  console.log(`✅ Successfully seeded ${products.length} products!`);
  return products.length;
}
```

---

### `package.json`

This shows the versions of the relevant Firebase libraries.

```json
{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
    "build": "NODE_ENV=production next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/google-genai": "^1.20.0",
    "@genkit-ai/next": "^1.20.0",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^11.9.1",
    "firebase-admin": "^12.3.0",
    "genkit": "^1.20.0",
    "lucide-react": "^0.475.0",
    "next": "15.3.3",
    "patch-package": "^8.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "genkit-cli": "^1.20.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```
