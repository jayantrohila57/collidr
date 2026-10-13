const SSL_MODE_ALIASES_FOR_VERIFY_FULL = new Set([
  "prefer",
  "require",
  "verify-ca",
]);

/**
 * pg v8 warns when sslmode is prefer/require/verify-ca (treated as verify-full).
 * Normalize the URL so logs stay quiet while behavior stays verify-full.
 */
export function normalizeDatabaseSslModeInUrl(
  connectionString: string,
): string {
  const trimmed = connectionString.trim();
  if (!trimmed) {
    return connectionString;
  }

  try {
    const url = new URL(trimmed);
    const sslmode = url.searchParams.get("sslmode");
    if (
      sslmode &&
      SSL_MODE_ALIASES_FOR_VERIFY_FULL.has(sslmode.toLowerCase())
    ) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
    return trimmed;
  } catch {
    return connectionString;
  }
}

function finalizeConnectionString(connectionString: string): string {
  return normalizeDatabaseSslModeInUrl(connectionString);
}

/**
 * Prefer Neon pooler in serverless production to avoid cold direct connections.
 * Override with DATABASE_URL_POOLED when set in Vercel/Neon integration.
 */
export function resolveDatabaseConnectionString(raw: string): string {
  const explicit = process.env.DATABASE_URL_POOLED?.trim();
  if (explicit) {
    return finalizeConnectionString(explicit);
  }

  if (process.env.NODE_ENV !== "production") {
    return finalizeConnectionString(raw);
  }

  try {
    const url = new URL(raw);
    if (!url.hostname.includes(".neon.tech")) {
      return finalizeConnectionString(raw);
    }
    if (url.hostname.includes("-pooler")) {
      return finalizeConnectionString(raw);
    }
    const segments = url.hostname.split(".");
    const endpoint = segments[0];
    if (endpoint.startsWith("ep-") && !endpoint.endsWith("-pooler")) {
      segments[0] = `${endpoint}-pooler`;
      url.hostname = segments.join(".");
      return finalizeConnectionString(url.toString());
    }
  } catch {
    return finalizeConnectionString(raw);
  }

  return finalizeConnectionString(raw);
}
