import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { AppError } from "../../middleware/error";
import type { DeviceInfo, RefreshTokenRow } from "./auth.types";

export class TokenService {
  private static readonly HASH_ROUNDS = 10;

  /**
   * Calculate token expiration date based on duration string
   * @param duration - Duration string like "30d", "7d"
   * @returns Date object
   */
  private static getExpirationDate(duration: string): Date {
    const days = Number.parseInt(duration.replace("d", ""));
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  /**
   * Generate a refresh token and store it in the database
   * @param userId - User's unique identifier
   * @param expiresIn - Expiration duration (e.g., "30d")
   * @param deviceInfo - Optional device information
   * @returns Plain text refresh token (UUID)
   */
  static async generateRefreshToken(
    userId: string,
    expiresIn: string,
    deviceInfo?: DeviceInfo
  ): Promise<string> {
    const token = randomUUID();
    const tokenHash = await bcrypt.hash(token, this.HASH_ROUNDS);
    const expiresAt = this.getExpirationDate(expiresIn);

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info)
       VALUES ($1, $2, $3, $4)`,
      [userId, tokenHash, expiresAt, deviceInfo ? JSON.stringify(deviceInfo) : null]
    );

    return token;
  }

  /**
   * Validate a refresh token
   * @param token - Plain text refresh token
   * @returns Token row if valid
   * @throws Error if token is invalid, expired, or revoked
   */
  static async validateRefreshToken(token: string): Promise<RefreshTokenRow> {
    // Get all non-revoked tokens (we need to hash-compare each one)
    const result = await db.query<RefreshTokenRow>(
      `SELECT * FROM refresh_tokens
       WHERE revoked_at IS NULL
       AND expires_at > NOW()`
    );

    // Find matching token by comparing hashes
    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(token, row.token_hash);
      if (isMatch) {
        return row;
      }
    }

    throw new AppError("Invalid or expired refresh token", 401);
  }

  /**
   * Revoke a single refresh token
   * @param token - Plain text refresh token
   */
  static async revokeRefreshToken(token: string): Promise<void> {
    // Find and revoke the token
    const result = await db.query<RefreshTokenRow>(
      `SELECT * FROM refresh_tokens WHERE revoked_at IS NULL`
    );

    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(token, row.token_hash);
      if (isMatch) {
        await db.query(
          `UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1`,
          [row.id]
        );
        return;
      }
    }
  }

  /**
   * Revoke all refresh tokens for a user (security breach response)
   * @param userId - User's unique identifier
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    await db.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  }

  /**
   * Delete a refresh token (for token rotation)
   * @param token - Plain text refresh token
   */
  static async deleteRefreshToken(token: string): Promise<void> {
    const result = await db.query<RefreshTokenRow>(
      `SELECT * FROM refresh_tokens WHERE revoked_at IS NULL`
    );

    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(token, row.token_hash);
      if (isMatch) {
        await db.query(`DELETE FROM refresh_tokens WHERE id = $1`, [row.id]);
        return;
      }
    }
  }

  /**
   * Check if a token has been used before (reuse detection)
   * @param token - Plain text refresh token
   * @returns userId if token was previously used (revoked), null otherwise
   */
  static async checkTokenReuse(token: string): Promise<string | null> {
    const result = await db.query<RefreshTokenRow>(
      `SELECT * FROM refresh_tokens WHERE revoked_at IS NOT NULL`
    );

    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(token, row.token_hash);
      if (isMatch) {
        return row.user_id;
      }
    }

    return null;
  }
}
