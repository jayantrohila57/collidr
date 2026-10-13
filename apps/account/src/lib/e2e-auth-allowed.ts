import "server-only";

/** True only for local / CI E2E — never on Vercel or Node production runtime. */
export function isE2eAuthRouteAllowed(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  return process.env.E2E_TEST_MODE === "1";
}
