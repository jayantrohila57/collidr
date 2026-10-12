"use client";

import { Github, Shield } from "lucide-react";
import { ErrorState } from "@/components/patterns/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { formatDateTime } from "@/lib/format";

export function SettingsPage() {
  const { data: session, isPending, error, refetch } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-4" aria-busy="true">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
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
    <div className="mx-auto max-w-2xl space-y-6">
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

      <Separator />

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

      <p className="text-muted-foreground text-xs">
        Project visibility and secrets are managed per project. Use the project
        actions menu to change status, visibility, or delete data.
      </p>
    </div>
  );
}
