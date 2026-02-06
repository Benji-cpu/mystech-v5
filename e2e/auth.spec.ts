import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login page
    await expect(page).toHaveURL(/login/);
  });

  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/login/);
    // Should show sign-in option
    const signInButton = page.getByRole("button", { name: /sign in|google|continue/i });
    await expect(signInButton).toBeVisible();
  });
});
