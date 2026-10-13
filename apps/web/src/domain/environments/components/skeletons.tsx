"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table/data-table";
import {
  Card,
  CardFrame,
  CardFrameHeader,
  CardFrameTitle,
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

export function ProjectDetailSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardPanel>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardPanel>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-7 w-32 rounded-md" />
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-8 w-full max-w-md rounded-lg" />
        </div>
        <div className="lg:hidden">
          <Skeleton className="h-7 w-full rounded-md" />
        </div>
        <CardFrame>
          <CardFrameHeader>
            <CardFrameTitle>Variables</CardFrameTitle>
          </CardFrameHeader>
          <VariablesSkeleton />
        </CardFrame>
      </section>
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
    />
  );
}
