import { describe, expect, it } from "vitest";
import {
  departmentBodySchema,
  inventoryReceiptCreateSchema,
  productBodySchema,
} from "../../src/models/schemas.js";

describe("departmentBodySchema", () => {
  it("accepts valid input", () => {
    const data = departmentBodySchema.parse({
      name: "Phòng Kế toán",
      address: "Tầng 2",
    });
    expect(data.name).toBe("Phòng Kế toán");
  });

  it("rejects empty name", () => {
    expect(() => departmentBodySchema.parse({ name: "" })).toThrow();
  });
});

describe("productBodySchema", () => {
  it("accepts valid product", () => {
    const data = productBodySchema.parse({
      code: "VT-001",
      name: "Giấy A4",
      unit: "Ram",
    });
    expect(data.code).toBe("VT-001");
  });
});

describe("inventoryReceiptCreateSchema", () => {
  const validReceipt = {
    receipt_date: "2026-05-23",
    department_id: 1,
    warehouse_id: 2,
    items: [
      {
        product_id: 1,
        document_quantity: 10,
        actual_quantity: 10,
        unit_price: 50000,
      },
    ],
  };

  it("accepts receipt without receipt_no", () => {
    const data = inventoryReceiptCreateSchema.parse(validReceipt);
    expect(data.receipt_date).toBe("2026-05-23");
    expect(data.items).toHaveLength(1);
  });

  it("rejects invalid date format", () => {
    expect(() =>
      inventoryReceiptCreateSchema.parse({
        ...validReceipt,
        receipt_date: "23/05/2026",
      }),
    ).toThrow();
  });

  it("requires at least one item", () => {
    expect(() =>
      inventoryReceiptCreateSchema.parse({
        ...validReceipt,
        items: [],
      }),
    ).toThrow();
  });

  it("rejects non-positive actual_quantity", () => {
    expect(() =>
      inventoryReceiptCreateSchema.parse({
        ...validReceipt,
        items: [{ ...validReceipt.items[0], actual_quantity: 0 }],
      }),
    ).toThrow();
  });
});
