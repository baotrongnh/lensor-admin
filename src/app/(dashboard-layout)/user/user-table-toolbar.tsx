"use client";

import { Table } from "@tanstack/react-table";
import {
  IconChevronDown,
  IconLayoutColumns,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "./user-schema";

interface UserTableToolbarProps {
  table: Table<User>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
}

export function UserTableToolbar({
  table,
  globalFilter,
  onGlobalFilterChange,
}: UserTableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-sm">
          <IconSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search users..."
            value={globalFilter ?? ""}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <Select
            value={
              (table.getColumn("role")?.getFilterValue() as string[])?.[0] ??
              "all"
            }
            onValueChange={(value) => {
              table
                .getColumn("role")
                ?.setFilterValue(value === "all" ? undefined : [value]);
            }}
          >
            <SelectTrigger className="w-32" suppressHydrationWarning>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Editor">Editor</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={
              (table.getColumn("status")?.getFilterValue() as string[])?.[0] ??
              "all"
            }
            onValueChange={(value) => {
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? undefined : [value]);
            }}
          >
            <SelectTrigger className="w-32" suppressHydrationWarning>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns className="size-4" />
              <span className="hidden lg:inline">Columns</span>
              <IconChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm">
          <IconPlus className="size-4" />
          <span className="hidden lg:inline">Add User</span>
        </Button>
      </div>
    </div>
  );
}
