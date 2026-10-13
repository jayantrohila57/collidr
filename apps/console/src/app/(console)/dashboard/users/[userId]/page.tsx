"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { authClient } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

type SessionRow = {
  id: string;
  createdAt: string;
  expiresAt: string;
  impersonatedBy: string | null;
};

export default function ConsoleUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const queryClient = useQueryClient();

  const detail = useQuery(trpc.platform.getUser.queryOptions({ userId }));

  const setRole = useMutation({
    ...trpc.platform.setUserRole.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const revokeSession = useMutation({
    ...trpc.platform.revokeSession.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const user = detail.data?.user;
  const sessions = detail.data?.sessions ?? [];

  const sessionColumns: DataTableColumnDef<SessionRow>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Session" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expires" />
      ),
      cell: ({ row }) => formatDateTime(row.original.expiresAt),
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={revokeSession.isPending}
          onClick={() => revokeSession.mutate({ sessionId: row.original.id })}
        >
          Revoke
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard/users"
          className="text-muted-foreground hover:underline"
        >
          Users
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{user?.email ?? userId}</span>
      </div>

      {detail.isError ? (
        <QueryErrorState message="User not found or failed to load." />
      ) : null}

      <ConsolePageHeader title={user?.email ?? "User"} description={user?.name}>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!user || setRole.isPending}
            onClick={() =>
              user &&
              setRole.mutate({
                userId: user.id,
                role: user.role === "admin" ? "user" : "admin",
              })
            }
          >
            Toggle admin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!user}
            onClick={() =>
              user && authClient.admin.impersonateUser({ userId: user.id })
            }
          >
            Impersonate
          </Button>
          {user?.banned ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                authClient.admin
                  .unbanUser({ userId })
                  .then(() => queryClient.invalidateQueries())
              }
            >
              Unban
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!user}
              onClick={() =>
                authClient.admin
                  .banUser({ userId, banReason: "Console ban" })
                  .then(() => queryClient.invalidateQueries())
              }
            >
              Ban
            </Button>
          )}
        </div>
      </ConsolePageHeader>

      {user ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Role</span>
              <p className="font-mono text-xs">{user.role}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p>
                {user.banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge variant="secondary">Active</Badge>
                )}
              </p>
            </div>
            {user.banReason ? (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Ban reason</span>
                <p>{user.banReason}</p>
              </div>
            ) : null}
            <div>
              <span className="text-muted-foreground">Created</span>
              <p>{formatDateTime(user.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">User ID</span>
              <p className="font-mono text-xs">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-2">
        <h2 className="font-medium text-sm">Recent sessions</h2>
        <DataTable
          columns={sessionColumns}
          data={sessions}
          isLoading={detail.isPending}
          framed
          compactLayout
          emptyMessage="No sessions for this user."
        />
      </div>
    </div>
  );
}
