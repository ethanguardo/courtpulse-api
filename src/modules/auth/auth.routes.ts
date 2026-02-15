import { Router } from "express";
import { AuthController } from "./auth.controller";
import { DevController } from "./dev.controller";
import { requireAuth } from "../../middleware/auth";
import { env } from "../../config/env";

export const authRouter = Router();

// Public routes
authRouter.post("/google", AuthController.googleAuth);
authRouter.post("/apple", AuthController.appleAuth);
authRouter.post("/refresh", AuthController.refresh);

// Development-only routes (disabled in production)
if (env.NODE_ENV !== "production") {
  authRouter.post("/dev/login", DevController.devLogin);
}

// Protected routes
authRouter.post("/logout", requireAuth, AuthController.logout);
authRouter.get("/me", requireAuth, AuthController.me);
