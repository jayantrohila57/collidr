import { auth } from "@env-manager/auth";
import { ensureE2eDemoProject } from "@env-manager/db";
import { NextResponse } from "next/server";

const E2E_EMAIL = "e2e-playwright@env-manager.local";
const E2E_PASSWORD = "e2e-local-only-not-for-production";
const E2E_NAME = "Playwright E2E";

function isE2eLoginEnabled() {
  return process.env.E2E_TEST_MODE === "1";
}

function assertE2eSecret(request: Request) {
  const expected = process.env.E2E_TEST_SECRET ?? "local-e2e-secret";
  const provided = request.headers.get("x-e2e-secret");
  return provided === expected;
}

export async function POST(request: Request) {
  if (!isE2eLoginEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!assertE2eSecret(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email: E2E_EMAIL,
        password: E2E_PASSWORD,
        name: E2E_NAME,
      },
    });
  } catch {
    // User may already exist from a prior run.
  }

  const response = await auth.api.signInEmail({
    body: {
      email: E2E_EMAIL,
      password: E2E_PASSWORD,
    },
    asResponse: true,
  });

  await ensureE2eDemoProject();

  return response;
}
