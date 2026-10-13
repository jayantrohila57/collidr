import { publicProcedure, router } from "../index";
import { auditLogsRouter } from "./audit";
import { auditEventsRouter } from "./audit-events";
import { dashboardRouter } from "./dashboard";
import { environmentsRouter } from "./environments";
import { notificationsRouter } from "./notifications";
import { organizationsRouter } from "./organizations";
import { permissionsRouter } from "./permissions";
import { projectAccessRouter } from "./project-access-router";
import { projectsRouter } from "./projects";
import { environmentVariablesRouter } from "./variables";

/** Product router for `apps/studio` — org/project/env surface without account settings. */
export const studioRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  dashboard: dashboardRouter,
  projects: projectsRouter,
  environments: environmentsRouter,
  environmentVariables: environmentVariablesRouter,
  auditLogs: auditLogsRouter,
  auditEvents: auditEventsRouter,
  notifications: notificationsRouter,
  permissions: permissionsRouter,
  organizations: organizationsRouter,
  projectAccess: projectAccessRouter,
});

export type StudioRouter = typeof studioRouter;
