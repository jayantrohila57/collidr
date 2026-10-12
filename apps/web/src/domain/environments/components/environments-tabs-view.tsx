"use client";

import { FileKey, Plus } from "lucide-react";
import { useMemo } from "react";
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
      <Empty className="h-full w-full border-2 border-muted-foreground/20 border-dashed bg-muted/30">
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
      <CardHeader className="gap-3 space-y-0">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <CardTitle className="flex min-w-0 items-center gap-2 text-lg sm:text-2xl">
            <FileKey className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
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
          className="min-w-0 gap-3"
        >
          <div className="min-w-0 space-y-2 md:hidden">
            <Select value={resolvedActive} onValueChange={onTabChange}>
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

          <div className="hidden min-w-0 md:block">
            <div className="min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:thin]">
              <TabsList
                variant="line"
                className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0"
              >
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className="inline-flex shrink-0 items-center gap-0.5"
                  >
                    <TabsTrigger
                      className={
                        resolvedActive === env.id
                          ? "shrink-0 rounded-none border-b-2 border-b-primary px-3 text-base text-primary"
                          : "shrink-0 rounded-none border-b-2 border-b-border px-3 text-base"
                      }
                      value={env.id}
                    >
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
            </div>
          </div>

          {environments.map((env) => (
            <TabsContent
              key={env.id}
              value={env.id}
              className="min-w-0 rounded-md border bg-input/10 p-3 sm:p-4"
            >
              {children(env)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
