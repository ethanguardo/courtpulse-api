import express from "express";
import cors from "cors";
import { pool } from "./config/db";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});


app.get("/db-test", async (_req, res) => {
  const result = await pool.query("SELECT NOW() as now");
  res.json({ now: result.rows[0].now });
});
