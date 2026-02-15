import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import type { TokenPayload } from "./auth.types";

export class JWTService {
  /**
   * Generate a JWT access token
   * @param userId - User's unique identifier
   * @param email - User's email address
   * @returns Signed JWT token
   */
  static generateAccessToken(userId: string, email: string): string {
    const payload: Omit<TokenPayload, "iat" | "exp"> = {
      sub: userId,
      email,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  /**
   * Verify and decode a JWT access token
   * @param token - JWT token to verify
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw error;
    }
  }
}
