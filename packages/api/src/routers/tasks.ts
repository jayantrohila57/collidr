import { activeMemberWhere, db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { member } from "@loftlancer/db/schema/organization";
import { task, taskComment } from "@loftlancer/db/schema/project-app";
import { project } from "@loftlancer/db/schema/projects";
import { notify } from "@loftlancer/notifications/notify";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, ilike, isNull, type SQL, sql } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { projectIdFromInput } from "../actions/guard-resolve";
import type { RequireActionContext } from "../actions/require-action";
import { orgProcedure, router } from "../index";

export const TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "done",
  "canceled",
] as const;
export const TASK_PRIORITIES = [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
] as const;

async function projectIdForTask(
  input: unknown,
): Promise<Partial<RequireActionContext>> {
  const id = (input as { taskId?: string })?.taskId;
  if (!id) return {};
  const [row] = await db
    .select({ projectId: task.projectId })
    .from(task)
    .where(eq(task.id, id))
    .limit(1);
  return { projectId: row?.projectId ?? null };
}

async function loadTask(taskId: string) {
  const [row] = await db
    .select()
    .from(task)
    .where(and(eq(task.id, taskId), isNull(task.deletedAt)))
    .limit(1);
  if (!row)
    throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
  return row;
}

async function projectInfo(projectId: string) {
  const [p] = await db
    .select({
      slug: project.slug,
      name: project.name,
      organizationId: project.organizationId,
    })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);
  return p;
}

async function notifyTask(
  type: "task.assigned" | "task.mentioned",
  recipients: string[],
  t: { id: string; number: number; title: string; projectId: string },
  actor: { id: string; name: string | null },
  key: string,
) {
  const ids = [...new Set(recipients)].filter((r) => r !== actor.id);
  if (ids.length === 0) return;
  const p = await projectInfo(t.projectId);
  if (!p) return;
  await notify({
    type,
    recipients: ids.map((userId) => ({ userId })),
    actorUserId: actor.id,
    actorName: actor.name,
    organizationId: p.organizationId,
    entity: { type: "task", id: t.id },
    data: {
      projectSlug: p.slug,
      projectName: p.name,
      taskId: t.id,
      taskNumber: t.number,
      title: t.title,
    },
    idempotencyKey: key,
  }).catch((e) => console.error("task notify failed", e));
}

const listInput = z.object({
  projectId: z.string().min(1),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: z.string().optional(),
  search: z.string().max(200).optional(),
  limit: z.number().int().min(1).max(500).default(100),
  offset: z.number().int().min(0).default(0),
});

const taskFields = {
  title: z.string().trim().min(1).max(200),
  description: z.string().max(20_000).nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  labels: z.array(z.string().trim().min(1).max(32)).max(10).optional(),
};

