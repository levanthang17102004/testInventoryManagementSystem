import { config } from "./config/index.js";
import { createApp } from "./app.js";
import { pool } from "./db/pool.js";

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`API http://localhost:${config.port}`);
});

async function shutdown(): Promise<void> {
  server.close();
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
