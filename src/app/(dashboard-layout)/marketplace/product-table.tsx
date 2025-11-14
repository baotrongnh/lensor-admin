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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./product-columns";
import { Product, transformApiProduct } from "./product-schema";
import { ProductTablePagination } from "./product-table-pagination";
import { ProductTableToolbar } from "./product-table-toolbar";
import { ProductService } from "@/services/product.service";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductTable() {
  const [data, setData] = React.useState<Product[]>([]);
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

  // Fetch products data
  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;

      const response = await ProductService.getAllProducts(page, limit);
      const products = response.data.map(transformApiProduct);

      setData(products);
      setTotalRows(products.length);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  // Search products
  const handleSearch = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchQuery("");
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setSearchQuery(query);

      const response = await ProductService.searchProducts(query, 100);
      const products = response.data.map(transformApiProduct);

      setData(products);
      setTotalRows(products.length);
    } catch (error) {
      console.error("Failed to search products:", error);
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
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [globalFilter, handleSearch, fetchProducts]);

  // Initial fetch and pagination changes
  React.useEffect(() => {
    if (!searchQuery) {
      fetchProducts();
    }
  }, [fetchProducts, searchQuery]);

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
      refreshData: fetchProducts,
    },
  });

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Toolbar */}
      <ProductTableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        isLoading={loading || isSearching}
      />

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
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <ProductTablePagination table={table} totalRows={rowCount} />
    </div>
  );
}
