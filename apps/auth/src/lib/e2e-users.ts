export const E2E_PRIMARY_EMAIL = "e2e-playwright@loftlancer.local";
export const E2E_INVITEE_EMAIL = "e2e-playwright-invitee@loftlancer.local";
export const E2E_PRIMARY_NAME = "Playwright E2E";
export const E2E_INVITEE_NAME = "Playwright E2E Invitee";
export const E2E_NOTIFICATIONS_ORG_SLUG = "e2e-notifications-org";

export type E2ePersona = "primary" | "invitee";

export function e2ePersonaCredentials(persona: E2ePersona) {
  if (persona === "invitee") {
    return {
      email: E2E_INVITEE_EMAIL,
      name: E2E_INVITEE_NAME,
    };
  }
  return {
    email: E2E_PRIMARY_EMAIL,
    name: E2E_PRIMARY_NAME,
  };
}
