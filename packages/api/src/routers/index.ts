import { protectedProcedure, publicProcedure, router } from "../index";
import { accountRouter } from "./account";
import { auditLogsRouter } from "./audit";
import { auditEventsRouter } from "./audit-events";
import { dashboardRouter } from "./dashboard";
import { environmentsRouter } from "./environments";
import { notificationsRouter } from "./notifications";
import { organizationsRouter } from "./organizations";
import { permissionsRouter } from "./permissions";
import { projectsRouter } from "./projects";
import { environmentVariablesRouter } from "./variables";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
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
});
export type AppRouter = typeof appRouter;
