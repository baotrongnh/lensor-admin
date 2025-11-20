"use client";

import * as React from "react";
import { IconDotsVertical, IconEye, IconTrash, IconBan, IconCheck } from "@tabler/icons-react";
import { ProductService } from "@/services/product.service";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "./product-schema";
import { ProductDetailsModal } from "./product-details-modal";
import { ProductDeleteModal } from "./product-delete-modal";

interface ProductTableActionsProps {
  product: Product;
  onProductDeleted?: () => void;
}

export function ProductTableActions({
  product,
  onProductDeleted,
}: ProductTableActionsProps) {
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isBlocking, setIsBlocking] = React.useState(false);

  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  const handleDeleteProduct = () => {
    setShowDeleteModal(true);
  };

  const handleBlockProduct = async () => {
    try {
      setIsBlocking(true);
      await ProductService.blockProduct(product.id, 'block');
      toast.success('Product blocked successfully');
      if (onProductDeleted) onProductDeleted();
    } catch (error: any) {
      console.error('Error blocking product:', error);
      toast.error(error.message || 'Failed to block product');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockProduct = async () => {
    try {
      setIsBlocking(true);
      await ProductService.blockProduct(product.id, 'unblock');
      toast.success('Product unblocked successfully');
      if (onProductDeleted) onProductDeleted();
    } catch (error: any) {
      console.error('Error unblocking product:', error);
      toast.error(error.message || 'Failed to unblock product');
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground size-8"
            size="icon"
          >
            <IconDotsVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewDetails}>
            <IconEye className="mr-2 size-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleBlockProduct} disabled={isBlocking}>
            <IconBan className="mr-2 size-4" />
            Block Product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleUnblockProduct} disabled={isBlocking}>
            <IconCheck className="mr-2 size-4" />
            Unblock Product
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDeleteProduct}>
            <IconTrash className="mr-2 size-4" />
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Product Details Modal */}
      <ProductDetailsModal
        productId={product.id}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      {/* Product Delete Modal */}
      <ProductDeleteModal
        product={product}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onProductDeleted={onProductDeleted}
      />
    </>
  );
}
