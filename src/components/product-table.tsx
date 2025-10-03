"use client";

import { differenceInDays, format } from "date-fns";
import type { Product, ProductStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface ProductTableProps {
  products: Product[];
  onCommit: (productId: string, quantity: number) => void;
}

const getStatus = (product: Product): ProductStatus => {
  const daysToExpiry = differenceInDays(new Date(product.minExpiry), new Date());
  if (daysToExpiry < 30) return "expiring-soon";
  if (daysToExpiry < 90) return "at-risk";
  return "healthy";
};

const statusConfig = {
  healthy: {
    label: "Healthy",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  "at-risk": {
    label: "At Risk",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  "expiring-soon": {
    label: "Expiring Soon",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function ProductTable({ products, onCommit }: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">On Hand</TableHead>
          <TableHead>Commitment</TableHead>
          <TableHead className="text-right">Shelf Life</TableHead>
          <TableHead className="text-right">Sell By</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const status = getStatus(product);
          const { label, className } = statusConfig[status];
          const daysToSellOut = differenceInDays(new Date(product.projectedSellOut), new Date());
          const commitProgress = Math.min(
            (product.committedQuantity / product.quantityOnHand) * 100,
            100
          );

          return (
            <TableRow key={product.id}>
              <TableCell>
                <div className="font-medium font-headline">{product.description}</div>
                <div className="text-sm text-muted-foreground font-mono">{product.itemCode}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("font-semibold", className)}>
                  {label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{product.quantityOnHand.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Progress value={commitProgress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {product.committedQuantity.toLocaleString()} / {product.quantityOnHand.toLocaleString()} ({commitProgress.toFixed(0)}%)
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">{differenceInDays(new Date(product.minExpiry), new Date())} days</TableCell>
              <TableCell className={cn("text-right", daysToSellOut < 0 && "text-destructive")}>
                {format(new Date(product.projectedSellOut), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <CommitDialog product={product} onCommit={onCommit} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
