import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Mount auth routes
app.use("/api/auth", authRouter);

// Error handler must be last
app.use(errorHandler);
