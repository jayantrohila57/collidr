"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import type { ReactNode } from "react";

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
      <SectionCardSkeleton titleWidth="w-36" descriptionWidth="w-56">
        <Skeleton className="h-8 w-fit max-w-full rounded-lg sm:w-64" />
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
