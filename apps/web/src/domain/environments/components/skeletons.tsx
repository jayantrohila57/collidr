"use client";

import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
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
    <Frame className="w-full" role="status" aria-live="polite" aria-busy="true">
      <FramePanel>
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
      </FramePanel>
      <FramePanel>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-full max-w-md rounded-lg" />
        <Skeleton className="h-7 w-full rounded-md" />
      </FramePanel>
      <FrameHeader>
        <FrameTitle>Variables</FrameTitle>
      </FrameHeader>
      <FramePanel>
        <VariablesSkeleton />
      </FramePanel>
    </Frame>
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
