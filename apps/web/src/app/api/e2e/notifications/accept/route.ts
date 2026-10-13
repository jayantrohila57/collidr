import { auth } from "@env-manager/auth";
import { env } from "@env-manager/env/server";
import { NextResponse } from "next/server";
import { isE2eAuthRouteAllowed } from "@/lib/e2e-auth-allowed";
import { e2ePersonaCredentials } from "@/lib/e2e-users";

function assertE2eSecret(request: Request) {
  const expected = process.env.E2E_TEST_SECRET ?? "local-e2e-secret";
  const provided = request.headers.get("x-e2e-secret");
  return provided === expected;
}

export async function POST(request: Request) {
  if (!isE2eAuthRouteAllowed()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!assertE2eSecret(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (env.NOTIFICATIONS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "NOTIFICATIONS_ENABLED must be true" },
      { status: 412 },
    );
  }

  const body = (await request.json()) as { invitationId?: string };
  if (!body.invitationId?.trim()) {
    return NextResponse.json(
      { error: "invitationId required" },
      { status: 400 },
    );
  }

  const invitee = e2ePersonaCredentials("invitee");
  const signIn = await auth.api.signInEmail({
    body: { email: invitee.email, password: invitee.password },
    asResponse: true,
  });

  if (!signIn.ok) {
    return NextResponse.json(
      { error: "Invitee sign-in failed" },
      { status: 500 },
    );
  }

  const cookie = signIn.headers.get("set-cookie");
  const baseUrl = env.BETTER_AUTH_URL.replace(/\/$/, "");
  const accept = await fetch(
    `${baseUrl}/api/auth/organization/accept-invitation`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ invitationId: body.invitationId }),
    },
  );

  if (!accept.ok) {
    const text = await accept.text();
    return NextResponse.json(
      { error: "Accept failed", detail: text },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
