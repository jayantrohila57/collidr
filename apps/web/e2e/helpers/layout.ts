import { expect, type Page } from "@playwright/test";

export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

/** Rough CLS guard: main content height should not collapse after load. */
export async function assertStableMainHeight(page: Page) {
  const main = page.locator("#main-content");
  await expect(main).toBeVisible();
  const heightBefore = await main.evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  await page.waitForTimeout(400);
  const heightAfter = await main.evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  const delta = Math.abs(heightAfter - heightBefore);
  expect(delta).toBeLessThan(heightBefore * 0.35);
}

export function parseSessionCookies(raw: string, baseURL: string) {
  const url = new URL(baseURL);
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf("=");
      const name = eq === -1 ? pair : pair.slice(0, eq);
      const value = eq === -1 ? "" : pair.slice(eq + 1);
      return {
        name,
        value,
        domain: url.hostname,
        path: "/",
        httpOnly: true,
        secure: url.protocol === "https:",
        sameSite: "Lax" as const,
      };
    });
}
