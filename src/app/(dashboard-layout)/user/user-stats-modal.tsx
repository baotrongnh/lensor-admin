"use client";

import * as React from "react";
import {
  IconFileText,
  IconUsers,
  IconUserPlus,
  IconChartBar,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserService, UserStats } from "@/services/user.service";

interface UserStatsModalProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserStatsModal({
  userId,
  userName,
  userAvatar,
  open,
  onOpenChange,
}: UserStatsModalProps) {
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && userId) {
      fetchUserStats();
    }
  }, [open, userId]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUserStats(userId);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      toast.error("Failed to load user statistics", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      // Don't close modal, just show error state
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Statistics</DialogTitle>
          <DialogDescription>
            Activity and usage statistics for {userName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-lg">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{userName}</h3>
                <p className="text-sm text-muted-foreground">User ID: {userId.slice(0, 8)}...</p>
              </div>
            </div>

            <Separator />

            {stats ? (
              <div className="grid gap-6 md:grid-cols-3">
                {/* Posts Count */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Bài đăng
                    </CardTitle>
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <IconFileText className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      {stats.postsCount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tổng số bài đã đăng
                    </p>
                  </CardContent>
                </Card>

                {/* Followers Count */}
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                      Người theo dõi
                    </CardTitle>
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <IconUsers className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                      {stats.followersCount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Số người đang theo dõi
                    </p>
                  </CardContent>
                </Card>

                {/* Following Count */}
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Đang theo dõi
                    </CardTitle>
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <IconUserPlus className="size-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      {stats.followingCount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Số người đang theo dõi
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <IconChartBar className="mx-auto size-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Statistics Available</h3>
                <p className="text-sm text-muted-foreground">
                  Statistics data is not available for this user at the moment.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

