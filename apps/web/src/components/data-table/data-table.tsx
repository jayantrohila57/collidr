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
import { useEffect, useRef, useState } from "react";
import {
  dataTableActionsCellClassName,
  dataTableActionsHeaderClassName,
  isDataTableActionsColumn,
} from "@/components/data-table/data-table-actions-column";
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
import { layoutSectionStackClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import type { DataTableEmptyConfig } from "./data-table-empty-types";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeletonBody } from "./data-table-skeleton-body";
import { DataTableToolbar } from "./data-table-toolbar";
import { resolveDataTableEmptyMarkup } from "./resolve-data-table-empty";

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
  /** Structured empty vs no-results states (rendered inside the table frame) */
  empty?: DataTableEmptyConfig;
  /** @deprecated Prefer `empty` */
  emptyState?: ReactNode;
  /** Server-side or toolbar filters active (empty data means no results) */
  filterActive?: boolean;
  caption?: string;
  /** Visually hide table caption while keeping it for screen readers */
  captionSrOnly?: boolean;
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
  pinActions: boolean,
  placement: "header" | "cell",
) {
  const meta = columnDef.meta as
    | { className?: string; headerClassName?: string }
    | undefined;
  const base =
    placement === "header"
      ? cn(meta?.headerClassName, meta?.className)
      : meta?.className;
  if (isDataTableActionsColumn(columnDef)) {
    return cn(
      base,
      placement === "header"
        ? dataTableActionsHeaderClassName()
        : dataTableActionsCellClassName(pinActions),
    );
  }
  return base;
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
  empty,
  emptyState,
  filterActive = false,
  caption,
  captionSrOnly = false,
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinActions, setPinActions] = useState(false);
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setPinActions(el.scrollWidth > el.clientWidth + 1);
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    const tableEl = el.querySelector("[data-slot=table]");
    if (tableEl instanceof HTMLElement) {
      observer.observe(tableEl);
    }
    return () => observer.disconnect();
  }, [columns, data, isLoading, hasRows, rowModel.rows.length]);

  const showEmpty = !isLoading && !hasRows;
  const hasClientSearch = Boolean(
    searchEnabled && String(searchValue ?? "").trim(),
  );
  const emptyVariant: "empty" | "noResults" =
    data.length > 0 && !hasRows
      ? "noResults"
      : data.length === 0 && (filterActive || hasClientSearch)
        ? "noResults"
        : "empty";

  const emptyMarkup =
    emptyState ??
    (showEmpty
      ? resolveDataTableEmptyMarkup({
          config: empty,
          variant: emptyVariant,
          onClearSearch:
            onSearchChange && hasClientSearch
              ? () => onSearchChange("")
              : undefined,
          fallbackTitle: emptyMessage,
        })
      : null);

  const tableMarkup = (
    <Table
      variant="card"
      containerRef={scrollRef}
      className={cn(compactLayout && "table-fixed")}
    >
      {caption ? (
        <TableCaption className={cn(captionSrOnly && "sr-only")}>
          {caption}
        </TableCaption>
      ) : null}
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={columnClassName(
                  header.column.columnDef,
                  pinActions,
                  "header",
                )}
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
                  className={columnClassName(
                    cell.column.columnDef,
                    pinActions,
                    "cell",
                  )}
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
        <Frame className="w-full min-w-0 max-w-full overflow-hidden rounded-xl">
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
