import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mockPool = vi.hoisted(() => ({
  query: vi.fn(),
  connect: vi.fn(),
  on: vi.fn(),
}));

vi.mock("../../src/db/pool.js", () => ({
  pool: mockPool,
}));

import { createApp } from "../../src/app.js";

describe("GET /health", () => {
  beforeEach(() => {
    mockPool.query.mockReset();
    mockPool.on.mockReset();
  });

  it("returns connected when database responds", async () => {
    mockPool.query.mockResolvedValue({ rows: [{ "?column?": 1 }] });

    const res = await request(createApp()).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", database: "connected" });
  });

  it("returns disconnected when database fails", async () => {
    mockPool.query.mockRejectedValue(new Error("connection refused"));

    const res = await request(createApp()).get("/health");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "error", database: "disconnected" });
  });
});

describe("GET /api/departments", () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  it("returns department list", async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ id: 1, name: "Phòng HC", address: null }],
    });

    const res = await request(createApp()).get("/api/departments");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Phòng HC");
  });
});

describe("POST /api/departments", () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  it("creates department with valid body", async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ id: 2, name: "Phòng IT", address: "Tầng 3" }],
    });

    const res = await request(createApp())
      .post("/api/departments")
      .send({ name: "Phòng IT", address: "Tầng 3" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Phòng IT");
  });

  it("returns 400 for invalid body", async () => {
    const res = await request(createApp())
      .post("/api/departments")
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Dữ liệu không hợp lệ");
    expect(mockPool.query).not.toHaveBeenCalled();
  });
});

describe("GET /api/departments/:id", () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  it("returns 404 when not found", async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const res = await request(createApp()).get("/api/departments/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Không tìm thấy đơn vị");
  });
});

describe("GET /api/inventory-receipts/next-number", () => {
  beforeEach(() => {
    mockPool.query.mockReset();
    mockPool.connect.mockReset();
  });

  it("returns preview receipt number", async () => {
    const mockClient = {
      query: vi
        .fn()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ receipt_no: "PNK-20260523-002" }] })
        .mockResolvedValueOnce({ rows: [] }),
      release: vi.fn(),
    };
    mockPool.connect.mockResolvedValue(mockClient);

    const res = await request(createApp()).get(
      "/api/inventory-receipts/next-number?date=2026-05-23",
    );

    expect(res.status).toBe(200);
    expect(res.body.receipt_no).toBe("PNK-20260523-003");
    expect(mockClient.release).toHaveBeenCalled();
  });
});
