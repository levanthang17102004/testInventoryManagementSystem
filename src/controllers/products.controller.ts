import type { Request, Response } from "express";
import { pool } from "../db/pool.js";
import { productBodySchema } from "../models/schemas.js";
import { handlePgError } from "../utils/pgError.js";
import { routeParamInt } from "../utils/routeParam.js";

export async function list(_req: Request, res: Response): Promise<void> {
  const { rows } = await pool.query("SELECT * FROM products ORDER BY id ASC");
  res.json(rows);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = routeParamInt(req, "id");
  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
    id,
  ]);
  if (rows.length === 0) {
    res.status(404).json({ error: "Không tìm thấy vật tư" });
    return;
  }
  res.json(rows[0]);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = productBodySchema.parse(req.body);
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (code, name, description, unit)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.code, data.name, data.description ?? null, data.unit],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (handlePgError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = routeParamInt(req, "id");
  const data = productBodySchema.partial().parse(req.body);
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.code !== undefined) {
    values.push(data.code);
    fields.push(`code = $${values.length}`);
  }
  if (data.name !== undefined) {
    values.push(data.name);
    fields.push(`name = $${values.length}`);
  }
  if (data.description !== undefined) {
    values.push(data.description);
    fields.push(`description = $${values.length}`);
  }
  if (data.unit !== undefined) {
    values.push(data.unit);
    fields.push(`unit = $${values.length}`);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: "Không có dữ liệu cập nhật" });
    return;
  }

  values.push(id);
  try {
    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING *`,
      values,
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Không tìm thấy vật tư" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    if (handlePgError(err, res)) return;
    throw err;
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = routeParamInt(req, "id");
  try {
    const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [
      id,
    ]);
    if (!rowCount) {
      res.status(404).json({ error: "Không tìm thấy vật tư" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    if (handlePgError(err, res)) return;
    throw err;
  }
}
