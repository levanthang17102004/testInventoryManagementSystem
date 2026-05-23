import type { Response } from "express";

const PG_FOREIGN_KEY = "23503";
const PG_UNIQUE = "23505";

export function handlePgError(err: unknown, res: Response): boolean {
  if (!err || typeof err !== "object" || !("code" in err)) {
    return false;
  }

  const code = (err as { code: string }).code;
  const detail =
    "detail" in err && typeof err.detail === "string" ? err.detail : undefined;

  if (code === PG_UNIQUE) {
    res.status(409).json({
      error: "Dữ liệu trùng (mã số / số phiếu đã tồn tại)",
      detail,
    });
    return true;
  }

  if (code === PG_FOREIGN_KEY) {
    res.status(400).json({
      error: "Tham chiếu không hợp lệ (department, warehouse, product, receipt)",
      detail,
    });
    return true;
  }

  return false;
}
