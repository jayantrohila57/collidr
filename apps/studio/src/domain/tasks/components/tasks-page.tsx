"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjectApps } from "@/domain/apps/hooks/use-project-apps";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { ListTodo, Plus } from "@/lib/icons";
import { initialsFromLabel } from "@/lib/initials";
import { trpc } from "@/utils/trpc";
import {
  priorityBadgeVariant,
  priorityLabel,
  statusBadgeVariant,
  statusLabel,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  type TaskPriority,
  type TaskStatus,
} from "../hooks/task-meta";
import { CreateTaskSheet } from "./create-task-sheet";
import { FieldSelect } from "./field-select";
import { TaskDetailSheet } from "./task-detail-sheet";

const PAGE_SIZE = 50;
const ROW_SKELETONS = Array.from({ length: 8 }, (_, i) => i);

export function TasksPageSkeleton() {
  return (
    <DashboardSection title="Tasks" description="Track work for this project.">
      <div className="flex flex-col gap-3" role="status" aria-busy="true">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </DashboardSection>
  );
}

export function TasksPage({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { projectId, project, apps } = useProjectApps(slug);
  const taskSettings = apps.find((a) => a.id === "tasks")?.settings;
  const createDefaults = useMemo(
    () =>
      taskSettings
        ? {
            status: taskSettings.defaultStatus as TaskStatus,
            priority: taskSettings.defaultPriority as TaskPriority,
          }
        : undefined,
    [taskSettings],
  );
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const canCreate = useCan("tasks.task.create", {
    projectId: projectId ?? undefined,
  });

  const openNumber = Number(searchParams.get("task") ?? "") || null;
  const setOpenNumber = (n: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (n) params.set("task", String(n));
    else params.delete("task");
    const q = params.toString();
    router.replace(`${pathname}${q ? `?${q}` : ""}` as Route, {
      scroll: false,
    });
  };

  const people = useQuery({
    ...trpc.tasks.people.queryOptions({ projectId: projectId ?? "" }),
    enabled: Boolean(projectId),
  });
  const list = useQuery({
    ...trpc.tasks.list.queryOptions({
      projectId: projectId ?? "",
      status: status === "all" ? undefined : (status as TaskStatus),
      priority: priority === "all" ? undefined : (priority as TaskPriority),
      assigneeId: assignee === "all" ? undefined : assignee,
      search: deferredSearch || undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    enabled: Boolean(projectId),
    placeholderData: (prev) => prev,
  });

  const rows = list.data?.rows ?? [];
  const total = list.data?.total ?? 0;
  const filtered =
    status !== "all" ||
    priority !== "all" ||
    assignee !== "all" ||
    Boolean(deferredSearch);
  const peopleOptions = (people.data ?? []).map((p) => ({
    value: p.id,
    label: p.name || p.email,
    hint: p.name ? p.email : undefined,
  }));
  const resetPage =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v);
      setPage(0);
    };

  return (
    <DashboardSection
      title="Tasks"
      description={
        project
          ? `Track work for ${project.name}.`
          : "Track work for this project."
      }
      back={`/p/${slug}` as Route}
      action={
        canCreate.allowed ? (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden />
            New task
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Input
            size="sm"
            className="w-56"
            placeholder="Search tasks…"
            aria-label="Search tasks"
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
          />
          <FieldSelect
            ariaLabel="Filter by status"
            value={status}
            onChange={resetPage(setStatus)}
            options={[
              { value: "all", label: "All statuses" },
              ...TASK_STATUS_OPTIONS,
            ]}
          />
          <FieldSelect
            ariaLabel="Filter by priority"
            value={priority}
            onChange={resetPage(setPriority)}
            options={[
              { value: "all", label: "All priorities" },
              ...TASK_PRIORITY_OPTIONS,
            ]}
          />
          <FieldSelect
            ariaLabel="Filter by assignee"
            className="w-44"
            value={assignee}
            onChange={resetPage(setAssignee)}
            options={[
              { value: "all", label: "Anyone" },
              { value: "none", label: "Unassigned" },
              ...peopleOptions,
            ]}
          />
          <span className="ms-auto text-muted-foreground text-xs tabular-nums">
            {list.data
              ? `${total} ${total === 1 ? "task" : "tasks"}`
              : "\u00a0"}
          </span>
        </div>

        {list.isError ? (
          <ErrorState
            title="Tasks unavailable"
            description="We couldn't load tasks."
            onRetry={() => list.refetch()}
          />
        ) : !list.isPending && rows.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title={filtered ? "No matching tasks" : "No tasks yet"}
            description={
              filtered
                ? "Try different filters."
                : "Create the first task for this project."
            }
            actionLabel={
              !filtered && canCreate.allowed ? "New task" : undefined
            }
            onAction={
              !filtered && canCreate.allowed
                ? () => setCreateOpen(true)
                : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl ring-1 ring-border/60">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-xs">ID</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="w-32 text-xs">Status</TableHead>
                  <TableHead className="w-28 text-xs">Priority</TableHead>
                  <TableHead className="w-44 text-xs">Assignee</TableHead>
                  <TableHead className="w-28 text-xs">Due</TableHead>
                  <TableHead className="w-28 text-xs">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isPending
                  ? ROW_SKELETONS.map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : rows.map((t) => (
                      <TableRow
                        key={t.id}
                        className="cursor-pointer"
                        tabIndex={0}
                        onClick={() => setOpenNumber(t.number)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setOpenNumber(t.number);
                        }}
                      >
                        <TableCell className="text-muted-foreground text-xs tabular-nums">
                          #{t.number}
                        </TableCell>
                        <TableCell className="max-w-0">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <Link
                              href={
                                `/p/${slug}/tasks?task=${t.number}` as Route
                              }
                              className="truncate hover:underline"
                              onClick={(e) => {
                                // Plain click opens the sheet in place; modifier
                                // clicks fall through to the browser (new tab).
                                if (e.metaKey || e.ctrlKey || e.shiftKey) {
                                  e.stopPropagation();
                                  return;
                                }
                                e.preventDefault();
                              }}
                            >
                              {t.title}
                            </Link>
                            {t.labels.slice(0, 2).map((l) => (
                              <Badge
                                key={l}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                              >
                                {l}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusBadgeVariant(t.status)}
                            size="sm"
                          >
                            {statusLabel(t.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {t.priority === "none" ? (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          ) : (
                            <Badge
                              variant={priorityBadgeVariant(t.priority)}
                              size="sm"
                            >
                              {priorityLabel(t.priority)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {t.assigneeId ? (
                            <div className="flex min-w-0 items-center gap-1.5">
                              <Avatar className="size-5">
                                {t.assigneeImage ? (
                                  <AvatarImage src={t.assigneeImage} alt="" />
                                ) : null}
                                <AvatarFallback className="text-[9px]">
                                  {initialsFromLabel(
                                    t.assigneeName ?? "?",
                                    "?",
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-xs">
                                {t.assigneeName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs tabular-nums">
                          {t.dueDate
                            ? new Date(t.dueDate).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          <ClientRelativeTime value={t.updatedAt} />
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        )}

        {total > PAGE_SIZE ? (
          <div className="flex items-center justify-end gap-1.5 text-xs">
            <span className="text-muted-foreground tabular-nums">
              {page * PAGE_SIZE + 1}–{Math.min(total, (page + 1) * PAGE_SIZE)}{" "}
              of {total}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={(page + 1) * PAGE_SIZE >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>

      {projectId ? (
        <>
          <CreateTaskSheet
            open={createOpen}
            onOpenChange={setCreateOpen}
            projectId={projectId}
            people={peopleOptions}
            onCreated={(n) => setOpenNumber(n)}
            defaults={createDefaults}
          />
          <TaskDetailSheet
            projectId={projectId}
            number={openNumber}
            people={people.data ?? []}
            onClose={() => setOpenNumber(null)}
          />
        </>
      ) : null}
    </DashboardSection>
  );
}
