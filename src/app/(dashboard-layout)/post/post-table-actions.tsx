"use client";

import * as React from "react";
import {
  IconDotsVertical,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post } from "./post-schema";
import { PostDetailsModal } from "./post-details-modal";
import { PostDeleteModal } from "./post-delete-modal";

interface PostTableActionsProps {
  post: Post;
  onPostDeleted?: () => void;
}

export function PostTableActions({
  post,
  onPostDeleted,
}: PostTableActionsProps) {
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  const handleDeletePost = () => {
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
          <DropdownMenuItem variant="destructive" onClick={handleDeletePost}>
            <IconTrash className="mr-2 size-4" />
            Delete Post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Post Details Modal */}
      <PostDetailsModal
        postId={post.id}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      {/* Post Delete Modal */}
      <PostDeleteModal
        post={post}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onPostDeleted={onPostDeleted}
      />
    </>
  );
}

