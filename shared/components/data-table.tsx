"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { cn } from "@/shared/lib/utils";

type DataTableProps<TData, TValue> = {
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  enablePagination?: boolean;
  enableSorting?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
  pageSize?: number;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function DataTable<TData, TValue>({
  className,
  columns,
  data,
  emptyMessage,
  enablePagination = true,
  enableSorting = true,
  isError = false,
  isLoading = false,
  onRetry,
  pageSize = 20,
}: DataTableProps<TData, TValue>) {
  const { t } = useAppTranslator();
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(enablePagination
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize } },
        }
      : {}),
  });

  const showPagination = enablePagination && data.length > pageSize;
  const rows = table.getRowModel().rows;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = enableSorting && header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className={canSort ? "cursor-pointer select-none" : undefined}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort ? (
                            sorted === "asc" ? (
                              <ArrowUp className="size-3.5" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="size-3.5" />
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-40" />
                            )
                          ) : null}
                        </span>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="h-32 text-center" colSpan={columns.length}>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell className="h-32 text-center" colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <p>{t("common.load_failed")}</p>
                    {onRetry ? (
                      <Button onClick={onRetry} size="sm" variant="outline">
                        {t("common.try_again")}
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={columns.length}
                >
                  {emptyMessage ?? t("common.table.no_results")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination ? <DataTablePagination table={table} /> : null}
    </div>
  );
}

function DataTablePagination<TData>({
  table,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
}) {
  const { t } = useAppTranslator();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const rowCount = table.getRowCount();
  const pageSizeValue = table.getState().pagination.pageSize;
  const from = pageIndex * pageSizeValue + 1;
  const to = Math.min((pageIndex + 1) * pageSizeValue, rowCount);

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-1 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {t("common.table.showing", {
          from: String(from),
          to: String(to),
          total: String(rowCount),
        })}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("common.table.rows_per_page")}
          </span>
          <Select
            onValueChange={(value: string) => table.setPageSize(Number(value))}
            value={String(pageSizeValue)}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground">
          {t("common.table.page", {
            page: String(pageIndex + 1),
            totalPages: String(pageCount),
          })}
        </span>

        <div className="flex items-center gap-1">
          <Button
            aria-label={t("common.table.first_page")}
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            aria-label={t("common.table.previous_page")}
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon-sm"
            variant="outline"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            aria-label={t("common.table.next_page")}
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon-sm"
            variant="outline"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            aria-label={t("common.table.last_page")}
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(pageCount - 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { DataTable };
