"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type TeamMemberRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string | null;
};

export default function ConsoleTeamDetailPage() {
  const params = useParams<{ teamId: string }>();
  const searchParams = useSearchParams();
  const teamId = params.teamId;
  const organizationId = searchParams.get("organizationId") ?? "";

  const detail = useQuery({
    ...trpc.platform.getTeam.queryOptions({
      organizationId,
      teamId,
    }),
    enabled: Boolean(organizationId),
  });

  const team = detail.data?.team;
  const members = detail.data?.members ?? [];

  const memberColumns = useMemo(
    (): DataTableColumnDef<TeamMemberRow>[] => [
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Member" />
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
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Added" />
        ),
        cell: ({ row }) =>
          row.original.createdAt ? formatDateTime(row.original.createdAt) : "—",
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard/teams"
          className="text-muted-foreground hover:underline"
        >
          Teams
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{team?.name ?? teamId}</span>
      </div>

      {!organizationId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization required</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Open this team from the teams list or append{" "}
            <code className="font-mono text-xs">?organizationId=…</code> to the
            URL.
          </CardContent>
        </Card>
      ) : null}

      {organizationId && detail.isError ? (
        <QueryErrorState message="Team not found or failed to load." />
      ) : null}

      <ConsolePageHeader
        title={team?.name ?? "Team"}
        description={
          organizationId
            ? `Organization ${organizationId}`
            : "Provide organizationId to load team"
        }
      />

      {team ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Team ID</Label>
              <p className="font-mono text-xs">{team.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Member count</Label>
              <p>{team.memberCount}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p>{formatDateTime(team.createdAt)}</p>
            </div>
            {team.deletedAt ? (
              <div>
                <Label className="text-muted-foreground">Deleted</Label>
                <p>{formatDateTime(team.deletedAt)}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : organizationId ? (
        <div className="text-sm">
          <Label className="text-muted-foreground">Organization ID</Label>
          <Input
            className="mt-1 max-w-md font-mono text-xs"
            readOnly
            value={organizationId}
          />
        </div>
      ) : null}

      {organizationId ? (
        <section className="space-y-2">
          <h2 className="font-medium text-sm">Members</h2>
          <DataTable
            columns={memberColumns}
            data={members}
            isLoading={detail.isPending}
            framed
            compactLayout
            emptyMessage="No members on this team."
          />
        </section>
      ) : null}
    </div>
  );
}
