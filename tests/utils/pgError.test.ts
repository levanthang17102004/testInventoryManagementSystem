import { describe, expect, it } from "vitest";
import { handlePgError } from "../../src/utils/pgError.js";
import { mockJsonResponse } from "../helpers/mockPool.js";

describe("handlePgError", () => {
  it("handles unique violation (23505)", () => {
    const res = mockJsonResponse();
    const handled = handlePgError({ code: "23505", detail: "dup key" }, res);

    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Dữ liệu trùng (mã số / số phiếu đã tồn tại)",
      detail: "dup key",
    });
  });

  it("handles foreign key violation (23503)", () => {
    const res = mockJsonResponse();
    const handled = handlePgError({ code: "23503" }, res);

    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns false for unknown errors", () => {
    const res = mockJsonResponse();
    expect(handlePgError(new Error("other"), res)).toBe(false);
    expect(res.status).not.toHaveBeenCalled();
  });
});
