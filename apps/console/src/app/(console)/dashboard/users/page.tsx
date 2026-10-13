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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { ServerPagination } from "@/domain/console/components/server-pagination";
import { useDebouncedValue } from "@/domain/console/hooks/use-debounced-value";
import { authClient } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
};

const PAGE_SIZE = 25;

export default function ConsoleUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const users = useQuery(
    trpc.platform.listUsers.queryOptions({
      limit: PAGE_SIZE,
      offset,
      search: debouncedSearch || undefined,
    }),
  );

  const setRole = useMutation({
    ...trpc.platform.setUserRole.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = users.data?.data.items ?? [];
  const total = users.data?.data.total ?? 0;

  const columns = useMemo((): DataTableColumnDef<UserRow>[] => {
    return [
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/users/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.email}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.role}</span>
        ),
      },
      {
        accessorKey: "banned",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Banned" />
        ),
        cell: ({ row }) =>
          row.original.banned ? (
            <Badge variant="destructive">Banned</Badge>
          ) : (
            <Badge variant="secondary">Active</Badge>
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
          const user = row.original;
          const actions: DataTableRowAction[] = [
            {
              label: "View details",
              onSelect: () => {
                window.location.href = `/dashboard/users/${user.id}`;
              },
            },
            {
              label: user.role === "admin" ? "Remove admin" : "Make admin",
              onSelect: () =>
                setRole.mutate({
                  userId: user.id,
                  role: user.role === "admin" ? "user" : "admin",
                }),
              disabled: setRole.isPending,
            },
            {
              label: "Impersonate",
              onSelect: () => {
                void authClient.admin.impersonateUser({ userId: user.id });
              },
            },
            user.banned
              ? {
                  label: "Unban",
                  onSelect: () => {
                    void authClient.admin
                      .unbanUser({ userId: user.id })
                      .then(() => queryClient.invalidateQueries());
                  },
                }
              : {
                  label: "Ban",
                  destructive: true,
                  onSelect: () => {
                    void authClient.admin
                      .banUser({ userId: user.id, banReason: "Console ban" })
                      .then(() => queryClient.invalidateQueries());
                  },
                },
          ];
          return <DataTableRowActions actions={actions} />;
        },
      },
    ];
  }, [queryClient, setRole]);

  return (
    <div className="space-y-4">
      <ConsolePageHeader
        title="Users"
        description="Platform-wide user directory (admin plugin roles)."
      >
        <div className="text-sm">
          <Label className="text-muted-foreground">Search email</Label>
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

      {users.isError ? (
        <QueryErrorState message="Could not load users." />
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={users.isPending}
        framed
        compactLayout
        emptyMessage="No users match your search."
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
