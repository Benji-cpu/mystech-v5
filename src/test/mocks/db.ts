import { vi } from "vitest";

// Mock Drizzle db — provides chainable query builder stubs
export function createMockDb() {
  const chainable = () => {
    const chain: Record<string, unknown> = {};
    const methods = [
      "select",
      "from",
      "where",
      "orderBy",
      "insert",
      "values",
      "returning",
      "update",
      "set",
      "delete",
      "innerJoin",
      "leftJoin",
    ];
    for (const method of methods) {
      chain[method] = vi.fn().mockReturnValue(chain);
    }
    return chain;
  };

  return chainable();
}

// Pre-built mock that can be used with vi.mock
export const mockDb = createMockDb();

// Helper to mock the db module
export function mockDbModule() {
  vi.mock("@/lib/db", () => ({
    db: mockDb,
  }));
  return mockDb;
}
