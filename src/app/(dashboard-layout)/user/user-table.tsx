"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./user-columns";
import { User, transformApiUser } from "./user-schema";
import { UserTablePagination } from "./user-table-pagination";
import { UserTableToolbar } from "./user-table-toolbar";
import { UserService } from "@/services/user.service";
import { Skeleton } from "@/components/ui/skeleton";

export function UserTable() {
  const [data, setData] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [totalRows, setTotalRows] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  // Fetch users data
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;

      const response = await UserService.getAllUsers(page, limit);
      const users = response.data.users.map(transformApiUser);

      setData(users);
      setTotalRows(response.data.pagination?.total || users.length);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  // Search users
  const handleSearch = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchQuery("");
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setSearchQuery(query);

      const response = await UserService.searchUsers(query, 100);
      const users = response.data.map(transformApiUser);

      setData(users);
      setTotalRows(users.length);
    } catch (error) {
      console.error("Failed to search users:", error);
      toast.error("Search failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (globalFilter) {
        handleSearch(globalFilter);
      } else {
        setSearchQuery("");
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [globalFilter, handleSearch, fetchUsers]);

  // Initial fetch and pagination changes
  React.useEffect(() => {
    if (!searchQuery) {
      fetchUsers();
    }
  }, [fetchUsers, searchQuery]);

  // Handle delete users
  const handleDeleteUsers = async (userIds: string[]) => {
    try {
      const result = await UserService.deleteUsers(userIds);

      if (result.success) {
        toast.success(`Successfully deleted ${result.deleted} user(s)`);
        setRowSelection({});
        fetchUsers();
      } else {
        toast.warning(
          `Deleted ${result.deleted} out of ${userIds.length} user(s)`
        );
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to delete users:", error);
      toast.error("Failed to delete users", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const rowCount = searchQuery ? data.length : totalRows;

  const table = useReactTable({
    data,
    columns,
    rowCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: !searchQuery, // Use manual pagination for API calls
    meta: {
      refreshData: fetchUsers,
    },
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Toolbar */}
      <UserTableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        isLoading={loading || isSearching}
      />

      {/* Selected Rows Actions */}
      {selectedRowsCount > 0 && (
        <div className="bg-muted/50 flex items-center justify-between rounded-lg border px-4 py-3">
          <div className="text-sm font-medium">
            {selectedRowsCount} user(s) selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success(`Exported ${selectedRowsCount} user(s)`);
              }}
            >
              Export
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const selectedIds = table
                  .getFilteredSelectedRowModel()
                  .rows.map((row) => row.original.id);

                toast.error(`Delete ${selectedRowsCount} user(s)?`, {
                  description: "This action cannot be undone.",
                  action: {
                    label: "Delete",
                    onClick: () => handleDeleteUsers(selectedIds),
                  },
                });
              }}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <UserTablePagination table={table} totalRows={rowCount} />
    </div>
  );
}
