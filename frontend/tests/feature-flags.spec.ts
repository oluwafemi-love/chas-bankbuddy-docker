import { test, expect } from "@playwright/test";

test.describe("Savings spotlight feature flag", () => {
  test("shows the panel when the feature is enabled", async ({
    page,
  }) => {
    await page.route("**/feature-flags", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ newDashboard: true }),
      });
    });

    await page.goto("/account");

    await expect(
      page.getByRole("heading", { name: "Savings spotlight" }),
    ).toBeVisible();
  });

  test("hides the panel when the feature is disabled", async ({
    page,
  }) => {
    await page.route("**/feature-flags", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ newDashboard: false }),
      });
    });

    await page.goto("/account");

    await expect(
      page.getByRole("heading", { name: "Savings spotlight" }),
    ).toHaveCount(0);
  });

  test("keeps the panel hidden when the feature flag request fails", async ({
    page,
  }) => {
    await page.route("**/feature-flags", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/account");

    await expect(
      page.getByRole("heading", { name: "Savings spotlight" }),
    ).toHaveCount(0);
  });
});
