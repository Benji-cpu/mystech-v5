/**
 * Visual + red-team audit walk. Drives every user-facing feature in a real
 * Chromium at mobile viewport (390x844), recording video, a replayable trace
 * (npx playwright show-trace), and a screenshot per step. Mechanical findings
 * (console errors, failed requests, horizontal overflow, small touch targets,
 * steps that couldn't complete) are collected to findings.json; visual judgment
 * happens afterwards by reviewing the PNGs.
 *
 * Run: npx tsx scripts/audit-walk.mts   (dev server on :3000 required)
 * All interactions run as test-user-e2e. AI-spending steps run at most once.
 */
import { chromium, type Page, type BrowserContext } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE = "http://localhost:3000";
const DIR = path.join(".audit", "2026-06-12");
fs.mkdirSync(path.join(DIR, "video"), { recursive: true });

type Finding = {
  severity: "P0" | "P1" | "P2" | "P3";
  page: string;
  issue: string;
  evidence?: string;
  screenshot?: string;
};
const findings: Finding[] = [];
const passes: string[] = [];
let stepNo = 0;

function logFinding(f: Finding) {
  findings.push(f);
  console.log(`  [${f.severity}] ${f.issue} (${f.page})`);
}

async function shot(page: Page, name: string): Promise<string> {
  const file = `${String(stepNo).padStart(2, "0")}-${name}.png`;
  try {
    await page.screenshot({ path: path.join(DIR, file), fullPage: false });
  } catch { /* page may have navigated */ }
  return file;
}

async function overflowCheck(page: Page, name: string) {
  try {
    const o = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      iw: window.innerWidth,
    }));
    if (o.sw > o.iw + 1) {
      logFinding({
        severity: "P1",
        page: page.url().replace(BASE, ""),
        issue: `Horizontal overflow: scrollWidth ${o.sw} > viewport ${o.iw}`,
        screenshot: `${String(stepNo).padStart(2, "0")}-${name}.png`,
      });
    }
  } catch { /* ignore */ }
}

function attachCollectors(page: Page, label: string) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text().slice(0, 300);
      // Ignore known noise
      if (text.includes("Download the React DevTools")) return;
      logFinding({ severity: "P2", page: page.url().replace(BASE, ""), issue: `[${label}] console error: ${text}` });
    }
  });
  page.on("pageerror", (err) => {
    logFinding({ severity: "P1", page: page.url().replace(BASE, ""), issue: `[${label}] page error: ${String(err).slice(0, 300)}` });
  });
  page.on("response", (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 500 && url.startsWith(BASE)) {
      logFinding({ severity: "P0", page: page.url().replace(BASE, ""), issue: `[${label}] ${status} from ${url.replace(BASE, "")}` });
    }
  });
}

async function step(page: Page, name: string, fn: () => Promise<void>) {
  stepNo++;
  console.log(`\n▶ ${stepNo}. ${name}`);
  try {
    await fn();
    const file = await shot(page, name);
    await overflowCheck(page, name);
    passes.push(`${stepNo}. ${name} (${file})`);
  } catch (err) {
    const file = await shot(page, `${name}-FAILED`);
    logFinding({
      severity: "P0",
      page: page.url().replace(BASE, ""),
      issue: `Step "${name}" failed: ${String(err).slice(0, 250)}`,
      screenshot: file,
    });
  }
}

async function login(page: Page) {
  const res = await page.request.post(`${BASE}/api/auth/test-login`);
  if (!res.ok()) throw new Error(`test-login failed: ${res.status()}`);
}

