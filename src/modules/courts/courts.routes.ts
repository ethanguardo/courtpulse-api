/**
 * Courts Module - Routes
 * Express router for basketball courts endpoints
 */

import { Router } from "express";
import * as CourtsController from "./courts.controller";

export const courtsRouter = Router();

/**
 * GET /api/courts
 * List basketball courts with optional filtering
 * Query params: city, suburb, latitude, longitude, radiusKm, indoor, hasLights, limit, offset
 */
courtsRouter.get("/", CourtsController.listCourts);

/**
 * GET /api/courts/:id
 * Get a single court by ID
 */
courtsRouter.get("/:id", CourtsController.getCourtById);
