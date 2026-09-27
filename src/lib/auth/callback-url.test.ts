import { describe, it, expect } from "vitest";
import { safeCallbackUrl } from "./callback-url";

describe("safeCallbackUrl", () => {
  it("defaults to /today", () => {
    expect(safeCallbackUrl(undefined, undefined)).toBe("/today");
  });

  it("keeps an internal ?next= path", () => {
    expect(safeCallbackUrl("/onboarding", undefined)).toBe("/onboarding");
  });

  it("follows the middleware's absolute callbackUrl as a path", () => {
    expect(
      safeCallbackUrl(undefined, "https://mystech-v5.vercel.app/daily?on=2026-09-28")
    ).toBe("/daily?on=2026-09-28");
  });

  it("never leaves the site", () => {
    expect(safeCallbackUrl("//evil.example", undefined)).toBe("/today");
    expect(safeCallbackUrl("https://evil.example/steal", undefined)).toBe("/steal");
    expect(safeCallbackUrl(undefined, "javascript:alert(1)")).toBe("/today");
  });

  it("does not loop back to /login", () => {
    expect(safeCallbackUrl(undefined, "https://mystech-v5.vercel.app/login")).toBe("/today");
  });
});
