"use client";

import { Edit, FileKey, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  isCreating: boolean;
  isUpdating: boolean;
  children: (env: Environment) => React.ReactNode;
}

export function EnvironmentsTabsView({
  environments,
  activeTab,
  onTabChange,
  onCreate,
  onUpdate,
  isCreating,
  isUpdating,
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
                <TabsTrigger
                  className={
                    activeTab === env.id
                      ? "group relative rounded-none border-b-2 border-b-primary text-lg text-primary"
                      : "group relative rounded-none border-b-2 border-b-border text-lg"
                  }
                  key={env.id}
                  value={env.id}
                >
                  <span className="pr-6">{env.name}</span>
                  <EditEnvironmentDialog
                    environment={env}
                    onConfirm={onUpdate}
                    isPending={isUpdating}
                    trigger={
                      <div className="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    }
                  />
                </TabsTrigger>
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
