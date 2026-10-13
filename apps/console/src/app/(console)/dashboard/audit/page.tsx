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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type AuditRow = {
  id: string;
  action: string;
  result: string;
  source: string;
  actorUserId: string;
  actorEmail: string | null;
  organizationId: string | null;
  organizationName: string | null;
  createdAt: string;
};

const PAGE_SIZE = 50;
const SOURCE_OPTIONS = ["all", "trpc", "mcp", "auth"] as const;

export default function ConsoleAuditPage() {
  const [offset, setOffset] = useState(0);
  const [actorUserId, setActorUserId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [action, setAction] = useState("");
  const [source, setSource] = useState<(typeof SOURCE_OPTIONS)[number]>("all");

  const events = useQuery(
    trpc.platform.listAuditEvents.queryOptions({
      limit: PAGE_SIZE,
      offset,
      actorUserId: actorUserId || undefined,
      organizationId: organizationId || undefined,
      action: action || undefined,
      source: source === "all" ? undefined : source,
    }),
  );

  const rows = events.data?.items ?? [];
  const total = events.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<AuditRow>[] => {
    return [
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
        accessorKey: "actorEmail",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actor" />
        ),
        cell: ({ row }) => row.original.actorEmail ?? row.original.actorUserId,
      },
      {
        accessorKey: "organizationName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Organization" />
        ),
        cell: ({ row }) =>
          row.original.organizationName ?? row.original.organizationId ?? "—",
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="When" />
        ),
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions
            actions={[
              {
                label: "View details",
                onSelect: () => {
                  window.location.href = `/dashboard/audit/${row.original.id}`;
                },
              },
            ]}
          />
        ),
      },
    ];
  }, []);

  const filterActive =
    Boolean(actorUserId) ||
    Boolean(organizationId) ||
    Boolean(action) ||
    source !== "all";

  return (
    <div className="space-y-4">
      <ConsolePageHeader
        title="Global audit"
        description="Canonical audit events across tenants and sources."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="text-sm">
          <Label className="text-muted-foreground">Actor user ID</Label>
          <Input
            className="mt-1"
            value={actorUserId}
            onChange={(e) => {
              setActorUserId(e.target.value);
              setOffset(0);
            }}
          />
        </div>
        <div className="text-sm">
          <Label className="text-muted-foreground">Organization ID</Label>
          <Input
            className="mt-1"
            value={organizationId}
            onChange={(e) => {
              setOrganizationId(e.target.value);
              setOffset(0);
            }}
          />
        </div>
        <div className="text-sm">
          <Label className="text-muted-foreground">Action</Label>
          <Input
            className="mt-1"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setOffset(0);
            }}
          />
        </div>
        <div className="text-sm">
          <Label className="text-muted-foreground">Source</Label>
          <Select
            value={source}
            onValueChange={(value) => {
              setSource((value ?? "all") as (typeof SOURCE_OPTIONS)[number]);
              setOffset(0);
            }}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt === "all" ? "All" : opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {events.isError ? (
        <QueryErrorState message="Could not load audit events." />
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={events.isPending}
        framed
        compactLayout
        emptyMessage="No audit events match your filters."
        filterActive={filterActive}
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
