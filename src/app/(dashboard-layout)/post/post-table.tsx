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
import { columns } from "./post-columns";
import { Post, transformApiPost } from "./post-schema";
import { PostTablePagination } from "./post-table-pagination";
import { PostTableToolbar } from "./post-table-toolbar";
import { PostService } from "@/services/post.service";
import { Skeleton } from "@/components/ui/skeleton";

export function PostTable() {
  const [data, setData] = React.useState<Post[]>([]);
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

  // Fetch posts data
  const fetchPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;

      const response = await PostService.getAllPosts(page, limit);
      const posts = response.data.posts.map(transformApiPost);

      setData(posts);
      setTotalRows(response.data.pagination?.total || posts.length);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load posts", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  // Search posts
  const handleSearch = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchQuery("");
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setSearchQuery(query);

      const response = await PostService.searchPosts(query, 100);
      const posts = response.data.map(transformApiPost);

      setData(posts);
      setTotalRows(posts.length);
    } catch (error) {
      console.error("Failed to search posts:", error);
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
        fetchPosts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [globalFilter, handleSearch, fetchPosts]);

  // Initial fetch and pagination changes
  React.useEffect(() => {
    if (!searchQuery) {
      fetchPosts();
    }
  }, [fetchPosts, searchQuery]);

  // Handle delete posts
  const handleDeletePosts = async (postIds: string[]) => {
    try {
      const result = await PostService.deletePosts(postIds);

      if (result.success) {
        toast.success(`Successfully deleted ${result.deleted} post(s)`);
        setRowSelection({});
        fetchPosts();
      } else {
        toast.warning(
          `Deleted ${result.deleted} out of ${postIds.length} post(s)`
        );
        fetchPosts();
      }
    } catch (error) {
      console.error("Failed to delete posts:", error);
      toast.error("Failed to delete posts", {
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
    manualPagination: !searchQuery,
    meta: {
      refreshData: fetchPosts,
    },
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Toolbar */}
      <PostTableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        isLoading={loading || isSearching}
      />

      {/* Selected Rows Actions */}
      {selectedRowsCount > 0 && (
        <div className="bg-muted/50 flex items-center justify-between rounded-lg border px-4 py-3">
          <div className="text-sm font-medium">
            {selectedRowsCount} post(s) selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success(`Exported ${selectedRowsCount} post(s)`);
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

                toast.error(`Delete ${selectedRowsCount} post(s)?`, {
                  description: "This action cannot be undone.",
                  action: {
                    label: "Delete",
                    onClick: () => handleDeletePosts(selectedIds),
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
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PostTablePagination table={table} totalRows={rowCount} />
    </div>
  );
}

