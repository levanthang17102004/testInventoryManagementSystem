import "dotenv/config";

function envString(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 3001,
  databaseUrl: envString(
    "DATABASE_URL",
    "postgresql://postgres:123456@localhost:5432/inventory_db",
  ),
} as const;
