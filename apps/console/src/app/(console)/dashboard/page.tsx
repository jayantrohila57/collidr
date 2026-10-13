"use client";

import { useQuery } from "@tanstack/react-query";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { StatCard } from "@/domain/console/components/stat-card";
import { trpc } from "@/utils/trpc";

export default function ConsoleDashboardPage() {
  const overview = useQuery(trpc.platform.overview.queryOptions());
  const health = useQuery(trpc.healthCheck.queryOptions());

  return (
    <div className="space-y-6">
      <ConsolePageHeader
        title="Platform overview"
        description={`Cross-tenant metrics for operators. API health: ${health.data ?? "…"}`}
      />

      {overview.isError ? (
        <QueryErrorState message="Failed to load overview. Ensure platform admin schema is applied." />
      ) : null}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Users"
          stat={overview.isPending ? undefined : overview.data?.users}
        />
        <StatCard
          label="Organizations"
          stat={overview.isPending ? undefined : overview.data?.organizations}
        />
        <StatCard
          label="Projects"
          stat={overview.isPending ? undefined : overview.data?.projects}
        />
        <StatCard
          label="Sessions"
          stat={overview.isPending ? undefined : overview.data?.sessions}
        />
      </dl>
    </div>
  );
}
