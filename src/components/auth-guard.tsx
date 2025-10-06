
"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "./app-shell";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [firebaseUser, isUserLoading, router]);

  if (isUserLoading || !firebaseUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return <>{children}</>;
}
