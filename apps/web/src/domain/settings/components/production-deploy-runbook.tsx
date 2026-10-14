"use client";

import type { FeatureFlagSnapshotRow } from "@loftlancer/env/feature-flags";
import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { readClientFeatureFlags } from "@/lib/client-feature-flags";
import { layoutGapClass, layoutSectionStackClass } from "@/lib/layout-spacing";
import { siteConfig } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

const RUNBOOK_REPO_PATH = "docs/PRODUCTION_DEPLOY.md";

function FlagBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge variant={enabled ? "success" : "secondary"}>
      {enabled ? "true" : "false"}
    </Badge>
  );
}

function pairedRows(
  serverRows: FeatureFlagSnapshotRow[],
  clientRows: ReturnType<typeof readClientFeatureFlags>,
) {
  const clientById = new Map(clientRows.map((row) => [row.id, row]));
  return serverRows
    .filter((row) => row.clientKey !== null)
    .map((row) => ({
      ...row,
      client: clientById.get(row.id),
    }));
}

export function ProductionDeployRunbook({
  serverFlags,
}: {
  serverFlags: FeatureFlagSnapshotRow[];
}) {
  const clientRows = readClientFeatureFlags();
  const paired = pairedRows(serverFlags, clientRows);
  const mismatches = paired.filter(
    (row) => row.client && row.serverEnabled !== row.client.clientEnabled,
  );
  const serverOnly = serverFlags.filter((row) => row.clientKey === null);

  return (
    <div className={cn(layoutSectionStackClass, "min-w-0")}>
      {mismatches.length > 0 ? (
        <Alert variant="warning">
          <AppIcon name="danger" />
          <AlertTitle>Feature flag mismatch</AlertTitle>
          <AlertDescription>
            Server runtime flags do not match the client bundle (built with{" "}
            <code className="text-xs">NEXT_PUBLIC_*</code>). Update Vercel env
            vars, then redeploy production. See the repo runbook for the full
            checklist.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="success">
          <AppIcon name="statusActive" />
          <AlertTitle>Paired flags match this build</AlertTitle>
          <AlertDescription>
            Server and client feature flags are aligned for this deployment.
            Changing flags in Vercel still requires a redeploy.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Paired feature flags</CardTitle>
          <CardDescription>
            Server values reflect this runtime; client values were inlined at{" "}
            <code className="text-xs">next build</code>.
          </CardDescription>
        </CardHeader>
        <CardPanel className={layoutGapClass}>
          <SettingsPanel>
            {paired.map((row) => (
              <SettingsRow
                key={row.id}
                label={row.label}
                description={row.clientKey ?? undefined}
              >
                <div
                  className={cn("flex flex-wrap items-center", layoutGapClass)}
                >
                  <span className="text-muted-foreground text-xs">Server</span>
                  <FlagBadge enabled={row.serverEnabled} />
                  <span className="text-muted-foreground text-xs">Client</span>
                  <FlagBadge enabled={row.client?.clientEnabled ?? false} />
                </div>
              </SettingsRow>
            ))}
          </SettingsPanel>
        </CardPanel>
      </Card>

      {serverOnly.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Server-only flags</CardTitle>
            <CardDescription>
              No NEXT_PUBLIC mirror; redeploy not required for these alone.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <SettingsPanel>
              {serverOnly.map((row) => (
                <SettingsRow
                  key={row.id}
                  label={row.label}
                  description={row.serverKey}
                >
                  <FlagBadge enabled={row.serverEnabled} />
                </SettingsRow>
              ))}
            </SettingsPanel>
          </CardPanel>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Deploy rate limits</CardTitle>
          <CardDescription>
            Batch commits on <code className="text-xs">main</code>, validate{" "}
            <code className="text-xs">pnpm turbo run build --filter=web</code>{" "}
            before push, and redeploy from Vercel when only env vars change.
          </CardDescription>
        </CardHeader>
        <CardPanel className={layoutGapClass}>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs">
            <li>
              One production deploy per push to main (no branch previews).
            </li>
            <li>
              After any <code className="text-xs">NEXT_PUBLIC_*</code> change,
              trigger a full production redeploy.
            </li>
            <li>
              Turbo remote cache keys include feature flags in{" "}
              <code className="text-xs">turbo.json</code> — keep them in sync
              when adding flags.
            </li>
          </ul>
        </CardPanel>
      </Card>

      <SettingsPanel>
        <SettingsSectionHeader
          title="Repository runbook"
          description="Production checklist, schema sign-off, and Turbo env reference."
          icon="settings"
        />
        <SettingsRow label="Documentation" description={RUNBOOK_REPO_PATH}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            render={
              <Link
                href={`${siteConfig.links.github}/blob/main/${RUNBOOK_REPO_PATH}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <AppIcon name="externalLink" className="text-current" />
            View on GitHub
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-2"
            render={<Link href={"/dashboard/settings" as Route} />}
          >
            Back to settings
          </Button>
        </SettingsRow>
      </SettingsPanel>
    </div>
  );
}
