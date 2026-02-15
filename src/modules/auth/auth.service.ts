import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";
import { db } from "../../db";
import { env } from "../../config/env";
import { JWTService } from "./jwt.service";
import { TokenService } from "./token.service";
import type {
  User,
  UserRow,
  AuthResponse,
  DeviceInfo,
  GoogleTokenPayload,
  AppleTokenPayload,
} from "./auth.types";

export class AuthService {
  private static googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

  /**
   * Convert database row to User object
   */
  private static rowToUser(row: UserRow): User {
    return {
      id: row.id,
      googleId: row.google_id,
      appleId: row.apple_id,
      email: row.email,
      emailVerified: row.email_verified,
      name: row.name,
      profilePictureUrl: row.profile_picture_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
    };
  }

  /**
   * Authenticate with Google Sign-In
   * @param idToken - Google ID token from mobile app
   * @param deviceInfo - Optional device information
   * @returns Authentication response with tokens and user data
   */
  static async authenticateWithGoogle(
    idToken: string,
    deviceInfo?: DeviceInfo
  ): Promise<AuthResponse> {
    // Verify Google ID token
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as GoogleTokenPayload;
    if (!payload) {
      throw new Error("Invalid Google token");
    }

    const { sub: googleId, email, email_verified, name, picture } = payload;

    if (!email) {
      throw new Error("Email not provided by Google");
    }

    // Find or create user
    let user = await this.findOrCreateGoogleUser({
      googleId,
      email,
      emailVerified: email_verified || false,
      name,
      profilePictureUrl: picture,
    });

    // Update last login
    await db.query(
      `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [user.id]
    );

    // Generate tokens
    const accessToken = JWTService.generateAccessToken(user.id, user.email);
    const refreshToken = await TokenService.generateRefreshToken(
      user.id,
      env.REFRESH_TOKEN_EXPIRES_IN,
      deviceInfo
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl,
      },
    };
  }

  /**
   * Authenticate with Apple Sign-In
   * @param idToken - Apple ID token from mobile app
   * @param deviceInfo - Optional device information
   * @returns Authentication response with tokens and user data
   */
  static async authenticateWithApple(
    idToken: string,
    deviceInfo?: DeviceInfo
  ): Promise<AuthResponse> {
    // Verify Apple ID token
    const payload = (await appleSignin.verifyIdToken(idToken, {
      audience: env.APPLE_CLIENT_ID,
    })) as AppleTokenPayload;

    if (!payload) {
      throw new Error("Invalid Apple token");
    }

    const { sub: appleId, email, email_verified } = payload;

    if (!email) {
      throw new Error("Email not provided by Apple");
    }

    // Find or create user
    let user = await this.findOrCreateAppleUser({
      appleId,
      email,
      emailVerified: email_verified || false,
    });

    // Update last login
    await db.query(
      `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [user.id]
    );

    // Generate tokens
    const accessToken = JWTService.generateAccessToken(user.id, user.email);
    const refreshToken = await TokenService.generateRefreshToken(
      user.id,
      env.REFRESH_TOKEN_EXPIRES_IN,
      deviceInfo
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token
   * @param deviceInfo - Optional device information
   * @returns New access token and refresh token
   */
  static async refreshAccessToken(
    refreshToken: string,
    deviceInfo?: DeviceInfo
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Check for token reuse (security breach)
    const reuseUserId = await TokenService.checkTokenReuse(refreshToken);
    if (reuseUserId) {
      // Token reuse detected - revoke all user's tokens
      await TokenService.revokeAllUserTokens(reuseUserId);
      throw new Error("Token reuse detected - all tokens revoked");
    }

    // Validate refresh token
    const tokenRow = await TokenService.validateRefreshToken(refreshToken);

    // Get user
    const result = await db.query<UserRow>(
      `SELECT * FROM users WHERE id = $1`,
      [tokenRow.user_id]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = this.rowToUser(result.rows[0]);

    // Delete old refresh token (token rotation)
    await TokenService.deleteRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = JWTService.generateAccessToken(user.id, user.email);
    const newRefreshToken = await TokenService.generateRefreshToken(
      user.id,
      env.REFRESH_TOKEN_EXPIRES_IN,
      deviceInfo
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user by revoking refresh token
   * @param refreshToken - Refresh token to revoke
   */
  static async logout(refreshToken: string): Promise<void> {
    await TokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Get user by ID
   * @param userId - User's unique identifier
   * @returns User object
   */
  static async getUserById(userId: string): Promise<User> {
    const result = await db.query<UserRow>(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return this.rowToUser(result.rows[0]);
  }

  /**
   * Find or create user by Google ID
   */
  private static async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    profilePictureUrl?: string;
  }): Promise<User> {
    // Try to find existing user by google_id
    let result = await db.query<UserRow>(
      `SELECT * FROM users WHERE google_id = $1`,
      [data.googleId]
    );

    if (result.rows.length > 0) {
      // Update user profile if data has changed
      const existingUser = result.rows[0];
      const needsUpdate =
        existingUser.name !== data.name ||
        existingUser.profile_picture_url !== data.profilePictureUrl ||
        existingUser.email_verified !== data.emailVerified;

      if (needsUpdate) {
        result = await db.query<UserRow>(
          `UPDATE users
           SET name = $1, profile_picture_url = $2, email_verified = $3, updated_at = NOW()
           WHERE id = $4
           RETURNING *`,
          [data.name, data.profilePictureUrl, data.emailVerified, existingUser.id]
        );
      }

      return this.rowToUser(result.rows[0]);
    }

    // Try to find by email (account linking scenario)
    result = await db.query<UserRow>(`SELECT * FROM users WHERE email = $1`, [
      data.email,
    ]);

    if (result.rows.length > 0) {
      // Link Google account to existing user
      result = await db.query<UserRow>(
        `UPDATE users
         SET google_id = $1, name = $2, profile_picture_url = $3,
             email_verified = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [
          data.googleId,
          data.name,
          data.profilePictureUrl,
          data.emailVerified,
          result.rows[0].id,
        ]
      );

      return this.rowToUser(result.rows[0]);
    }

    // Create new user
    result = await db.query<UserRow>(
      `INSERT INTO users (google_id, email, email_verified, name, profile_picture_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.googleId, data.email, data.emailVerified, data.name, data.profilePictureUrl]
    );

    return this.rowToUser(result.rows[0]);
  }

  /**
   * Find or create user by Apple ID
   */
  private static async findOrCreateAppleUser(data: {
    appleId: string;
    email: string;
    emailVerified: boolean;
  }): Promise<User> {
    // Try to find existing user by apple_id
    let result = await db.query<UserRow>(
      `SELECT * FROM users WHERE apple_id = $1`,
      [data.appleId]
    );

    if (result.rows.length > 0) {
      return this.rowToUser(result.rows[0]);
    }

    // Try to find by email (account linking scenario)
    result = await db.query<UserRow>(`SELECT * FROM users WHERE email = $1`, [
      data.email,
    ]);

    if (result.rows.length > 0) {
      // Link Apple account to existing user
      result = await db.query<UserRow>(
        `UPDATE users
         SET apple_id = $1, email_verified = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [data.appleId, data.emailVerified, result.rows[0].id]
      );

      return this.rowToUser(result.rows[0]);
    }

    // Create new user
    result = await db.query<UserRow>(
      `INSERT INTO users (apple_id, email, email_verified)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.appleId, data.email, data.emailVerified]
    );

    return this.rowToUser(result.rows[0]);
  }
}
