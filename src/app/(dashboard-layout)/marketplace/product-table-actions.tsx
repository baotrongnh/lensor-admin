"use client";

import * as React from "react";
import { IconDotsVertical, IconEye, IconTrash } from "@tabler/icons-react";

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

  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  const handleDeleteProduct = () => {
    setShowDeleteModal(true);
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
