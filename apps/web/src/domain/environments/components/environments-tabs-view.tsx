"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { HorizontalScrollRail } from "@/components/patterns/horizontal-scroll-rail";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { layoutGapClass, layoutToolbarClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { useEnvironmentVariableCounts } from "../hooks/use-environment-variable-counts";
import { CreateEnvironmentSheet } from "./create-environment-sheet";
import { DeleteEnvironmentDialog } from "./delete-environment-dialog";
import { EditEnvironmentSheet } from "./edit-environment-sheet";

interface Environment {
  id: string;
  name: string;
}

interface EnvironmentsTabsViewProps {
  environments: Environment[];
  activeTab?: string;
  onTabChange: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  children: (env: Environment) => React.ReactNode;
}

export function EnvironmentsTabsView({
  environments,
  activeTab,
  onTabChange,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
  children,
}: EnvironmentsTabsViewProps) {
  const resolvedActive =
    activeTab && environments.some((e) => e.id === activeTab)
      ? activeTab
      : environments[0]?.id;

  const activeEnvironment = useMemo(
    () => environments.find((e) => e.id === resolvedActive),
    [environments, resolvedActive],
  );

  const variableCounts = useEnvironmentVariableCounts(
    environments.map((env) => env.id),
  );

  if (environments.length === 0) {
    return (
      <Empty className="h-full w-full border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Plus className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No environments yet</EmptyTitle>
          <EmptyDescription>
            Create environments like development, staging, or production.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateEnvironmentSheet onConfirm={onCreate} isPending={isCreating} />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <section className={cn("flex min-w-0 flex-col", layoutGapClass)}>
      <Tabs
        value={resolvedActive}
        onValueChange={onTabChange}
        className="min-w-0 gap-2"
      >
        <HorizontalScrollRail>
          <TabsList size="sm" className="h-auto w-max max-w-full justify-start">
            {environments.map((env) => {
              const count = variableCounts[env.id];
              return (
                <TabsTab key={env.id} value={env.id} className="gap-1.5">
                  <span>{env.name}</span>
                  {count !== undefined ? (
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="tabular-nums"
                    >
                      {count}
                    </Badge>
                  ) : null}
                </TabsTab>
              );
            })}
          </TabsList>
        </HorizontalScrollRail>

        {activeEnvironment ? (
          <TabsPanel value={activeEnvironment.id} className="min-w-0">
            <div className={cn(layoutToolbarClass, "items-center pb-0")}>
              <div className="flex flex-1 items-center gap-1">
                <EditEnvironmentSheet
                  environment={activeEnvironment}
                  onConfirm={onUpdate}
                  isPending={isUpdating}
                />
                <DeleteEnvironmentDialog
                  environmentName={activeEnvironment.name}
                  onConfirm={() => onDelete(activeEnvironment.id)}
                  isPending={isDeleting}
                />
              </div>
            </div>
            {children(activeEnvironment)}
          </TabsPanel>
        ) : null}
      </Tabs>
    </section>
  );
}
