/**
 * Checkins Module - Service Layer
 * Business logic for check-ins and occupancy tracking
 */

import { db } from "../../db";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error";
import { calculateDistance } from "../courts/courts.service";
import type {
  Checkin,
  CheckinRow,
  CheckinWithCourt,
  Occupancy,
  OccupancyLevel,
  CourtOccupancy,
  CourtOccupancyWithDetails,
  ListCheckinsQuery,
  ListCheckinsResponse,
  OccupancyQuery,
} from "./checkins.types";

export class CheckinsService {
  /**
   * Convert database row to Checkin domain object
   */
  private static rowToCheckin(row: CheckinRow): Checkin {
    return {
      id: row.id,
      userId: row.user_id,
      courtId: row.court_id,
      checkedInAt: row.checked_in_at,
      checkedOutAt: row.checked_out_at,
      autoExpired: row.auto_expired,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Calculate occupancy level from count
   */
  private static calculateOccupancyLevel(count: number): OccupancyLevel {
    if (count === 0) return "empty";
    if (count <= 4) return "low";
    if (count <= 10) return "medium";
    if (count <= 20) return "high";
    return "full";
  }

  /**
   * Check if check-in is expired (90 minutes by default)
   */
  private static isExpired(checkedInAt: Date): boolean {
    const expiryMinutes = env.CHECKIN_EXPIRY_MINUTES || 90;
    const expiryTime = new Date(checkedInAt);
    expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
    return new Date() > expiryTime;
  }

  /**
   * Create a new check-in
   * Automatically checks out from any previous court
   */
  static async createCheckin(userId: string, courtId: string): Promise<Checkin> {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Verify court exists
      const courtResult = await client.query(
        "SELECT id FROM courts WHERE id = $1",
        [courtId]
      );

      if (courtResult.rows.length === 0) {
        throw new AppError("Court not found", 404);
      }

      // Auto-checkout from previous court (if any)
      await client.query(
        `UPDATE checkins
         SET checked_out_at = NOW(), updated_at = NOW()
         WHERE user_id = $1 AND checked_out_at IS NULL`,
        [userId]
      );

      // Create new check-in
      const result = await client.query<CheckinRow>(
        `INSERT INTO checkins (user_id, court_id)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, courtId]
      );

      await client.query("COMMIT");

      return this.rowToCheckin(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Manually check out from a check-in
   */
  static async checkoutCheckin(checkinId: string, userId: string): Promise<Checkin> {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Verify check-in exists and belongs to user
      const checkResult = await client.query<CheckinRow>(
        "SELECT * FROM checkins WHERE id = $1",
        [checkinId]
      );

      if (checkResult.rows.length === 0) {
        throw new AppError("Check-in not found", 404);
      }

      const checkin = checkResult.rows[0];

      if (checkin.user_id !== userId) {
        throw new AppError("Not authorized to check out this check-in", 403);
      }

      if (checkin.checked_out_at !== null) {
        throw new AppError("Already checked out", 400);
      }

      // Update check-out timestamp
      const result = await client.query<CheckinRow>(
        `UPDATE checkins
         SET checked_out_at = NOW(), updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [checkinId]
      );

      await client.query("COMMIT");

      return this.rowToCheckin(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user's current active check-in
   */
  static async getActiveCheckin(
    userId: string
  ): Promise<CheckinWithCourt | null> {
    const expiryMinutes = env.CHECKIN_EXPIRY_MINUTES || 90;

    const result = await db.query<CheckinRow & {
      court_name: string;
      court_address: string | null;
      court_city: string;
      court_latitude: string;
      court_longitude: string;
    }>(
      `SELECT
         c.*,
         co.name as court_name,
         co.address as court_address,
         co.city as court_city,
         co.latitude as court_latitude,
         co.longitude as court_longitude
       FROM checkins c
       INNER JOIN courts co ON c.court_id = co.id
       WHERE c.user_id = $1
         AND c.checked_out_at IS NULL
         AND c.checked_in_at > NOW() - INTERVAL '${expiryMinutes} minutes'
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      ...this.rowToCheckin(row),
      court: {
        id: row.court_id,
        name: row.court_name,
        address: row.court_address || undefined,
        city: row.court_city,
        latitude: parseFloat(row.court_latitude),
        longitude: parseFloat(row.court_longitude),
      },
    };
  }

  /**
   * Get user's check-in history
   */
  static async getUserCheckins(
    userId: string,
    query: ListCheckinsQuery
  ): Promise<ListCheckinsResponse> {
    const { courtId, includeActive = true, limit = 50, offset = 0 } = query;
    const expiryMinutes = env.CHECKIN_EXPIRY_MINUTES || 90;

    // Build query
    let sql = `
      SELECT
        c.*,
        co.name as court_name,
        co.address as court_address,
        co.city as court_city,
        co.latitude as court_latitude,
        co.longitude as court_longitude
      FROM checkins c
      INNER JOIN courts co ON c.court_id = co.id
      WHERE c.user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    // Filter by court ID if provided
    if (courtId) {
      sql += ` AND c.court_id = $${paramIndex}`;
      params.push(courtId);
      paramIndex++;
    }

    // Filter out active check-ins if requested
    if (!includeActive) {
      sql += ` AND (c.checked_out_at IS NOT NULL OR c.checked_in_at <= NOW() - INTERVAL '${expiryMinutes} minutes')`;
    }

    // Get total count
    const countSql = sql.replace(/SELECT[\s\S]*FROM/i, "SELECT COUNT(*) as count FROM");
    const countResult = await db.query(countSql, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Add ordering and pagination
    sql += " ORDER BY c.checked_in_at DESC";
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const result = await db.query<CheckinRow & {
      court_name: string;
      court_address: string | null;
      court_city: string;
      court_latitude: string;
      court_longitude: string;
    }>(sql, params);

    const data: CheckinWithCourt[] = result.rows.map((row) => ({
      ...this.rowToCheckin(row),
      court: {
        id: row.court_id,
        name: row.court_name,
        address: row.court_address || undefined,
        city: row.court_city,
        latitude: parseFloat(row.court_latitude),
        longitude: parseFloat(row.court_longitude),
      },
    }));

    return {
      data,
      meta: {
        total,
        limit,
        offset,
      },
    };
  }

  /**
   * Get occupancy for a single court
   */
  static async getCourtOccupancy(courtId: string): Promise<CourtOccupancy> {
    // Verify court exists
    const courtCheck = await db.query("SELECT id FROM courts WHERE id = $1", [
      courtId,
    ]);

    if (courtCheck.rows.length === 0) {
      throw new AppError("Court not found", 404);
    }

    const expiryMinutes = env.CHECKIN_EXPIRY_MINUTES || 90;

    // Count active check-ins
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM checkins
       WHERE court_id = $1
         AND checked_out_at IS NULL
         AND checked_in_at > NOW() - INTERVAL '${expiryMinutes} minutes'`,
      [courtId]
    );

    const count = parseInt(result.rows[0].count, 10);
    const level = this.calculateOccupancyLevel(count);

    return {
      courtId,
      occupancy: {
        count,
        level,
      },
    };
  }

  /**
   * Get occupancy for multiple courts
   * Supports filtering by court IDs or location-based search
   */
  static async getMultipleCourtOccupancies(
    query: OccupancyQuery
  ): Promise<CourtOccupancyWithDetails[]> {
    const { courtIds, latitude, longitude, radiusKm = 5 } = query;
    const expiryMinutes = env.CHECKIN_EXPIRY_MINUTES || 90;

    let courtIdList: string[] = [];

    // Get court IDs based on query type
    if (courtIds && courtIds.length > 0) {
      // Direct court IDs provided
      courtIdList = courtIds;
    } else if (latitude !== undefined && longitude !== undefined) {
      // Location-based search
      // Calculate bounding box
      const latDelta = radiusKm / 111;
      const lonDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

      const minLat = latitude - latDelta;
      const maxLat = latitude + latDelta;
      const minLon = longitude - lonDelta;
      const maxLon = longitude + lonDelta;

      // Get courts within bounding box
      const courtsResult = await db.query(
        `SELECT id, name, address, city, suburb, latitude, longitude
         FROM courts
         WHERE latitude BETWEEN $1 AND $2
           AND longitude BETWEEN $3 AND $4`,
        [minLat, maxLat, minLon, maxLon]
      );

      // Filter by exact radius and collect court IDs
      const courtsWithDistance = courtsResult.rows
        .map((row) => ({
          id: row.id,
          name: row.name,
          address: row.address,
          city: row.city,
          suburb: row.suburb,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          distance: calculateDistance(
            latitude,
            longitude,
            parseFloat(row.latitude),
            parseFloat(row.longitude)
          ),
        }))
        .filter((court) => court.distance <= radiusKm);

      courtIdList = courtsWithDistance.map((c) => c.id);

      // If no courts found, return empty array
      if (courtIdList.length === 0) {
        return [];
      }
    } else {
      throw new AppError(
        "Either courtIds or latitude/longitude must be provided",
        400
      );
    }

    // Get occupancy data for all courts in one query
    const occupancyResult = await db.query<{
      court_id: string;
      count: string;
      name: string;
      address: string | null;
      city: string;
      suburb: string | null;
      latitude: string;
      longitude: string;
    }>(
      `SELECT
         co.id as court_id,
         co.name,
         co.address,
         co.city,
         co.suburb,
         co.latitude,
         co.longitude,
         COUNT(c.id) as count
       FROM courts co
       LEFT JOIN checkins c ON co.id = c.court_id
         AND c.checked_out_at IS NULL
         AND c.checked_in_at > NOW() - INTERVAL '${expiryMinutes} minutes'
       WHERE co.id = ANY($1)
       GROUP BY co.id`,
      [courtIdList]
    );

    // Build response with occupancy data
    const results: CourtOccupancyWithDetails[] = occupancyResult.rows.map((row) => {
      const count = parseInt(row.count, 10);
      const level = this.calculateOccupancyLevel(count);
      const courtLat = parseFloat(row.latitude);
      const courtLon = parseFloat(row.longitude);

      const result: CourtOccupancyWithDetails = {
        courtId: row.court_id,
        occupancy: {
          count,
          level,
        },
        court: {
          id: row.court_id,
          name: row.name,
          address: row.address || undefined,
          city: row.city,
          suburb: row.suburb || undefined,
          latitude: courtLat,
          longitude: courtLon,
        },
      };

      // Add distance if location-based search
      if (latitude !== undefined && longitude !== undefined) {
        result.court.distance = calculateDistance(
          latitude,
          longitude,
          courtLat,
          courtLon
        );
      }

      return result;
    });

    // Sort by distance if location-based
    if (latitude !== undefined && longitude !== undefined) {
      results.sort((a, b) => (a.court.distance || 0) - (b.court.distance || 0));
    }

    return results;
  }
}
