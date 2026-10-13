"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { ErrorState } from "@/components/patterns/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/utils/trpc";

export function OrganizationsPageClient() {
  const query = useQuery(trpc.organizations.list.queryOptions());

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (query.error) {
    return (
      <ErrorState
        title="Could not load organizations"
        description={query.error.message}
        onRetry={() => query.refetch()}
      />
    );
  }

  const items = query.data?.items ?? [];

  if (!items.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No organizations</EmptyTitle>
          <EmptyDescription>
            Create or join an organization to collaborate.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((org) => (
        <Card key={org.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">{org.name}</CardTitle>
            <span className="text-muted-foreground text-xs capitalize">
              {org.role === "admin" ? "manager" : org.role}
            </span>
          </CardHeader>
          <div className="px-6 pb-6">
            <Button
              size="sm"
              render={
                <Link href={`/dashboard/organizations/${org.slug}` as Route} />
              }
            >
              Open hub
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
