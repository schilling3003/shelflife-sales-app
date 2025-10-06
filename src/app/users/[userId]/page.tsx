
"use client";

import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { products as allProducts } from "@/lib/data";
import type { SalesCommitment, Product } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface UserData {
  firstName?: string;
  lastName?: string;
  email: string;
}

export default function UserCommitmentsPage() {
  const { userId } = useParams<{ userId: string }>();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (firestore && userId ? doc(firestore, "users", userId) : null),
    [firestore, userId]
  );
  const { data: user, isLoading: isUserLoading } = useDoc<UserData>(userDocRef);

  const commitmentsQuery = useMemoFirebase(
    () =>
      firestore && userId
        ? collection(firestore, "users", userId, "salesCommitments")
        : null,
    [firestore, userId]
  );
  const { data: commitments, isLoading: areCommitmentsLoading } =
    useCollection<SalesCommitment>(commitmentsQuery);

  const productMap = useMemo(() => {
    return allProducts.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {} as Record<string, Product>);
  }, []);

  const isLoading = isUserLoading || areCommitmentsLoading;

  const userDisplayName =
    user?.firstName || user?.lastName
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user?.email || "Loading...";

  return (
    <AuthGuard>
      <AppShell>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle>Sales Commitments</CardTitle>
              <CardDescription>
                Commitments made by {userDisplayName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading commitments...</p>}
              {commitments && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">Committed Qty</TableHead>
                      <TableHead>Commitment Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commitments.map((commitment) => {
                      const product = productMap[commitment.productId];
                      return (
                        <TableRow key={commitment.id}>
                          <TableCell className="font-medium">
                            {product?.description || "Unknown Product"}
                          </TableCell>
                          <TableCell>{product?.brand || "-"}</TableCell>
                          <TableCell className="text-right">
                            {commitment.committedQuantity.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {format(
                              parseISO(commitment.commitmentDate),
                              "MM/dd/yyyy"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
               {commitments?.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground mt-8">
                    This user has not made any commitments yet.
                  </div>
                )}
            </CardContent>
          </Card>
        </main>
      </AppShell>
    </AuthGuard>
  );
}
