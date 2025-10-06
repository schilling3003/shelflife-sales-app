
'use client';

import { useState } from 'react';
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
import { products } from '@/lib/data';

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // We'll leave delete for a future step
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed-data', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to seed data.');
      }

      const data = await response.json();
      toast({
        title: 'Success!',
        description: `${data.count} products have been seeded to your database.`,
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
                        This action will write {products.length} documents to your Firestore database using a secure, server-side admin process.
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
