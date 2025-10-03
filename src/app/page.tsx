import { Header } from "@/components/header";
import { DashboardClient } from "@/components/dashboard-client";
import { products as initialProducts } from "@/lib/data";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
        <DashboardClient initialProducts={initialProducts} />
      </main>
    </div>
  );
}
