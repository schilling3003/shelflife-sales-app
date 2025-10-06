
"use client";

import { useMemo, useState } from "react";
import { ListFilter } from "lucide-react";

import { Product } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductTable } from "./product-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore } from "@/firebase";
import { products as initialProducts } from "@/lib/data";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";

export function DashboardClient() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sort, setSort] = useState("sell-out-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const handleCommit = (productId: string, quantity: number) => {
    if (!user || !firestore) return;

    // Optimistically update the UI
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId
          ? { ...p, committedQuantity: p.committedQuantity + quantity }
          : p
      )
    );
    
    const commitmentsRef = collection(firestore, 'users', user.uid, 'salesCommitments');
    addDocumentNonBlocking(commitmentsRef, {
        productId,
        committedQuantity: quantity,
        commitmentDate: new Date().toISOString(),
        userId: user.uid,
    });
  };
  
  const divisions = useMemo(() => ["all", ...Array.from(new Set(initialProducts.map(p => p.division.toString()))).sort((a,b) => Number(a) - Number(b))], [initialProducts]);
  const brands = useMemo(() => ["all", ...Array.from(new Set(initialProducts.map(p => p.brand))).sort()], [initialProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (divisionFilter !== "all") {
      filtered = filtered.filter(p => p.division.toString() === divisionFilter);
    }
    
    if (brandFilter !== "all") {
      filtered = filtered.filter(p => p.brand === brandFilter);
    }

    if (showOnlyAvailable) {
        filtered = filtered.filter(p => p.quantityOnHand > p.committedQuantity);
    }

    return filtered;
  }, [products, divisionFilter, brandFilter, showOnlyAvailable]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const availableA = a.quantityOnHand - a.committedQuantity;
      const availableB = b.quantityOnHand - b.committedQuantity;
      const dateA = new Date(a.projectedSellOut);
      const dateB = new Date(b.projectedSellOut);

      switch (sort) {
        case "sell-out-asc":
          return dateA.getTime() - dateB.getTime();
        case "sell-out-desc":
            return dateB.getTime() - dateA.getTime();
        case "desc-asc":
          return a.description.localeCompare(b.description);
        case "desc-desc":
          return b.description.localeCompare(a.description);
        case "brand-asc":
          return a.brand.localeCompare(b.brand);
        case "brand-desc":
          return b.brand.localeCompare(a.brand);
        case "available-asc":
          return availableA - availableB;
        case "available-desc":
            return availableB - availableA;
        default:
          return 0;
      }
    });
  }, [filteredProducts, sort]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };


  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <Label htmlFor="division-filter">Division</Label>
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger id="division-filter" className="w-[100px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {divisions.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All' : d}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor="brand-filter">Brand</Label>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger id="brand-filter" className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {brands.map(b => <SelectItem key={b} value={b}>{b === 'all' ? 'All' : b}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <Checkbox id="show-available" checked={showOnlyAvailable} onCheckedChange={(checked) => setShowOnlyAvailable(!!checked)} />
            <Label htmlFor="show-available">Show Available Only</Label>
        </div>
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
                <DropdownMenuRadioItem value="desc-asc">
                  Description: A-Z
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc-desc">
                  Description: Z-A
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="brand-asc">
                  Brand: A-Z
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="brand-desc">
                  Brand: Z-A
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="available-asc">
                  Available: Low to High
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="available-desc">
                  Available: High to Low
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-lg border shadow-sm">
        <ProductTable products={paginatedProducts} onCommit={handleCommit} />
      </div>
       {paginatedProducts.length === 0 && (
          <div className="text-center text-muted-foreground mt-8">
            No products found.
          </div>
        )}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
            Showing {paginatedProducts.length > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, sortedProducts.length) : 0} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                    value={String(itemsPerPage)}
                    onValueChange={handleItemsPerPageChange}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Next
                </Button>
            </div>
        </div>
    </div>
    </>
  );
}
