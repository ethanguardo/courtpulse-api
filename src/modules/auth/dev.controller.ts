import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../../db";
import { JWTService } from "./jwt.service";
import { TokenService } from "./token.service";
import { env } from "../../config/env";
import type { UserRow } from "./auth.types";

/**
 * ⚠️ DEVELOPMENT ONLY CONTROLLER ⚠️
 *
 * This controller provides a test endpoint that bypasses OAuth authentication.
 * It should ONLY be used in development/testing environments.
 * The route is automatically disabled when NODE_ENV === 'production'.
 */

const devLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().optional(),
});

export class DevController {
  /**
   * POST /api/auth/dev/login
   * Development-only endpoint that creates/finds a test user and returns tokens
   * Bypasses OAuth completely for local testing
   *
   * @param req - Request with { email, name? }
   * @param res - Response with { accessToken, refreshToken, user }
   */
  static async devLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extra safety check
      if (env.NODE_ENV === "production") {
        res.status(403).json({ error: "Dev endpoints disabled in production" });
        return;
      }

      const input = devLoginSchema.parse(req.body);

      // Find or create user
      let result = await db.query<UserRow>(
        `SELECT * FROM users WHERE email = $1`,
        [input.email]
      );

      let user: UserRow;

      if (result.rows.length > 0) {
        // User exists - update last login
        user = result.rows[0];
        await db.query(
          `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
          [user.id]
        );
      } else {
        // Create new test user
        result = await db.query<UserRow>(
          `INSERT INTO users (email, name, email_verified)
           VALUES ($1, $2, true)
           RETURNING *`,
          [input.email, input.name || "Test User"]
        );
        user = result.rows[0];
      }

      // Generate tokens
      const deviceInfo = {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        source: "dev-login",
      };

      const accessToken = JWTService.generateAccessToken(user.id, user.email);
      const refreshToken = await TokenService.generateRefreshToken(
        user.id,
        env.REFRESH_TOKEN_EXPIRES_IN,
        deviceInfo
      );

      res.status(200).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePictureUrl: user.profile_picture_url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
