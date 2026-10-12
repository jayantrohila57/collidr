"use client";

import { FileKey, Plus } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <FileKey className="h-6 w-6" />
          Environments
        </CardTitle>
        <CardAction>
          <CreateEnvironmentDialog
            onConfirm={onCreate}
            isPending={isCreating}
            triggerText="Add Environment"
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <div className="flex items-center justify-between">
            <TabsList variant={"line"}>
              {environments.map((env) => (
                <div key={env.id} className="inline-flex items-center gap-0.5">
                  <TabsTrigger
                    className={
                      activeTab === env.id
                        ? "rounded-none border-b-2 border-b-primary text-lg text-primary"
                        : "rounded-none border-b-2 border-b-border text-lg"
                    }
                    value={env.id}
                  >
                    {env.name}
                  </TabsTrigger>
                  <span className="flex items-center gap-0.5 pr-2">
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
          {environments.map((env) => (
            <TabsContent
              key={env.id}
              value={env.id}
              className="rounded-md border bg-input/10 p-4"
            >
              {children(env)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
