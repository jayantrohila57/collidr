/** Read Sentry DSN at runtime (server may only have NEXT_PUBLIC_SENTRY_DSN on Vercel). */
export function resolveSentryDsn(): string | undefined {
  const env = process.env as Record<string, string | undefined>;
  const dsn =
    env.NEXT_PUBLIC_SENTRY_DSN?.trim() || env.SENTRY_DSN?.trim() || "";
  return dsn.length > 0 ? dsn : undefined;
}

export function resolveSentryEnvironment(forBrowser: boolean): string {
  const env = process.env as Record<string, string | undefined>;
  if (forBrowser) {
    return env.NEXT_PUBLIC_VERCEL_ENV ?? env.NODE_ENV ?? "development";
  }
  return env.VERCEL_ENV ?? env.NODE_ENV ?? "development";
}

export function resolveSentryRelease(): string {
  return `loftlancer@${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"}`;
}
