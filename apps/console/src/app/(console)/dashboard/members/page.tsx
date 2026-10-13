"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
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

type MemberRow = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  userId: string;
  role: string;
  name: string;
  email: string;
  createdAt: string;
  deletedAt: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleMembersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const members = useQuery(
    trpc.platform.listMembers.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const removeMember = useMutation({
    ...trpc.platform.removeMember.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = members.data?.items ?? [];
  const total = members.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<MemberRow>[] => {
    return [
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Member" />
        ),
        cell: ({ row }) => (
          <div>
            <Link
              href={`/dashboard/users/${row.original.userId}`}
              className="font-medium hover:underline"
            >
              {row.original.email}
            </Link>
            <p className="text-muted-foreground text-xs">{row.original.name}</p>
          </div>
        ),
      },
      {
        accessorKey: "organizationName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Organization" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/organizations/${row.original.organizationId}`}
            className="hover:underline"
          >
            {row.original.organizationName}
          </Link>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joined" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => {
          const member = row.original;
          const actions: DataTableRowAction[] = [
            {
              label: "View organization",
              onSelect: () => {
                window.location.href = `/dashboard/organizations/${member.organizationId}`;
              },
            },
            {
              label: "View user",
              onSelect: () => {
                window.location.href = `/dashboard/users/${member.userId}`;
              },
            },
            {
              label: "Remove member",
              destructive: true,
              disabled: removeMember.isPending || Boolean(member.deletedAt),
              onSelect: () =>
                removeMember.mutate({
                  organizationId: member.organizationId,
                  targetUserId: member.userId,
                }),
            },
          ];
          return <DataTableRowActions actions={actions} />;
        },
      },
    ];
  }, [removeMember]);

  return (
    <AdminListPage
      title="Members"
      description="Organization memberships across all tenants."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search email, name, or org"
      isError={members.isError}
      errorMessage="Could not load members."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={members.isPending}
        framed
        compactLayout
        emptyMessage="No members match your search."
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
