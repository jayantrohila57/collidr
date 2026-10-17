import type { LogAttributes, LogLevel, LogSink } from "./index";

/**
 * The slice of `@sentry/nextjs` the sink needs. Typed structurally so this
 * package carries no Sentry dependency; apps pass their own `Sentry` import.
 */
export type SentryLike = {
  logger: Record<
    LogLevel,
    (message: string, attributes?: Record<string, unknown>) => void
  >;
  captureException: (
    error: unknown,
    hint?: { extra?: Record<string, unknown> },
  ) => unknown;
  setUser: (user: { id: string } | null) => void;
  setTag: (key: string, value: string | undefined) => void;
};

/** Sentry Logs + issues + request identity (ids only), for `configureLogger`. */
export function createSentrySink(sentry: SentryLike): LogSink {
  return {
    log(level: LogLevel, message: string, attributes: LogAttributes) {
      sentry.logger[level](message, attributes);
    },
    captureException(error: unknown, attributes: LogAttributes) {
      sentry.captureException(error, { extra: attributes });
    },
    setIdentity({ userId, orgId }) {
      sentry.setUser(userId ? { id: userId } : null);
      sentry.setTag("org_id", orgId ?? undefined);
    },
  };
}
