"use client";

import { FileKey, Plus } from "lucide-react";
import { useMemo } from "react";
import { HorizontalScrollRail } from "@/components/patterns/horizontal-scroll-rail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { touchTarget } from "@/lib/utils";
import { CreateEnvironmentDialog } from "./create-environment-dialog";
import { DeleteEnvironmentDialog } from "./delete-environment-dialog";
import { EditEnvironmentDialog } from "./edit-environment-dialog";

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
          <CreateEnvironmentDialog
            onConfirm={onCreate}
            isPending={isCreating}
          />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Card className="min-w-0 bg-background">
      <CardHeader className="space-y-0">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <CardTitle className="flex min-w-0 items-center gap-2 text-lg">
            <FileKey className="size-5 shrink-0" />
            <span className="truncate">Environments</span>
          </CardTitle>
          <CreateEnvironmentDialog
            onConfirm={onCreate}
            isPending={isCreating}
            triggerText="Add Environment"
            compactOnMobile
          />
        </div>
      </CardHeader>
      <CardContent className="min-w-0">
        <Tabs
          value={resolvedActive}
          onValueChange={onTabChange}
          className="min-w-0 gap-4"
        >
          <div className="min-w-0 space-y-2 lg:hidden">
            <Select value={resolvedActive} onValueChange={onTabChange}>
              <SelectTrigger
                className={`w-full ${touchTarget}`}
                aria-label="Select environment"
              >
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
                <EditEnvironmentDialog
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
                    <span className="flex shrink-0 items-center gap-0.5 pr-2">
                      <EditEnvironmentDialog
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
            <TabsContent
              key={env.id}
              value={env.id}
              className="min-w-0 rounded-md border p-4"
            >
              {children(env)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
