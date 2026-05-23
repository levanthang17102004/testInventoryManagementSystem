import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import type { NextFunction, Request, Response } from "express";
import { errorHandler, notFound } from "../../src/middlewares/errorHandler.js";
import { mockJsonResponse } from "../helpers/mockPool.js";

describe("notFound", () => {
  it("returns 404 json", () => {
    const res = mockJsonResponse();
    notFound({} as Request, res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Không tìm thấy API" });
  });
});

describe("errorHandler", () => {
  it("handles ZodError", () => {
    const res = mockJsonResponse();
    const err = new ZodError([]);
    vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(err, {} as Request, res as unknown as Response, {} as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Dữ liệu không hợp lệ" }),
    );
  });

  it("handles invalid route param error", () => {
    const res = mockJsonResponse();
    vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(
      new Error("Invalid integer route param: id"),
      {} as Request,
      res as unknown as Response,
      {} as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 for unknown errors", () => {
    const res = mockJsonResponse();
    vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(
      new Error("unexpected"),
      {} as Request,
      res as unknown as Response,
      {} as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Lỗi máy chủ" });
  });
});
