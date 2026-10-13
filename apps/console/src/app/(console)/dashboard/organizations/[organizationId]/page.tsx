"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function ConsoleOrganizationDetailPage() {
  const params = useParams<{ organizationId: string }>();
  const organizationId = params.organizationId;
  const queryClient = useQueryClient();

  const detail = useQuery(
    trpc.platform.getOrganization.queryOptions({ organizationId }),
  );

  const updateOrganization = useMutation({
    ...trpc.platform.updateOrganization.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const transferOwner = useMutation({
    ...trpc.platform.transferOrganizationOwner.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const deleteOrganization = useMutation({
    ...trpc.platform.deleteOrganization.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const restoreOrganization = useMutation({
    ...trpc.platform.restoreOrganization.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const org = detail.data?.organization;
  const [editName, setEditName] = useState("");
  const [transferUserId, setTransferUserId] = useState("");

  useEffect(() => {
    if (org) {
      setEditName(org.name);
    }
  }, [org]);
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
          <CardContent className="space-y-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <Input
                className="mt-1 max-w-md"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Button
                type="button"
                className="mt-2"
                size="sm"
                disabled={updateOrganization.isPending}
                onClick={() =>
                  updateOrganization.mutate({
                    organizationId: org.id,
                    name: editName.trim(),
                  })
                }
              >
                Save name
              </Button>
            </div>
            <div>
              <Label className="text-muted-foreground">
                Transfer ownership to user ID
              </Label>
              <div className="mt-1 flex max-w-md flex-wrap gap-2">
                <Input
                  className="flex-1 font-mono text-xs"
                  value={transferUserId}
                  onChange={(e) => setTransferUserId(e.target.value)}
                  placeholder="User ID"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={transferOwner.isPending || !transferUserId.trim()}
                  onClick={() =>
                    transferOwner.mutate({
                      organizationId: org.id,
                      targetUserId: transferUserId.trim(),
                    })
                  }
                >
                  Transfer
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleteOrganization.isPending}
                onClick={() =>
                  deleteOrganization.mutate({ organizationId: org.id })
                }
              >
                Delete organization
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={restoreOrganization.isPending}
                onClick={() =>
                  restoreOrganization.mutate({ organizationId: org.id })
                }
              >
                Restore organization
              </Button>
            </div>
            <div>
              <Label className="text-muted-foreground">Organization ID</Label>
              <p className="font-mono text-xs">{org.id}</p>
              <p className="mt-1 text-muted-foreground">
                Created {formatDateTime(org.createdAt)}
              </p>
            </div>
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
