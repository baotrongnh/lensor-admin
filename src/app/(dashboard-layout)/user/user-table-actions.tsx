"use client";

import * as React from "react";
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "./user-schema";
import { UserService } from "@/services/user.service";
import { UserDetailsModal } from "./user-details-modal";

interface UserTableActionsProps {
  user: User;
  onUserDeleted?: () => void;
  onUserUpdated?: () => void;
}

export function UserTableActions({ user, onUserDeleted, onUserUpdated }: UserTableActionsProps) {
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);

  const handleDelete = async () => {
    try {
      await UserService.deleteUser(user.id);
      toast.success(`User ${user.name} deleted successfully`);
      onUserDeleted?.();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  const handleViewStats = async () => {
    try {
      const response = await UserService.getUserStats(user.id);
      toast.success(`Stats for ${user.name}`, {
        description: JSON.stringify(response.data),
      });
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      toast.error("Failed to load user statistics");
    }
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
          <DropdownMenuItem onClick={handleViewStats}>
            <IconEye className="mr-2 size-4" />
            View Statistics
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              toast.info(`Edit functionality coming soon`);
              // You can implement a modal or navigate to edit page here
            }}
          >
            <IconEdit className="mr-2 size-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              toast.error(`Delete ${user.name}?`, {
                description: "This action cannot be undone.",
                action: {
                  label: "Delete",
                  onClick: handleDelete,
                },
              });
            }}
          >
            <IconTrash className="mr-2 size-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Details Modal */}
      <UserDetailsModal
        userId={user.id}
        userName={user.name}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />
    </>
  );
}
