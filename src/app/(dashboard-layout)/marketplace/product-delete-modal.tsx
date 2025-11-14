"use client";

import * as React from "react";
import { IconAlertTriangle, IconTrash, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductService } from "@/services/product.service";
import { Product } from "./product-schema";

interface ProductDeleteModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductDeleted?: () => void;
}

export function ProductDeleteModal({
  product,
  open,
  onOpenChange,
  onProductDeleted,
}: ProductDeleteModalProps) {
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!product) return;

    try {
      setDeleting(true);
      await ProductService.deleteProduct(product.id);

      toast.success("Product deleted successfully", {
        description: `${product.title} has been removed from the marketplace`,
      });

      onProductDeleted?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(product.price);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10">
              <IconAlertTriangle className="size-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Delete Product</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info Card */}
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {product.thumbnail && (
                  <img
                    src={`${
                      process.env.NEXT_PUBLIC_API_BASE_URL ||
                      "http://14.169.52.232:3005"
                    }${product.thumbnail}`}
                    alt={product.title}
                    className="size-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-foreground line-clamp-2">
                    {product.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    <span className="text-sm font-semibold text-green-600">
                      {formattedPrice}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                By {product.authorName}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex gap-3">
              <IconAlertTriangle className="size-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Warning</p>
                <p className="text-sm text-muted-foreground">
                  Deleting this product will:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Remove the product from marketplace
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Delete all product images and files
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Remove all reviews and ratings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    This action cannot be reversed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <IconTrash className="mr-2 size-4" />
                Delete Product
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
