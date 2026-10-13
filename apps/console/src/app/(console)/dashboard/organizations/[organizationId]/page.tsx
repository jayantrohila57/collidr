"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function ConsoleOrganizationDetailPage() {
  const params = useParams<{ organizationId: string }>();
  const organizationId = params.organizationId;

  const detail = useQuery(
    trpc.platform.getOrganization.queryOptions({ organizationId }),
  );

  const org = detail.data?.organization;
  const members = detail.data?.members ?? [];
  const projects = detail.data?.projects ?? [];
  const audit = detail.data?.audit ?? [];

  const memberColumns = useMemo(
    (): DataTableColumnDef<(typeof members)[number]>[] => [
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Member" />
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.email}</p>
            <p className="text-muted-foreground text-xs">{row.original.name}</p>
          </div>
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
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  const projectColumns = useMemo(
    (): DataTableColumnDef<(typeof projects)[number]>[] => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Project" />
        ),
      },
      {
        accessorKey: "slug",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Slug" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.slug}</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
      },
    ],
    [],
  );

  const auditColumns = useMemo(
    (): DataTableColumnDef<(typeof audit)[number]>[] => [
      {
        accessorKey: "action",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/audit/${row.original.id}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.action}
          </Link>
        ),
      },
      {
        accessorKey: "result",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Result" />
        ),
      },
      {
        accessorKey: "source",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Source" />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="When" />
        ),
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard/organizations"
          className="text-muted-foreground hover:underline"
        >
          Organizations
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{org?.name ?? organizationId}</span>
      </div>

      {detail.isError ? (
        <QueryErrorState message="Organization not found or failed to load." />
      ) : null}

      <ConsolePageHeader
        title={org?.name ?? "Organization"}
        description={org ? `/${org.slug}` : undefined}
      />

      {org ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-mono text-muted-foreground text-xs">{org.id}</p>
            <p className="mt-1 text-muted-foreground">
              Created {formatDateTime(org.createdAt)}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-2">
        <h2 className="font-medium text-sm">Members</h2>
        <DataTable
          columns={memberColumns}
          data={members}
          isLoading={detail.isPending}
          framed
          compactLayout
          emptyMessage="No members."
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-sm">Projects</h2>
        <DataTable
          columns={projectColumns}
          data={projects}
          isLoading={detail.isPending}
          framed
          compactLayout
          emptyMessage="No projects in this organization."
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-medium text-sm">Recent audit</h2>
        <DataTable
          columns={auditColumns}
          data={audit}
          isLoading={detail.isPending}
          framed
          compactLayout
          emptyMessage="No audit events for this organization."
        />
      </section>
    </div>
  );
}
