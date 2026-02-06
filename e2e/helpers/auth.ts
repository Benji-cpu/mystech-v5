import type { Page } from "@playwright/test";

/**
 * Authenticate a Playwright page by calling the dev-only test-login route.
 * Must be called before navigating to protected pages.
 */
export async function loginAsTestUser(page: Page) {
  const response = await page.request.post("/api/auth/test-login");
  if (!response.ok()) {
    throw new Error(
      `Test login failed: ${response.status()} ${await response.text()}`
    );
  }
  return response.json();
}
