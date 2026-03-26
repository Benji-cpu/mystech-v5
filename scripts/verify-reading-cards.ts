/**
 * Visual verification script for reading card flow.
 * Run with: npx playwright test --config=scripts/pw-verify.config.ts
 */
import { test, type Page } from "@playwright/test";

const BASE = "http://localhost:3000";

async function authenticate(page: Page) {
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(500);
  const authResult = await page.evaluate(async (baseUrl: string) => {
    const res = await fetch(`${baseUrl}/api/auth/test-login`, { method: "POST" });
    return { status: res.status, body: await res.json() };
  }, BASE);
  console.log(`[Auth] ${JSON.stringify(authResult)}`);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
}

test("Reading card flow visual verification", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // ────── STEP 1: Authenticate ──────
  console.log("\n=== STEP 1: Authenticating ===");
  await authenticate(page);

  // ────── STEP 2: Navigate to /readings/new ──────
  console.log("\n=== STEP 2: Navigate to /readings/new ===");
  await page.goto(`${BASE}/readings/new`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  console.log(`URL: ${page.url()}`);

  // ────── STEP 3: Screenshot setup page (390px) ──────
  console.log("\n=== STEP 3: Screenshot setup page (390px) ===");
  await page.screenshot({ path: "verify-reading-setup-mobile-390.png", fullPage: true });

  // ────── STEP 4: Select a deck ──────
  console.log("\n=== STEP 4: Select a deck ===");
  // Click "Your Chronicle" button (it contains "Your Chronicle" and "5 cards")
  await page.locator('button:has-text("Your Chronicle")').click();
  console.log("Clicked 'Your Chronicle' deck");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "verify-reading-after-deck-select.png", fullPage: true });

  // ────── STEP 5: Expand and select "Three Card" spread ──────
  console.log("\n=== STEP 5: Select Three Card spread ===");

  // Click the "Spread" accordion header to expand it
  const spreadHeader = page.getByText("Spread", { exact: true }).first();
  if (await spreadHeader.isVisible()) {
    await spreadHeader.click();
    console.log("Clicked 'Spread' accordion header to expand");
    await page.waitForTimeout(1000);
  }

  // Screenshot after expanding
  await page.screenshot({ path: "verify-reading-spread-expanded.png", fullPage: true });

  // Now list all visible text to find spread options
  const bodyText = await page.locator("body").innerText();
  console.log(`Page text after spread expand: ${bodyText.substring(0, 800)}`);

  // Find and click "Three Card"
  const threeCardOption = page.getByText("Three Card").first();
  if (await threeCardOption.isVisible().catch(() => false)) {
    await threeCardOption.click();
    console.log("Clicked 'Three Card' option");
  } else {
    // Try locating by description
    const pastPresentFuture = page.getByText("Past, Present, Future").first();
    if (await pastPresentFuture.isVisible().catch(() => false)) {
      await pastPresentFuture.click();
      console.log("Clicked 'Past, Present, Future' description");
    } else {
      // Just list all buttons to debug
      const allBtns = await page.locator("button").all();
      for (let i = 0; i < allBtns.length; i++) {
        const txt = (await allBtns[i].innerText().catch(() => "")).trim().replace(/\n/g, " | ");
        const vis = await allBtns[i].isVisible().catch(() => false);
        console.log(`  btn[${i}]: "${txt.substring(0, 80)}" visible=${vis}`);
      }
    }
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: "verify-reading-spread-selected.png", fullPage: true });

  // ────── STEP 6: Type intention ──────
  console.log("\n=== STEP 6: Type intention ===");

  // After spread selection, the intention section may auto-expand or need clicking
  // Check for "Intention" header
  const intentionHeader = page.getByText(/Set Your Intention|Your Intention|Intention/i).first();
  if (await intentionHeader.isVisible().catch(() => false)) {
    // Check if there's already an input visible
    const input = page.locator('input[type="text"], textarea').first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill("Testing card spacing");
      console.log("Filled intention input directly");
    } else {
      // Click the header to expand
      await intentionHeader.click();
      console.log("Clicked intention header");
      await page.waitForTimeout(500);
      const input2 = page.locator('input[type="text"], textarea').first();
      if (await input2.isVisible().catch(() => false)) {
        await input2.fill("Testing card spacing");
        console.log("Filled intention input after expanding");
      } else {
        console.log("No text input found after expanding intention");
      }
    }
  } else {
    // Try finding input directly
    const input = page.locator('input[type="text"], textarea').first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill("Testing card spacing");
      console.log("Filled intention input (no header needed)");
    } else {
      console.log("No intention input found");
      // Print page text for debugging
      const txt = await page.locator("body").innerText();
      console.log(`Current page text: ${txt.substring(0, 600)}`);
    }
  }

  await page.waitForTimeout(500);
  await page.screenshot({ path: "verify-reading-ready-to-begin.png", fullPage: true });

  // ────── STEP 7: Click "Begin Reading" ──────
  console.log("\n=== STEP 7: Click Begin Reading ===");
  const beginBtn = page.locator('button:has-text("Begin Reading")').first();
  const isDisabled = await beginBtn.isDisabled();
  console.log(`Begin Reading disabled: ${isDisabled}`);

  if (!isDisabled) {
    await beginBtn.click();
    console.log("Clicked Begin Reading");
  } else {
    console.log("Begin is still disabled. Will try force-click...");
    // Let's check what's missing
    const txt = await page.locator("body").innerText();
    console.log(`Page state: ${txt.substring(0, 500)}`);
    // Force click
    await beginBtn.click({ force: true });
    console.log("Force-clicked Begin Reading");
  }

  // ────── STEP 8: Wait for cards ──────
  console.log("\n=== STEP 8: Waiting for cards... ===");
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "verify-reading-drawing-3s.png", fullPage: false });
  console.log("  3s - screenshot taken");

  await page.waitForTimeout(5000);
  await page.screenshot({ path: "verify-reading-drawing-8s.png", fullPage: false });
  console.log("  8s - screenshot taken");

  await page.waitForTimeout(5000);
  console.log("  13s - done waiting");

  // ────── STEP 9: Mobile screenshot of revealed cards ──────
  console.log("\n=== STEP 9: Mobile screenshots (390px) ===");
  await page.screenshot({
    path: "verify-reading-cards-mobile-390.png",
    fullPage: true,
  });
  await page.screenshot({
    path: "verify-reading-cards-mobile-390-viewport.png",
    fullPage: false,
  });
  console.log("Saved mobile screenshots");

  // Analyze the card rendering
  const analysis = await page.evaluate(() => {
    // Check for card elements with perspective (from ReadingFlipCard)
    const perspectiveEls = document.querySelectorAll('[style*="perspective"]');
    const cardInfo: string[] = [];
    perspectiveEls.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const style = (el as HTMLElement).style;
      cardInfo.push(`Card ${i}: ${Math.round(rect.width)}x${Math.round(rect.height)} at (${Math.round(rect.left)},${Math.round(rect.top)})`);
    });

    // Check for images
    const images = document.querySelectorAll('img');
    const imgInfo: string[] = [];
    images.forEach((img, i) => {
      imgInfo.push(`img[${i}]: ${img.alt || 'no alt'} src=${img.src.substring(0, 60)}`);
    });

    // Check overflow clipping on card parents
    const overflowIssues: string[] = [];
    perspectiveEls.forEach((card, i) => {
      let el = card.parentElement;
      let depth = 0;
      while (el && depth < 8) {
        const cs = getComputedStyle(el);
        if (cs.overflow !== 'visible' && cs.overflow !== '') {
          overflowIssues.push(`Card${i} parent[${depth}] <${el.tagName.toLowerCase()} class="${el.className.substring(0,60)}"> overflow=${cs.overflow}`);
        }
        el = el.parentElement;
        depth++;
      }
    });

    // Check for glow/shadow elements
    const allEls = document.querySelectorAll('*');
    let glowCount = 0;
    const glowDetails: string[] = [];
    allEls.forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.boxShadow && cs.boxShadow !== 'none') {
        glowCount++;
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          glowDetails.push(`${el.tagName} at (${Math.round(rect.left)},${Math.round(rect.top)}) shadow=${cs.boxShadow.substring(0,80)}`);
        }
      }
    });

    return { cardInfo, imgInfo, overflowIssues, glowCount, glowDetails: glowDetails.slice(0, 10) };
  });

  console.log("\n--- Card Analysis ---");
  console.log("Cards (perspective elements):", analysis.cardInfo);
  console.log("Images:", analysis.imgInfo);
  console.log("Overflow issues:", analysis.overflowIssues);
  console.log(`Glow/shadow elements: ${analysis.glowCount}`);
  console.log("Glow details:", analysis.glowDetails);

  // ────── STEP 10: Desktop screenshot ──────
  console.log("\n=== STEP 10: Desktop screenshots (1280px) ===");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: "verify-reading-cards-desktop-1280.png", fullPage: true });
  await page.screenshot({ path: "verify-reading-cards-desktop-1280-viewport.png", fullPage: false });
  console.log("Saved desktop screenshots");

  // ────── STEP 11: Click revealed card for modal ──────
  console.log("\n=== STEP 11: Click revealed card for modal ===");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);

  // Look for elements with cursor pointer AND perspective parent (reading cards)
  const cardClickers = await page.evaluate(() => {
    const perspEls = document.querySelectorAll('[style*="perspective"]');
    const clickable: { index: number; cursor: string; tag: string }[] = [];
    perspEls.forEach((el, i) => {
      const style = (el as HTMLElement).style;
      clickable.push({
        index: i,
        cursor: style.cursor || getComputedStyle(el).cursor,
        tag: el.tagName,
      });
    });
    return clickable;
  });
  console.log("Card cursor states:", cardClickers);

  // Click the first card with pointer cursor, or first card element
  if (cardClickers.length > 0) {
    const perspCards = page.locator('[style*="perspective"]');
    const pointerCard = cardClickers.find(c => c.cursor === 'pointer');
    const idx = pointerCard ? pointerCard.index : 0;
    await perspCards.nth(idx).click();
    console.log(`Clicked card ${idx} (cursor: ${cardClickers[idx]?.cursor})`);
  } else {
    console.log("No perspective card elements found to click");
  }

  await page.waitForTimeout(2000);

  // ────── STEP 12: Modal screenshot ──────
  console.log("\n=== STEP 12: Modal screenshots ===");
  await page.screenshot({ path: "verify-reading-modal-mobile-390.png", fullPage: false });

  const dialogCount = await page.locator('[role="dialog"]').count();
  console.log(`Dialogs found: ${dialogCount}`);

  if (dialogCount > 0) {
    console.log("MODAL IS OPEN");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "verify-reading-modal-desktop-1280.png", fullPage: false });
  } else {
    console.log("No modal detected after card click");
    // Check if maybe the page changed
    await page.screenshot({ path: "verify-reading-after-card-click.png", fullPage: true });
  }

  console.log("\n=== VERIFICATION COMPLETE ===");
  await context.close();
});
