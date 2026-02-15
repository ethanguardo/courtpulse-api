export interface User {
  id: string;
  googleId?: string;
  appleId?: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserRow {
  id: string;
  google_id?: string;
  apple_id?: string;
  email: string;
  email_verified: boolean;
  name?: string;
  profile_picture_url?: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at?: Date;
  device_info?: Record<string, unknown>;
}

export interface TokenPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    profilePictureUrl?: string;
  };
}

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export interface AppleTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
}

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  [key: string]: unknown;
}
