import { expect, test } from "@playwright/test";

const hasAuth = Boolean(process.env.E2E_SESSION_COOKIE?.trim());

function trackBaseUiErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  return errors;
}

test.describe("menus (Base UI structure)", () => {
  test("account menu opens without Base UI errors", async ({ page }) => {
    test.skip(!hasAuth, "Set E2E_SESSION_COOKIE to run menu tests");
    const errors = trackBaseUiErrors(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "Open account menu" }).click();
    await expect(
      page.getByRole("menuitem", { name: /log out/i }),
    ).toBeVisible();

    expect(errors.some((e) => e.includes("Base UI"))).toBe(false);
  });

  test("org switcher menu opens without Base UI errors", async ({ page }) => {
    test.skip(!hasAuth, "Set E2E_SESSION_COOKIE to run menu tests");
    const errors = trackBaseUiErrors(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const orgTrigger = page.getByRole("button", {
      name: "Switch organization",
    });
    if ((await orgTrigger.count()) === 0) {
      test.skip();
    }

    await orgTrigger.click();
    await expect(page.getByRole("menu")).toBeVisible();

    expect(errors.some((e) => e.includes("Base UI"))).toBe(false);
  });

  test("project actions menu opens without Base UI errors", async ({
    page,
  }) => {
    test.skip(!hasAuth, "Set E2E_SESSION_COOKIE to run menu tests");
    const errors = trackBaseUiErrors(page);

    await page.goto("/dashboard/projects");
    await page.waitForLoadState("domcontentloaded");

    const actions = page.getByRole("button", { name: "Actions" }).first();
    if ((await actions.count()) === 0) {
      test.skip();
    }

    await actions.click();
    await expect(page.getByText("Project Actions")).toBeVisible();

    expect(errors.some((e) => e.includes("Base UI"))).toBe(false);
  });
});
