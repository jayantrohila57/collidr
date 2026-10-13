"use client";

import { Github } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ErrorState } from "@/components/patterns/error-state";
import {
  SettingsPanel,
  SettingsRow,
} from "@/components/patterns/settings-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { formatDateTime } from "@/lib/format";
import { initialsFromLabel } from "@/lib/initials";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { SettingsPageSkeleton } from "./settings-skeleton";

export function SettingsPage() {
  const { data: session, isPending, error, refetch } = useSession();
  const user = session?.user;

  if (isPending) {
    return <SettingsPageSkeleton />;
  }

  if (error || !user) {
    return (
      <ErrorState
        title="Could not load account"
        description="Sign in again to manage your settings."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <SettingsPanel>
      <SettingsRow label="Account" description="Profile and sign-in method.">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={user.image ?? undefined} alt="" />
            <AvatarFallback className="text-xs">
              {initialsFromLabel(user.name ?? user.email ?? "User", "US")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-end sm:text-start">
            <p className="truncate font-medium text-sm">
              {user.name ?? "User"}
            </p>
            <p className="truncate text-muted-foreground text-xs">
              {user.email}
            </p>
          </div>
        </div>
      </SettingsRow>

      <SettingsRow label="Sign-in" description="Connected provider.">
        <div className="text-end">
          <p className="flex items-center justify-end gap-1 text-muted-foreground text-xs">
            <Github className="size-3.5" aria-hidden />
            GitHub
          </p>
          {"createdAt" in user && user.createdAt ? (
            <p className="text-muted-foreground text-xs">
              Member since {formatDateTime(String(user.createdAt))}
            </p>
          ) : null}
        </div>
      </SettingsRow>

      {isOrganizationsEnabledOnClient() ? (
        <SettingsRow
          label="Organization"
          description="Members, invitations, and workspace profile."
        >
          <Button
            type="button"
            size="sm"
            className="w-fit"
            render={<Link href={"/dashboard/settings/organization" as Route} />}
          >
            Manage organization
          </Button>
        </SettingsRow>
      ) : null}
    </SettingsPanel>
  );
}
