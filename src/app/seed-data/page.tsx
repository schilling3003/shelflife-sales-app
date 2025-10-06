
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
import { writeBatch, doc, collection } from 'firebase/firestore';

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // We'll leave delete for a future step
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
      // Force a token refresh to get the latest custom claims.
      const token = await firebaseUser.getIdToken(true);

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
      
      // Force a refresh of the user's ID token to get the new claim.
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
    
    // Check for admin claim on the client
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
    // This functionality will need its own API route and admin action
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
