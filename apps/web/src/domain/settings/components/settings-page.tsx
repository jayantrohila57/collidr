"use client";

import { Github } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ErrorState } from "@/components/patterns/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Frame } from "@/components/ui/frame";
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
    <Frame className="w-full">
      <div className="flex flex-col gap-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your profile in this workspace.</CardDescription>
          </CardHeader>
          <CardPanel>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.image ?? undefined} alt="" />
                <AvatarFallback>
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
          </CardPanel>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardPanel className="text-sm">
            <p>
              <span className="text-muted-foreground">Signed in via</span>{" "}
              <Github className="inline size-4 align-text-bottom" aria-hidden />{" "}
              GitHub
            </p>
            {"createdAt" in user && user.createdAt ? (
              <p className="text-muted-foreground text-xs">
                Member since {formatDateTime(String(user.createdAt))}
              </p>
            ) : null}
          </CardPanel>
        </Card>

        {isOrganizationsEnabledOnClient() && (
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Workspace profile, members, and invitations.
              </CardDescription>
            </CardHeader>
            <CardPanel>
              <Link
                href={"/dashboard/settings/organization" as Route}
                className="text-primary text-sm underline-offset-4 hover:underline"
              >
                Manage organization
              </Link>
            </CardPanel>
          </Card>
        )}

        <p className="text-muted-foreground text-xs">
          Project visibility and secrets are managed per project from the
          project actions menu.
        </p>
      </div>
    </Frame>
  );
}
