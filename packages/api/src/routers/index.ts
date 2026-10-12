import { protectedProcedure, publicProcedure, router } from "../index";
import { auditLogsRouter } from "./audit";
import { dashboardRouter } from "./dashboard";
import { environmentsRouter } from "./environments";
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
});
export type AppRouter = typeof appRouter;
