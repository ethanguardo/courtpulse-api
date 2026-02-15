import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";

/**
 * Custom error class for operational errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handler middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    res.status(400).json({
      error: "Validation error",
      details: validationErrors,
    });
    return;
  }

  // Handle operational errors (AppError)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  // Log unexpected errors
  console.error("Unexpected error:", error);

  // Don't leak error details in production
  if (env.NODE_ENV === "production") {
    res.status(500).json({
      error: "Internal server error",
    });
    return;
  }

  // Send detailed error in development
  res.status(500).json({
    error: error.message,
    stack: error.stack,
  });
};
