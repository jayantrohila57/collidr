"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { useDebouncedValue } from "@/domain/console/hooks/use-debounced-value";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type SessionRow = {
  id: string;
  userId: string;
  userEmail: string;
  impersonatedBy: string | null;
  createdAt: string;
  expiresAt: string;
};

const PAGE_SIZE = 25;

export default function ConsoleSessionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [impersonatedOnly, setImpersonatedOnly] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const sessions = useQuery(
    trpc.platform.listSessions.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
      impersonatedOnly: impersonatedOnly || undefined,
    }),
  );

  const revokeSession = useMutation({
    ...trpc.platform.revokeSession.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = sessions.data?.items ?? [];
  const total = sessions.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<SessionRow>[] => {
    return [
      {
        accessorKey: "userEmail",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Session ID" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        accessorKey: "expiresAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expires" />
        ),
        cell: ({ row }) => formatDateTime(row.original.expiresAt),
      },
      {
        accessorKey: "impersonatedBy",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Impersonation" />
        ),
        cell: ({ row }) =>
          row.original.impersonatedBy ? (
            <span className="text-amber-700 text-xs dark:text-amber-200">
              {row.original.impersonatedBy}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions
            actions={[
              {
                label: "Revoke session",
                destructive: true,
                disabled: revokeSession.isPending,
                onSelect: () =>
                  revokeSession.mutate({ sessionId: row.original.id }),
              },
            ]}
          />
        ),
      },
    ];
  }, [revokeSession]);

  return (
    <div className="space-y-4">
      <ConsolePageHeader
        title="Sessions"
        description="Active sign-in sessions across the platform."
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="text-sm">
            <Label className="text-muted-foreground">Search email</Label>
            <Input
              className="mt-1 w-56"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOffset(0);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="impersonated-only"
              checked={impersonatedOnly}
              onCheckedChange={(checked) => {
                setImpersonatedOnly(checked);
                setOffset(0);
              }}
            />
            <Label htmlFor="impersonated-only" className="text-sm">
              Impersonated only
            </Label>
          </div>
        </div>
      </ConsolePageHeader>

      {sessions.isError ? (
        <QueryErrorState message="Could not load sessions." />
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={sessions.isPending}
        framed
        compactLayout
        emptyMessage="No sessions match your filters."
        filterActive={Boolean(debouncedSearch) || impersonatedOnly}
      />

      <ServerPagination
        offset={offset}
        limit={PAGE_SIZE}
        total={total}
        onOffsetChange={setOffset}
      />
    </div>
  );
}
