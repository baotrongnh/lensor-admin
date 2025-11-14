"use client";

import * as React from "react";
import {
  IconFileText,
  IconUser,
  IconCalendar,
  IconEye,
  IconHeart,
  IconMessage,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PostService, ApiPost } from "@/services/post.service";

interface PostDetailsModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailsModal({
  postId,
  open,
  onOpenChange,
}: PostDetailsModalProps) {
  const [postDetails, setPostDetails] = React.useState<ApiPost | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && postId) {
      fetchPostDetails();
    }
  }, [open, postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const response = await PostService.getPostById(postId);
      setPostDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch post details:", error);
      toast.error("Failed to load post details", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
          <DialogDescription>
            Detailed information about the post
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        ) : postDetails ? (
          <div className="space-y-6">
            {/* Post Title */}
            <div>
              <h3 className="text-2xl font-bold mb-2">{postDetails.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={postDetails.authorAvatar} />
                    <AvatarFallback>
                      {getInitials(postDetails.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{postDetails.authorName}</span>
                </div>
                <span>•</span>
                <span>{formatDate(postDetails.createdAt)}</span>
              </div>
            </div>

            <Separator />

            {/* Engagement Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <IconEye className="size-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{postDetails.views?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <IconHeart className="size-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{postDetails.likes?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <IconMessage className="size-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{postDetails.comments?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Post Content */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <IconFileText className="size-4" />
                Content
              </h4>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap">{postDetails.content}</p>
              </div>
            </div>

            {/* Post Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-1">Status</p>
                <Badge>{postDetails.status}</Badge>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-1">Category</p>
                <p className="text-sm text-muted-foreground">
                  {postDetails.category || "No category"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-1">Created At</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(postDetails.createdAt)}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-1">Updated At</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(postDetails.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

