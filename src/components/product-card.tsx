"use client";

import { differenceInDays, format } from "date-fns";
import { Calendar, Package, Tag, Warehouse } from "lucide-react";
import type { Product, ProductStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CommitDialog } from "./commit-dialog";

interface ProductCardProps {
  product: Product;
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

export function ProductCard({ product, onCommit }: ProductCardProps) {
  const status = getStatus(product);
  const { label, className } = statusConfig[status];
  const daysToSellOut = differenceInDays(new Date(product.projectedSellOut), new Date());
  const commitProgress = Math.min(
    (product.committedQuantity / product.quantityOnHand) * 100,
    100
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline tracking-tight">
          {product.description}
        </CardTitle>
        <CardDescription>
          <span className="font-mono">{product.itemCode}</span> - Div:{" "}
          {product.division}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 flex-grow">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Warehouse className="h-4 w-4" />
            <span>On Hand</span>
          </div>
          <span className="font-semibold text-right">{product.quantityOnHand.toLocaleString()}</span>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Pack Size</span>
          </div>
          <span className="font-semibold text-right">{product.packSize}</span>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Shelf Life</span>
          </div>
          <span className="font-semibold text-right">{differenceInDays(new Date(product.minExpiry), new Date())} days</span>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span>Sell By</span>
          </div>
          <span className={cn("font-semibold text-right", daysToSellOut < 0 && "text-destructive")}>{format(new Date(product.projectedSellOut), "MMM d, yyyy")}</span>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>Commitment</span>
            <span>{commitProgress.toFixed(0)}%</span>
          </div>
          <Progress value={commitProgress} aria-label={`${commitProgress.toFixed(0)}% committed`} />
          <div className="mt-1 text-xs text-muted-foreground text-right">
            {product.committedQuantity.toLocaleString()} / {product.quantityOnHand.toLocaleString()} units
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className={cn("font-semibold", className)}>{label}</Badge>
        <CommitDialog product={product} onCommit={onCommit} />
      </CardFooter>
    </Card>
  );
}
