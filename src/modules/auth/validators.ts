import { z } from "zod";

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
  deviceInfo: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
    })
    .optional(),
});

export const appleAuthSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
  authorizationCode: z.string().optional(),
  deviceInfo: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
    })
    .optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().uuid("Invalid refresh token format"),
  deviceInfo: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
    })
    .optional(),
});

export const logoutSchema = z.object({
  refreshToken: z.string().uuid("Invalid refresh token format"),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type AppleAuthInput = z.infer<typeof appleAuthSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
