import type { PoolClient } from "pg";

/** Định dạng: PNK-YYYYMMDD-001 (số thứ tự theo ngày lập phiếu) */
export async function generateReceiptNo(
  client: PoolClient,
  receiptDate: string,
): Promise<string> {
  const datePart = receiptDate.replace(/-/g, "");
  const prefix = `PNK-${datePart}-`;

  await client.query(`SELECT pg_advisory_xact_lock(hashtext($1::text))`, [
    `receipt_seq_${datePart}`,
  ]);

  const { rows } = await client.query<{ receipt_no: string }>(
    `SELECT receipt_no
     FROM inventory_receipts
     WHERE receipt_no LIKE $1
     ORDER BY receipt_no DESC
     LIMIT 1`,
    [`${prefix}%`],
  );

  let seq = 1;
  if (rows.length > 0) {
    const suffix = rows[0].receipt_no.slice(prefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (!Number.isNaN(parsed)) seq = parsed + 1;
  }

  return `${prefix}${String(seq).padStart(3, "0")}`;
}
