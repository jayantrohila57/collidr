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
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type TokenRow = {
  kind: "access" | "refresh";
  id: string;
  clientId: string;
  userId: string | null;
  scopes: string[] | null;
  expiresAt: string | null;
  createdAt: string | null;
  revoked: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleOAuthTokensPage() {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);

  const tokens = useQuery(
    trpc.platform.listOAuthTokens.queryOptions({
      limit: PAGE_SIZE,
      offset,
    }),
  );

  const revoke = useMutation({
    ...trpc.platform.revokeOAuthToken.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = tokens.data?.items ?? [];
  const total = tokens.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<TokenRow>[] => {
    return [
      {
        accessorKey: "kind",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Kind" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.kind}</Badge>
        ),
      },
      {
        accessorKey: "clientId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Client" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.clientId}</span>
        ),
      },
      {
        accessorKey: "userId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
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
        accessorKey: "scopes",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Scopes" />
        ),
        cell: ({ row }) => (
          <span className="line-clamp-2 font-mono text-xs">
            {row.original.scopes?.join(" ") ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "expiresAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expires" />
        ),
        cell: ({ row }) =>
          row.original.expiresAt ? formatDateTime(row.original.expiresAt) : "—",
      },
      {
        accessorKey: "revoked",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Revoked" />
        ),
        cell: ({ row }) =>
          row.original.revoked ? (
            formatDateTime(row.original.revoked)
          ) : (
            <Badge variant="secondary">Active</Badge>
          ),
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => {
          const token = row.original;
          const actions: DataTableRowAction[] = [
            {
              label: "Revoke token",
              destructive: true,
              disabled: revoke.isPending || Boolean(token.revoked),
              onSelect: () =>
                revoke.mutate({ kind: token.kind, tokenId: token.id }),
            },
          ];
          return <DataTableRowActions actions={actions} />;
        },
      },
    ];
  }, [revoke]);

  return (
    <AdminListPage
      title="OAuth tokens"
      description="Access and refresh tokens issued to OAuth clients."
      isError={tokens.isError}
      errorMessage="Could not load OAuth tokens."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={tokens.isPending}
        framed
        compactLayout
        emptyMessage="No OAuth tokens found."
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
