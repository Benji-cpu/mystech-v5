import { vi } from "vitest";

type MockUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export const TEST_USER: MockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  image: null,
};

// Mock getCurrentUser to return an authenticated user
export function mockAuthenticated(user: MockUser = TEST_USER) {
  vi.mock("@/lib/auth/helpers", () => ({
    getCurrentUser: vi.fn().mockResolvedValue(user),
    requireAuth: vi.fn().mockResolvedValue(user),
  }));
}

// Mock getCurrentUser to return null (unauthenticated)
export function mockUnauthenticated() {
  vi.mock("@/lib/auth/helpers", () => ({
    getCurrentUser: vi.fn().mockResolvedValue(null),
    requireAuth: vi.fn().mockImplementation(() => {
      throw new Error("Unauthorized");
    }),
  }));
}
