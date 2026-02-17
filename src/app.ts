import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { courtsRouter } from "./modules/courts/courts.routes";
import { checkinsRouter } from "./modules/checkins/checkins.routes";
import { errorHandler } from "./middleware/error";
import { pool } from "./config/db";

export const app = express();

app.use(cors());
app.use(express.json());

// Root route - API info
app.get("/", (_req, res) => {
  res.json({
    name: "CourtPulse API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "GET /health",
      auth: {
        devLogin: "POST /api/auth/dev/login",
        google: "POST /api/auth/google",
        apple: "POST /api/auth/apple",
        refresh: "POST /api/auth/refresh",
        logout: "POST /api/auth/logout",
        me: "GET /api/auth/me",
      },
      courts: {
        list: "GET /api/courts",
        getById: "GET /api/courts/:id",
        occupancy: "GET /api/courts/occupancy",
        courtOccupancy: "GET /api/courts/:id/occupancy",
      },
      checkins: {
        create: "POST /api/checkins",
        checkout: "POST /api/checkins/:id/checkout",
        active: "GET /api/checkins/active",
        history: "GET /api/checkins",
      },
    },
    docs: "See TESTING.md and QUICK_START.md for usage examples",
  });
});

app.get("/health", async (_req, res) => {
  const health: any = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };

  // Check database connection
  try {
    const result = await pool.query("SELECT NOW() as time, version() as version");
    health.database = {
      status: "connected",
      serverTime: result.rows[0].time,
      version: result.rows[0].version.split(" ")[0] + " " + result.rows[0].version.split(" ")[1],
    };
  } catch (error) {
    health.status = "degraded";
    health.database = {
      status: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Return appropriate status code
  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

// Mount auth routes
app.use("/api/auth", authRouter);

// Mount courts routes
app.use("/api/courts", courtsRouter);

// Mount checkins routes
app.use("/api/checkins", checkinsRouter);

// Error handler must be last
app.use(errorHandler);
