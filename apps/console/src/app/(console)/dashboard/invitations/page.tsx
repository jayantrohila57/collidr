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

type InvitationRow = {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  inviterId: string;
  teamId: string | null;
  createdAt: string;
  deletedAt: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleInvitationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const invitations = useQuery(
    trpc.platform.listInvitations.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const revoke = useMutation({
    ...trpc.platform.revokeInvitation.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const resend = useMutation({
    ...trpc.platform.resendInvitation.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = invitations.data?.items ?? [];
  const total = invitations.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<InvitationRow>[] => {
    return [
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.status}</Badge>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
      },
      {
        accessorKey: "organizationId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Organization" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/organizations/${row.original.organizationId}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.organizationId.slice(0, 8)}…
          </Link>
        ),
      },
      {
        accessorKey: "expiresAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Expires" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {formatDateTime(row.original.expiresAt)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => {
          const inv = row.original;
          const actions: DataTableRowAction[] = [
            {
              label: "View organization",
              onSelect: () => {
                window.location.href = `/dashboard/organizations/${inv.organizationId}`;
              },
            },
            {
              label: "Resend",
              disabled: resend.isPending,
              onSelect: () =>
                resend.mutate({
                  organizationId: inv.organizationId,
                  invitationId: inv.id,
                }),
            },
            {
              label: "Revoke",
              destructive: true,
              disabled: revoke.isPending,
              onSelect: () =>
                revoke.mutate({
                  organizationId: inv.organizationId,
                  invitationId: inv.id,
                }),
            },
          ];
          return <DataTableRowActions actions={actions} />;
        },
      },
    ];
  }, [resend, revoke]);

  return (
    <AdminListPage
      title="Invitations"
      description="Pending and historical organization invitations."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search email"
      isError={invitations.isError}
      errorMessage="Could not load invitations."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={invitations.isPending}
        framed
        compactLayout
        emptyMessage="No invitations found."
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
