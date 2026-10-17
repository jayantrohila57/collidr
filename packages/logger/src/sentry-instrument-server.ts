import { configureLogger } from "./index";
import { resolveSentryRelease } from "./sentry-env";
import type {
  LoftlancerApp,
  SentryInitExtras,
  SentryInitLike,
} from "./sentry-instrument";
import { buildSentryInitOptions, wireSentryLogger } from "./sentry-instrument";
import { coalescedServerLogFlush } from "./sentry-server-flush";

/** Node server runtime: init Sentry, coalesced log flush, and logger sink. */
export async function initAndWireSentryServer(
  sentry: SentryInitLike,
  app: LoftlancerApp,
  extras?: SentryInitExtras,
): Promise<void> {
  const options = buildSentryInitOptions(app, false, extras);
  if (!options.dsn) return;
  const release = resolveSentryRelease();
  configureLogger({ context: { app, release } });
  sentry.init(options);
  wireSentryLogger(sentry, app, {
    runtime: "server",
    onAfterLog: () => coalescedServerLogFlush(sentry),
  });
}
