# Basketball Courts Module - Implementation Summary

## Overview

The basketball courts discovery module has been successfully implemented for CourtPulse API. This module provides public endpoints for discovering basketball courts in Sydney, Australia.

## What Was Implemented

### 1. Database Schema ✅

**File:** `src/db/migrations/002_create_courts_table.sql`

- Created `courts` table with geolocation support
- Fields: name, address, latitude/longitude, location (POINT), suburb, city, state, postcode, country
- Court details: num_hoops, indoor, surface_type, has_lights
- Additional info: description, facilities (JSONB)
- Indexes on location, city, suburb, and coordinates
- Auto-updated timestamp trigger

### 2. Seed Data ✅

**File:** `src/db/seeds/001_sydney_courts.sql`

- **30 real basketball courts** across Sydney
- Coverage includes:
  - Inner Sydney (Surry Hills, Redfern, Alexandria, CBD)
  - Eastern Suburbs (Bondi, Centennial Park, Randwick, Maroubra)
  - Western Sydney (Parramatta, Blacktown, Auburn, Merrylands)
  - Northern Sydney (Chatswood, Lane Cove, North Sydney, Willoughby)
  - Southern Sydney (Tempe, Rockdale, Hurstville, Cronulla)
  - Northern Beaches (Manly, Brookvale, Narrabeen, Mona Vale)
- Accurate coordinates, addresses, and amenities for each court

### 3. Courts Module ✅

**Directory:** `src/modules/courts/`

**Files created:**
- `courts.types.ts` - TypeScript interfaces (Court, CourtRow, CourtFacilities, ListCourtsQuery)
- `validators.ts` - Zod validation schemas with proper boolean query parameter handling
- `courts.service.ts` - Business logic with geospatial queries and Haversine distance calculation
- `courts.controller.ts` - HTTP request handlers
- `courts.routes.ts` - Express router configuration

### 4. API Endpoints ✅

#### `GET /api/courts` - List Courts

**Query Parameters:**
- `city` (string) - Filter by city (e.g., "Sydney")
- `suburb` (string) - Filter by suburb (e.g., "Surry Hills")
- `latitude` (number) - User's latitude for radius search
- `longitude` (number) - User's longitude for radius search
- `radiusKm` (number) - Search radius in km (default: 5, max: 50)
- `indoor` (boolean) - Filter by indoor courts ("true"/"false")
- `hasLights` (boolean) - Filter by courts with lights ("true"/"false")
- `limit` (number) - Max results (default: 50, max: 100)
- `offset` (number) - Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Court Name",
      "address": "Full Address",
      "latitude": -33.8814,
      "longitude": 151.2100,
      "suburb": "Suburb",
      "city": "Sydney",
      "state": "NSW",
      "country": "Australia",
      "numHoops": 4,
      "indoor": false,
      "surfaceType": "concrete",
      "hasLights": true,
      "facilities": {...},
      "distance": 1.2,  // Only if lat/long provided
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "meta": {
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

#### `GET /api/courts/:id` - Get Court by ID

**Response:** Single court object (same structure as above)

**Error (404):** `{"error": "Court not found"}`

## Technical Implementation

### Location-Based Search

Since PostGIS was not available, implemented a hybrid approach:

1. **Bounding Box Filter** - Fast pre-filtering using lat/long range
2. **Haversine Formula** - Accurate distance calculation in application layer
3. **Sort by Distance** - Results sorted nearest first

This approach works efficiently for the MVP scale and can be optimized with PostGIS later if needed.

### Boolean Query Parameters

Fixed Zod's `coerce.boolean()` limitation with query strings by implementing custom transform:
- Handles "true"/"false" strings correctly
- Also supports "1"/"0" for convenience
- Returns `undefined` for invalid values

## Example API Calls

### List all Sydney courts
```bash
curl "http://localhost:3000/api/courts?city=Sydney"
```

### Find courts within 5km of location
```bash
curl "http://localhost:3000/api/courts?latitude=-33.8814&longitude=151.2100&radiusKm=5"
```

### Find outdoor courts with lights
```bash
curl "http://localhost:3000/api/courts?city=Sydney&indoor=false&hasLights=true"
```

### Get specific court
```bash
curl "http://localhost:3000/api/courts/{court-id}"
```

## Testing Results

All endpoints tested and working:
- ✅ List courts by city/suburb
- ✅ Location-based radius search with distance calculation
- ✅ Boolean filters (indoor, hasLights) working correctly
- ✅ Combined filters (location + attributes)
- ✅ Pagination and metadata
- ✅ Get court by ID
- ✅ 404 handling for non-existent courts
- ✅ API info includes courts endpoints

## Database Status

```sql
-- 30 courts in database
SELECT COUNT(*) FROM courts;  -- Result: 30

-- Courts by suburb
SELECT suburb, COUNT(*) FROM courts GROUP BY suburb;

-- Test location query
SELECT name, suburb FROM courts WHERE city = 'Sydney' LIMIT 5;
```

## Files Modified/Created

### Created (9 files):
1. `src/db/migrations/002_create_courts_table.sql`
2. `src/db/seeds/001_sydney_courts.sql`
3. `src/modules/courts/courts.types.ts`
4. `src/modules/courts/validators.ts`
5. `src/modules/courts/courts.service.ts`
6. `src/modules/courts/courts.controller.ts`
7. `src/modules/courts/courts.routes.ts`
8. `COURTS_MODULE.md` (this file)

### Modified (1 file):
1. `src/app.ts` - Registered courts routes and updated API info

## Next Steps

Now that the courts module is complete, you can:

1. **Add Check-ins Module** - Let users report court busyness
2. **User Favorites** - Save favorite courts (requires auth)
3. **Court Photos** - Add image upload and display
4. **Advanced Filters** - Surface type, specific facilities
5. **Reviews & Ratings** - User feedback on courts
6. **Expand to Other Cities** - Add more locations beyond Sydney

## Architecture Notes

- **Public Endpoints** - No authentication required for discovery
- **Modular Structure** - Follows auth module pattern
- **Clean Separation** - Types, validation, service, controller, routes
- **Scalable Design** - Easy to add more cities and features
- **Type-Safe** - Full TypeScript coverage

The basketball courts module is production-ready for MVP! 🏀
