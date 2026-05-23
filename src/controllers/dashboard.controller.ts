import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

export async function departmentSpending(
  _req: Request,
  res: Response,
): Promise<void> {
  const [byDept, grand, receiptCount] = await Promise.all([
    pool.query(
      `SELECT
         COALESCE(d.id, 0) AS department_id,
         COALESCE(d.name, 'Chưa gán đơn vị') AS department_name,
         COALESCE(SUM(r.total_amount), 0) AS total_spent,
         COUNT(r.id)::int AS receipt_count
       FROM inventory_receipts r
       LEFT JOIN departments d ON d.id = r.department_id
       GROUP BY d.id, d.name
       ORDER BY total_spent DESC`,
    ),
    pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS grand_total
       FROM inventory_receipts`,
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM inventory_receipts`),
  ]);

  res.json({
    departments: byDept.rows,
    grand_total: grand.rows[0].grand_total,
    receipt_count: receiptCount.rows[0].total,
  });
}
