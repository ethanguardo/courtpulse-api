import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { courtsRouter } from "./modules/courts/courts.routes";
import { errorHandler } from "./middleware/error";

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
      },
    },
    docs: "See TESTING.md and QUICK_START.md for usage examples",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Mount auth routes
app.use("/api/auth", authRouter);

// Mount courts routes
app.use("/api/courts", courtsRouter);

// Error handler must be last
app.use(errorHandler);
