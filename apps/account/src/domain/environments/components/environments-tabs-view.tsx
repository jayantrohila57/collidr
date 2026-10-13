"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { HorizontalScrollRail } from "@/components/patterns/horizontal-scroll-rail";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { iconMutedClassName } from "@/lib/icons";
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { useEnvironmentVariableCounts } from "../hooks/use-environment-variable-counts";
import { CreateEnvironmentSheet } from "./create-environment-sheet";
import { DeleteEnvironmentDialog } from "./delete-environment-dialog";
import { EditEnvironmentSheet } from "./edit-environment-sheet";
import { EnvironmentTabCountBadge } from "./environment-tab-count-badge";

interface Environment {
  id: string;
  name: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
  updatedBy?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
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
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
            <AppIcon name="environment" className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No environments yet</EmptyTitle>
          <EmptyDescription>
            Add development, staging, or production targets for this project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateEnvironmentSheet
            onConfirm={onCreate}
            isPending={isCreating}
            triggerText="Add environment"
          />
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
        <HorizontalScrollRail compactControls className="min-w-0">
          <div className="flex w-max min-w-full items-end gap-1 border-border border-b">
            <TabsList
              variant="underline"
              size="sm"
              className="h-9 min-h-9 w-fit shrink-0 justify-start gap-0 bg-transparent p-0"
            >
              {environments.map((env) => {
                const count = variableCounts[env.id];
                return (
                  <TabsTab
                    key={env.id}
                    value={env.id}
                    size="sm"
                    className="h-9 min-h-9 shrink-0 grow-0 gap-1.5 whitespace-nowrap rounded-none px-2.5 data-active:shadow-none"
                  >
                    <AppIcon
                      name="environment"
                      className={cn(iconMutedClassName, "size-4")}
                    />
                    <span className="max-w-[7.5rem] truncate sm:max-w-none">
                      {env.name}
                    </span>
                    <EnvironmentTabCountBadge count={count} />
                  </TabsTab>
                );
              })}
            </TabsList>
            {activeEnvironment ? (
              <Menu>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <MenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="size-8 shrink-0"
                            aria-label="Environment actions"
                          />
                        }
                      />
                    }
                  >
                    <AppIcon name="rowActions" className="text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Environment actions</TooltipContent>
                </Tooltip>
                <MenuPopup align="end">
                  <MenuItem onClick={() => setCreateOpen(true)}>
                    <AppIcon name="plus" className="me-2 text-foreground" />
                    Add environment
                  </MenuItem>
                  <MenuItem onClick={() => setEditOpen(true)}>
                    <AppIcon name="edit" className="me-2 text-foreground" />
                    Rename
                  </MenuItem>
                  <MenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <AppIcon name="delete" className="me-2 text-foreground" />
                    Delete
                  </MenuItem>
                </MenuPopup>
              </Menu>
            ) : null}
          </div>
        </HorizontalScrollRail>

        <div className="min-w-0">
          {environments.map((env) => (
            <div
              key={env.id}
              role="tabpanel"
              hidden={env.id !== resolvedActive}
              className="min-w-0"
            >
              {children(env)}
            </div>
          ))}
        </div>
      </Tabs>

      <CreateEnvironmentSheet
        onConfirm={onCreate}
        isPending={isCreating}
        triggerText="Add environment"
        open={createOpen}
        onOpenChange={setCreateOpen}
        hideTrigger
      />

      {activeEnvironment ? (
        <>
          <EditEnvironmentSheet
            open={editOpen}
            onOpenChange={setEditOpen}
            hideTrigger
            environment={activeEnvironment}
            onConfirm={onUpdate}
            isPending={isUpdating}
          />
          <DeleteEnvironmentDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            hideTrigger
            environmentName={activeEnvironment.name}
            onConfirm={() => onDelete(activeEnvironment.id)}
            isPending={isDeleting}
          />
        </>
      ) : null}
    </section>
  );
}
