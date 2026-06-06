import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/kohvisordid",
  "/kohvisordid/1",
  "/kontakt",
  "/tellimus",
  "/kkk",
  "/tarne",
  "/tagastus",
  "/kohvik",
  "/admin/login",
];

test("public pages fit the viewport and expose their primary heading", async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

test("navigation, theme and database content remain interactive", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByText("Vabu kohti: 8 / 20")).toBeVisible();

  if (testInfo.project.name === "mobile") {
    const menu = page.locator(".nav-toggle");
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Peamenüü" })).toBeVisible();
  }

  await page.getByRole("button", { name: "Vaheta tume ja hele teema" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.goto("/kohvisordid?rostitase=Hele");
  await expect(page.getByRole("heading", { name: "Aeglane Hommik" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Öine Valss" })).toHaveCount(0);
});

test("key pages meet WCAG 2.2 AA checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/kohvisordid", "/kontakt", "/tellimus", "/admin/login"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, `${route}: ${JSON.stringify(results.violations)}`).toEqual([]);
  }
});
