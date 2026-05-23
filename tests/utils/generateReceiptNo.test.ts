import { describe, expect, it, vi } from "vitest";
import type { PoolClient } from "pg";
import { generateReceiptNo } from "../../src/utils/generateReceiptNo.js";

function mockClient(lastReceiptNo?: string): PoolClient {
  return {
    query: vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: lastReceiptNo ? [{ receipt_no: lastReceiptNo }] : [],
      }),
  } as unknown as PoolClient;
}

describe("generateReceiptNo", () => {
  it("starts at 001 when no existing receipt for date", async () => {
    const client = mockClient();
    const no = await generateReceiptNo(client, "2026-05-23");
    expect(no).toBe("PNK-20260523-001");
  });

  it("increments sequence from last receipt of same day", async () => {
    const client = mockClient("PNK-20260523-003");
    const no = await generateReceiptNo(client, "2026-05-23");
    expect(no).toBe("PNK-20260523-004");
  });

  it("uses date part in prefix", async () => {
    const client = mockClient("PNK-20260101-009");
    const no = await generateReceiptNo(client, "2026-01-01");
    expect(no).toBe("PNK-20260101-010");
  });

  it("acquires advisory lock before lookup", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const client = { query } as unknown as PoolClient;

    await generateReceiptNo(client, "2026-05-23");

    expect(query.mock.calls[0][0]).toContain("pg_advisory_xact_lock");
    expect(query.mock.calls[1][1]).toEqual(["PNK-20260523-%"]);
  });
});
