import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import type { AuthRequest } from "../../middleware/auth";
import {
  googleAuthSchema,
  appleAuthSchema,
  refreshTokenSchema,
  logoutSchema,
} from "./validators";

export class AuthController {
  /**
   * POST /api/auth/google
   * Authenticate with Google Sign-In
   */
  static async googleAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = googleAuthSchema.parse(req.body);

      const deviceInfo = input.deviceInfo || {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      };

      const authResponse = await AuthService.authenticateWithGoogle(
        input.idToken,
        deviceInfo
      );

      res.status(200).json(authResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/apple
   * Authenticate with Apple Sign-In
   */
  static async appleAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = appleAuthSchema.parse(req.body);

      const deviceInfo = input.deviceInfo || {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      };

      const authResponse = await AuthService.authenticateWithApple(
        input.idToken,
        deviceInfo
      );

      res.status(200).json(authResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = refreshTokenSchema.parse(req.body);

      const deviceInfo = input.deviceInfo || {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      };

      const tokens = await AuthService.refreshAccessToken(
        input.refreshToken,
        deviceInfo
      );

      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Revoke refresh token (sign out)
   */
  static async logout(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = logoutSchema.parse(req.body);

      await AuthService.logout(input.refreshToken);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  static async me(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await AuthService.getUserById(req.user.id);

      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl,
      });
    } catch (error) {
      next(error);
    }
  }
}
