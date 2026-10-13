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

type EnvironmentRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  projectId: string;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleEnvironmentsPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const environments = useQuery(
    trpc.platform.listEnvironments.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const rows = environments.data?.items ?? [];
  const total = environments.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<EnvironmentRow>[] => {
    return [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Environment" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/environments/${row.original.id}?organizationId=${row.original.organizationId ?? ""}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "slug",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Slug" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground text-xs">
            {row.original.slug}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
      },
      {
        accessorKey: "projectId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Project" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/projects/${row.original.projectId}?organizationId=${row.original.organizationId ?? ""}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.projectId.slice(0, 8)}…
          </Link>
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
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions
            actions={[
              {
                label: "View environment",
                onSelect: () => {
                  window.location.href = `/dashboard/environments/${row.original.id}?organizationId=${row.original.organizationId ?? ""}`;
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
      title="Environments"
      description="Deployment environments across projects."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search name or slug"
      isError={environments.isError}
      errorMessage="Could not load environments."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={environments.isPending}
        framed
        compactLayout
        emptyMessage="No environments found."
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
