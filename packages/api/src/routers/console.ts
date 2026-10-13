import { publicProcedure, router } from "../index";
import { platformRouter } from "./platform";

/** Router mounted at `apps/console` `/api/trpc` (Decision 16). */
export const consoleAppRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  platform: platformRouter,
});

export type ConsoleAppRouter = typeof consoleAppRouter;
