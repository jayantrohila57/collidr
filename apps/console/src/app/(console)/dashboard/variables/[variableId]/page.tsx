"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function ConsoleVariableDetailPage() {
  const params = useParams<{ variableId: string }>();
  const searchParams = useSearchParams();
  const variableId = params.variableId;
  const organizationId = searchParams.get("organizationId") ?? "";
  const [revealRequested, setRevealRequested] = useState(false);

  const detail = useQuery({
    ...trpc.platform.getVariable.queryOptions({
      organizationId,
      variableId,
    }),
    enabled: Boolean(organizationId),
  });

  const revealed = useQuery({
    ...trpc.platform.revealVariable.queryOptions({
      organizationId,
      variableId,
    }),
    enabled: Boolean(organizationId) && revealRequested,
    retry: false,
  });

  const variable = detail.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard/variables"
          className="text-muted-foreground hover:underline"
        >
          Variables
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-xs">{variable?.key ?? variableId}</span>
      </div>

      {!organizationId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization required</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Open this variable from the list or add{" "}
            <code className="font-mono text-xs">?organizationId=…</code> to the
            URL.
          </CardContent>
        </Card>
      ) : null}

      {organizationId && detail.isError ? (
        <QueryErrorState message="Variable not found or failed to load." />
      ) : null}

      <ConsolePageHeader
        title={variable?.key ?? "Variable"}
        description={undefined}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!organizationId || (revealRequested && revealed.isFetching)}
          onClick={() => setRevealRequested(true)}
        >
          Reveal value
        </Button>
      </ConsolePageHeader>

      {variable ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">Environment</Label>
              <p className="font-mono text-xs">{variable.environmentId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Updated</Label>
              <p>{formatDateTime(variable.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {revealRequested ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revealed value</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {revealed.isPending ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : null}
            {revealed.isError ? (
              <QueryErrorState message="Could not reveal variable value." />
            ) : null}
            {revealed.data ? (
              <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                {revealed.data.value}
              </pre>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
