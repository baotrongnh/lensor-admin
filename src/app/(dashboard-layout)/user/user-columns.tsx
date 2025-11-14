"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  IconUserCheck,
  IconUserOff,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "./user-schema";
import { UserTableActions } from "./user-table-actions";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground text-sm">{user.email}</span>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      const roleColors: Record<string, string> = {
        Admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        Manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        Editor: "bg-green-500/10 text-green-500 border-green-500/20",
        User: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        Viewer: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      };

      return (
        <Badge
          variant="outline"
          className={`${roleColors[role]} px-2.5 py-1 font-medium`}
        >
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig: Record<
        string,
        { color: string; icon: React.ReactNode }
      > = {
        Active: {
          color: "bg-green-500/10 text-green-500 border-green-500/20",
          icon: <IconUserCheck className="size-3.5" />,
        },
        Inactive: {
          color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          icon: <IconUserOff className="size-3.5" />,
        },
        Suspended: {
          color: "bg-red-500/10 text-red-500 border-red-500/20",
          icon: <IconUserOff className="size-3.5" />,
        },
      };

      const config = statusConfig[status];

      return (
        <Badge
          variant="outline"
          className={`${config.color} flex w-fit items-center gap-1.5 px-2.5 py-1 font-medium`}
        >
          {config.icon}
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm">
          {date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.original.lastLogin;
      if (!lastLogin)
        return <span className="text-muted-foreground text-sm">Never</span>;

      const date = new Date(lastLogin);
      return (
        <div className="text-sm">
          {date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      // Access the table's meta to get the refresh function
      const meta = table.options.meta as { refreshData?: () => void } | undefined;
      return (
        <UserTableActions 
          user={row.original} 
          onUserDeleted={meta?.refreshData}
          onUserUpdated={meta?.refreshData}
        />
      );
    },
  },
];

