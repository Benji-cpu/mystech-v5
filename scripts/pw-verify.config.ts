import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "scripts/verify-reading-cards.ts",
  timeout: 120000,
  use: {
    headless: true,
    screenshot: "off",
    trace: "off",
  },
  reporter: [["line"]],
});
