"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { DataTableColumnDef } from "@/components/data-table/data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const setSupportManager = useMutation({
    ...trpc.platform.setSupportManager.mutationOptions(),
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

  const updateUser = useMutation({
    ...trpc.platform.updateUser.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const softDeleteUser = useMutation({
    ...trpc.platform.softDeleteUser.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const restoreUser = useMutation({
    ...trpc.platform.restoreUser.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const user = detail.data?.user;
  const sessions = detail.data?.sessions ?? [];

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

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
            disabled={!user || setSupportManager.isPending}
            onClick={() =>
              user &&
              setSupportManager.mutate({
                userId: user.id,
                granted: !user.isSupportManager,
              })
            }
          >
            {user?.isSupportManager
              ? "Revoke support manager"
              : "Grant support manager"}
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
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <Input
                  className="mt-1"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <Input
                  className="mt-1"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={updateUser.isPending}
                onClick={() =>
                  updateUser.mutate({
                    userId: user.id,
                    name: editName.trim(),
                    email: editEmail.trim(),
                  })
                }
              >
                Save profile
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={softDeleteUser.isPending}
                onClick={() => softDeleteUser.mutate({ userId: user.id })}
              >
                Soft delete user
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={restoreUser.isPending}
                onClick={() => restoreUser.mutate({ userId: user.id })}
              >
                Restore user
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="font-mono text-xs">{user.role}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Support manager</Label>
                <p>
                  {user.isSupportManager ? (
                    <Badge variant="secondary">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
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
                  <Label className="text-muted-foreground">Ban reason</Label>
                  <p>{user.banReason}</p>
                </div>
              ) : null}
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{formatDateTime(user.createdAt)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="font-mono text-xs">{user.id}</p>
              </div>
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