async function touchTargets(page: Page, where: string) {
  try {
    const small = await page.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll("nav a, nav button").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.width < 40 || r.height < 40)) {
          out.push(`${(el.textContent || el.getAttribute("aria-label") || "?").trim().slice(0, 20)}: ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      });
      return out;
    });
    for (const s of small) {
      logFinding({ severity: "P2", page: where, issue: `Touch target <40px in nav: ${s}` });
    }
  } catch { /* ignore */ }
}

async function main() {
  const browser = await chromium.launch();

  // ── Mobile context (primary) ──
  const mobile: BrowserContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    recordVideo: { dir: path.join(DIR, "video"), size: { width: 390, height: 844 } },
    baseURL: BASE,
  });
  await mobile.tracing.start({ screenshots: true, snapshots: true });
  const page = await mobile.newPage();
  attachCollectors(page, "mobile");
  page.setDefaultTimeout(20_000);

  // ── 1. Unauthenticated surfaces ──
  await step(page, "landing", async () => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });
  await step(page, "pricing", async () => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
  });
  await step(page, "login-page", async () => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
  });
  await step(page, "unauth-today-bounces", async () => {
    await page.goto("/today");
    await page.waitForURL(/\/login/);
  });
  await step(page, "redteam-prod-testlogin-404", async () => {
    const res = await page.request.post("https://mystech-v5.vercel.app/api/auth/test-login");
    if (res.status() !== 404) {
      logFinding({ severity: "P0", page: "prod /api/auth/test-login", issue: `Expected 404 in production, got ${res.status()}` });
    }
  });
  await step(page, "redteam-unauth-apis-401", async () => {
    for (const api of ["/api/chronicle/today", "/api/readings/quick"]) {
      const res = api.includes("quick")
        ? await page.request.post(`${BASE}${api}`)
        : await page.request.get(`${BASE}${api}`);
      if (res.status() !== 401) {
        logFinding({ severity: "P1", page: api, issue: `Unauthenticated API expected 401, got ${res.status()}` });
      }
    }
  });

  // ── 2. Login + Today ritual ──
  await login(page);
  await step(page, "today-initial", async () => {
    await page.goto("/today");
    await page.waitForLoadState("networkidle");
    await touchTargets(page, "/today bottom nav");
  });

  const dialogueInput = page.locator('textarea[placeholder="Share what\'s on your mind..."]');
  const alreadyComplete = await page
    .getByText("View your story")
    .isVisible()
    .catch(() => false);

  if (!alreadyComplete) {
    await step(page, "ritual-wait-dialogue", async () => {
      await dialogueInput.waitFor({ state: "visible", timeout: 60_000 });
    });

    const messages = [
      "Today felt steady. I spent the morning planning and the afternoon building — a lot of small decisions stacked up.",
      "Mostly calm, a little stretched. I want to finish what I started without rushing the last part.",
      "I think that's everything for today.",
      "Ready when you are.",
    ];
    let forged = false;
    for (let i = 0; i < messages.length && !forged; i++) {
      await step(page, `ritual-message-${i + 1}`, async () => {
        await dialogueInput.fill(messages[i]);
        await page.locator(".chronicle-input-row button").last().click();
        // wait for Lyra's streamed reply to finish (input re-enabled)
        await page.waitForFunction(
          () => {
            const ta = document.querySelector('textarea[placeholder="Share what\'s on your mind..."]') as HTMLTextAreaElement | null;
            return ta ? !ta.disabled : true;
          },
          undefined,
          { timeout: 60_000 }
        );
      });
      forged = await page.getByText("Forge today's card").isVisible().catch(() => false);
    }

    if (forged) {
      await step(page, "ritual-forge-doubletap", async () => {
        const forge = page.getByText("Forge today's card");
        // red-team: rapid double click — must not double-forge
        await forge.click();
        await forge.click({ timeout: 1500 }).catch(() => {});
      });
      await step(page, "ritual-complete", async () => {
        await page.getByText("View your story").waitFor({ state: "visible", timeout: 180_000 });
      });
    } else {
      logFinding({ severity: "P1", page: "/today", issue: "Forge CTA never appeared after 4 dialogue messages" });
    }
  } else {
    passes.push("ritual already complete today — landed on complete phase directly");
  }

  await step(page, "ritual-complete-links", async () => {
    for (const label of ["Go deeper", "View your story"]) {
      const visible = await page.getByText(label).isVisible().catch(() => false);
      if (!visible) logFinding({ severity: "P1", page: "/today", issue: `Complete-phase link "${label}" not visible` });
    }
  });

  // red-team: reload on /today must resume complete state
  await step(page, "ritual-reload-resume", async () => {
    await page.reload();
    await page.getByText("View your story").waitFor({ state: "visible", timeout: 30_000 });
  });

  // ── 3. Story ──
  await step(page, "story", async () => {
    await page.goto("/story");
    await page.waitForLoadState("networkidle");
  });
  await step(page, "story-open-reading", async () => {
    const row = page.locator('a[href^="/readings/"]').first();
    if (await row.isVisible().catch(() => false)) {
      await row.click();
      await page.waitForLoadState("networkidle");
    } else {
      passes.push("story has no reading rows yet (ok for fresh user)");
    }
  });

  // ── 4. Readings ──
  await step(page, "reading-new-setup", async () => {
    await page.goto("/readings/new");
    await page.waitForLoadState("networkidle");
  });
  await step(page, "reading-deepdive-locked", async () => {
    const locked = await page.locator("text=Deep dive").isVisible().catch(() => false);
    if (!locked) logFinding({ severity: "P2", page: "/readings/new", issue: "'Deep dive' group label not visible on mobile spread list" });
  });
  await step(page, "reading-run", async () => {
    // pick first deck if a selector exists, pick One Card, begin
    const oneCard = page.getByText("One Card", { exact: false }).first();
    if (await oneCard.isVisible().catch(() => false)) await oneCard.click();
    const begin = page.getByText("Begin reading");
    await begin.waitFor({ state: "visible", timeout: 15_000 });
    await begin.click();
    // interpretation streams — wait for share/feedback affordances or text
    await page.waitForTimeout(4_000);
    await page.waitForLoadState("networkidle", { timeout: 120_000 }).catch(() => {});
  });
  await step(page, "reading-second-same-day-limit", async () => {
    await page.goto("/readings/new");
    const oneCard = page.getByText("One Card", { exact: false }).first();
    if (await oneCard.isVisible().catch(() => false)) await oneCard.click();
    const begin = page.getByText("Begin reading");
    if (await begin.isVisible().catch(() => false)) {
      await begin.click();
      await page.waitForTimeout(3_000);
      // graceful limit surface expected — capture whatever shows
    }
  });
  await step(page, "quick-draw", async () => {
    await page.goto("/readings/quick");
    await page.waitForLoadState("networkidle");
    const btn = page.locator("button").first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(4_000);
    }
  });

  // ── 5. Decks ──
  let deckUrl = "";
  await step(page, "decks-library", async () => {
    await page.goto("/decks");
    await page.waitForLoadState("networkidle");
  });
  await step(page, "deck-detail", async () => {
    const deckLink = page.locator('a[href^="/decks/"]:not([href="/decks/new"]):not([href^="/decks/styles"])').first();
    await deckLink.waitFor({ state: "visible", timeout: 15_000 });
    await deckLink.click();
    await page.waitForLoadState("networkidle");
    deckUrl = page.url().replace(BASE, "");
  });
  await step(page, "deck-card-modal", async () => {
    const card = page.locator("img").first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1_200);
    }
  });
  await step(page, "card-refine-page", async () => {
    const refine = page.locator('a[href*="/cards/"]').first();
    if (await refine.isVisible().catch(() => false)) {
      await refine.click();
      await page.waitForLoadState("networkidle");
    } else if (deckUrl) {
      passes.push("no refine link visible in modal (may be hover-only on desktop)");
    }
  });
  await step(page, "deck-print-page", async () => {
    if (deckUrl) {
      await page.goto(`${deckUrl}/print`);
      await page.waitForLoadState("networkidle");
    }
  });
  await step(page, "redteam-foreign-deck-404", async () => {
    const res = await page.goto("/decks/zzz-not-a-real-deck-id");
    await page.waitForLoadState("networkidle");
    if (res && res.status() === 200) {
      const body = await page.textContent("body").catch(() => "");
      if (body && !/not found|404/i.test(body)) {
        logFinding({ severity: "P1", page: "/decks/[bogus]", issue: "Bogus deck id did not yield a not-found surface" });
      }
    }
  });

  // ── 6. Styles ──
  await step(page, "styles-gallery", async () => {
    await page.goto("/decks/styles");
    await page.waitForLoadState("networkidle");
  });
  let styleUrl = "";
  await step(page, "style-detail", async () => {
    const tile = page.locator('a[href^="/decks/styles/"]:not([href$="/new"])').first();
    await tile.waitFor({ state: "visible", timeout: 15_000 });
    await tile.click();
    await page.waitForLoadState("networkidle");
    styleUrl = page.url().replace(BASE, "");
  });
  await step(page, "style-editor", async () => {
    if (styleUrl) {
      await page.goto(`${styleUrl}/edit`);
      await page.waitForLoadState("networkidle");
    }
  });
  await step(page, "style-new-form", async () => {
    await page.goto("/decks/styles/new");
    await page.waitForLoadState("networkidle");
  });

  // ── 7. Paths / focus ──
  await step(page, "paths-picker", async () => {
    await page.goto("/paths");
    await page.waitForLoadState("networkidle");
  });
  await step(page, "path-detail-activate", async () => {
    const pathLink = page.locator('a[href^="/paths/"]').first();
    if (await pathLink.isVisible().catch(() => false)) {
      await pathLink.click();
      await page.waitForLoadState("networkidle");
      const begin = page.getByText("Begin This Path");
      if (await begin.isVisible().catch(() => false)) {
        await begin.click();
        await page.waitForTimeout(4_000);
        await page.waitForLoadState("networkidle").catch(() => {});
      }
    } else {
      passes.push("no path links on /paths (no preset paths seeded?)");
    }
  });
  await step(page, "story-focus-trail", async () => {
    await page.goto("/story");
    await page.waitForLoadState("networkidle");
    const focus = await page.getByText("Current focus").isVisible().catch(() => false);
    if (!focus) passes.push("no Current focus card on Story (no active path for test user)");
  });

  // ── 8. Settings ──
  for (const [name, url] of [
    ["settings-hub", "/settings"],
    ["settings-daily-reminder", "/settings/daily-card"],
    ["settings-billing", "/settings/billing"],
    ["profile", "/profile"],
  ] as const) {
    await step(page, name, async () => {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
    });
  }

  // ── 9. System-wide ──
  await step(page, "feedback-fab", async () => {
    await page.goto("/today");
    await page.waitForLoadState("networkidle");
    const fb = page.getByRole("button", { name: /feedback/i }).first();
    if (await fb.isVisible().catch(() => false)) {
      await fb.click();
      await page.waitForTimeout(800);
      const ta = page.locator("textarea").last();
      if (await ta.isVisible().catch(() => false)) {
        await ta.fill("[audit] automated visual/red-team pass — please dismiss.");
        const submit = page.getByRole("button", { name: /send|submit/i }).last();
        if (await submit.isVisible().catch(() => false)) {
          await submit.click();
          await page.waitForTimeout(1_500);
        }
      }
    } else {
      logFinding({ severity: "P2", page: "/today", issue: "Feedback nav action not found/clickable on mobile" });
    }
  });
  await step(page, "redirect-table", async () => {
    const redirects: [string, string][] = [
      ["/home", "/today"],
      ["/dashboard", "/today"],
      ["/readings", "/story"],
      ["/studio", "/decks"],
      ["/art-styles", "/decks/styles"],
      ["/chronicle/today", "/today"],
      ["/daily", "/today"],
    ];
    for (const [from, to] of redirects) {
      await page.goto(from);
      await page.waitForLoadState("networkidle");
      if (!page.url().includes(to)) {
        logFinding({ severity: "P1", page: from, issue: `Redirect expected → ${to}, landed on ${page.url().replace(BASE, "")}` });
      }
    }
  });
  await step(page, "redteam-admin-as-user", async () => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    const body = (await page.textContent("body").catch(() => "")) ?? "";
    if (/users|decks|readings/i.test(body) && page.url().includes("/admin")) {
      // Heuristic — verify it actually rendered the dashboard vs an error/redirect
      const hasStats = await page.getByText(/total users/i).isVisible().catch(() => false);
      if (hasStats) logFinding({ severity: "P0", page: "/admin", issue: "Non-admin user can see the admin dashboard" });
    }
  });
  await step(page, "nav-active-states", async () => {
    for (const url of ["/today", "/decks", "/story", "/settings"]) {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await shot(page, `nav-${url.replace("/", "")}`);
    }
  });

  await mobile.tracing.stop({ path: path.join(DIR, "trace-mobile.zip") });
  await mobile.close();

  // ── 10. Desktop spot checks ──
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 }, baseURL: BASE });
  const dpage = await desktop.newPage();
  attachCollectors(dpage, "desktop");
  await login(dpage);
  for (const [name, url] of [
    ["desktop-today", "/today"],
    ["desktop-story", "/story"],
    ["desktop-decks", "/decks"],
    ["desktop-reading-new", "/readings/new"],
  ] as const) {
    await step(dpage, name, async () => {
      await dpage.goto(url);
      await dpage.waitForLoadState("networkidle");
    });
  }
  await desktop.close();
  await browser.close();

  fs.writeFileSync(path.join(DIR, "findings.json"), JSON.stringify({ findings, passes }, null, 2));
  console.log(`\n━━━ DONE ━━━\n${passes.length} steps passed, ${findings.length} findings.`);
  console.log(`Artifacts: ${DIR}/ (screenshots, video/, trace-mobile.zip, findings.json)`);
}

main().catch((err) => {
  console.error("AUDIT HARNESS CRASHED:", err);
  fs.writeFileSync(path.join(DIR, "findings.json"), JSON.stringify({ findings, passes, crash: String(err) }, null, 2));
  process.exit(1);
});
