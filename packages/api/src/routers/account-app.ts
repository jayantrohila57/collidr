import { publicProcedure, router } from "../index";
import { accountRouter } from "./account";
import { auditEventsRouter } from "./audit-events";

/** Account app router — profile/sessions/export/delete + self-scoped audit timeline. */
export const accountAppRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  account: accountRouter,
  auditEvents: auditEventsRouter,
});

export type AccountAppRouter = typeof accountAppRouter;
