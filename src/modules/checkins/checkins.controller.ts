/**
 * Checkins Module - Controller Layer
 * HTTP request handlers for check-in endpoints
 */

import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { CheckinsService } from "./checkins.service";
import {
  createCheckinSchema,
  checkinIdSchema,
  listCheckinsSchema,
  occupancyQuerySchema,
} from "./validators";

export class CheckinsController {
  /**
   * POST /api/checkins
   * Create a new check-in
   * Auth: Required
   */
  static async createCheckin(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = createCheckinSchema.parse(req.body);

      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const checkin = await CheckinsService.createCheckin(
        req.user.id,
        input.courtId
      );

      res.status(201).json(checkin);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/checkins/:id/checkout
   * Manually check out from a check-in
   * Auth: Required
   */
  static async checkoutCheckin(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = checkinIdSchema.parse(req.params);

      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const checkin = await CheckinsService.checkoutCheckin(id, req.user.id);

      res.status(200).json(checkin);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/checkins/active
   * Get user's current active check-in
   * Auth: Required
   */
  static async getActiveCheckin(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const checkin = await CheckinsService.getActiveCheckin(req.user.id);

      if (!checkin) {
        res.status(200).json({ active: false });
        return;
      }

      res.status(200).json(checkin);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/checkins
   * Get user's check-in history
   * Auth: Required
   */
  static async getUserCheckins(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = listCheckinsSchema.parse(req.query);

      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const result = await CheckinsService.getUserCheckins(req.user.id, query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courts/:id/occupancy
   * Get occupancy for a single court
   * Auth: Not required (public)
   */
  static async getCourtOccupancy(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = checkinIdSchema.parse(req.params);

      const occupancy = await CheckinsService.getCourtOccupancy(id);

      res.status(200).json({
        ...occupancy,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courts/occupancy
   * Get occupancy for multiple courts
   * Auth: Not required (public)
   */
  static async getMultipleCourtOccupancies(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = occupancyQuerySchema.parse(req.query);

      // Validate that either courtIds or location is provided
      if (
        !query.courtIds &&
        (query.latitude === undefined || query.longitude === undefined)
      ) {
        res.status(400).json({
          error: "Either courtIds or latitude/longitude must be provided",
        });
        return;
      }

      // Validate location search parameters (both or neither)
      if (
        (query.latitude !== undefined || query.longitude !== undefined) &&
        (query.latitude === undefined || query.longitude === undefined)
      ) {
        res.status(400).json({
          error: "Both latitude and longitude are required for location search",
        });
        return;
      }

      const results = await CheckinsService.getMultipleCourtOccupancies(query);

      res.status(200).json({
        data: results,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
