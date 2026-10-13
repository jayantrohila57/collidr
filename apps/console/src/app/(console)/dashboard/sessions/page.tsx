"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export default function ConsoleSessionsPage() {
  const sessions = useQuery(trpc.platform.listSessions.queryOptions());

  return (
    <div className="space-y-4">
      <h1 className="font-semibold text-xl">Sessions</h1>
      {sessions.isPending ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {(sessions.data?.items ?? []).map((row) => (
            <li key={row.id} className="space-y-1 px-3 py-2">
              <p>
                <span className="font-medium">{row.userEmail}</span>
                <span className="text-muted-foreground"> · {row.id}</span>
              </p>
              {row.impersonatedBy ? (
                <p className="text-amber-700 text-xs dark:text-amber-200">
                  Impersonated by {row.impersonatedBy}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
