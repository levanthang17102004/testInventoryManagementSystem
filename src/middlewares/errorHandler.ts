import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { handlePgError } from "../utils/pgError.js";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Không tìm thấy API" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Dữ liệu không hợp lệ",
      details: err.flatten(),
    });
    return;
  }

  if (handlePgError(err, res)) {
    return;
  }

  if (err instanceof Error && err.message.startsWith("Invalid integer route param")) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Lỗi máy chủ" });
}
