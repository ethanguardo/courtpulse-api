import type { Request, Response, NextFunction } from "express";
import { JWTService } from "../modules/auth/jwt.service";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Middleware to require authentication
 * Extracts JWT from Authorization header, verifies it, and attaches user data to request
 */
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({ error: "Invalid authorization header format" });
      return;
    }

    const token = parts[1];

    // Verify JWT
    const payload = JWTService.verifyAccessToken(token);

    // Attach user data to request
    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Token expired") {
        res.status(401).json({ error: "Token expired" });
        return;
      }
      if (error.message === "Invalid token") {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
    }
    res.status(401).json({ error: "Authentication failed" });
  }
};
