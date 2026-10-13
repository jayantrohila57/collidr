"use client";

import type { RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import type { ReactNode } from "react";
import { useState } from "react";
import { Frame } from "@/components/ui/frame";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { layoutGapClass, layoutSectionStackClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { DataTableEmpty } from "./data-table-empty";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeletonBody } from "./data-table-skeleton-body";
import { DataTableToolbar } from "./data-table-toolbar";

export type DataTableColumnDef<TData extends RowData> = LegacyColumnDef<
  TData,
  // biome-ignore lint/suspicious/noExplicitAny: accessor value types differ per column
  any
>;

export type DataTableProps<TData extends RowData> = {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  skeletonRowCount?: number;
  emptyMessage?: string;
  emptyState?: ReactNode;
  caption?: string;
  framed?: boolean;
  className?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filter?: ReactNode;
  primaryAction?: ReactNode;
  enablePagination?: boolean;
  pageSize?: number;
  /** Client-side search across row values */
  searchable?: boolean;
  /** Constrain table to parent width (responsive tables) */
  compactLayout?: boolean;
};

function columnClassName<TData extends RowData>(
  columnDef: DataTableColumnDef<TData>,
) {
  const meta = columnDef.meta as { className?: string } | undefined;
  return meta?.className;
}

function defaultGlobalFilterFn<TData extends RowData>(
  row: { original: TData },
  _columnId: string,
  filterValue: string,
) {
  const query = String(filterValue).toLowerCase().trim();
  if (!query) return true;
  const values = Object.values(row.original as Record<string, unknown>);
  return values.some((value) => {
    if (value == null) return false;
    if (typeof value === "object") {
      return JSON.stringify(value).toLowerCase().includes(query);
    }
    return String(value).toLowerCase().includes(query);
  });
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  skeletonRowCount = 5,
  emptyMessage = "No results.",
  emptyState,
  caption,
  framed = false,
  className,
  searchPlaceholder,
  searchValue: searchValueProp,
  onSearchChange: onSearchChangeProp,
  filter,
  primaryAction,
  enablePagination = false,
  pageSize = 10,
  searchable = false,
  compactLayout = false,
}: DataTableProps<TData>) {
  const [internalSearch, setInternalSearch] = useState("");
  const searchEnabled =
    searchable ||
    onSearchChangeProp !== undefined ||
    searchValueProp !== undefined;
  const searchValue = searchEnabled
    ? (searchValueProp ?? internalSearch)
    : undefined;
  const onSearchChange = searchEnabled
    ? (onSearchChangeProp ?? setInternalSearch)
    : undefined;

  const showToolbar =
    searchEnabled || Boolean(filter) || Boolean(primaryAction);

  const table = useLegacyTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    globalFilterFn: defaultGlobalFilterFn,
    state: {
      globalFilter: searchEnabled ? searchValue : undefined,
    },
    onGlobalFilterChange: onSearchChange,
    initialState: {
      pagination: { pageIndex: 0, pageSize },
    },
  });

  const columnCount = columns.length;
  const rowModel = table.getRowModel();
  const hasRows = rowModel.rows.length > 0;
  const showEmpty = !isLoading && !hasRows;

  const emptyMarkup =
    emptyState ?? (showEmpty ? <DataTableEmpty title={emptyMessage} /> : null);

  const tableMarkup =
    showEmpty && emptyState !== undefined ? (
      emptyMarkup
    ) : (
      <Table variant="card" className={cn(compactLayout && "table-fixed")}>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={columnClassName(header.column.columnDef)}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <DataTableSkeletonBody
              columnCount={columnCount}
              rows={skeletonRowCount}
            />
          ) : hasRows ? (
            rowModel.rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={columnClassName(cell.column.columnDef)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="p-0">
                {emptyMarkup ?? (
                  <p className="px-4 py-6 text-center text-muted-foreground text-sm">
                    {emptyMessage}
                  </p>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );

  const body = (
    <div className={cn(layoutSectionStackClass, className)}>
      {showToolbar ? (
        <DataTableToolbar
          searchPlaceholder={searchPlaceholder}
          searchValue={onSearchChange ? searchValue : undefined}
          onSearchChange={onSearchChange}
          filter={filter}
          primaryAction={primaryAction}
        />
      ) : null}
      {framed ? (
        <Frame className="w-full min-w-0 max-w-full overflow-x-auto">
          {tableMarkup}
        </Frame>
      ) : (
        <div
          className={cn(compactLayout && "min-w-0 max-w-full overflow-x-auto")}
        >
          {tableMarkup}
        </div>
      )}
      {enablePagination && !isLoading && hasRows ? (
        <DataTablePagination table={table} />
      ) : null}
    </div>
  );

  return body;
}
