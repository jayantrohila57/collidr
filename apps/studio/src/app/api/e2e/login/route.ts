import { auth } from "@loftlancer/auth";
import { e2ePasswordlessSignIn } from "@loftlancer/auth/passwordless";
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

  // Passwordless (#373): a captured magic link creates or signs in the user.
  const response = await e2ePasswordlessSignIn(auth, {
    email: credentials.email,
    name: credentials.name,
  });

  if (persona === "primary") {
    const { ensureE2eDemoProject, ensureE2ePrimaryOrganization } = await import(
      "@loftlancer/db"
    );
    await ensureE2eDemoProject();
    await ensureE2ePrimaryOrganization();
  }

  return response;
}
