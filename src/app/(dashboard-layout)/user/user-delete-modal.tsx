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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserService } from "@/services/user.service";
import { User } from "./user-schema";

interface UserDeleteModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDeleted?: () => void;
}

export function UserDeleteModal({
  user,
  open,
  onOpenChange,
  onUserDeleted,
}: UserDeleteModalProps) {
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      await UserService.deleteUser(user.id);

      toast.success("User deleted successfully", {
        description: `${user.name} has been removed from the system`,
      });

      onUserDeleted?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setDeleting(false);
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

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10">
              <IconAlertTriangle className="size-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Delete User</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info Card */}
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-red-500 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex gap-3">
              <IconAlertTriangle className="size-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Warning</p>
                <p className="text-sm text-muted-foreground">
                  Deleting this user will:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Remove all user data permanently
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Delete all posts and content
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    Remove all connections and followers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    This action cannot be reversed
                  </li>
                </ul>
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
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
