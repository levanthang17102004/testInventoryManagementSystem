import { vi } from "vitest";

export type MockPool = {
  query: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
};

export function createMockPool(): MockPool {
  return {
    query: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
  };
}

export function mockJsonResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res;
}
