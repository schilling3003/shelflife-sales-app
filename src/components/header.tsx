import { Package, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6" />
        <h1 className="font-headline text-2xl font-semibold">
          ShelfLife Sales
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button>
          <UploadCloud className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </div>
    </header>
  );
}
