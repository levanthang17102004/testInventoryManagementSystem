import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "sql", "schema.sql");

function parseDatabaseUrl(url: string): {
  baseUrl: string;
  database: string;
} {
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, "") || "inventory_db";
  parsed.pathname = "/postgres";
  return { baseUrl: parsed.toString(), database };
}

async function ensureDatabase(
  baseUrl: string,
  database: string,
): Promise<void> {
  const adminPool = new pg.Pool({ connectionString: baseUrl });
  try {
    const exists = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [database],
    );
    if (exists.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE "${database}"`);
      console.log(`Created database: ${database}`);
    }
  } finally {
    await adminPool.end();
  }
}

async function main(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:123456@localhost:5432/inventory_db";

  const { baseUrl, database } = parseDatabaseUrl(connectionString);
  await ensureDatabase(baseUrl, database);

  const pool = new pg.Pool({ connectionString });
  const sql = readFileSync(schemaPath, "utf-8");

  try {
    await pool.query(sql);
    console.log("Database schema applied successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
