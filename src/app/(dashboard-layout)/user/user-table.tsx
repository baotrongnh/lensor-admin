"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
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
import { User } from "./user-schema";
import { UserTablePagination } from "./user-table-pagination";
import { UserTableToolbar } from "./user-table-toolbar";

interface UserTableProps {
  data: User[];
}

export function UserTable({ data: initialData }: UserTableProps) {
  const [data] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Toolbar */}
      <UserTableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
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
                toast.error(`Delete ${selectedRowsCount} user(s)?`, {
                  description: "This action cannot be undone.",
                  action: {
                    label: "Delete",
                    onClick: () => {
                      toast.success("Users deleted");
                      setRowSelection({});
                    },
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
            {table.getRowModel().rows?.length ? (
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
      <UserTablePagination table={table} />
    </div>
  );
}
