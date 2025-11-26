"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Product } from "./product-schema";
import { ProductTableActions } from "./product-table-actions";

export const columns: ColumnDef<Product>[] = [
  {
    id: "author",
    header: "Author",
    cell: ({ row }) => {
      const product = row.original;
      const initials = product.authorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={product.authorAvatar} alt={product.authorName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{product.authorName}</span>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="max-w-md">
          <span className="font-medium line-clamp-2">{product.title}</span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.original.price;
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);

      return <div className="font-semibold text-green-600">{formatted}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <Badge variant="secondary" className="font-medium">
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={status === "active" ? "default" : "destructive"}
          className="font-medium"
        >
          {status === "active" ? "Active" : "Blocked"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "sellCount",
    header: "Sales",
    cell: ({ row }) => {
      const sellCount = row.original.sellCount;
      return (
        <div className="font-medium">{sellCount.toLocaleString()} sold</div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as
        | { refreshData?: () => void }
        | undefined;
      return (
        <ProductTableActions
          product={row.original}
          onProductDeleted={meta?.refreshData}
        />
      );
    },
  },
];
