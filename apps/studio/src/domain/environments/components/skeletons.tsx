"use client";

import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import { layoutGapClass } from "@loftlancer/ui/layout-spacing";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import type { ReactNode } from "react";
import { PageStack } from "@/components/layout/app-layout";
import { AppIcon } from "@/components/patterns/app-icon";
import { iconMutedClassName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { isVariablesV2EnabledOnClient } from "@/lib/variables-v2-enabled";
import { EnvironmentTabCountBadge } from "./environment-tab-count-badge";
import {
  VARIABLES_SEARCH_PLACEHOLDER,
  variableColumnClassNames,
} from "./variables-table-columns";

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

/** Card skeleton used by the project settings route. */
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

/** Environment tab labels in the skeleton rail (e.g. development, staging). */
const ENV_TAB_PLACEHOLDERS = ["w-[5.5rem]", "w-14"];

const loadedVariableColumns = (variablesV2: boolean) => [
  variableColumnHelper.display({
    id: "key",
    meta: { className: variableColumnClassNames.key },
    header: () => (
      <span className="font-medium text-muted-foreground text-xs">Key</span>
    ),
    cell: () => null,
  }),
  variableColumnHelper.display({
    id: "value",
    meta: { className: variableColumnClassNames.value },
    header: "Value",
    cell: () => null,
  }),
  ...(variablesV2
    ? [
        variableColumnHelper.display({
          id: "updatedBy",
          meta: { className: variableColumnClassNames.updatedBy },
          header: "Updated",
          cell: () => null,
        }),
      ]
    : []),
  variableColumnHelper.display({
    id: "actions",
    meta: { className: variableColumnClassNames.actions },
    header: () => <DataTableActionsColumnHeader />,
    cell: () => null,
  }),
];

/**
 * Variables table while the environment loads: the loaded table's toolbar
 * (search, Copy/Import .env, Add variable), frame and columns, with skeleton
 * rows only in the body (#326).
 */
export function VariablesTableSkeleton() {
  const variablesV2 = isVariablesV2EnabledOnClient();
  return (
    <DataTable
      columns={loadedVariableColumns(variablesV2)}
      data={[]}
      isLoading
      searchable
      searchPlaceholder={VARIABLES_SEARCH_PLACEHOLDER}
      framed
      compactLayout
      toolbarTrailing={
        <>
          <Button type="button" variant="outline" className="h-8" disabled>
            <AppIcon name="copyEnv" />
            Copy as .env
          </Button>
          <Button type="button" variant="outline" className="h-8" disabled>
            <AppIcon name="importFile" />
            Import .env
          </Button>
        </>
      }
      primaryAction={
        <Button
          type="button"
          size="sm"
          className="max-sm:size-8 max-sm:gap-0 max-sm:px-0 sm:gap-1.5"
          disabled
          aria-label="Add variable"
        >
          <AppIcon name="plus" className="text-current" />
          <span className="sr-only sm:not-sr-only">Add variable</span>
        </Button>
      }
    />
  );
}

/**
 * Mirrors ProjectDetail 1:1 (#326): the environment tab rail (underline tabs
 * with count badges + actions button) above the variables table. No card,
 * no extra columns.
 */
export function ProjectEnvironmentsSkeleton() {
  return (
    <PageStack className="w-full min-w-0 gap-4">
      <section
        className="flex min-w-0 flex-col gap-2"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading environments…</span>
        <div className={cn("flex min-w-0 flex-col", layoutGapClass)}>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="min-w-0 overflow-hidden" aria-hidden>
              <div className="flex w-max min-w-full items-end gap-1 border-border border-b">
                <div className="flex h-9 min-h-9 w-fit shrink-0 items-center">
                  {ENV_TAB_PLACEHOLDERS.map((w) => (
                    <span
                      key={w}
                      className="flex h-9 shrink-0 items-center gap-1.5 px-2.5"
                    >
                      <AppIcon
                        name="environment"
                        className={cn(iconMutedClassName, "size-4")}
                      />
                      <Skeleton className={cn("h-3", w)} />
                      <EnvironmentTabCountBadge />
                    </span>
                  ))}
                </div>
                <Skeleton className="size-8 shrink-0 rounded-md" />
              </div>
            </div>
            <div className="min-w-0">
              <VariablesTableSkeleton />
            </div>
          </div>
        </div>
      </section>
    </PageStack>
  );
}
