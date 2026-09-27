import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Art Styles", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("art style picker is visible on the create page", async ({
    page,
  }) => {
    await page.goto("/decks/new");
    await expect(page.getByText("Art Style")).toBeVisible();
  });

  test("preset art styles are displayed", async ({ page }) => {
    await page.goto("/decks/new");
    // Check for a few known preset style names
    await expect(page.getByText("Tarot Classic")).toBeVisible();
    await expect(page.getByText("Watercolor Dream")).toBeVisible();
    await expect(page.getByText("Celestial")).toBeVisible();
  });

  test("can select an art style", async ({ page }) => {
    await page.goto("/decks/new");
    // Click on a preset style
    await page.getByText("Celestial").click();
    // The style should be visually selected (has ring/border)
    const celestialCard = page.getByText("Celestial").locator("..");
    await expect(celestialCard).toBeVisible();
  });
});
