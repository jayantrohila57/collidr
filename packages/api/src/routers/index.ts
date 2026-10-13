import { publicProcedure, router } from "../index";
import { accountRouter } from "./account";
import { auditLogsRouter } from "./audit";
import { auditEventsRouter } from "./audit-events";
import { dashboardRouter } from "./dashboard";
import { environmentsRouter } from "./environments";
import { notificationsRouter } from "./notifications";
import { organizationsRouter } from "./organizations";
import { permissionsRouter } from "./permissions";
import { projectAccessRouter } from "./project-access-router";
import { projectsRouter } from "./projects";
import { teamsRouter } from "./teams";
import { environmentVariablesRouter } from "./variables";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  dashboard: dashboardRouter,
  projects: projectsRouter,
  environments: environmentsRouter,
  environmentVariables: environmentVariablesRouter,
  auditLogs: auditLogsRouter,
  auditEvents: auditEventsRouter,
  notifications: notificationsRouter,
  permissions: permissionsRouter,
  account: accountRouter,
  organizations: organizationsRouter,
  projectAccess: projectAccessRouter,
  teams: teamsRouter,
});
export type AppRouter = typeof appRouter;
