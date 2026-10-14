import "server-only";

/**
 * True only for local / CI E2E (`E2E_TEST_MODE=1`).
 * Allowed for `next start` locally; blocked on Vercel production.
 */
export function isE2eAuthRouteAllowed(): boolean {
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  return process.env.E2E_TEST_MODE === "1";
}
