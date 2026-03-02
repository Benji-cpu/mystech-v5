import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Reading Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("setup screen shows deck and spread selectors", async ({ page }) => {
    await page.goto("/readings/new");
    await expect(page.getByText(/new reading/i)).toBeVisible();
    // Should see at least one deck or empty state prompt
    const hasDeck = await page.getByText(/cards$/i).first().isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/create.*deck/i).first().isVisible().catch(() => false);
    expect(hasDeck || hasEmpty).toBeTruthy();
  });

  test("Begin Reading button is disabled without selections", async ({ page }) => {
    await page.goto("/readings/new");
    const beginButton = page.getByRole("button", { name: /begin reading/i });
    await expect(beginButton).toBeVisible();
    await expect(beginButton).toBeDisabled();
  });

  test("selecting deck and spread enables Begin Reading", async ({ page }) => {
    await page.goto("/readings/new");

    // Wait for decks to load
    await page.waitForTimeout(1000);

    // Click first available deck (if there are multiple)
    const deckButtons = page.locator("button").filter({ hasText: /cards$/ });
    const deckCount = await deckButtons.count();
    if (deckCount > 0) {
      await deckButtons.first().click();
    }

    // Wait for spread selector to appear, then click one
    const spreadButton = page.getByRole("button", { name: /single card|three card/i }).first();
    if (await spreadButton.isVisible().catch(() => false)) {
      await spreadButton.click();

      // Begin Reading should now be enabled
      const beginButton = page.getByRole("button", { name: /begin reading/i });
      await expect(beginButton).toBeEnabled();
    }
  });

  test("full reading flow: setup → cards → interpretation → complete", async ({ page }) => {
    test.setTimeout(90_000); // Reading flow can take time with AI streaming

    await page.goto("/readings/new");
    await page.waitForTimeout(1000);

    // Select first deck
    const deckButtons = page.locator("button").filter({ hasText: /cards$/ });
    const deckCount = await deckButtons.count();
    if (deckCount === 0) {
      test.skip(true, "No decks available for test user");
      return;
    }
    await deckButtons.first().click();

    // Select Single Card spread (always available on free tier)
    const singleCard = page.getByRole("button", { name: /single card/i }).first();
    await expect(singleCard).toBeVisible();
    await singleCard.click();

    // Click Begin Reading
    const beginButton = page.getByRole("button", { name: /begin reading/i });
    await expect(beginButton).toBeEnabled();
    await beginButton.click();

    // Setup should collapse, cards should appear
    await expect(beginButton).not.toBeVisible({ timeout: 5000 });

    // Wait for interpretation to start streaming (presenting phase)
    const interpretationHeader = page.getByText(/your reading/i);
    await expect(interpretationHeader).toBeVisible({ timeout: 30_000 });

    // Wait for "View Complete Reading" link — the completion indicator
    const viewReadingLink = page.getByRole("link", { name: /view complete reading/i });
    await expect(viewReadingLink).toBeVisible({ timeout: 60_000 });
  });

  test("View Complete Reading navigates to reading page", async ({ page }) => {
    test.setTimeout(90_000);

    await page.goto("/readings/new");
    await page.waitForTimeout(1000);

    const deckButtons = page.locator("button").filter({ hasText: /cards$/ });
    if ((await deckButtons.count()) === 0) {
      test.skip(true, "No decks available");
      return;
    }
    await deckButtons.first().click();
    await page.getByRole("button", { name: /single card/i }).first().click();
    await page.getByRole("button", { name: /begin reading/i }).click();

    // Wait for completion
    const viewReadingLink = page.getByRole("link", { name: /view complete reading/i });
    await expect(viewReadingLink).toBeVisible({ timeout: 60_000 });

    // Click and verify navigation to reading detail page
    await viewReadingLink.click();
    await expect(page).toHaveURL(/\/readings\/[a-zA-Z0-9-]+$/, { timeout: 5000 });
  });

  test("Celtic Cross reading completes without timeout", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/readings/new");
    await page.waitForTimeout(1000);

    const deckButtons = page.locator("button").filter({ hasText: /cards$/ });
    if ((await deckButtons.count()) === 0) {
      test.skip(true, "No decks available");
      return;
    }
    await deckButtons.first().click();

    // Select Celtic Cross spread (requires pro or admin)
    const celticCross = page.getByRole("button", { name: /celtic cross/i }).first();
    const celticVisible = await celticCross.isVisible().catch(() => false);
    if (!celticVisible) {
      test.skip(true, "Celtic Cross not available (likely free tier)");
      return;
    }

    // Check if it's disabled (locked for free users)
    const isDisabled = await celticCross.isDisabled().catch(() => false);
    if (isDisabled) {
      test.skip(true, "Celtic Cross locked for this user");
      return;
    }

    await celticCross.click();

    const beginButton = page.getByRole("button", { name: /begin reading/i });
    await expect(beginButton).toBeEnabled();

    const startTime = Date.now();
    await beginButton.click();

    // Setup should collapse
    await expect(beginButton).not.toBeVisible({ timeout: 5000 });

    // Should NOT see timeout error
    const timeoutError = page.getByText(/timed out/i);

    // Wait for "Next Card" button — first card revealed
    const nextCardButton = page.getByRole("button", { name: /next card/i });
    await expect(nextCardButton).toBeVisible({ timeout: 60_000 });

    // Verify no timeout occurred
    await expect(timeoutError).not.toBeVisible();

    const elapsed = Date.now() - startTime;
    console.log(`[Celtic Cross timing] First card ready in ${elapsed}ms`);
  });
});
