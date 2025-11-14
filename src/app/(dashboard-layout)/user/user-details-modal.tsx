"use client";

import * as React from "react";
import {
  IconMail,
  IconCalendar,
  IconClock,
  IconUser,
  IconShieldCheck,
  IconCircleCheck,
  IconCircleX,
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
import { UserService, ApiUser } from "@/services/user.service";

interface UserDetailsModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsModal({
  userId,
  userName,
  open,
  onOpenChange,
}: UserDetailsModalProps) {
  const [userDetails, setUserDetails] = React.useState<ApiUser | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUserById(userId);
      setUserDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user details", {
        description:
          error instanceof Error ? error.message : "Please try again",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Detailed information about the user
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-start gap-4">
              <Avatar className="size-20">
                <AvatarImage
                  src={userDetails.avatarUrl}
                  alt={userDetails.name}
                />
                <AvatarFallback className="text-xl">
                  {getInitials(userDetails.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{userDetails.name}</h3>
                    <p className="text-muted-foreground">{userDetails.email}</p>
                  </div>
                  {userDetails.emailConfirmedAt ? (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      <IconCircleCheck className="mr-1 size-3.5" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-500/10 text-gray-500 border-gray-500/20"
                    >
                      <IconCircleX className="mr-1 size-3.5" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid gap-4">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Account Information
                </h4>

                {/* User ID */}
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <IconUser className="mt-1 size-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {userDetails.id}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <IconMail className="mt-1 size-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">
                      {userDetails.email}
                    </p>
                  </div>
                </div>

                {/* Email Confirmed */}
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <IconShieldCheck className="mt-1 size-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Email Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(userDetails.emailConfirmedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Activity Timestamps
                </h4>

                {/* Created At */}
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <IconCalendar className="mt-1 size-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(userDetails.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Updated At */}
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <IconClock className="mt-1 size-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(userDetails.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Last Sign In */}
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <IconClock className="mt-1 size-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Last Sign In</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(userDetails.lastSignInAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
