"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminListPage } from "@/domain/console/components/admin-list-page";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { useDebouncedValue } from "@/domain/console/hooks/use-debounced-value";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type FlagRow = {
  key: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleFeatureFlagsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const flags = useQuery(
    trpc.platform.listFeatureFlags.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const setFlag = useMutation({
    ...trpc.platform.setFeatureFlag.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = flags.data?.items ?? [];
  const total = flags.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<FlagRow>[] => {
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
        accessorKey: "enabled",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Enabled" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.enabled}
              disabled={setFlag.isPending}
              onCheckedChange={(checked) =>
                setFlag.mutate({
                  key: row.original.key,
                  enabled: checked,
                })
              }
            />
            <Label className="text-muted-foreground text-xs">
              {row.original.enabled ? "On" : "Off"}
            </Label>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Updated" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {formatDateTime(row.original.updatedAt)}
          </span>
        ),
      },
      {
        accessorKey: "updatedBy",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Updated by" />
        ),
        cell: ({ row }) => row.original.updatedBy ?? "—",
      },
    ];
  }, [setFlag]);

  return (
    <AdminListPage
      title="Feature flags"
      description="Platform-wide feature toggles."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search key"
      isError={flags.isError}
      errorMessage="Could not load feature flags."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={flags.isPending}
        framed
        compactLayout
        emptyMessage="No feature flags found."
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
