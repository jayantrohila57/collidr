export function isOrganizationsEnabledOnClient(): boolean {
  return process.env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED === "true";
}
