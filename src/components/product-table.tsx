"use client";

import { differenceInDays, format } from "date-fns";
import type { Product, ProductStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
          <TableHead>Division</TableHead>
          <TableHead>Pack</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Min Exp</TableHead>
          <TableHead>Max Exp</TableHead>
          <TableHead>Sell Out</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const status = getStatus(product);
          const { label, className } = statusConfig[status];
          const daysToSellOut = differenceInDays(new Date(product.projectedSellOut), new Date());

          return (
            <TableRow key={product.id}>
              <TableCell className="py-2">
                <div className="font-medium font-headline">{product.description}</div>
                <div className="text-xs text-muted-foreground">{product.brand}</div>
                <div className="text-xs text-muted-foreground font-mono">{product.itemCode}</div>
              </TableCell>
              <TableCell className="py-2">
                <Badge variant="outline" className={cn("font-semibold", className)}>
                  {label}
                </Badge>
              </TableCell>
              <TableCell className="py-2">{product.division}</TableCell>
              <TableCell className="py-2">{product.packSize}</TableCell>
              <TableCell className="py-2">{product.size}</TableCell>
              <TableCell className="py-2">{format(new Date(product.minExpiry), "MM/dd/yy")}</TableCell>
              <TableCell className="py-2">{format(new Date(product.maxExpiry), "MM/dd/yy")}</TableCell>
              <TableCell className={cn("py-2", daysToSellOut < 0 && "text-destructive")}>
                {format(new Date(product.projectedSellOut), "MM/dd/yy")}
              </TableCell>
              <TableCell className="py-2 text-right">
                <CommitDialog product={product} onCommit={onCommit} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
