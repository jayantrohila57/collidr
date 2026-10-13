/** True when the request includes the configured E2E_TEST_SECRET (unset env fails closed). */
export function isValidE2eSecret(request: Request): boolean {
  const expected = process.env.E2E_TEST_SECRET;
  if (!expected) {
    return false;
  }
  const provided = request.headers.get("x-e2e-secret");
  return provided === expected;
}
