/**
 * Checkins Module - Routes
 * Express routes for check-in endpoints
 */

import { Router } from "express";
import { CheckinsController } from "./checkins.controller";
import { requireAuth } from "../../middleware/auth";

export const checkinsRouter = Router();

// All check-in routes require authentication
checkinsRouter.post("/", requireAuth, CheckinsController.createCheckin);
checkinsRouter.post(
  "/:id/checkout",
  requireAuth,
  CheckinsController.checkoutCheckin
);
checkinsRouter.get("/active", requireAuth, CheckinsController.getActiveCheckin);
checkinsRouter.get("/", requireAuth, CheckinsController.getUserCheckins);
