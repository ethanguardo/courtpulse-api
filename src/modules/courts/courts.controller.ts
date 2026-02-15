/**
 * Courts Module - Controller Layer
 * HTTP request handlers for basketball courts endpoints
 */

import type { Request, Response, NextFunction } from "express";
import { listCourtsSchema, courtIdSchema } from "./validators";
import * as CourtsService from "./courts.service";

/**
 * GET /api/courts
 * List basketball courts with optional filters
 * Public endpoint - no authentication required
 */
export async function listCourts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate query parameters
    const query = listCourtsSchema.parse(req.query);

    // Validate location search parameters
    if (
      (query.latitude !== undefined || query.longitude !== undefined) &&
      (query.latitude === undefined || query.longitude === undefined)
    ) {
      res.status(400).json({
        error: "Both latitude and longitude are required for location search",
      });
      return;
    }

    // Execute service
    const result = await CourtsService.listCourts(query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/courts/:id
 * Get a single court by ID
 * Public endpoint - no authentication required
 */
export async function getCourtById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validate court ID
    const { id } = courtIdSchema.parse(req.params);

    // Fetch court
    const court = await CourtsService.getCourtById(id);

    if (!court) {
      res.status(404).json({
        error: "Court not found",
      });
      return;
    }

    res.status(200).json(court);
  } catch (error) {
    next(error);
  }
}
