
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import Link from "next/link";

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

interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export default function UsersPage() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, "users")) : null),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<UserData>(usersQuery);

  return (
    <AuthGuard>
      <AppShell>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                List of all sales representatives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading users...</p>}
              {users && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Link
                            href={`/users/${user.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {user.firstName || user.lastName
                              ? `${user.firstName ?? ""} ${
                                  user.lastName ?? ""
                                }`.trim()
                              : "Unnamed User"}
                          </Link>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
               {users?.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground mt-8">
                    No users found.
                  </div>
                )}
            </CardContent>
          </Card>
        </main>
      </AppShell>
    </AuthGuard>
  );
}
