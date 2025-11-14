"use client";

import * as React from "react";
import {
  IconDotsVertical,
  IconEdit,
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
import { User } from "./user-schema";
import { UserDetailsModal } from "./user-details-modal";
import { UserStatsModal } from "./user-stats-modal";
import { UserEditModal } from "./user-edit-modal";
import { UserDeleteModal } from "./user-delete-modal";

interface UserTableActionsProps {
  user: User;
  onUserDeleted?: () => void;
  onUserUpdated?: () => void;
}

export function UserTableActions({
  user,
  onUserDeleted,
  onUserUpdated,
}: UserTableActionsProps) {
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showStatsModal, setShowStatsModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  const handleViewStats = () => {
    setShowStatsModal(true);
  };

  const handleEditUser = () => {
    setShowEditModal(true);
  };

  const handleDeleteUser = () => {
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
          <DropdownMenuItem onClick={handleViewStats}>
            <IconEye className="mr-2 size-4" />
            View Statistics
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditUser}>
            <IconEdit className="mr-2 size-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDeleteUser}>
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

      {/* User Statistics Modal */}
      <UserStatsModal
        userId={user.id}
        userName={user.name}
        userAvatar={user.avatar}
        open={showStatsModal}
        onOpenChange={setShowStatsModal}
      />

      {/* User Edit Modal */}
      <UserEditModal
        userId={user.id}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onUserUpdated={onUserUpdated}
      />

      {/* User Delete Modal */}
      <UserDeleteModal
        user={user}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onUserDeleted={onUserDeleted}
      />
    </>
  );
}
