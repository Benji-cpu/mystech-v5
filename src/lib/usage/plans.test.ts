import { describe, it, expect } from "vitest";
import { getUserPlanFromRole } from "./plans";

describe("getUserPlanFromRole", () => {
  it("returns 'admin' for admin role", () => {
    expect(getUserPlanFromRole("admin")).toBe("admin");
  });

  it("returns 'free' for 'user' role", () => {
    expect(getUserPlanFromRole("user")).toBe("free");
  });

  it("returns 'free' for undefined role", () => {
    expect(getUserPlanFromRole(undefined)).toBe("free");
  });

  it("returns 'free' for 'tester' role", () => {
    expect(getUserPlanFromRole("tester")).toBe("free");
  });

  it("returns 'free' for empty string role", () => {
    expect(getUserPlanFromRole("")).toBe("free");
  });
});
