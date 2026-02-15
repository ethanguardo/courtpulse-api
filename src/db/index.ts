import { Pool } from "pg";
import { env } from "../config/env";

export const db = new Pool({
  connectionString: env.DATABASE_URL,
});

// Test connection on startup
db.on("error", (err) => {
  console.error("Unexpected database error:", err);
  process.exit(-1);
});
