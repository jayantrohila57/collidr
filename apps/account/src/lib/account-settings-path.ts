const ACCOUNT_SETTINGS_PATHS = new Set([
  "/settings",
  "/settings/profile",
  "/settings/security",
  "/settings/sessions",
  "/settings/accounts",
  "/settings/notifications",
  "/settings/danger",
  "/settings/export",
  "/settings/delete",
  "/settings/timeline",
]);

/** Whether the pathname is a recognized account settings route. */
export function isRecognizedAccountSettingsPath(pathname: string): boolean {
  if (ACCOUNT_SETTINGS_PATHS.has(pathname)) return true;
  return false;
}
