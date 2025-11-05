"use client";

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

interface UserTableActionsProps {
  user: User;
}

export function UserTableActions({ user }: UserTableActionsProps) {
  return (
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
        <DropdownMenuItem
          onClick={() => {
            toast.success(`Viewing ${user.name}`);
          }}
        >
          <IconEye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            toast.success(`Editing ${user.name}`);
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
                onClick: () => toast.success("User deleted"),
              },
            });
          }}
        >
          <IconTrash className="mr-2 size-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
