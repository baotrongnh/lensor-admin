"use client";

import * as React from "react";
import {
  IconEye,
  IconHeart,
  IconMessage,
  IconShare,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PostService, PostStats } from "@/services/post.service";

interface PostStatsModalProps {
  postId: string;
  postTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostStatsModal({
  postId,
  postTitle,
  open,
  onOpenChange,
}: PostStatsModalProps) {
  const [stats, setStats] = React.useState<PostStats | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && postId) {
      fetchPostStats();
    }
  }, [open, postId]);

  const fetchPostStats = async () => {
    try {
      setLoading(true);
      const response = await PostService.getPostStats(postId);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch post stats:", error);
      toast.error("Failed to load post statistics", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Post Statistics</DialogTitle>
          <DialogDescription className="line-clamp-1">
            Engagement statistics for: {postTitle}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Vote Count */}
              <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                    Lượt vote
                  </CardTitle>
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <IconHeart className="size-5 text-red-600 dark:text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {stats.voteCount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tổng số vote
                  </p>
                </CardContent>
              </Card>

              {/* Comment Count */}
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                    Bình luận
                  </CardTitle>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <IconMessage className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {stats.commentCount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tổng số bình luận
                  </p>
                </CardContent>
              </Card>

              {/* View Count */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Lượt xem
                  </CardTitle>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <IconEye className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.viewCount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tổng số lượt xem
                  </p>
                </CardContent>
              </Card>

              {/* Share Count */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Chia sẻ
                  </CardTitle>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <IconShare className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.shareCount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tổng số chia sẻ
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No statistics available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

