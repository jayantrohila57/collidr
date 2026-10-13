"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { HorizontalScrollRail } from "@/components/patterns/horizontal-scroll-rail";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <section className="flex min-w-0 flex-col gap-2">
      <Tabs
        value={resolvedActive}
        onValueChange={onTabChange}
        className="min-w-0 gap-2"
      >
        <div className="min-w-0 space-y-2 lg:hidden">
          <Select
            value={resolvedActive}
            items={environments.map((env) => ({
              value: env.id,
              label: env.name,
            }))}
            onValueChange={(value) => {
              if (value) onTabChange(value);
            }}
          >
            <SelectTrigger className="w-full" aria-label="Select environment">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env.id} value={env.id}>
                  {env.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeEnvironment && (
            <div className="flex items-center gap-1">
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
          )}
        </div>

        <div className="hidden min-w-0 lg:block">
          <HorizontalScrollRail>
            <TabsList className="inline-flex h-auto w-max flex-nowrap justify-start">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className="inline-flex shrink-0 items-center gap-0.5"
                >
                  <TabsTrigger className="shrink-0" value={env.id}>
                    {env.name}
                  </TabsTrigger>
                  <span className="flex shrink-0 items-center gap-0.5 pe-2">
                    <EditEnvironmentSheet
                      environment={env}
                      onConfirm={onUpdate}
                      isPending={isUpdating}
                    />
                    <DeleteEnvironmentDialog
                      environmentName={env.name}
                      onConfirm={() => onDelete(env.id)}
                      isPending={isDeleting}
                    />
                  </span>
                </div>
              ))}
            </TabsList>
          </HorizontalScrollRail>
        </div>

        {environments.map((env) => (
          <TabsContent key={env.id} value={env.id} className="min-w-0 pt-2">
            {children(env)}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
