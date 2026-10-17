import { auth } from "@loftlancer/auth";
import { e2ePasswordlessSignIn } from "@loftlancer/auth/passwordless";
import { NextResponse } from "next/server";
import { isE2eAuthRouteAllowed } from "@/lib/e2e-auth-allowed";
import { isValidE2eSecret } from "@/lib/e2e-secret";
import { type E2ePersona, e2ePersonaCredentials } from "@/lib/e2e-users";

function sessionCookieHeader(setCookies: string[]): Headers {
  const headers = new Headers();
  const pairs = setCookies
    .map((line) => line.split(";")[0]?.trim())
    .filter((pair): pair is string => Boolean(pair));
  if (pairs.length > 0) {
    headers.set("cookie", pairs.join("; "));
  }
  return headers;
}

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
    const { ensureE2eDemoProject } = await import("@loftlancer/db");
    const demo = await ensureE2eDemoProject();
    if (demo) {
      const next = new Response(response.body, response);
      next.headers.set("X-E2E-Demo-Org", demo.organizationSlug);
      next.headers.set("X-E2E-Demo-Project", demo.projectSlug);

      const signInCookies = response.headers.getSetCookie();
      const active = await auth.api
        .setActiveOrganization({
          headers: sessionCookieHeader(signInCookies),
          body: { organizationSlug: demo.organizationSlug },
          asResponse: true,
        })
        .catch(() => null);
      if (active?.ok) {
        for (const cookie of active.headers.getSetCookie()) {
          next.headers.append("set-cookie", cookie);
        }
      }

      return next;
    }
  }

  return response;
}
