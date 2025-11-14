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
import { PostService } from "@/services/post.service";
import { Post } from "./post-schema";

interface PostDeleteModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostDeleted?: () => void;
}

export function PostDeleteModal({
  post,
  open,
  onOpenChange,
  onPostDeleted,
}: PostDeleteModalProps) {
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!post) return;

    try {
      setDeleting(true);
      await PostService.deletePost(post.id);

      toast.success("Post deleted successfully");
      onPostDeleted?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10">
              <IconAlertTriangle className="size-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Delete Post</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="font-semibold line-clamp-2">{post.title}</p>
            <p className="text-sm text-muted-foreground mt-1">by {post.authorName}</p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex gap-3">
              <IconAlertTriangle className="size-5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Warning</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete the post and all associated data.
                </p>
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
                Delete Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

