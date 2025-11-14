"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  IconEye,
  IconHeart,
  IconMessage,
  IconFileText,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Post } from "./post-schema";
import { PostTableActions } from "./post-table-actions";

export const columns: ColumnDef<Post>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Post",
    cell: ({ row }) => {
      const post = row.original;
      const initials = post.authorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-start gap-3 max-w-md">
          <Avatar className="size-9 mt-0.5">
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-medium line-clamp-2">{post.title}</span>
            <span className="text-muted-foreground text-sm">
              by {post.authorName}
            </span>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig: Record<
        string,
        { color: string; icon: React.ReactNode }
      > = {
        Published: {
          color: "bg-green-500/10 text-green-500 border-green-500/20",
          icon: <IconFileText className="size-3.5" />,
        },
        Draft: {
          color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          icon: <IconFileText className="size-3.5" />,
        },
        Archived: {
          color: "bg-red-500/10 text-red-500 border-red-500/20",
          icon: <IconFileText className="size-3.5" />,
        },
      };

      const config = statusConfig[status];

      return (
        <Badge
          variant="outline"
          className={`${config.color} flex w-fit items-center gap-1.5 px-2.5 py-1 font-medium`}
        >
          {config.icon}
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      if (!category) return <span className="text-muted-foreground">-</span>;

      return (
        <Badge variant="outline" className="px-2.5 py-1">
          {category}
        </Badge>
      );
    },
  },
  {
    id: "engagement",
    header: "Engagement",
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <IconEye className="size-4" />
            <span>{post.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <IconHeart className="size-4" />
            <span>{post.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <IconMessage className="size-4" />
            <span>{post.comments.toLocaleString()}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm">
          {date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as { refreshData?: () => void } | undefined;
      return (
        <PostTableActions
          post={row.original}
          onPostDeleted={meta?.refreshData}
          onPostUpdated={meta?.refreshData}
        />
      );
    },
  },
];

