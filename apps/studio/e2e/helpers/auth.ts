export function hasE2eAuth(): boolean {
  return (
    Boolean(process.env.E2E_SESSION_COOKIE?.trim()) ||
    process.env.E2E_TEST_MODE === "1"
  );
}
