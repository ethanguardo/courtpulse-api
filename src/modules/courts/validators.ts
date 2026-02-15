/**
 * Courts Module - Validation Schemas
 * Zod schemas for court endpoint validation
 */

import { z } from "zod";

/**
 * Helper to parse query string booleans
 * Handles "true", "false", "1", "0" properly
 */
const queryBoolean = z
  .union([z.string(), z.boolean()])
  .transform((val) => {
    if (typeof val === "boolean") return val;
    if (val === "true" || val === "1") return true;
    if (val === "false" || val === "0") return false;
    return undefined;
  })
  .optional();

/**
 * Validation schema for listing courts
 * Query parameters for GET /api/courts
 */
export const listCourtsSchema = z.object({
  // Location filters
  city: z.string().optional(),
  suburb: z.string().optional(),
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
  radiusKm: z.coerce
    .number()
    .positive("Radius must be positive")
    .max(50, "Maximum radius is 50km")
    .optional(),

  // Court attribute filters
  indoor: queryBoolean,
  hasLights: queryBoolean,

  // Pagination
  limit: z.coerce
    .number()
    .positive("Limit must be positive")
    .max(100, "Maximum limit is 100")
    .default(50),
  offset: z.coerce
    .number()
    .nonnegative("Offset must be non-negative")
    .default(0),
});

/**
 * Validation schema for court ID parameter
 * Used in GET /api/courts/:id
 */
export const courtIdSchema = z.object({
  id: z.string().uuid("Invalid court ID format"),
});

/**
 * Type exports for TypeScript inference
 */
export type ListCourtsInput = z.infer<typeof listCourtsSchema>;
export type CourtIdInput = z.infer<typeof courtIdSchema>;
