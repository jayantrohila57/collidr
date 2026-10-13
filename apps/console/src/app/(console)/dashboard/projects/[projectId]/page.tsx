"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function ConsoleProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const projectId = params.projectId;
  const organizationId = searchParams.get("organizationId") ?? "";

  const projectQuery = useQuery({
    ...trpc.platform.getProject.queryOptions({
      organizationId,
      projectId,
    }),
    enabled: Boolean(organizationId),
  });

  const managersQuery = useQuery({
    ...trpc.platform.listProjectManagers.queryOptions({
      organizationId,
      projectId,
    }),
    enabled: Boolean(organizationId),
  });

  const teamsQuery = useQuery({
    ...trpc.platform.listProjectTeams.queryOptions({
      organizationId,
      projectId,
    }),
    enabled: Boolean(organizationId),
  });

  const project = projectQuery.data?.project;
  const managers = managersQuery.data?.items ?? [];
  const teams = teamsQuery.data?.items ?? [];

  const managerColumns = useMemo(
    (): DataTableColumnDef<(typeof managers)[number]>[] => [
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Manager" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/users/${row.original.userId}`}
            className="hover:underline"
          >
            <span className="font-medium">{row.original.email}</span>
            <span className="block text-muted-foreground text-xs">
              {row.original.name}
            </span>
          </Link>
        ),
      },
    ],
    [],
  );

  const teamColumns = useMemo(
    (): DataTableColumnDef<(typeof teams)[number]>[] => [
      {
        accessorKey: "teamName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Team" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/teams/${row.original.teamId}?organizationId=${organizationId}`}
            className="hover:underline"
          >
            {row.original.teamName}
          </Link>
        ),
      },
      {
        accessorKey: "teamId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Team ID" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.teamId}</span>
        ),
      },
    ],
    [organizationId],
  );

  const loadError =
    organizationId &&
    (projectQuery.isError || managersQuery.isError || teamsQuery.isError);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard/projects"
          className="text-muted-foreground hover:underline"
        >
          Projects
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{project?.name ?? projectId}</span>
      </div>

      {!organizationId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization required</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Open this project from the projects list or add{" "}
            <code className="font-mono text-xs">?organizationId=…</code> to the
            URL.
          </CardContent>
        </Card>
      ) : null}

      {loadError ? (
        <QueryErrorState message="Project not found or failed to load." />
      ) : null}

      <ConsolePageHeader
        title={project?.name ?? "Project"}
        description={project?.slug ? `/${project.slug}` : undefined}
      />

      {project ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <p>{project.status}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Organization</Label>
              <p className="font-mono text-xs">{organizationId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Updated</Label>
              <p>
                {project.updatedAt ? formatDateTime(project.updatedAt) : "—"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Project ID</Label>
              <p className="font-mono text-xs">{project.id}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {organizationId ? (
        <>
          <section className="space-y-2">
            <h2 className="font-medium text-sm">Project managers</h2>
            <DataTable
              columns={managerColumns}
              data={managers}
              isLoading={managersQuery.isPending}
              framed
              compactLayout
              emptyMessage="No project managers assigned."
            />
          </section>

          <section className="space-y-2">
            <h2 className="font-medium text-sm">Linked teams</h2>
            <DataTable
              columns={teamColumns}
              data={teams}
              isLoading={teamsQuery.isPending}
              framed
              compactLayout
              emptyMessage="No teams linked to this project."
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
