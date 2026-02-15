/**
 * Courts Module - Routes
 * Express router for basketball courts endpoints
 */

import { Router } from "express";
import * as CourtsController from "./courts.controller";
import { CheckinsController } from "../checkins/checkins.controller";

export const courtsRouter = Router();

/**
 * GET /api/courts/occupancy
 * Get occupancy for multiple courts
 * Query params: courtIds (comma-separated) OR latitude, longitude, radiusKm
 */
courtsRouter.get("/occupancy", CheckinsController.getMultipleCourtOccupancies);

/**
 * GET /api/courts
 * List basketball courts with optional filtering
 * Query params: city, suburb, latitude, longitude, radiusKm, indoor, hasLights, limit, offset
 */
courtsRouter.get("/", CourtsController.listCourts);

/**
 * GET /api/courts/:id/occupancy
 * Get occupancy for a single court
 */
courtsRouter.get("/:id/occupancy", CheckinsController.getCourtOccupancy);

/**
 * GET /api/courts/:id
 * Get a single court by ID
 */
courtsRouter.get("/:id", CourtsController.getCourtById);
