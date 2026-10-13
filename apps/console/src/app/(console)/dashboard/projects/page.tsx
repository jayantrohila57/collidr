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

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  organizationId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleProjectsPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const projects = useQuery(
    trpc.platform.listProjects.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const rows = projects.data?.items ?? [];
  const total = projects.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<ProjectRow>[] => {
    return [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Project" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/projects/${row.original.id}?organizationId=${row.original.organizationId ?? ""}`}
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
        accessorKey: "organizationId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Organization" />
        ),
        cell: ({ row }) =>
          row.original.organizationId ? (
            <Link
              href={`/dashboard/organizations/${row.original.organizationId}`}
              className="font-mono text-xs hover:underline"
            >
              {row.original.organizationId.slice(0, 8)}…
            </Link>
          ) : (
            "—"
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
                label: "View project",
                onSelect: () => {
                  window.location.href = `/dashboard/projects/${row.original.id}?organizationId=${row.original.organizationId ?? ""}`;
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
      title="Projects"
      description="Projects across all organizations."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search name or slug"
      isError={projects.isError}
      errorMessage="Could not load projects."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={projects.isPending}
        framed
        compactLayout
        emptyMessage="No projects found."
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
