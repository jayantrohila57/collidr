"use client";

import { Github } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ErrorState } from "@/components/patterns/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { formatDateTime } from "@/lib/format";
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
    <div className="flex min-w-0 flex-col gap-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Profile and sign-in method.</CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt="" />
              <AvatarFallback className="text-xs">
                {user.name?.slice(0, 2)?.toUpperCase() ??
                  user.email?.slice(0, 2)?.toUpperCase() ??
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-sm">
                {user.name ?? "User"}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {user.email}
              </p>
            </div>
          </div>
          <p className="flex items-center gap-1 text-muted-foreground text-xs">
            <Github className="size-3.5" aria-hidden />
            GitHub
          </p>
        </CardPanel>
      </Card>

      {"createdAt" in user && user.createdAt ? (
        <Card>
          <CardPanel className="text-muted-foreground text-xs">
            Member since {formatDateTime(String(user.createdAt))}
          </CardPanel>
        </Card>
      ) : null}

      {isOrganizationsEnabledOnClient() ? (
        <Card>
          <CardPanel className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-sm">Organization</p>
              <p className="text-muted-foreground text-xs">
                Members, invitations, and workspace profile.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              render={
                <Link href={"/dashboard/settings/organization" as Route} />
              }
            >
              Manage organization
            </Button>
          </CardPanel>
        </Card>
      ) : null}
    </div>
  );
}
