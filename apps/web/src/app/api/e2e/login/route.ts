import { auth } from "@env-manager/auth";
import { NextResponse } from "next/server";
import { isE2eAuthRouteAllowed } from "@/lib/e2e-auth-allowed";
import { isValidE2eSecret } from "@/lib/e2e-secret";
import { type E2ePersona, e2ePersonaCredentials } from "@/lib/e2e-users";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isE2eAuthRouteAllowed()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isValidE2eSecret(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let persona: E2ePersona = "primary";
  try {
    const body = (await request.json()) as { persona?: E2ePersona };
    if (body.persona === "invitee" || body.persona === "primary") {
      persona = body.persona;
    }
  } catch {
    // Empty body defaults to primary.
  }

  const credentials = e2ePersonaCredentials(persona);

  try {
    await auth.api.signUpEmail({
      body: credentials,
    });
  } catch {
    // User may already exist from a prior run.
  }

  const response = await auth.api.signInEmail({
    body: {
      email: credentials.email,
      password: credentials.password,
    },
    asResponse: true,
  });

  if (persona === "primary") {
    const { ensureE2eDemoProject } = await import("@env-manager/db");
    await ensureE2eDemoProject();
  }

  return response;
}
