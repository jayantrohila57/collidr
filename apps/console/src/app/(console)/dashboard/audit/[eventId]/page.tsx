"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsolePageHeader } from "@/domain/console/components/console-page-header";
import { QueryErrorState } from "@/domain/console/components/query-state";
import { formatDateTime } from "@/lib/format";
import { trpc } from "@/utils/trpc";

export default function ConsoleAuditDetailPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const event = useQuery(trpc.platform.getAuditEvent.queryOptions({ eventId }));

  const row = event.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard/audit"
          className="text-muted-foreground hover:underline"
        >
          Audit
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-xs">{eventId}</span>
      </div>

      {event.isError ? (
        <QueryErrorState message="Audit event not found or failed to load." />
      ) : null}

      <ConsolePageHeader
        title={row?.action ?? "Audit event"}
        description={row ? formatDateTime(row.createdAt) : undefined}
      />

      {row ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Result</p>
                <p>{row.result}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Source</p>
                <p>{row.source}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Actor</p>
                <p>{row.actorEmail ?? row.actorUserId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Organization</p>
                <p>{row.organizationName ?? row.organizationId ?? "—"}</p>
              </div>
              {row.mcpTool ? (
                <div>
                  <p className="text-muted-foreground">MCP tool</p>
                  <p className="font-mono text-xs">{row.mcpTool}</p>
                </div>
              ) : null}
              {row.denialReason ? (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Denial reason</p>
                  <p>{row.denialReason}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payload</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted/40 p-3 font-mono text-xs">
                {JSON.stringify(row.payload, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
