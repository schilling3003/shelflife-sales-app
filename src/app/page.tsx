"use client";

import { AuthGuard } from "@/components/auth-guard";
import { DashboardClient } from "@/components/dashboard-client";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  return (
    <AuthGuard>
      <AppShell>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          <DashboardClient />
        </main>
      </AppShell>
    </AuthGuard>
  );
}
