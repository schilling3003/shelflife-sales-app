
"use client";

import { useMemo, useState } from "react";
import { ListFilter } from "lucide-react";

import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductTable } from "./product-table";

interface DashboardClientProps {
  initialProducts: Product[];
}

export function DashboardClient({ initialProducts }: DashboardClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sort, setSort] = useState("sell-out-asc");

  const handleCommit = (productId: string, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId
          ? { ...p, committedQuantity: p.committedQuantity + quantity }
          : p
      )
    );
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const dateA = new Date(a.projectedSellOut);
      const dateB = new Date(b.projectedSellOut);
      if (sort === "sell-out-asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }, [products, sort]);

  return (
    <>
      <div className="flex items-center">
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Sort
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                <DropdownMenuRadioItem value="sell-out-asc">
                  Sell-out Date: Asc
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="sell-out-desc">
                  Sell-out Date: Desc
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-lg border shadow-sm">
        <ProductTable products={sortedProducts} onCommit={handleCommit} />
      </div>
       {sortedProducts.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            No products found.
          </div>
        )}
    </>
  );
}
