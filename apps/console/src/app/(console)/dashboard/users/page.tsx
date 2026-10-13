"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export default function ConsoleUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const users = useQuery(
    trpc.platform.listUsers.queryOptions({
      search: search || undefined,
    }),
  );

  const setRole = useMutation({
    ...trpc.platform.setUserRole.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const rows = users.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-semibold text-xl">Users</h1>
          <p className="text-muted-foreground text-sm">
            Platform-wide user directory (admin plugin roles).
          </p>
        </div>
        <label className="text-sm">
          <span className="text-muted-foreground">Search email</span>
          <input
            className="mt-1 block rounded-md border bg-background px-2 py-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {users.isPending ? (
        <p className="text-muted-foreground text-sm">Loading users…</p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground text-xs">
            <tr>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Banned</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.role}</td>
                <td className="px-3 py-2">{row.banned ? "yes" : "no"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded border px-2 py-0.5 text-xs hover:bg-muted"
                      disabled={setRole.isPending}
                      onClick={() =>
                        setRole.mutate({
                          userId: row.id,
                          role: row.role === "admin" ? "user" : "admin",
                        })
                      }
                    >
                      Toggle admin
                    </button>
                    <button
                      type="button"
                      className="rounded border px-2 py-0.5 text-xs hover:bg-muted"
                      onClick={() => {
                        void authClient.admin.impersonateUser({
                          userId: row.id,
                        });
                      }}
                    >
                      Impersonate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
