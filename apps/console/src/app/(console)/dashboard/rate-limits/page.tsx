"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableRowAction } from "@/components/data-table/data-table-row-actions";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { AdminListPage } from "@/domain/console/components/admin-list-page";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { useDebouncedValue } from "@/domain/console/hooks/use-debounced-value";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type BucketRow = {
  key: string;
  count: number;
  windowStart: string;
};

const PAGE_SIZE = 25;

export default function ConsoleRateLimitsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const buckets = useQuery(
    trpc.platform.listRateLimitBuckets.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const reset = useMutation({
    ...trpc.platform.resetRateLimitBucket.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = buckets.data?.items ?? [];
  const total = buckets.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<BucketRow>[] => {
    return [
      {
        accessorKey: "key",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Key" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.key}</span>
        ),
      },
      {
        accessorKey: "count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Count" />
        ),
      },
      {
        accessorKey: "windowStart",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Window start" />
        ),
        cell: ({ row }) => formatDateTime(row.original.windowStart),
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions
            actions={[
              {
                label: "Reset bucket",
                destructive: true,
                disabled: reset.isPending,
                onSelect: () => reset.mutate({ key: row.original.key }),
              },
            ]}
          />
        ),
      },
    ];
  }, [reset]);

  return (
    <AdminListPage
      title="Rate limits"
      description="Active rate-limit buckets (key prefix search)."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Key prefix"
      isError={buckets.isError}
      errorMessage="Could not load rate limit buckets."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={buckets.isPending}
        framed
        compactLayout
        emptyMessage="No rate limit buckets found."
        filterActive={Boolean(debouncedSearch)}
      />

      <ServerPagination
        offset={offset}
        limit={PAGE_SIZE}
        total={total}
        onOffsetChange={setOffset}
      />
    </AdminListPage>
  );
}
