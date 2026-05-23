import type { Request, Response } from "express";
import { pool } from "../db/pool.js";
import { warehouseBodySchema } from "../models/schemas.js";
import { handlePgError } from "../utils/pgError.js";
import { routeParamInt } from "../utils/routeParam.js";

export async function list(_req: Request, res: Response): Promise<void> {
  const { rows } = await pool.query(
    "SELECT * FROM warehouses ORDER BY id ASC",
  );
  res.json(rows);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = routeParamInt(req, "id");
  const { rows } = await pool.query(
    "SELECT * FROM warehouses WHERE id = $1",
    [id],
  );
  if (rows.length === 0) {
    res.status(404).json({ error: "Không tìm thấy kho" });
    return;
  }
  res.json(rows[0]);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = warehouseBodySchema.parse(req.body);
  try {
    const { rows } = await pool.query(
      `INSERT INTO warehouses (name, location)
       VALUES ($1, $2)
       RETURNING *`,
      [data.name, data.location ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (handlePgError(err, res)) return;
    throw err;
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = routeParamInt(req, "id");
  const data = warehouseBodySchema.partial().parse(req.body);
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    values.push(data.name);
    fields.push(`name = $${values.length}`);
  }
  if (data.location !== undefined) {
    values.push(data.location);
    fields.push(`location = $${values.length}`);
  }

  if (fields.length === 0) {
    res.status(400).json({ error: "Không có dữ liệu cập nhật" });
    return;
  }

  values.push(id);
  try {
    const { rows } = await pool.query(
      `UPDATE warehouses SET ${fields.join(", ")}
       WHERE id = $${values.length}
       RETURNING *`,
      values,
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Không tìm thấy kho" });
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
    const { rowCount } = await pool.query(
      "DELETE FROM warehouses WHERE id = $1",
      [id],
    );
    if (!rowCount) {
      res.status(404).json({ error: "Không tìm thấy kho" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    if (handlePgError(err, res)) return;
    throw err;
  }
}