export const tasksRouter = router({
  list: orgProcedure
    .input(listInput)
    .use(actionGuard("tasks.task.read", projectIdFromInput))
    .query(async ({ input }) => {
      const conds: SQL[] = [
        eq(task.projectId, input.projectId),
        isNull(task.deletedAt),
      ];
      if (input.status) conds.push(eq(task.status, input.status));
      if (input.priority) conds.push(eq(task.priority, input.priority));
      if (input.assigneeId === "none") conds.push(isNull(task.assigneeId));
      else if (input.assigneeId)
        conds.push(eq(task.assigneeId, input.assigneeId));
      if (input.search?.trim())
        conds.push(ilike(task.title, `%${input.search.trim()}%`));
      const where = and(...conds);
      const [rows, total] = await Promise.all([
        db
          .select({
            id: task.id,
            number: task.number,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId,
            assigneeName: user.name,
            assigneeImage: user.image,
            dueDate: task.dueDate,
            labels: task.labels,
            updatedAt: task.updatedAt,
          })
          .from(task)
          .leftJoin(user, eq(user.id, task.assigneeId))
          .where(where)
          .orderBy(desc(task.number))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ n: sql<number>`count(*)::int` })
          .from(task)
          .where(where)
          .then((r) => r[0]?.n ?? 0),
      ]);
      return { rows, total };
    }),

  /** Org members who can be assigned / mentioned. */
  people: orgProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .use(actionGuard("tasks.task.read", projectIdFromInput))
    .query(async ({ input }) => {
      const p = await projectInfo(input.projectId);
      if (!p?.organizationId) return [];
      return db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(activeMemberWhere(eq(member.organizationId, p.organizationId)))
        .orderBy(asc(user.name))
        .limit(1000);
    }),

  get: orgProcedure
    .input(z.object({ projectId: z.string().min(1), number: z.number().int() }))
    .use(actionGuard("tasks.task.read", projectIdFromInput))
    .query(async ({ input }) => {
      const [row] = await db
        .select()
        .from(task)
        .where(
          and(
            eq(task.projectId, input.projectId),
            eq(task.number, input.number),
            isNull(task.deletedAt),
          ),
        )
        .limit(1);
      if (!row) return null;
      const comments = await db
        .select({
          id: taskComment.id,
          body: taskComment.body,
          createdAt: taskComment.createdAt,
          authorId: taskComment.authorId,
          authorName: user.name,
          authorImage: user.image,
        })
        .from(taskComment)
        .leftJoin(user, eq(user.id, taskComment.authorId))
        .where(
          and(eq(taskComment.taskId, row.id), isNull(taskComment.deletedAt)),
        )
        .orderBy(asc(taskComment.createdAt));
      return { task: row, comments };
    }),

  create: orgProcedure
    .input(z.object({ projectId: z.string().min(1), ...taskFields }))
    .use(actionGuard("tasks.task.create", projectIdFromInput))
    .mutation(async ({ ctx, input }) => {
      const p = await projectInfo(input.projectId);
      if (!p)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      const id = crypto.randomUUID();
      // Per-project numbering; retry once on a concurrent unique clash.
      let created: typeof task.$inferSelect | undefined;
      for (let attempt = 0; attempt < 3 && !created; attempt++) {
        try {
          [created] = await db
            .insert(task)
            .values({
              id,
              organizationId: p.organizationId,
              projectId: input.projectId,
              number: sql`(select coalesce(max(number), 0) + 1 from task where project_id = ${input.projectId})`,
              title: input.title,
              description: input.description ?? null,
              status: input.status ?? "todo",
              priority: input.priority ?? "none",
              assigneeId: input.assigneeId ?? null,
              reporterId: ctx.session.user.id,
              dueDate: input.dueDate ?? null,
              labels: input.labels ?? [],
            })
            .returning();
        } catch (e) {
          if (
            (e as { code?: string; cause?: { code?: string } })?.code !==
              "23505" &&
            (e as { cause?: { code?: string } })?.cause?.code !== "23505"
          )
            throw e;
        }
      }
      if (!created)
        throw new TRPCError({ code: "CONFLICT", message: "Try again" });
      if (created.assigneeId) {
        await notifyTask(
          "task.assigned",
          [created.assigneeId],
          created,
          ctx.session.user,
          `task.assigned:${created.id}:${created.assigneeId}`,
        );
      }
      return created;
    }),

  update: orgProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
        ...taskFields,
        title: taskFields.title.optional(),
      }),
    )
    .use(actionGuard("tasks.task.update", projectIdForTask))
    .mutation(async ({ ctx, input }) => {
      const before = await loadTask(input.taskId);
      const { taskId, ...patch } = input;
      const [updated] = await db
        .update(task)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(task.id, taskId))
        .returning();
      if (updated?.assigneeId && updated.assigneeId !== before.assigneeId) {
        await notifyTask(
          "task.assigned",
          [updated.assigneeId],
          updated,
          ctx.session.user,
          `task.assigned:${updated.id}:${updated.assigneeId}:${Date.now()}`,
        );
      }
      return updated;
    }),

  delete: orgProcedure
    .input(z.object({ taskId: z.string().min(1) }))
    .use(actionGuard("tasks.task.delete", projectIdForTask))
    .mutation(async ({ input }) => {
      await loadTask(input.taskId);
      await db
        .update(task)
        .set({ deletedAt: new Date() })
        .where(eq(task.id, input.taskId));
      return { ok: true as const };
    }),

  comment: orgProcedure
    .input(
      z.object({
        taskId: z.string().min(1),
        body: z.string().trim().min(1).max(10_000),
        mentionUserIds: z.array(z.string()).max(20).default([]),
      }),
    )
    .use(actionGuard("tasks.comment.create", projectIdForTask))
    .mutation(async ({ ctx, input }) => {
      const t = await loadTask(input.taskId);
      const [c] = await db
        .insert(taskComment)
        .values({
          id: crypto.randomUUID(),
          taskId: t.id,
          authorId: ctx.session.user.id,
          body: input.body,
        })
        .returning();
      await db
        .update(task)
        .set({ updatedAt: new Date() })
        .where(eq(task.id, t.id));
      if (c && input.mentionUserIds.length) {
        await notifyTask(
          "task.mentioned",
          input.mentionUserIds,
          t,
          ctx.session.user,
          `task.mentioned:${c.id}`,
        );
      }
      return c;
    }),
});
