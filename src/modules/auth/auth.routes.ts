import { Router } from "express";
import { AuthController } from "./auth.controller";
import { requireAuth } from "../../middleware/auth";

export const authRouter = Router();

// Public routes
authRouter.post("/google", AuthController.googleAuth);
authRouter.post("/apple", AuthController.appleAuth);
authRouter.post("/refresh", AuthController.refresh);

// Protected routes
authRouter.post("/logout", requireAuth, AuthController.logout);
authRouter.get("/me", requireAuth, AuthController.me);
