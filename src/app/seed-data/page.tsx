
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import {
  writeBatch,
  doc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { products as initialProducts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AppShell } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function SeedDataPage() {
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not initialized.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const productsCollectionRef = collection(firestore, 'products');
      const batch = writeBatch(firestore);

      initialProducts.forEach((product) => {
        const docRef = doc(productsCollectionRef, product.id);
        batch.set(docRef, product);
      });

      await batch.commit();
      toast({
        title: 'Success!',
        description: `${initialProducts.length} products have been seeded to your database.`,
      });
    } catch (error) {
      console.error('Error seeding data:', error);
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
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Firestore is not initialized.',
          });
      return;
    }
    setIsDeleting(true);
    try {
      const productsCollectionRef = collection(firestore, 'products');
      const querySnapshot = await getDocs(productsCollectionRef);
      const batch = writeBatch(firestore);
      let count = 0;
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
        count++;
      });
      await batch.commit();
      toast({
        title: 'Success!',
        description: `${count} products have been deleted from your database.`,
      });
    } catch (error) {
        console.error('Error deleting data:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
          variant: 'destructive',
          title: 'Error Deleting Data',
          description: errorMessage,
        });
    } finally {
        setIsDeleting(false);
    }
  }

  return (
    <AuthGuard>
      <AppShell>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Seed Firestore Data</CardTitle>
              <CardDescription>
                Populate your Firestore database with the initial set of product data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>For Development Only</AlertTitle>
                    <AlertDescription>
                        This action will write multiple documents to your Firestore database.
                        This will overwrite any existing products with the same ID.
                    </AlertDescription>
                </Alert>
              <Button
                onClick={handleSeedData}
                disabled={isLoading || isDeleting}
                className="w-full"
              >
                {isLoading ? 'Seeding...' : 'Seed Products'}
              </Button>
              <Button
                onClick={handleDeleteData}
                disabled={isLoading || isDeleting}
                variant="destructive"
                className="w-full"
              >
                {isDeleting ? 'Deleting...' : 'Delete All Products'}
              </Button>
            </CardContent>
          </Card>
        </main>
      </AppShell>
    </AuthGuard>
  );
}

    