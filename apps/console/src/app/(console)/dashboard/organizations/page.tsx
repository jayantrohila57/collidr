"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { useDebouncedValue } from "@/domain/console/hooks/use-debounced-value";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

const PAGE_SIZE = 25;

export default function ConsoleOrganizationsPage() {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const orgs = useQuery(
    trpc.platform.listOrganizations.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const rows = orgs.data?.items ?? [];
  const total = orgs.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<OrgRow>[] => {
    return [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/organizations/${row.original.id}`}
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
                label: "View organization",
                onSelect: () => {
                  window.location.href = `/dashboard/organizations/${row.original.id}`;
                },
              },
            ]}
          />
        ),
      },
    ];
  }, []);

  return (
    <div className="space-y-4">
      <ConsolePageHeader
        title="Organizations"
        description="Cross-tenant workspaces."
      >
        <div className="text-sm">
          <Label className="text-muted-foreground">Search</Label>
          <Input
            className="mt-1 w-56"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
          />
        </div>
      </ConsolePageHeader>

      {orgs.isError ? (
        <QueryErrorState message="Could not load organizations." />
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={orgs.isPending}
        framed
        compactLayout
        emptyMessage="No organizations found."
        filterActive={Boolean(debouncedSearch)}
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
