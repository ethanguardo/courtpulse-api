# CourtPulse API

A comprehensive backend API for basketball court discovery and real-time occupancy tracking. Built with Node.js, TypeScript, Express, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Architecture](#project-architecture)
- [Database Schema](#database-schema)
- [Environment Configuration](#environment-configuration)
- [API Reference](#api-reference)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Available Commands](#available-commands)
- [Local URLs](#local-urls)
- [Current Limitations](#current-limitations)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Code Style & Patterns](#code-style--patterns)

---

## Overview

**CourtPulse** is a mobile-first API that helps basketball players discover courts, check in when they're playing, and see real-time occupancy levels at nearby courts.

### Key Features

✅ **Authentication System**
- OAuth integration (Google Sign-In, Apple Sign-In)
- JWT-based access tokens (15-minute expiry)
- Refresh token rotation (30-day expiry)
- Token reuse detection for security
- Development login endpoint for testing

✅ **Basketball Court Discovery**
- Location-based court search (PostGIS)
- Filter by city, suburb, indoor/outdoor, lighting
- Distance-based queries (find courts within X km)
- Court details (hoops, surface, facilities)

✅ **Check-ins & Occupancy Tracking**
- Check in at courts when playing
- Automatic checkout when switching courts
- Check-in auto-expiry (90 minutes default)
- Real-time occupancy levels (empty, low, moderate, high, full)
- Check-in history tracking

### Technology Stack

- **Runtime:** Node.js 18+ with TypeScript 5.9
- **Framework:** Express 5.2.1
- **Database:** PostgreSQL 15+ with PostGIS extension
- **Authentication:** JWT (jsonwebtoken), Google OAuth, Apple Sign-In
- **Validation:** Zod 4.3
- **Development:** ts-node-dev (hot reload)
- **Database Client:** node-postgres (pg)

---

## Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 15 or higher
- **PostGIS extension** (for geolocation queries)
- **Package manager:** npm

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd courtpulse-api
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

Required `.env` configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/courtpulse
JWT_SECRET=your-secret-key-min-32-chars-long
PORT=3000
NODE_ENV=development
```

4. **Create PostgreSQL database:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE courtpulse;"

# Enable PostGIS extension
psql -U postgres -d courtpulse -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

5. **Run database migrations:**
```bash
# Set DATABASE_URL from .env
source .env

# Run migrations in order
psql $DATABASE_URL < src/db/migrations/001_create_auth_tables.sql
psql $DATABASE_URL < src/db/migrations/002_create_courts_table.sql
psql $DATABASE_URL < src/db/migrations/003_create_checkins_table.sql
```

6. **Start the development server:**
```bash
npm run dev
```

Server will start at: **http://localhost:3000**

7. **Test your first API call:**
```bash
# Check server health
curl http://localhost:3000/health

# View all available endpoints
curl http://localhost:3000/

# Dev login (no OAuth required)
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

---

## Project Architecture

### Directory Structure

```
courtpulse-api/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── env.ts                # Environment variables validation
│   │   └── db.ts                 # Database connection pool
│   ├── db/
│   │   ├── index.ts              # Database utilities
│   │   └── migrations/           # SQL migration files
│   │       ├── 001_create_auth_tables.sql
│   │       ├── 002_create_courts_table.sql
│   │       └── 003_create_checkins_table.sql
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication middleware
│   │   └── error.ts              # Global error handler
│   └── modules/                  # Feature modules (MVC pattern)
│       ├── auth/
│       │   ├── auth.routes.ts    # Route definitions
│       │   ├── auth.controller.ts # HTTP handlers
│       │   ├── auth.service.ts   # Business logic
│       │   ├── jwt.service.ts    # JWT token generation
│       │   ├── token.service.ts  # Refresh token management
│       │   ├── validators.ts     # Zod schemas
│       │   └── auth.types.ts     # TypeScript types
│       ├── courts/
│       │   ├── courts.routes.ts
│       │   ├── courts.controller.ts
│       │   ├── courts.service.ts
│       │   ├── courts.types.ts
│       │   └── validators.ts
│       └── checkins/
│           ├── checkins.routes.ts
│           ├── checkins.controller.ts
│           ├── checkins.service.ts
│           ├── checkins.types.ts
│           └── validators.ts
├── scripts/
│   ├── test-auth.sh              # Automated auth testing
│   ├── db-inspect.sh             # Database inspection tool
│   └── troubleshoot.sh           # Diagnostic script
├── dist/                         # Compiled JavaScript (gitignored)
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── TESTING.md                    # Detailed testing guide
├── QUICK_START.md                # Quick reference
└── README.md                     # This file
```

### Module Pattern (MVC + Services)

Each feature module follows this structure:

**Routes Layer** (`*.routes.ts`)
- Defines HTTP endpoints and methods
- Maps routes to controllers
- Applies middleware (authentication, validation)

**Controller Layer** (`*.controller.ts`)
- Handles HTTP request/response
- Validates input with Zod schemas
- Calls service layer
- Formats responses

**Service Layer** (`*.service.ts`)
- Contains business logic
- Interacts with database
- Handles transactions
- No HTTP knowledge

**Validators** (`validators.ts`)
- Zod schemas for request validation
- Type inference for TypeScript

**Types** (`*.types.ts`)
- TypeScript interfaces and types
- Database row types
- API response types

### Request Flow

```
HTTP Request
    ↓
Routes (auth.routes.ts)
    ↓
Middleware (auth.ts, error.ts)
    ↓
Controller (auth.controller.ts)
    ↓
Validation (validators.ts)
    ↓
Service (auth.service.ts)
    ↓
Database (db pool)
    ↓
Service Response
    ↓
Controller Response
    ↓
HTTP Response
```

---

## Database Schema

### Tables Overview

#### `users` - User accounts
Stores user profile information from OAuth providers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `google_id` | VARCHAR(255) | Google OAuth user ID (unique) |
| `apple_id` | VARCHAR(255) | Apple Sign-In user ID (unique) |
| `email` | VARCHAR(255) | User email (unique, required) |
| `email_verified` | BOOLEAN | Email verification status |
| `name` | VARCHAR(255) | User display name |
| `profile_picture_url` | TEXT | URL to profile picture |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `last_login_at` | TIMESTAMPTZ | Last successful login |

**Indexes:**
- `idx_users_google_id` on `google_id`
- `idx_users_apple_id` on `apple_id`
- `idx_users_email` on `email`

#### `refresh_tokens` - Refresh token management
Stores refresh tokens for JWT authentication (tokens are hashed).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `token_hash` | VARCHAR(255) | Hashed refresh token (unique) |
| `expires_at` | TIMESTAMPTZ | Token expiration (30 days) |
| `created_at` | TIMESTAMPTZ | Token creation timestamp |
| `revoked_at` | TIMESTAMPTZ | Token revocation timestamp (NULL = active) |
| `device_info` | JSONB | Device metadata (optional) |

**Indexes:**
- `idx_refresh_tokens_user_id` on `user_id`
- `idx_refresh_tokens_token_hash` on `token_hash`
- `idx_refresh_tokens_expires_at` on `expires_at`

**Constraints:**
- `ON DELETE CASCADE` - deletes all tokens when user is deleted

#### `courts` - Basketball courts
Stores basketball court locations and details.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Court name (required) |
| `address` | TEXT | Street address |
| `latitude` | NUMERIC(10,8) | Latitude coordinate |
| `longitude` | NUMERIC(11,8) | Longitude coordinate |
| `location` | POINT | PostGIS point for spatial queries |
| `suburb` | VARCHAR(100) | Suburb/neighborhood |
| `city` | VARCHAR(100) | City (required) |
| `state` | VARCHAR(50) | State/province (required) |
| `postcode` | VARCHAR(10) | Postal code |
| `country` | VARCHAR(100) | Country (default: 'Australia') |
| `num_hoops` | INTEGER | Number of basketball hoops |
| `indoor` | BOOLEAN | Indoor court flag |
| `surface_type` | VARCHAR(50) | Surface material (concrete, asphalt, wooden, rubber) |
| `has_lights` | BOOLEAN | Court lighting available |
| `description` | TEXT | Additional details |
| `facilities` | JSONB | Facilities object (parking, restrooms, water, seating) |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp (auto-updated) |

**Indexes:**
- `idx_courts_location` (GIST) on `location` - spatial queries
- `idx_courts_city` on `city`
- `idx_courts_suburb` on `suburb`
- `idx_courts_coordinates` on `(latitude, longitude)`

**Triggers:**
- `courts_updated_at_trigger` - auto-updates `updated_at` on row changes

#### `checkins` - User check-ins at courts
Tracks when users check in/out at basketball courts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `court_id` | UUID | Foreign key to courts |
| `checked_in_at` | TIMESTAMPTZ | Check-in timestamp (required) |
| `checked_out_at` | TIMESTAMPTZ | Check-out timestamp (NULL = still checked in) |
| `auto_expired` | BOOLEAN | True if auto-expired (90 min default) |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp (auto-updated) |

**Indexes:**
- `idx_checkins_user_id` on `user_id`
- `idx_checkins_court_id` on `court_id`
- `idx_checkins_checked_in_at` on `checked_in_at`
- `idx_checkins_active` (partial) on `(user_id, checked_out_at)` WHERE `checked_out_at IS NULL`
- `idx_checkins_court_active` (partial) on `(court_id, checked_out_at)` WHERE `checked_out_at IS NULL`

**Constraints:**
- `idx_checkins_one_active_per_user` (unique) - one active check-in per user
- `ON DELETE CASCADE` - deletes check-ins when user/court is deleted

**Triggers:**
- `checkins_updated_at_trigger` - auto-updates `updated_at` on row changes

### Relationships

```
users (1) ←→ (many) refresh_tokens
users (1) ←→ (many) checkins
courts (1) ←→ (many) checkins
```

### Running Migrations

```bash
# Load DATABASE_URL from .env
source .env

# Run all migrations
psql $DATABASE_URL < src/db/migrations/001_create_auth_tables.sql
psql $DATABASE_URL < src/db/migrations/002_create_courts_table.sql
psql $DATABASE_URL < src/db/migrations/003_create_checkins_table.sql

# Verify tables were created
psql $DATABASE_URL -c "\dt"
```

---

## Environment Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | - | Secret key for JWT signing (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Production only | - | Google OAuth client ID |
| `APPLE_CLIENT_ID` | Production only | - | Apple Sign-In service ID |
| `CHECKIN_EXPIRY_MINUTES` | No | `90` | Check-in auto-expiry time |

### Example `.env` File

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://courtpulse:courtpulse@localhost:5432/courtpulse

# JWT Configuration
# IMPORTANT: Use a strong, random secret in production!
# Generate with: openssl rand -base64 32
JWT_SECRET=dev-secret-key-min-32-chars-long-please-change-in-production

# OAuth Providers (Optional in Development)
# For development, use POST /api/auth/dev/login instead
# GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# APPLE_CLIENT_ID=your.apple.service.id

# Check-ins Configuration
CHECKIN_EXPIRY_MINUTES=90
```

### Validation

Environment variables are validated on startup in `src/config/env.ts`:
- `DATABASE_URL` must be set (throws error if missing)
- `JWT_SECRET` must be set (throws error if missing)
- In production, at least one OAuth provider (`GOOGLE_CLIENT_ID` or `APPLE_CLIENT_ID`) is required

---

## API Reference

Base URL: `http://localhost:3000`

### Health & Info

#### `GET /`
Get API information and available endpoints.

**Authentication:** Not required

**Response:**
```json
{
  "name": "CourtPulse API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "GET /health",
    "auth": { ... },
    "courts": { ... },
    "checkins": { ... }
  }
}
```

#### `GET /health`
Health check endpoint.

**Authentication:** Not required

**Response:**
```json
{
  "ok": true
}
```

---

### Authentication Endpoints

#### `POST /api/auth/dev/login`
Development-only login endpoint (bypasses OAuth).

**Authentication:** Not required
**Environment:** Development only (disabled in production)

**Request Body:**
```json
{
  "email": "test@example.com",
  "name": "Test User"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test@example.com",
    "name": "Test User",
    "profilePictureUrl": null
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

#### `POST /api/auth/google`
Authenticate with Google OAuth ID token.

**Authentication:** Not required

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@gmail.com",
    "name": "John Doe",
    "profilePictureUrl": "https://..."
  }
}
```

#### `POST /api/auth/apple`
Authenticate with Apple Sign-In ID token.

**Authentication:** Not required

**Request Body:**
```json
{
  "idToken": "eyJraWQiOiJlWGF1bm1MIiwiYWxn...",
  "email": "user@privaterelay.appleid.com",
  "name": "John Doe"
}
```

**Response (200):**
Same as Google auth response.

#### `GET /api/auth/me`
Get current authenticated user profile.

**Authentication:** Required (Bearer token)

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test@example.com",
  "name": "Test User",
  "profilePictureUrl": null
}
```

**Example:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### `POST /api/auth/refresh`
Refresh access token using refresh token.

**Authentication:** Not required
**Note:** Old refresh token is deleted (single-use, rotation)

**Request Body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "660f9511-f30c-52e5-b827-557766551111"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

#### `POST /api/auth/logout`
Revoke refresh token (logout).

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `204 No Content`

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

### Courts Endpoints

#### `GET /api/courts`
List basketball courts with optional filters.

**Authentication:** Not required (public endpoint)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `latitude` | number | Latitude for location search |
| `longitude` | number | Longitude for location search |
| `radiusKm` | number | Search radius in kilometers (default: 10) |
| `city` | string | Filter by city |
| `suburb` | string | Filter by suburb |
| `indoor` | boolean | Filter indoor courts (true/false) |
| `hasLights` | boolean | Filter courts with lights (true/false) |
| `limit` | number | Results per page (default: 20, max: 100) |
| `offset` | number | Pagination offset (default: 0) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Sydney Park Basketball Courts",
      "address": "Sydney Park Rd, Alexandria NSW 2015",
      "latitude": -33.9142,
      "longitude": 151.1835,
      "suburb": "Alexandria",
      "city": "Sydney",
      "state": "NSW",
      "postcode": "2015",
      "country": "Australia",
      "numHoops": 4,
      "indoor": false,
      "surfaceType": "concrete",
      "hasLights": true,
      "description": "Outdoor courts with night lighting",
      "facilities": {
        "parking": true,
        "restrooms": true,
        "water": true,
        "seating": true
      },
      "distance": 2.4
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Examples:**
```bash
# List all courts
curl http://localhost:3000/api/courts

# Search by location (within 5km of Sydney CBD)
curl "http://localhost:3000/api/courts?latitude=-33.8688&longitude=151.2093&radiusKm=5"

# Filter by city
curl "http://localhost:3000/api/courts?city=Sydney"

# Indoor courts only
curl "http://localhost:3000/api/courts?indoor=true"

# Courts with lights in Alexandria
curl "http://localhost:3000/api/courts?suburb=Alexandria&hasLights=true"
```

#### `GET /api/courts/:id`
Get a single court by ID.

**Authentication:** Not required

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Sydney Park Basketball Courts",
  "address": "Sydney Park Rd, Alexandria NSW 2015",
  "latitude": -33.9142,
  "longitude": 151.1835,
  "suburb": "Alexandria",
  "city": "Sydney",
  "state": "NSW",
  "postcode": "2015",
  "country": "Australia",
  "numHoops": 4,
  "indoor": false,
  "surfaceType": "concrete",
  "hasLights": true,
  "description": "Outdoor courts with night lighting",
  "facilities": {
    "parking": true,
    "restrooms": true,
    "water": true,
    "seating": true
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/courts/550e8400-e29b-41d4-a716-446655440000
```

#### `GET /api/courts/:id/occupancy`
Get real-time occupancy for a specific court.

**Authentication:** Not required

**Response (200):**
```json
{
  "courtId": "550e8400-e29b-41d4-a716-446655440000",
  "courtName": "Sydney Park Basketball Courts",
  "activeCheckins": 6,
  "occupancyLevel": "moderate",
  "lastUpdated": "2024-02-16T10:30:00.000Z"
}
```

**Occupancy Levels:**
- `empty` - 0 players
- `low` - 1-3 players
- `moderate` - 4-7 players
- `high` - 8-11 players
- `full` - 12+ players

**Example:**
```bash
curl http://localhost:3000/api/courts/550e8400-e29b-41d4-a716-446655440000/occupancy
```

#### `GET /api/courts/occupancy`
Get occupancy for multiple courts (by IDs or location).

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `courtIds` | string | Comma-separated court IDs |
| `latitude` | number | Latitude for location search |
| `longitude` | number | Longitude for location search |
| `radiusKm` | number | Search radius (default: 10km) |

**Note:** Either `courtIds` OR `latitude`+`longitude` is required.

**Response (200):**
```json
{
  "data": [
    {
      "courtId": "550e8400-...",
      "courtName": "Sydney Park Basketball Courts",
      "activeCheckins": 6,
      "occupancyLevel": "moderate"
    },
    {
      "courtId": "660f9511-...",
      "courtName": "Redfern Park Courts",
      "activeCheckins": 2,
      "occupancyLevel": "low"
    }
  ],
  "lastUpdated": "2024-02-16T10:30:00.000Z"
}
```

**Examples:**
```bash
# By court IDs
curl "http://localhost:3000/api/courts/occupancy?courtIds=550e8400-...,660f9511-..."

# By location (within 10km)
curl "http://localhost:3000/api/courts/occupancy?latitude=-33.8688&longitude=151.2093&radiusKm=10"
```

---

### Check-ins Endpoints

#### `POST /api/checkins`
Check in at a basketball court.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "courtId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201):**
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551111",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "courtId": "550e8400-e29b-41d4-a716-446655440000",
  "checkedInAt": "2024-02-16T10:30:00.000Z",
  "checkedOutAt": null,
  "autoExpired": false,
  "court": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sydney Park Basketball Courts",
    "suburb": "Alexandria",
    "city": "Sydney"
  }
}
```

**Notes:**
- If user has an active check-in at another court, it will be automatically checked out
- Check-ins auto-expire after 90 minutes (configurable via `CHECKIN_EXPIRY_MINUTES`)
- Only one active check-in per user at a time

**Example:**
```bash
curl -X POST http://localhost:3000/api/checkins \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courtId":"550e8400-e29b-41d4-a716-446655440000"}'
```

#### `POST /api/checkins/:id/checkout`
Manually check out from a check-in.

**Authentication:** Required (Bearer token)

**Response (200):**
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551111",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "courtId": "550e8400-e29b-41d4-a716-446655440000",
  "checkedInAt": "2024-02-16T10:30:00.000Z",
  "checkedOutAt": "2024-02-16T11:45:00.000Z",
  "autoExpired": false
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/checkins/770f9622-f30c-52e5-b827-557766551111/checkout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### `GET /api/checkins/active`
Get user's current active check-in.

**Authentication:** Required (Bearer token)

**Response (200) - Active check-in:**
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551111",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "courtId": "550e8400-e29b-41d4-a716-446655440000",
  "checkedInAt": "2024-02-16T10:30:00.000Z",
  "checkedOutAt": null,
  "autoExpired": false,
  "court": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sydney Park Basketball Courts",
    "suburb": "Alexandria",
    "city": "Sydney"
  }
}
```

**Response (200) - No active check-in:**
```json
{
  "active": false
}
```

**Example:**
```bash
curl http://localhost:3000/api/checkins/active \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### `GET /api/checkins`
Get user's check-in history.

**Authentication:** Required (Bearer token)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Results per page (default: 20, max: 100) |
| `offset` | number | Pagination offset (default: 0) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "770f9622-f30c-52e5-b827-557766551111",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "courtId": "550e8400-e29b-41d4-a716-446655440000",
      "checkedInAt": "2024-02-16T10:30:00.000Z",
      "checkedOutAt": "2024-02-16T11:45:00.000Z",
      "autoExpired": false,
      "court": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Sydney Park Basketball Courts",
        "suburb": "Alexandria",
        "city": "Sydney"
      }
    }
  ],
  "pagination": {
    "total": 24,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Example:**
```bash
# Get recent check-ins
curl "http://localhost:3000/api/checkins?limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Pagination
curl "http://localhost:3000/api/checkins?limit=10&offset=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Error Responses

All endpoints may return these error responses:

**400 Bad Request** - Invalid input
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized** - Missing or invalid authentication
```json
{
  "error": "Invalid token"
}
```

**403 Forbidden** - Access denied
```json
{
  "error": "Dev endpoints disabled in production"
}
```

**404 Not Found** - Resource not found
```json
{
  "error": "Court not found"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Internal server error"
}
```

---

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This starts the server with:
- Hot reload (auto-restart on file changes)
- TypeScript transpilation on-the-fly
- Error stack traces
- Development endpoints enabled (`/api/auth/dev/login`)

### Making Code Changes

1. **Edit TypeScript files** in `src/`
2. **Server auto-restarts** (thanks to ts-node-dev)
3. **Test your changes** immediately

### Adding a New Feature

Follow the existing module pattern:

1. **Create module directory:**
```bash
mkdir -p src/modules/your-feature
```

2. **Create module files:**
```
src/modules/your-feature/
├── your-feature.routes.ts      # Define routes
├── your-feature.controller.ts   # HTTP handlers
├── your-feature.service.ts      # Business logic
├── your-feature.types.ts        # TypeScript types
└── validators.ts                # Zod schemas
```

3. **Define routes** (e.g., `your-feature.routes.ts`):
```typescript
import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as Controller from "./your-feature.controller";

export const yourFeatureRouter = Router();

// Public route
yourFeatureRouter.get("/", Controller.list);

// Protected route
yourFeatureRouter.post("/", authenticate, Controller.create);
```

4. **Implement controller** (e.g., `your-feature.controller.ts`):
```typescript
import type { Request, Response, NextFunction } from "express";
import { createSchema } from "./validators";
import * as Service from "./your-feature.service";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createSchema.parse(req.body);
    const result = await Service.create(input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
```

5. **Implement service** (e.g., `your-feature.service.ts`):
```typescript
import { pool } from "../../config/db";
import type { YourType } from "./your-feature.types";

export async function create(data: YourType): Promise<YourType> {
  const result = await pool.query(
    `INSERT INTO your_table (column1, column2) VALUES ($1, $2) RETURNING *`,
    [data.column1, data.column2]
  );
  return result.rows[0];
}
```

6. **Mount routes** in `src/app.ts`:
```typescript
import { yourFeatureRouter } from "./modules/your-feature/your-feature.routes";

app.use("/api/your-feature", yourFeatureRouter);
```

7. **Test your feature:**
```bash
curl http://localhost:3000/api/your-feature
```

### Database Changes

1. **Create migration file:**
```bash
touch src/db/migrations/004_your_migration.sql
```

2. **Write SQL:**
```sql
-- Migration: Add new feature
CREATE TABLE your_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_your_table_name ON your_table(name);
```

3. **Run migration:**
```bash
source .env
psql $DATABASE_URL < src/db/migrations/004_your_migration.sql
```

4. **Verify:**
```bash
psql $DATABASE_URL -c "\d your_table"
```

### Building for Production

```bash
# Compile TypeScript to JavaScript
npm run build

# Output in dist/ directory
ls dist/

# Run production build
npm start
```

---

## Testing

### Automated Testing

Run the complete authentication test suite:

```bash
npm run test:auth
```

**What it tests:**
- Dev login (token generation)
- Protected routes (JWT validation)
- Token refresh (rotation)
- Logout (token revocation)
- Database state verification

Expected output:
```
✅ All tests passed!
✓ Dev login successful
✓ Protected route accessible
✓ Token refresh working
✓ Logout successful
✓ Database state verified
```

### Manual Testing with curl

#### 1. Authentication Flow

```bash
# Login
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}')

# Extract tokens (requires jq)
ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"

# Get user profile
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Refresh token
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

#### 2. Courts Discovery

```bash
# List all courts
curl http://localhost:3000/api/courts | jq

# Search by location
curl "http://localhost:3000/api/courts?latitude=-33.8688&longitude=151.2093&radiusKm=5" | jq

# Filter by city
curl "http://localhost:3000/api/courts?city=Sydney" | jq

# Indoor courts with lights
curl "http://localhost:3000/api/courts?indoor=true&hasLights=true" | jq
```

#### 3. Check-ins

```bash
# First, login to get tokens
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

# Get a court ID (replace with actual ID from courts list)
COURT_ID="550e8400-e29b-41d4-a716-446655440000"

# Check in
curl -X POST http://localhost:3000/api/checkins \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courtId\":\"$COURT_ID\"}" | jq

# Get active check-in
curl http://localhost:3000/api/checkins/active \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq

# Check court occupancy
curl "http://localhost:3000/api/courts/$COURT_ID/occupancy" | jq

# Check-in history
curl "http://localhost:3000/api/checkins?limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
```

### Database Inspection

View database contents:

```bash
npm run db:inspect
```

Shows:
- All users
- Active refresh tokens
- Recent check-ins
- Court occupancy

### Troubleshooting Script

Run diagnostics:

```bash
npm run troubleshoot
```

Checks:
- Server status
- Database connection
- Port availability
- Environment variables
- Recent logs

---

## Available Commands

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` directory |
| `npm start` | Run compiled production server |
| `npm run test:auth` | Run authentication test suite |
| `npm run db:inspect` | Inspect database tables and data |
| `npm run troubleshoot` | Run diagnostic checks |
| `npm run fix-port` | Kill process on port 3000 |

### Database Commands

```bash
# Load DATABASE_URL from .env
source .env

# Connect to database
psql $DATABASE_URL

# List all tables
psql $DATABASE_URL -c "\dt"

# Describe table structure
psql $DATABASE_URL -c "\d users"

# View users
psql $DATABASE_URL -c "SELECT id, email, name FROM users;"

# View active check-ins
psql $DATABASE_URL -c "SELECT * FROM checkins WHERE checked_out_at IS NULL;"

# Count courts by city
psql $DATABASE_URL -c "SELECT city, COUNT(*) FROM courts GROUP BY city;"

# Run migration
psql $DATABASE_URL < src/db/migrations/001_create_auth_tables.sql
```

### Useful SQL Queries

```sql
-- View all users with login times
SELECT id, email, name, last_login_at, created_at
FROM users
ORDER BY last_login_at DESC NULLS LAST;

-- Count active refresh tokens per user
SELECT u.email, COUNT(rt.id) as token_count
FROM users u
LEFT JOIN refresh_tokens rt ON u.id = rt.user_id
WHERE rt.revoked_at IS NULL
GROUP BY u.email;

-- View active check-ins with court names
SELECT
  u.email,
  c.name as court_name,
  ch.checked_in_at,
  AGE(NOW(), ch.checked_in_at) as duration
FROM checkins ch
JOIN users u ON ch.user_id = u.id
JOIN courts c ON ch.court_id = c.id
WHERE ch.checked_out_at IS NULL
ORDER BY ch.checked_in_at DESC;

-- Court occupancy summary
SELECT
  c.name,
  c.city,
  COUNT(ch.id) as active_players
FROM courts c
LEFT JOIN checkins ch ON c.id = ch.court_id
  AND ch.checked_out_at IS NULL
GROUP BY c.id, c.name, c.city
ORDER BY active_players DESC;
```

---

## Local URLs

### Primary URLs

- **API Root:** http://localhost:3000/
- **Health Check:** http://localhost:3000/health

### Authentication

- **Dev Login:** http://localhost:3000/api/auth/dev/login
- **Google OAuth:** http://localhost:3000/api/auth/google
- **Apple Sign-In:** http://localhost:3000/api/auth/apple
- **Get Current User:** http://localhost:3000/api/auth/me
- **Refresh Token:** http://localhost:3000/api/auth/refresh
- **Logout:** http://localhost:3000/api/auth/logout

### Courts

- **List Courts:** http://localhost:3000/api/courts
- **Get Court:** http://localhost:3000/api/courts/:id
- **Court Occupancy:** http://localhost:3000/api/courts/:id/occupancy
- **Multiple Occupancies:** http://localhost:3000/api/courts/occupancy

### Check-ins

- **Create Check-in:** http://localhost:3000/api/checkins
- **Checkout:** http://localhost:3000/api/checkins/:id/checkout
- **Active Check-in:** http://localhost:3000/api/checkins/active
- **Check-in History:** http://localhost:3000/api/checkins

---

## Current Limitations

### Not Implemented Yet

**Testing & Quality:**
- ❌ No automated unit/integration tests (Jest, Supertest)
- ❌ No CI/CD pipeline
- ❌ No code coverage reporting
- ❌ Manual testing only

**API Features:**
- ❌ No rate limiting (vulnerable to abuse)
- ❌ No request logging middleware
- ❌ No API versioning (e.g., `/api/v1/`)
- ❌ No API documentation UI (Swagger/OpenAPI)
- ❌ No pagination cursors (offset-based only)
- ❌ No field selection/sparse fieldsets
- ❌ No request compression (gzip)

**Infrastructure:**
- ❌ No caching layer (Redis)
- ❌ No WebSocket support for real-time updates
- ❌ No monitoring/metrics (Prometheus, Grafana)
- ❌ No error tracking (Sentry, Rollbar)
- ❌ No structured logging (Winston, Pino)
- ❌ No database connection pooling limits
- ❌ No health checks for dependencies (DB, Redis)

**Security:**
- ❌ No email verification flow
- ❌ No password reset (OAuth only)
- ❌ No account deletion endpoint
- ❌ No CORS configuration for production
- ❌ No helmet.js security headers
- ❌ No input sanitization (XSS protection)
- ❌ No SQL injection prevention beyond parameterized queries

**Courts Module:**
- ❌ No user-submitted courts (admin-only data)
- ❌ No court photos/images
- ❌ No court reviews or ratings
- ❌ No court verification status
- ❌ No court editing/updates
- ❌ No amenity details beyond basic facilities
- ❌ No operating hours tracking
- ❌ No court popularity metrics
- ❌ No court reporting/flagging system

**Check-ins Module:**
- ❌ No skill level tracking (beginner, intermediate, advanced)
- ❌ No group/party check-ins
- ❌ No check-in visibility settings (public/private)
- ❌ No check-in notifications
- ❌ No check-in reminders
- ❌ No check-in statistics/analytics

**Social Features:**
- ❌ No user profiles (public)
- ❌ No friends/following system
- ❌ No activity feed
- ❌ No user chat/messaging
- ❌ No user blocking
- ❌ No user reporting

**User Features:**
- ❌ No favorites/bookmarks (save courts)
- ❌ No pickup games/events creation
- ❌ No game invitations
- ❌ No court recommendations (personalized)
- ❌ No user achievements/badges
- ❌ No user statistics (games played, courts visited)

**Notifications:**
- ❌ No push notifications
- ❌ No email notifications
- ❌ No SMS notifications
- ❌ No notification preferences

**Media:**
- ❌ No image upload functionality
- ❌ No image processing/thumbnails
- ❌ No video support
- ❌ No CDN integration

**Admin:**
- ❌ No admin dashboard
- ❌ No admin API endpoints
- ❌ No user management (ban, suspend)
- ❌ No content moderation tools
- ❌ No analytics dashboard
- ❌ No data export/import tools

### Known Issues

- Check-ins don't auto-expire until a new request triggers the cleanup
- No background job for auto-expiring check-ins
- Court occupancy calculation doesn't account for court capacity
- No rate limiting means endpoints can be spammed
- Dev login endpoint is accessible in production if `NODE_ENV` isn't set
- No graceful shutdown handling
- No database migration rollback mechanism
- No TypeScript strict mode enabled

### Planned Future Enhancements

**Phase 1 (High Priority):**
- Court reviews and ratings
- Court photo uploads (S3/CloudFront)
- User favorites/bookmarks
- Push notifications (FCM/APNS)
- Rate limiting middleware
- Automated testing suite

**Phase 2 (Medium Priority):**
- Pickup games/events module
- Social features (friends, invites)
- Enhanced search filters
- WebSocket real-time updates
- Admin dashboard
- Analytics tracking

**Phase 3 (Low Priority):**
- User skill level system
- Achievement system
- Court recommendations (ML)
- Video uploads
- In-app messaging
- Advanced analytics

---

## Security Considerations

### Authentication & Authorization

**JWT Tokens:**
- Access tokens expire after **15 minutes**
- Refresh tokens expire after **30 days**
- Tokens are signed with `JWT_SECRET` (HMAC-SHA256)
- No token blacklist (rely on short expiry)

**Refresh Token Security:**
- Tokens stored as **bcrypt hashes** (never plain text)
- **Single-use tokens** (rotation) - old token deleted on refresh
- **Token reuse detection** - all user tokens revoked if reused token detected
- Token expiry checked on every use
- Tokens cascade-deleted when user is deleted

**OAuth Integration:**
- Google ID tokens verified with Google's public keys
- Apple ID tokens verified with Apple's public keys
- Email addresses trusted from OAuth providers
- Profile pictures stored as URLs (not uploaded)

**Development Mode:**
- `/api/auth/dev/login` endpoint for testing **without OAuth**
- **Disabled in production** (throws 403 error)
- Should NOT be used in production environments

### Best Practices

**Token Management:**
1. **Store securely:**
   - iOS: Keychain
   - Android: Keystore/EncryptedSharedPreferences
   - Web: httpOnly cookies (not localStorage!)

2. **Handle expiry:**
   - Access token expired (401) → Call refresh endpoint
   - Refresh token expired (401) → Redirect to login

3. **Logout properly:**
   - Call `/api/auth/logout` to revoke refresh token
   - Clear tokens from secure storage
   - Redirect to login screen

**Production Configuration:**

```env
# NEVER use default secrets in production!
JWT_SECRET=$(openssl rand -base64 32)

# Always set NODE_ENV
NODE_ENV=production

# Configure OAuth providers
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
APPLE_CLIENT_ID=your.apple.service.id

# Use strong database password
DATABASE_URL=postgresql://user:STRONG_PASSWORD@host:5432/dbname
```

**Database Security:**
- All passwords hashed with bcrypt (salt rounds: 10)
- Parameterized queries prevent SQL injection
- Foreign key constraints enforce referential integrity
- Indexes on sensitive columns (email, google_id, apple_id)

**CORS Configuration:**
- Currently allows all origins (`*`)
- **Configure for production:**
```typescript
app.use(cors({
  origin: ['https://your-app.com', 'https://www.your-app.com'],
  credentials: true
}));
```

### Threat Model

**Protected Against:**
- ✅ SQL injection (parameterized queries)
- ✅ JWT forgery (signed tokens)
- ✅ Token reuse (rotation + detection)
- ✅ Brute force (OAuth-only in production)
- ✅ Password leaks (OAuth-only, no passwords)

**NOT Protected Against:**
- ❌ Rate limiting (DDoS, brute force)
- ❌ XSS attacks (no input sanitization)
- ❌ CSRF attacks (no CSRF tokens)
- ❌ Mass assignment (no explicit field filtering)
- ❌ Timing attacks (bcrypt compare)

---

## Troubleshooting

### Server Issues

#### Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Kill process on port 3000
npm run fix-port

# Or manually
lsof -ti :3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Server Won't Start

**Check:**
```bash
# 1. Node version
node --version  # Should be 18+

# 2. PostgreSQL running
brew services list | grep postgresql

# 3. Database connection
source .env
psql $DATABASE_URL -c "SELECT 1"

# 4. Environment variables
cat .env | grep -E "DATABASE_URL|JWT_SECRET"

# 5. Run troubleshoot script
npm run troubleshoot
```

### Database Issues

#### Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql@15

# Check if running
psql -U postgres -c "SELECT version();"
```

#### Database Does Not Exist

**Error:**
```
database "courtpulse" does not exist
```

**Solution:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE courtpulse;"

# Enable PostGIS
psql -U postgres -d courtpulse -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations
source .env
psql $DATABASE_URL < src/db/migrations/001_create_auth_tables.sql
psql $DATABASE_URL < src/db/migrations/002_create_courts_table.sql
psql $DATABASE_URL < src/db/migrations/003_create_checkins_table.sql
```

#### Migration Errors

**Error:**
```
ERROR: relation "users" already exists
```

**Solution:**
Migration already ran. Skip it or drop tables:
```bash
# Check what tables exist
psql $DATABASE_URL -c "\dt"

# Drop tables if needed (WARNING: deletes all data!)
psql $DATABASE_URL -c "DROP TABLE IF EXISTS checkins CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS courts CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS refresh_tokens CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS users CASCADE;"

# Re-run migrations
psql $DATABASE_URL < src/db/migrations/001_create_auth_tables.sql
psql $DATABASE_URL < src/db/migrations/002_create_courts_table.sql
psql $DATABASE_URL < src/db/migrations/003_create_checkins_table.sql
```

### Authentication Issues

#### Invalid Token (401)

**Causes:**
1. Token expired (15 minutes for access tokens)
2. Malformed token
3. Wrong `JWT_SECRET`
4. Token not included in header

**Solutions:**
```bash
# 1. Refresh the access token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# 2. Check Authorization header format
# ✅ Correct: Authorization: Bearer <token>
# ❌ Wrong: Authorization: <token>

# 3. Verify JWT_SECRET in .env matches what was used to sign tokens
cat .env | grep JWT_SECRET
```

#### Missing Authorization Header

**Error:**
```json
{
  "error": "Missing authorization header"
}
```

**Solution:**
```bash
# Always include Authorization header for protected endpoints
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Refresh Token Expired

**Error:**
```json
{
  "error": "Invalid or expired refresh token"
}
```

**Solution:**
Refresh tokens expire after 30 days. Login again:
```bash
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","name":"Your Name"}'
```

#### Token Reuse Detected

**Error:**
```json
{
  "error": "Invalid or expired refresh token"
}
```

**What happened:**
You tried to use an old refresh token that was already used. For security, all your tokens were revoked.

**Solution:**
Login again to get new tokens:
```bash
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","name":"Your Name"}'
```

### TypeScript Issues

#### Compilation Errors

**Error:**
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
```

**Solution:**
Fix the type error in your code. TypeScript is enforcing type safety.

#### Module Not Found

**Error:**
```
Cannot find module './config/env'
```

**Solution:**
```bash
# Verify file exists
ls -la src/config/env.ts

# Check import path (relative paths must start with ./)
# ✅ Correct: import { env } from "./config/env";
# ❌ Wrong: import { env } from "config/env";
```

### API Issues

#### CORS Errors

**Error (in browser):**
```
Access to fetch at 'http://localhost:3000/api/auth/me' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solution:**
CORS is enabled for all origins by default. If you modified `app.ts`, restore:
```typescript
app.use(cors());
```

#### Request Timeout

**Symptoms:**
Request hangs and never responds.

**Possible causes:**
1. Infinite loop in code
2. Database query never returns
3. Missing `await` on async function

**Debug:**
```bash
# Check server logs
npm run dev  # Look for errors/hangs

# Test database query directly
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 1;"
```

### Data Issues

#### Court Not Found

**Error:**
```json
{
  "error": "Court not found"
}
```

**Solution:**
```bash
# List all courts
curl http://localhost:3000/api/courts

# Check if court exists in database
psql $DATABASE_URL -c "SELECT id, name FROM courts;"
```

#### Check-in Failed

**Error:**
```json
{
  "error": "Court not found"
}
```

**Solution:**
Verify court ID is valid:
```bash
# Get valid court ID
curl http://localhost:3000/api/courts | jq '.'

# Use the correct UUID
curl -X POST http://localhost:3000/api/checkins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courtId":"VALID_UUID_HERE"}'
```

### Performance Issues

#### Slow Queries

**Symptoms:**
API responses take multiple seconds.

**Debug:**
```bash
# Enable PostgreSQL query logging
psql $DATABASE_URL -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"  # Log queries > 1s
psql $DATABASE_URL -c "SELECT pg_reload_conf();"

# Check slow queries
tail -f /usr/local/var/log/postgresql@15.log
```

**Solution:**
- Verify indexes exist (see Database Schema section)
- Add missing indexes
- Optimize query logic

#### Memory Issues

**Error:**
```
JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

---

## Code Style & Patterns

### TypeScript Conventions

**Type Definitions:**
```typescript
// Use interfaces for objects
interface User {
  id: string;
  email: string;
  name: string | null;
}

// Use types for unions/primitives
type UserId = string;
type OccupancyLevel = "empty" | "low" | "moderate" | "high" | "full";
```

**Async/Await:**
```typescript
// Always use async/await (not callbacks or .then())
export async function getUser(id: string): Promise<User> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}
```

**Error Handling:**
```typescript
// Let errors bubble up to error handler middleware
export async function controller(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service();
    res.json(result);
  } catch (error) {
    next(error);  // Pass to error handler
  }
}
```

### Naming Conventions

**Files:**
- `kebab-case.ts` for file names
- `auth.routes.ts`, `courts.service.ts`

**Functions:**
- `camelCase` for functions and variables
- `PascalCase` for classes and types

**Database:**
- `snake_case` for columns: `created_at`, `user_id`
- `camelCase` in TypeScript: `createdAt`, `userId`

### Database Patterns

**Parameterized Queries (Required):**
```typescript
// ✅ Correct - parameterized
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ Wrong - SQL injection vulnerability!
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

**Transactions:**
```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');

  // Multiple queries in transaction
  await client.query('UPDATE users SET ... WHERE id = $1', [userId]);
  await client.query('INSERT INTO audit_log ...');

  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

**Row Mapping:**
```typescript
// Database returns snake_case
const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
const row = result.rows[0];

// Map to camelCase for API
return {
  id: row.id,
  email: row.email,
  name: row.name,
  createdAt: row.created_at,  // snake_case → camelCase
  lastLoginAt: row.last_login_at,
};
```

### Validation Patterns

**Zod Schemas:**
```typescript
import { z } from "zod";

// Define schema
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
});

// Infer TypeScript type
export type CreateUserInput = z.infer<typeof createUserSchema>;

// Use in controller
export async function create(req: Request, res: Response) {
  const input = createUserSchema.parse(req.body);  // Throws if invalid
  // input is now typed as CreateUserInput
}
```

### API Response Patterns

**Success Response:**
```typescript
// Single resource
res.status(200).json(user);

// Collection
res.status(200).json({
  data: users,
  pagination: {
    total: 100,
    limit: 20,
    offset: 0,
    hasMore: true
  }
});
```

**Error Response:**
```typescript
// Simple error
res.status(404).json({ error: "Not found" });

// Validation error with details
res.status(400).json({
  error: "Validation error",
  details: [
    { field: "email", message: "Invalid email format" }
  ]
});
```

---

## Additional Resources

- **TESTING.md** - Detailed testing guide with examples
- **QUICK_START.md** - Quick reference for common commands
- **TROUBLESHOOTING.md** - Additional troubleshooting tips
- **COURTS_MODULE.md** - Courts module documentation

---

## Contributing

This is a personal project, but contributions are welcome!

**Before submitting:**
1. Follow the existing code patterns
2. Write clear commit messages
3. Test your changes manually
4. Update documentation if needed

---

## License

ISC

---

## Support

If you encounter issues:

1. **Check this README** - Most common issues are documented
2. **Run troubleshoot script:** `npm run troubleshoot`
3. **Check server logs:** Look at `npm run dev` output
4. **Inspect database:** `npm run db:inspect`
5. **Verify environment:** Check `.env` configuration

---

**Built with ❤️ for basketball players**
