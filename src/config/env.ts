import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  DATABASE_URL: process.env.DATABASE_URL || "",

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: "15m" as const,
  REFRESH_TOKEN_EXPIRES_IN: "30d" as const,

  // Check-ins
  CHECKIN_EXPIRY_MINUTES: process.env.CHECKIN_EXPIRY_MINUTES
    ? Number(process.env.CHECKIN_EXPIRY_MINUTES)
    : 90,

  NODE_ENV: process.env.NODE_ENV || "development",
};

if (!env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in .env");
}

if (!env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in .env");
}

// In production, require at least one OAuth provider
// In development, allow missing OAuth for testing with dev/login endpoint
if (env.NODE_ENV === "production" && !env.GOOGLE_CLIENT_ID && !env.APPLE_CLIENT_ID) {
  throw new Error("At least one OAuth provider (GOOGLE_CLIENT_ID or APPLE_CLIENT_ID) must be configured in production");
}
