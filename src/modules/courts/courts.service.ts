/**
 * Courts Module - Service Layer
 * Business logic and database queries for basketball courts
 */

import { db } from "../../db";
import type {
  Court,
  CourtRow,
  ListCourtsQuery,
  ListCourtsResponse,
} from "./courts.types";

/**
 * List basketball courts with optional filtering
 * Supports location-based search (radius) or city/suburb filtering
 */
export async function listCourts(
  query: ListCourtsQuery
): Promise<ListCourtsResponse> {
  const {
    city,
    suburb,
    latitude,
    longitude,
    radiusKm = 5,
    indoor,
    hasLights,
    limit = 50,
    offset = 0,
  } = query;

  // Build dynamic query based on filters
  let sql = "SELECT * FROM courts WHERE 1=1";
  const params: any[] = [];
  let paramIndex = 1;

  // Location-based search (radius) - using bounding box filter
  if (latitude !== undefined && longitude !== undefined) {
    // Calculate bounding box (approximate)
    // 1 degree of latitude ≈ 111 km
    // 1 degree of longitude ≈ 111 km * cos(latitude)
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLon = longitude - lonDelta;
    const maxLon = longitude + lonDelta;

    // Bounding box filter (fast pre-filter)
    sql += ` AND latitude BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
    sql += ` AND longitude BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}`;
    params.push(minLat, maxLat, minLon, maxLon);
    paramIndex += 4;
  } else {
    // City/suburb filtering (no distance calculation)
    if (city) {
      sql += ` AND city ILIKE $${paramIndex}`;
      params.push(city);
      paramIndex++;
    }

    if (suburb) {
      sql += ` AND suburb ILIKE $${paramIndex}`;
      params.push(suburb);
      paramIndex++;
    }
  }

  // Court attribute filters
  if (indoor !== undefined) {
    sql += ` AND indoor = $${paramIndex}`;
    params.push(indoor);
    paramIndex++;
  }

  if (hasLights !== undefined) {
    sql += ` AND has_lights = $${paramIndex}`;
    params.push(hasLights);
    paramIndex++;
  }

  // Execute query (without pagination yet if location-based)
  let queryResult = await db.query(sql, params);

  // If location-based search, calculate distances and filter by exact radius
  let courts: Court[];
  let total: number;

  if (latitude !== undefined && longitude !== undefined) {
    // Calculate exact distances using Haversine formula
    const courtsWithDistance = queryResult.rows.map((row: CourtRow) => {
      const court = rowToCourt(row);
      court.distance = calculateDistance(
        latitude,
        longitude,
        court.latitude,
        court.longitude
      );
      return court;
    });

    // Filter by exact radius
    const filteredCourts = courtsWithDistance.filter(
      (court) => court.distance! <= radiusKm
    );

    // Sort by distance
    filteredCourts.sort((a, b) => a.distance! - b.distance!);

    total = filteredCourts.length;

    // Apply pagination
    courts = filteredCourts.slice(offset, offset + limit);
  } else {
    // Non-location search: use database count and pagination
    const countSql = sql.replace(/SELECT \*/i, "SELECT COUNT(*) as count");
    const countResult = await db.query(countSql, params);
    total = parseInt(countResult.rows[0].count, 10);

    // Add ordering and pagination
    sql += " ORDER BY name";
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute paginated query
    const paginatedResult = await db.query(sql, params);
    courts = paginatedResult.rows.map(rowToCourt);
  }

  return {
    data: courts,
    meta: {
      total,
      limit,
      offset,
    },
  };
}

/**
 * Get a single court by ID
 */
export async function getCourtById(id: string): Promise<Court | null> {
  const result = await db.query("SELECT * FROM courts WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return rowToCourt(result.rows[0]);
}

/**
 * Convert database row to Court domain object
 * Transforms snake_case to camelCase and parses types
 */
function rowToCourt(row: CourtRow): Court {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    suburb: row.suburb,
    city: row.city,
    state: row.state,
    postcode: row.postcode,
    country: row.country,
    numHoops: row.num_hoops,
    indoor: row.indoor,
    surfaceType: row.surface_type,
    hasLights: row.has_lights,
    description: row.description,
    facilities: row.facilities as any,
    distance: row.distance ? Math.round(row.distance * 10) / 10 : undefined, // Round to 1 decimal
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * (Fallback if PostGIS not available - not currently used)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
