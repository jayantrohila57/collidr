"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export default function ConsoleDashboardPage() {
  const overview = useQuery(trpc.platform.overview.queryOptions());
  const health = useQuery(trpc.healthCheck.queryOptions());

  if (overview.isPending) {
    return <p className="text-muted-foreground text-sm">Loading overview…</p>;
  }

  if (overview.isError) {
    return (
      <p className="text-destructive text-sm">
        Failed to load overview. Ensure platform admin schema is applied.
      </p>
    );
  }

  const stats = overview.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-xl">Platform overview</h1>
        <p className="text-muted-foreground text-sm">
          Cross-tenant metrics for operators. API health: {health.data ?? "…"}
        </p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Users", stats.users],
          ["Organizations", stats.organizations],
          ["Projects", stats.projects],
          ["Sessions", stats.sessions],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="font-semibold text-2xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
