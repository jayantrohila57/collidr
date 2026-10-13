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
      className="flex w-full flex-col gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-[auto_1fr_auto_1fr]">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-28" />
      </div>

      <SectionCardSkeleton titleWidth="w-36" descriptionWidth="w-56">
        <Skeleton className="h-8 w-full max-w-md rounded-lg" />
        <VariablesSkeleton />
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
