"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableRowAction } from "@/components/data-table/data-table-row-actions";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { AdminListPage } from "@/domain/console/components/admin-list-page";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { useDebouncedValue } from "@/domain/console/hooks/use-debounced-value";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type NotificationRow = {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  recipientUserId: string | null;
  recipientEmail: string | null;
  organizationId: string | null;
  readAt: string | null;
  createdAt: string;
  deletedAt: string | null;
};

const PAGE_SIZE = 25;

export default function ConsoleNotificationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const notifications = useQuery(
    trpc.platform.listNotifications.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const deleteNotification = useMutation({
    ...trpc.platform.deleteNotification.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = notifications.data?.items ?? [];
  const total = notifications.data?.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<NotificationRow>[] => {
    return [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.title ?? "—"}</p>
            <p className="line-clamp-1 text-muted-foreground text-xs">
              {row.original.body ?? ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.type}</span>
        ),
      },
      {
        accessorKey: "recipientEmail",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Recipient" />
        ),
        cell: ({ row }) =>
          row.original.recipientEmail ?? row.original.recipientUserId,
      },
      {
        accessorKey: "readAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Read" />
        ),
        cell: ({ row }) =>
          row.original.readAt ? (
            <span className="text-muted-foreground text-xs">
              {formatDateTime(row.original.readAt)}
            </span>
          ) : (
            <Badge variant="secondary">Unread</Badge>
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
        cell: ({ row }) => {
          const n = row.original;
          const actions: DataTableRowAction[] = [
            ...(n.organizationId
              ? [
                  {
                    label: "View organization",
                    onSelect: () => {
                      window.location.href = `/dashboard/organizations/${n.organizationId}`;
                    },
                  },
                ]
              : []),
            {
              label: "Soft delete",
              destructive: true,
              disabled: deleteNotification.isPending,
              onSelect: () =>
                deleteNotification.mutate({ notificationId: n.id }),
            },
          ];
          return <DataTableRowActions actions={actions} />;
        },
      },
    ];
  }, [deleteNotification]);

  return (
    <AdminListPage
      title="Notifications"
      description="In-app notifications across users and organizations."
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setOffset(0);
      }}
      searchLabel="Search title or recipient"
      isError={notifications.isError}
      errorMessage="Could not load notifications."
    >
      <DataTable
        columns={columns}
        data={rows}
        isLoading={notifications.isPending}
        framed
        compactLayout
        emptyMessage="No notifications found."
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
