import { z } from "zod";

export const createCheckinSchema = z.object({
  courtId: z.string().uuid("Invalid court ID"),
});

export const checkinIdSchema = z.object({
  id: z.string().uuid("Invalid check-in ID"),
});

export const listCheckinsSchema = z.object({
  courtId: z.string().uuid().optional(),
  includeActive: z.coerce.boolean().default(true),
  limit: z.coerce.number().positive().max(100).default(50),
  offset: z.coerce.number().nonnegative().default(0),
});

export const occupancyQuerySchema = z.object({
  courtIds: z.string().optional().transform((val) =>
    val ? val.split(',').slice(0, 50) : undefined
  ),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(50).default(5),
});
