"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function ConsoleEnvironmentDetailPage() {
  const params = useParams<{ environmentId: string }>();
  const searchParams = useSearchParams();
  const environmentId = params.environmentId;
  const organizationId = searchParams.get("organizationId") ?? "";

  const detail = useQuery({
    ...trpc.platform.getEnvironment.queryOptions({
      organizationId,
      environmentId,
    }),
    enabled: Boolean(organizationId),
  });

  const env = detail.data?.environment;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard/environments"
          className="text-muted-foreground hover:underline"
        >
          Environments
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>{env?.name ?? environmentId}</span>
      </div>

      {!organizationId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization required</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Open this environment from the list or add{" "}
            <code className="font-mono text-xs">?organizationId=…</code> to the
            URL.
          </CardContent>
        </Card>
      ) : null}

      {organizationId && detail.isError ? (
        <QueryErrorState message="Environment not found or failed to load." />
      ) : null}

      <ConsolePageHeader
        title={env?.name ?? "Environment"}
        description={env?.slug ? `/${env.slug}` : undefined}
      />

      {env ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <p>{env.status}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Project ID</Label>
              <p className="font-mono text-xs">{env.projectId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Organization</Label>
              <p className="font-mono text-xs">{organizationId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Updated</Label>
              <p>{env.updatedAt ? formatDateTime(env.updatedAt) : "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-muted-foreground">Environment ID</Label>
              <p className="font-mono text-xs">{env.id}</p>
            </div>
            <div className="sm:col-span-2">
              <Link
                href={`/dashboard/variables?environmentId=${env.id}`}
                className="text-sm hover:underline"
              >
                View variables in this environment
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
