import { z } from "zod";

export const departmentBodySchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().optional().nullable(),
});

export const warehouseBodySchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().optional().nullable(),
});

export const productBodySchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  unit: z.string().min(1).max(50),
});

export const inventoryReceiptItemSchema = z.object({
  product_id: z.number().int().positive(),
  document_quantity: z.number().nonnegative().default(0),
  actual_quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
});

const inventoryReceiptFieldsSchema = z.object({
  receipt_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  department_id: z.number().int().positive().optional().nullable(),
  warehouse_id: z.number().int().positive().optional().nullable(),
  delivered_by: z.string().max(255).optional().nullable(),
  received_by: z.string().max(255).optional().nullable(),
  accountant: z.string().max(255).optional().nullable(),
  warehouse_keeper: z.string().max(255).optional().nullable(),
  reference_document: z.string().optional().nullable(),
  debit_account: z.string().max(50).optional().nullable(),
  credit_account: z.string().max(50).optional().nullable(),
  total_amount_text: z.string().optional().nullable(),
  attached_documents_count: z.number().int().nonnegative().optional(),
  note: z.string().optional().nullable(),
  items: z.array(inventoryReceiptItemSchema).min(1),
});

/** Tạo phiếu — số phiếu do server tự sinh */
export const inventoryReceiptCreateSchema = inventoryReceiptFieldsSchema;

/** Cập nhật phiếu — không đổi số phiếu */
export const inventoryReceiptUpdateSchema = inventoryReceiptFieldsSchema;

export type InventoryReceiptBody = z.infer<typeof inventoryReceiptCreateSchema>;
