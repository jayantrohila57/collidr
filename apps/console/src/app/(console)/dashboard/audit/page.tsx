"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export default function ConsoleAuditPage() {
  const events = useQuery(trpc.platform.listAuditEvents.queryOptions());

  return (
    <div className="space-y-4">
      <h1 className="font-semibold text-xl">Global audit</h1>
      {events.isPending ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <ul className="divide-y rounded-lg border font-mono text-xs">
          {(events.data?.items ?? []).map((event) => (
            <li key={event.id} className="px-3 py-2">
              <span className="text-foreground">{event.action}</span>
              <span className="text-muted-foreground">
                {" "}
                · {event.result} · {String(event.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
