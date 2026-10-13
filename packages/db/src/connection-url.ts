/**
 * Prefer Neon pooler in serverless production to avoid cold direct connections.
 * Override with DATABASE_URL_POOLED when set in Vercel/Neon integration.
 */
export function resolveDatabaseConnectionString(raw: string): string {
  const explicit = process.env.DATABASE_URL_POOLED?.trim();
  if (explicit) {
    return explicit;
  }

  if (process.env.NODE_ENV !== "production") {
    return raw;
  }

  try {
    const url = new URL(raw);
    if (!url.hostname.includes(".neon.tech")) {
      return raw;
    }
    if (url.hostname.includes("-pooler")) {
      return raw;
    }
    const segments = url.hostname.split(".");
    const endpoint = segments[0];
    if (endpoint.startsWith("ep-") && !endpoint.endsWith("-pooler")) {
      segments[0] = `${endpoint}-pooler`;
      url.hostname = segments.join(".");
      return url.toString();
    }
  } catch {
    return raw;
  }

  return raw;
}
