"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

type VariableRow = {
  id: string;
  key: string;
  environmentId: string;
  projectId: string;
  organizationId: string | null;
  type: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleVariablesPage() {
  const searchParams = useSearchParams();
  const environmentIdFilter = searchParams.get("environmentId") ?? "";

  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const variables = useQuery(
    trpc.platform.listVariables.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
      environmentId: environmentIdFilter || undefined,
    }),
  );

  const rows = variables.data?.items ?? [];
  const total = variables.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<VariableRow>[] => {
    return [
      {
        accessorKey: "key",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Key" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/variables/${row.original.id}?organizationId=${row.original.organizationId ?? ""}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.key}
          </Link>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => row.original.type ?? "—",
      },
      {
        accessorKey: "environmentId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Environment" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/environments/${row.original.environmentId}?organizationId=${row.original.organizationId ?? ""}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.environmentId.slice(0, 8)}…
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
                label: "View variable",
                onSelect: () => {
                  window.location.href = `/dashboard/variables/${row.original.id}?organizationId=${row.original.organizationId ?? ""}`;
                },
              },
            ]}
          />
        ),
      },
    ];
  }, []);

  const filterActive = Boolean(debouncedSearch) || Boolean(environmentIdFilter);

  return (
    <AdminListPage
      title="Variables"
      description={
        environmentIdFilter
          ? `Filtered to environment ${environmentIdFilter}`
          : "Environment variables across tenants."
      }
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search key"
      isError={variables.isError}
      errorMessage="Could not load variables."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={variables.isPending}
        framed
        compactLayout
        emptyMessage="No variables found."
        filterActive={filterActive}
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
