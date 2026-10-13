import { auth } from "@env-manager/auth";
import { isOrganizationsEnabled } from "@env-manager/env/organizations";
import { env } from "@env-manager/env/server";
import { prepareE2eInvitationNotifications } from "@env-manager/notifications/e2e/prepare-invitation";
import { NextResponse } from "next/server";
import { isE2eAuthRouteAllowed } from "@/lib/e2e-auth-allowed";
import { isValidE2eSecret } from "@/lib/e2e-secret";
import { e2ePersonaCredentials } from "@/lib/e2e-users";

async function ensureE2eUsers() {
  for (const persona of ["primary", "invitee"] as const) {
    const credentials = e2ePersonaCredentials(persona);
    try {
      await auth.api.signUpEmail({ body: credentials });
    } catch {
      // already exists
    }
  }
}

export async function POST(request: Request) {
  if (!isE2eAuthRouteAllowed()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isValidE2eSecret(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (env.NOTIFICATIONS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "NOTIFICATIONS_ENABLED must be true" },
      { status: 412 },
    );
  }
  if (!isOrganizationsEnabled()) {
    return NextResponse.json(
      { error: "ORGANIZATIONS_ENABLED must be true" },
      { status: 412 },
    );
  }

  await ensureE2eUsers();
  const result = await prepareE2eInvitationNotifications();
  return NextResponse.json(result);
}
