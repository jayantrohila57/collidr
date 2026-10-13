"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export default function ConsoleOrganizationsPage() {
  const orgs = useQuery(trpc.platform.listOrganizations.queryOptions());

  return (
    <div className="space-y-4">
      <h1 className="font-semibold text-xl">Organizations</h1>
      {orgs.isPending ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {(orgs.data?.items ?? []).map((org) => (
            <li
              key={org.id}
              className="flex justify-between gap-2 px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium">{org.name}</span>
                <span className="text-muted-foreground"> · {org.slug}</span>
              </span>
              <span className="text-muted-foreground text-xs">{org.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
