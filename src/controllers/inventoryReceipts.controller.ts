import type { Request, Response } from "express";
import type { PoolClient } from "pg";
import { pool } from "../db/pool.js";
import {
  inventoryReceiptCreateSchema,
  inventoryReceiptUpdateSchema,
  type InventoryReceiptBody,
} from "../models/schemas.js";
import { generateReceiptNo } from "../utils/generateReceiptNo.js";
import { handlePgError } from "../utils/pgError.js";
import { routeParamInt } from "../utils/routeParam.js";

function sumItemsTotal(items: InventoryReceiptBody["items"]): number {
  return items.reduce(
    (sum, item) => sum + item.actual_quantity * item.unit_price,
    0,
  );
}

async function fetchReceiptWithItems(id: number) {
  const receiptResult = await pool.query(
    `SELECT r.*,
            d.name AS department_name,
            w.name AS warehouse_name
     FROM inventory_receipts r
     LEFT JOIN departments d ON d.id = r.department_id
     LEFT JOIN warehouses w ON w.id = r.warehouse_id
     WHERE r.id = $1`,
    [id],
  );

  if (receiptResult.rows.length === 0) {
    return null;
  }

  const itemsResult = await pool.query(
    `SELECT i.*,
            p.code AS product_code,
            p.name AS product_name,
            p.unit AS product_unit
     FROM inventory_receipt_items i
     JOIN products p ON p.id = i.product_id
     WHERE i.receipt_id = $1
     ORDER BY i.id ASC`,
    [id],
  );

  return {
    ...receiptResult.rows[0],
    items: itemsResult.rows,
  };
}

async function insertReceiptItems(
  client: PoolClient,
  receiptId: number,
  items: InventoryReceiptBody["items"],
): Promise<void> {
  for (const item of items) {
    await client.query(
      `INSERT INTO inventory_receipt_items
         (receipt_id, product_id, document_quantity, actual_quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        receiptId,
        item.product_id,
        item.document_quantity,
        item.actual_quantity,
        item.unit_price,
      ],
    );
  }
}

export async function list(_req: Request, res: Response): Promise<void> {
  const { rows } = await pool.query(
    `SELECT r.*,
            d.name AS department_name,
            w.name AS warehouse_name
     FROM inventory_receipts r
     LEFT JOIN departments d ON d.id = r.department_id
     LEFT JOIN warehouses w ON w.id = r.warehouse_id
     ORDER BY r.receipt_date DESC, r.id DESC`,
  );
  res.json(rows);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = routeParamInt(req, "id");
  const receipt = await fetchReceiptWithItems(id);
  if (!receipt) {
    res.status(404).json({ error: "Không tìm thấy phiếu nhập kho" });
    return;
  }
  res.json(receipt);
}

export async function previewNextNumber(
  req: Request,
  res: Response,
): Promise<void> {
  const raw = typeof req.query.date === "string" ? req.query.date : "";
  const receiptDate =
    /^\d{4}-\d{2}-\d{2}$/.test(raw)
      ? raw
      : new Date().toISOString().slice(0, 10);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const receipt_no = await generateReceiptNo(client, receiptDate);
    await client.query("ROLLBACK");
    res.json({ receipt_no, receipt_date: receiptDate });
  } finally {
    client.release();
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = inventoryReceiptCreateSchema.parse(req.body);
  const totalAmount = sumItemsTotal(data.items);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const receiptNo = await generateReceiptNo(client, data.receipt_date);

    const receiptResult = await client.query(
      `INSERT INTO inventory_receipts (
         receipt_no, receipt_date, department_id, warehouse_id,
         delivered_by, received_by, accountant, warehouse_keeper,
         reference_document, debit_account, credit_account,
         total_amount, total_amount_text, attached_documents_count, note
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
       ) RETURNING id`,
      [
        receiptNo,
        data.receipt_date,
        data.department_id ?? null,
        data.warehouse_id ?? null,
        data.delivered_by ?? null,
        data.received_by ?? null,
        data.accountant ?? null,
        data.warehouse_keeper ?? null,
        data.reference_document ?? null,
        data.debit_account ?? null,
        data.credit_account ?? null,
        totalAmount,
        data.total_amount_text ?? null,
        data.attached_documents_count ?? 0,
        data.note ?? null,
      ],
    );

    const receiptId = receiptResult.rows[0].id as number;
    await insertReceiptItems(client, receiptId, data.items);
    await client.query("COMMIT");

    const receipt = await fetchReceiptWithItems(receiptId);
    res.status(201).json(receipt);
  } catch (err) {
    await client.query("ROLLBACK");
    if (handlePgError(err, res)) return;
    throw err;
  } finally {
    client.release();
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = routeParamInt(req, "id");
  const data = inventoryReceiptUpdateSchema.parse(req.body);
  const totalAmount = sumItemsTotal(data.items);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rowCount } = await client.query(
      `UPDATE inventory_receipts SET
         receipt_date = $1,
         department_id = $2,
         warehouse_id = $3,
         delivered_by = $4,
         received_by = $5,
         accountant = $6,
         warehouse_keeper = $7,
         reference_document = $8,
         debit_account = $9,
         credit_account = $10,
         total_amount = $11,
         total_amount_text = $12,
         attached_documents_count = $13,
         note = $14,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $15`,
      [
        data.receipt_date,
        data.department_id ?? null,
        data.warehouse_id ?? null,
        data.delivered_by ?? null,
        data.received_by ?? null,
        data.accountant ?? null,
        data.warehouse_keeper ?? null,
        data.reference_document ?? null,
        data.debit_account ?? null,
        data.credit_account ?? null,
        totalAmount,
        data.total_amount_text ?? null,
        data.attached_documents_count ?? 0,
        data.note ?? null,
        id,
      ],
    );

    if (!rowCount) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Không tìm thấy phiếu nhập kho" });
      return;
    }

    await client.query(
      "DELETE FROM inventory_receipt_items WHERE receipt_id = $1",
      [id],
    );
    await insertReceiptItems(client, id, data.items);
    await client.query("COMMIT");

    const receipt = await fetchReceiptWithItems(id);
    res.json(receipt);
  } catch (err) {
    await client.query("ROLLBACK");
    if (handlePgError(err, res)) return;
    throw err;
  } finally {
    client.release();
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = routeParamInt(req, "id");
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM inventory_receipts WHERE id = $1",
      [id],
    );
    if (!rowCount) {
      res.status(404).json({ error: "Không tìm thấy phiếu nhập kho" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    if (handlePgError(err, res)) return;
    throw err;
  }
}
