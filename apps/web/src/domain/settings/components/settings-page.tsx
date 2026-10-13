"use client";

import { Github, Shield } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ErrorState } from "@/components/patterns/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" aria-hidden />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-16 shrink-0">
            <AvatarImage src={user.image ?? undefined} alt="" />
            <AvatarFallback>
              {user.name?.slice(0, 2)?.toUpperCase() ??
                user.email?.slice(0, 2)?.toUpperCase() ??
                "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.name ?? "User"}</p>
            <p className="truncate text-muted-foreground text-sm">
              {user.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Signed in via</span>{" "}
            <Github className="inline size-4 align-text-bottom" aria-hidden />{" "}
            GitHub
          </p>
          {"createdAt" in user && user.createdAt ? (
            <p className="text-muted-foreground">
              Member since {formatDateTime(String(user.createdAt))}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {isOrganizationsEnabledOnClient() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={"/dashboard/settings/organization" as Route}
              className="cursor-pointer text-primary text-sm underline-offset-4 hover:underline"
            >
              Manage organization and members
            </Link>
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground text-xs">
        Project visibility and secrets are managed per project. Use the project
        actions menu to change status, visibility, or delete data.
      </p>
    </div>
  );
}
