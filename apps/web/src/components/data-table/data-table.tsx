"use client";

import type { RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
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
import { DataTableSkeletonBody } from "./data-table-skeleton-body";

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
  caption?: string;
  framed?: boolean;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  skeletonRowCount = 5,
  emptyMessage = "No results.",
  caption,
  framed = false,
}: DataTableProps<TData>) {
  const table = useLegacyTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const columnCount = columns.length;

  const tableMarkup = (
    <Table variant="card">
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
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
        ) : table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columnCount}>{emptyMessage}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (framed) {
    return <Frame className="w-full">{tableMarkup}</Frame>;
  }

  return tableMarkup;
}
