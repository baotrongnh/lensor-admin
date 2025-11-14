"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconHeart, IconMessage } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Post } from "./post-schema";
import { PostTableActions } from "./post-table-actions";

export const columns: ColumnDef<Post>[] = [
  {
    id: "author",
    header: "Author",
    cell: ({ row }) => {
      const post = row.original;
      const initials = post.authorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{post.authorName}</span>
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
      const post = row.original;
      return (
        <div className="max-w-md">
          <span className="font-medium line-clamp-2">{post.title}</span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {row.original.createdAt}
        </div>
      );
    },
  },
  {
    accessorKey: "voteCount",
    header: "Votes",
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <IconHeart
            className={`size-4 ${
              post.isLiked
                ? "fill-current text-red-500"
                : "text-muted-foreground"
            }`}
          />
          <span className="font-medium">{post.voteCount.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "commentCount",
    header: "Comments",
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <IconMessage className="size-4 text-muted-foreground" />
          <span className="font-medium">
            {post.commentCount.toLocaleString()}
          </span>
        </div>
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
        <PostTableActions
          post={row.original}
          onPostDeleted={meta?.refreshData}
        />
      );
    },
  },
];
