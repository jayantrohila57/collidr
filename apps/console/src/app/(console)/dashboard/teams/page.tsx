"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { AdminListPage } from "@/domain/console/components/admin-list-page";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { useDebouncedValue } from "@/domain/console/hooks/use-debounced-value";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type TeamRow = {
  id: string;
  name: string;
  organizationId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleTeamsPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const teams = useQuery(
    trpc.platform.listTeams.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const rows = teams.data?.items ?? [];
  const total = teams.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<TeamRow>[] => {
    return [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Team" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/teams/${row.original.id}?organizationId=${row.original.organizationId}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
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
        accessorKey: "memberCount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Members" />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
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
        cell: ({ row }) => (
          <DataTableRowActions
            actions={[
              {
                label: "View team",
                onSelect: () => {
                  window.location.href = `/dashboard/teams/${row.original.id}?organizationId=${row.original.organizationId}`;
                },
              },
            ]}
          />
        ),
      },
    ];
  }, []);

  return (
    <AdminListPage
      title="Teams"
      description="Teams within organizations."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search team name"
      isError={teams.isError}
      errorMessage="Could not load teams."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={teams.isPending}
        framed
        compactLayout
        emptyMessage="No teams found."
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
