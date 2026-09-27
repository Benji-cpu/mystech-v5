import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Deck Creation (Simple Mode)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("form has required fields", async ({ page }) => {
    await page.goto("/decks/new");
    await expect(page.locator("#title")).toBeVisible();
    await expect(page.locator("#description")).toBeVisible();
    await expect(page.getByText("Generate My Deck")).toBeVisible();
  });

  test("submit button is present", async ({ page }) => {
    await page.goto("/decks/new");
    const button = page.getByRole("button", { name: /generate my deck/i });
    await expect(button).toBeVisible();
  });

  test("can fill out the creation form", async ({ page }) => {
    await page.goto("/decks/new");

    await page.locator("#title").fill("Test Deck E2E");
    await page.locator("#description").fill("A test deck created by E2E tests");

    // Select card count (click the "5" option)
    await page.getByRole("button", { name: "5" }).click();

    // Verify form is filled
    await expect(page.locator("#title")).toHaveValue("Test Deck E2E");
    await expect(page.locator("#description")).toHaveValue(
      "A test deck created by E2E tests"
    );
  });
});
