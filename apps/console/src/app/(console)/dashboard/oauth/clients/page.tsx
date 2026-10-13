"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableRowAction } from "@/components/data-table/data-table-row-actions";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { AdminListPage } from "@/domain/console/components/admin-list-page";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { useDebouncedValue } from "@/domain/console/hooks/use-debounced-value";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type OAuthClientRow = {
  id: string;
  clientId: string;
  name: string | null;
  userId: string | null;
  disabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleOAuthClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const clients = useQuery(
    trpc.platform.listOAuthClients.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const revoke = useMutation({
    ...trpc.platform.revokeOAuthClient.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = clients.data?.items ?? [];
  const total = clients.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<OAuthClientRow>[] => {
    return [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "clientId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Client ID" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.clientId}</span>
        ),
      },
      {
        accessorKey: "userId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Owner" />
        ),
        cell: ({ row }) =>
          row.original.userId ? (
            <Link
              href={`/dashboard/users/${row.original.userId}`}
              className="font-mono text-xs hover:underline"
            >
              {row.original.userId.slice(0, 8)}…
            </Link>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "disabled",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) =>
          row.original.disabled ? (
            <Badge variant="destructive">Disabled</Badge>
          ) : (
            <Badge variant="secondary">Active</Badge>
          ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) =>
          row.original.createdAt ? formatDateTime(row.original.createdAt) : "—",
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original;
          const actions: DataTableRowAction[] = [
            {
              label: "View owner",
              onSelect: () => {
                if (client.userId) {
                  window.location.href = `/dashboard/users/${client.userId}`;
                }
              },
            },
            {
              label: "Disable client",
              destructive: true,
              disabled: revoke.isPending || client.disabled,
              onSelect: () => revoke.mutate({ clientId: client.clientId }),
            },
          ];
          return <DataTableRowActions actions={actions} />;
        },
      },
    ];
  }, [revoke]);

  return (
    <AdminListPage
      title="OAuth clients"
      description="Registered OAuth clients and their owners."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search name or client ID"
      isError={clients.isError}
      errorMessage="Could not load OAuth clients."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={clients.isPending}
        framed
        compactLayout
        emptyMessage="No OAuth clients found."
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
