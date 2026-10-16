import { sidebarRouter } from "./sidebar";
import { actionGuard } from "../actions/action-guard";
import { protectedProcedure, publicProcedure, router } from "../index";
import { accountRouter } from "./account";
import { auditEventsRouter } from "./audit-events";
import { fetchUserAccountStats } from "./dashboard";
import { permissionsRouter } from "./permissions";

/** Account app router — profile/sessions/export/delete + self-scoped audit timeline. */
export const accountAppRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  account: accountRouter,
  auditEvents: auditEventsRouter,
  dashboard: router({
    getUserAccountStats: protectedProcedure
      .use(actionGuard("profile.view"))
      .query(async ({ ctx }) => fetchUserAccountStats(ctx.session.user.id)),
  }),
  permissions: permissionsRouter,
  sidebar: sidebarRouter,
});

export type AccountAppRouter = typeof accountAppRouter;
