
"use client";

import { differenceInDays, format } from "date-fns";
import type { Product } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CommitDialog } from "./commit-dialog";
import { Progress } from "@/components/ui/progress";

interface ProductTableProps {
  products: Product[];
  onCommit: (productId: string, quantity: number) => void;
}

export function ProductTable({ products, onCommit }: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Item Code</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Division</TableHead>
          <TableHead>Pack</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Min Exp</TableHead>
          <TableHead>Max Exp</TableHead>
          <TableHead>Sell Out</TableHead>
          <TableHead className="text-right">QOH</TableHead>
          <TableHead className="w-[150px] text-right">Inventory</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const daysToSellOut = differenceInDays(new Date(product.projectedSellOut), new Date());
          const availableQuantity = product.quantityOnHand - product.committedQuantity;
          const commitmentPercentage = product.quantityOnHand > 0 ? (product.committedQuantity / product.quantityOnHand) * 100 : 0;

          return (
            <TableRow key={product.id}>
              <TableCell className="py-1 font-medium font-headline">{product.description}</TableCell>
              <TableCell className="py-1 font-mono">{product.itemCode}</TableCell>
              <TableCell className="py-1 text-muted-foreground">{product.brand}</TableCell>
              <TableCell className="py-1">{product.division}</TableCell>
              <TableCell className="py-1">{product.packSize}</TableCell>
              <TableCell className="py-1">{product.size}</TableCell>
              <TableCell className="py-1">{format(new Date(product.minExpiry), "MM/dd/yy")}</TableCell>
              <TableCell className="py-1">{format(new Date(product.maxExpiry), "MM/dd/yy")}</TableCell>
              <TableCell className={cn("py-1", daysToSellOut < 0 && "text-destructive")}>
                {format(new Date(product.projectedSellOut), "MM/dd/yy")}
              </TableCell>
              <TableCell className="py-1 text-right font-medium">{product.quantityOnHand.toLocaleString()}</TableCell>
               <TableCell className="py-1 text-right">
                <div className="flex flex-col items-end">
                   <div className="font-medium">{availableQuantity.toLocaleString()} <span className="text-xs text-muted-foreground">avail</span></div>
                   <Progress value={commitmentPercentage} className="h-1 mt-1 w-24" />
                </div>
              </TableCell>
              <TableCell className="py-1 text-right">
                <CommitDialog product={product} onCommit={onCommit} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
