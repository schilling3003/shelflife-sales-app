"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { useState } from "react";

interface CommitDialogProps {
  product: Product;
  onCommit: (productId: string, quantity: number) => void;
}

export function CommitDialog({ product, onCommit }: CommitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const remainingQuantity = product.quantityOnHand - product.committedQuantity;

  const FormSchema = z.object({
    quantity: z.coerce
      .number()
      .int()
      .positive("Quantity must be positive.")
      .max(
        remainingQuantity,
        `Commitment cannot exceed remaining quantity of ${remainingQuantity}.`
      ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    onCommit(product.id, data.quantity);
    toast({
      title: "Commitment Successful",
      description: `You have committed to selling ${data.quantity} units of ${product.description}.`,
    });
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={remainingQuantity <= 0}>
          {remainingQuantity > 0 ? "Commit" : "Fully Committed"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Commit to Sell</DialogTitle>
          <DialogDescription>
            Enter the quantity of "{product.description}" you commit to selling.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-sm">
                <p><strong>Total on Hand:</strong> {product.quantityOnHand.toLocaleString()}</p>
                <p><strong>Already Committed:</strong> {product.committedQuantity.toLocaleString()}</p>
                <p><strong>Available to Commit:</strong> <span className="font-semibold">{remainingQuantity.toLocaleString()}</span></p>
            </div>
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commitment Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter quantity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Submit Commitment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
