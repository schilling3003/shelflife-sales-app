"use client";

import { useMemo, useState } from "react";
import { ListFilter } from "lucide-react";

import type { Product, ProductStatus } from "@/lib/types";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { differenceInDays } from "date-fns";
import { ProductTable } from "./product-table";

type FilterStatus = "all" | ProductStatus;

interface DashboardClientProps {
  initialProducts: Product[];
}

const getStatus = (product: Product): ProductStatus => {
  const daysToExpiry = differenceInDays(new Date(product.minExpiry), new Date());
  if (daysToExpiry < 30) return "expiring-soon";
  if (daysToExpiry < 90) return "at-risk";
  return "healthy";
};

export function DashboardClient({ initialProducts }: DashboardClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filter, setFilter] = useState<FilterStatus>("all");
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

  const filteredAndSortedProducts = useMemo(() => {
    let filtered =
      filter === "all"
        ? products
        : products.filter((p) => getStatus(p) === filter);

    return filtered.sort((a, b) => {
      const dateA = new Date(a.projectedSellOut);
      const dateB = new Date(b.projectedSellOut);
      if (sort === "sell-out-asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }, [products, filter, sort]);

  return (
    <>
      <div className="flex items-center">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="healthy">Healthy</TabsTrigger>
            <TabsTrigger value="at-risk" className="text-yellow-600">At Risk</TabsTrigger>
            <TabsTrigger value="expiring-soon" className="text-red-600">Expiring Soon</TabsTrigger>
          </TabsList>
        </Tabs>
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
        <ProductTable products={filteredAndSortedProducts} onCommit={handleCommit} />
      </div>
       {filteredAndSortedProducts.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            No products match the current filter.
          </div>
        )}
    </>
  );
}
