import { expect, test } from "@playwright/test";

const secret = process.env.E2E_TEST_SECRET ?? "local-e2e-secret";

const notificationsE2eEnabled =
  process.env.E2E_TEST_MODE === "1" &&
  (process.env.NOTIFICATIONS_ENABLED === "true" ||
    process.env.NOTIFICATIONS_ENABLED === undefined) &&
  (process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED === undefined);

test.describe("notifications — invitation flow", () => {
  test.skip(
    !notificationsE2eEnabled,
    "Requires E2E_TEST_MODE and notification flags (see playwright webServer env).",
  );

  test("invitee sees invitation; inviter sees acceptance", async ({
    browser,
    baseURL,
  }) => {
    const prepare = await fetch(`${baseURL}/api/e2e/notifications/prepare`, {
      method: "POST",
      headers: { "x-e2e-secret": secret },
    });
    expect(prepare.ok).toBeTruthy();
    const { invitationId } = (await prepare.json()) as {
      invitationId: string;
    };

    const inviteeContext = await browser.newContext();
    const inviteePage = await inviteeContext.newPage();
    const inviteeLogin = await inviteePage.request.post(
      `${baseURL}/api/e2e/login`,
      {
        headers: { "x-e2e-secret": secret },
        data: { persona: "invitee" },
      },
    );
    expect(inviteeLogin.ok()).toBeTruthy();

    await inviteePage.goto("/dashboard");
    await inviteePage.getByRole("button", { name: /Notifications/i }).click();
    await expect(
      inviteePage
        .getByText("Organization invitation", { exact: false })
        .first(),
    ).toBeVisible();
    await inviteeContext.close();

    const accept = await fetch(`${baseURL}/api/e2e/notifications/accept`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-e2e-secret": secret,
      },
      body: JSON.stringify({ invitationId }),
    });
    expect(accept.ok).toBeTruthy();

    const inviterContext = await browser.newContext();
    const inviterPage = await inviterContext.newPage();
    const inviterLogin = await inviterPage.request.post(
      `${baseURL}/api/e2e/login`,
      {
        headers: { "x-e2e-secret": secret },
        data: { persona: "primary" },
      },
    );
    expect(inviterLogin.ok()).toBeTruthy();

    await inviterPage.goto("/dashboard/notifications");
    await expect(
      inviterPage.getByText("Invitation accepted", { exact: false }).first(),
    ).toBeVisible();
    await inviterContext.close();
  });
});
