"use client";

import { useQueries } from "@tanstack/react-query";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { HorizontalScrollRail } from "@/components/patterns/horizontal-scroll-rail";
import { Badge } from "@/components/ui/badge";
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
import { layoutGapClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  useQueries({
    queries: environments
      .filter((env) => UUID_RE.test(env.id))
      .map((env) => ({
        ...trpc.environmentVariables.list.queryOptions({
          environmentId: env.id,
        }),
        staleTime: 5 * 60 * 1000,
      })),
  });

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
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <HorizontalScrollRail className="w-full min-w-0 sm:flex-1">
            <TabsList size="sm" className="h-auto w-max min-w-0 justify-start">
              {environments.map((env) => {
                const count = variableCounts[env.id];
                return (
                  <TabsTab
                    key={env.id}
                    value={env.id}
                    className="max-w-[10rem] gap-1.5 sm:max-w-none"
                  >
                    <span className="truncate">{env.name}</span>
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
            <div className="flex shrink-0 justify-end sm:justify-start">
              <Menu>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <MenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Environment actions"
                          />
                        }
                      />
                    }
                  >
                    <MoreVertical className="size-4" aria-hidden />
                  </TooltipTrigger>
                  <TooltipContent>Environment actions</TooltipContent>
                </Tooltip>
                <MenuPopup align="end">
                  <MenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="me-2 size-4" aria-hidden />
                    Rename
                  </MenuItem>
                  <MenuItem
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="me-2 size-4" aria-hidden />
                    Delete
                  </MenuItem>
                </MenuPopup>
              </Menu>
            </div>
          ) : null}
        </div>

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
