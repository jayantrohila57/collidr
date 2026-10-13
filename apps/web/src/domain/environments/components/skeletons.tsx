"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import type { ReactNode } from "react";
import { DataTable } from "@/components/data-table/data-table";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type VariableSkeletonRow = { id: string };

const variableColumnHelper = legacyCreateColumnHelper<VariableSkeletonRow>();
const variableSkeletonColumns = [
  variableColumnHelper.display({ id: "key", header: "Key", cell: () => null }),
  variableColumnHelper.display({
    id: "value",
    header: "Value",
    cell: () => null,
  }),
  variableColumnHelper.display({
    id: "actions",
    header: "Actions",
    cell: () => null,
  }),
];

function SectionCardSkeleton({
  titleWidth,
  descriptionWidth,
  children,
}: {
  titleWidth: string;
  descriptionWidth: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className={`h-6 ${titleWidth}`} />
        </CardTitle>
        <CardDescription>
          <Skeleton className={`h-4 ${descriptionWidth}`} />
        </CardDescription>
      </CardHeader>
      <CardPanel>{children}</CardPanel>
    </Card>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-2"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <SectionCardSkeleton titleWidth="w-28" descriptionWidth="w-64">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </SectionCardSkeleton>

      <SectionCardSkeleton titleWidth="w-24" descriptionWidth="w-72">
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            "slug",
            "status",
            "visibility",
            "archived",
            "created",
            "updated",
          ].map((field) => (
            <div key={field} className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </SectionCardSkeleton>

      <SectionCardSkeleton titleWidth="w-36" descriptionWidth="w-80">
        <Skeleton className="h-9 w-full max-w-md rounded-lg" />
        <Skeleton className="h-9 w-full max-w-2xl rounded-lg" />
        <Card className="mt-2 shadow-none">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-24" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-56" />
            </CardDescription>
          </CardHeader>
          <CardPanel className="pt-0">
            <VariablesSkeleton />
          </CardPanel>
        </Card>
      </SectionCardSkeleton>

      <SectionCardSkeleton titleWidth="w-24" descriptionWidth="w-56">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-8 w-40 rounded-md" />
      </SectionCardSkeleton>

      <SectionCardSkeleton titleWidth="w-32" descriptionWidth="w-64">
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </SectionCardSkeleton>
    </div>
  );
}

export function VariablesSkeleton() {
  return (
    <DataTable
      columns={variableSkeletonColumns}
      data={[]}
      isLoading
      skeletonRowCount={4}
      framed
    />
  );
}
