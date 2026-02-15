# CourtPulse API - Sample Data Reference

This document shows realistic examples of how data should be structured in the CourtPulse database and API responses.

## Table of Contents

- [Users](#users)
- [Refresh Tokens](#refresh-tokens)
- [Courts](#courts)
- [Check-ins](#check-ins)
- [API Response Examples](#api-response-examples)

---

## Users

Sample user records in the `users` table.

### User 1 - Google OAuth User
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "google_id": "105842077123456789012",
  "apple_id": null,
  "email": "john.smith@gmail.com",
  "email_verified": true,
  "name": "John Smith",
  "profile_picture_url": "https://lh3.googleusercontent.com/a/AATXAJyXyz123...",
  "created_at": "2024-01-15T08:30:00.000Z",
  "updated_at": "2024-02-16T10:30:00.000Z",
  "last_login_at": "2024-02-16T10:30:00.000Z"
}
```

### User 2 - Apple Sign-In User
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "google_id": null,
  "apple_id": "001234.a1b2c3d4e5f6.7890",
  "email": "sarah.j@privaterelay.appleid.com",
  "email_verified": true,
  "name": "Sarah Johnson",
  "profile_picture_url": null,
  "created_at": "2024-01-20T14:15:00.000Z",
  "updated_at": "2024-02-16T09:00:00.000Z",
  "last_login_at": "2024-02-16T09:00:00.000Z"
}
```

### User 3 - Dev Login User (Testing)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "google_id": null,
  "apple_id": null,
  "email": "test@example.com",
  "email_verified": false,
  "name": "Test User",
  "profile_picture_url": null,
  "created_at": "2024-02-16T11:00:00.000Z",
  "updated_at": "2024-02-16T11:00:00.000Z",
  "last_login_at": "2024-02-16T11:00:00.000Z"
}
```

### User 4 - Both OAuth Providers
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "google_id": "105842077987654321098",
  "apple_id": "001234.z9y8x7w6v5u4.3210",
  "email": "mike.chen@gmail.com",
  "email_verified": true,
  "name": "Mike Chen",
  "profile_picture_url": "https://lh3.googleusercontent.com/a/AATXAJyAbc456...",
  "created_at": "2024-01-10T16:45:00.000Z",
  "updated_at": "2024-02-16T08:15:00.000Z",
  "last_login_at": "2024-02-16T08:15:00.000Z"
}
```

---

## Refresh Tokens

Sample refresh token records in the `refresh_tokens` table.

### Active Token 1 (John Smith)
```json
{
  "id": "660f9511-f30c-52e5-b827-557766551001",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "token_hash": "$2b$10$8K1p/a0dL.6Ut9tCCvvZ7eFj1jQNp7Ij5wFGLzP5nYn3XJ6nJq8eS",
  "expires_at": "2024-03-18T10:30:00.000Z",
  "created_at": "2024-02-16T10:30:00.000Z",
  "revoked_at": null,
  "device_info": {
    "device": "iPhone 14 Pro",
    "os": "iOS 17.2",
    "app_version": "1.0.0"
  }
}
```

### Active Token 2 (Sarah Johnson - iPad)
```json
{
  "id": "660f9511-f30c-52e5-b827-557766551002",
  "user_id": "550e8400-e29b-41d4-a716-446655440002",
  "token_hash": "$2b$10$9L2q/b1eM.7Vu0uDDwwA8fGk2kRoq8Jk6xGhM0Q6oZo4YK7oKr9fT",
  "expires_at": "2024-03-18T09:00:00.000Z",
  "created_at": "2024-02-16T09:00:00.000Z",
  "revoked_at": null,
  "device_info": {
    "device": "iPad Pro",
    "os": "iOS 17.3",
    "app_version": "1.0.0"
  }
}
```

### Revoked Token (Logged Out)
```json
{
  "id": "660f9511-f30c-52e5-b827-557766551003",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "token_hash": "$2b$10$7J0o/9z0cK.5St9sABuuB6dEh0jPmn6Ig4vEFk9zO5mYm2XJ5nIo7qR",
  "expires_at": "2024-03-17T15:00:00.000Z",
  "created_at": "2024-02-15T15:00:00.000Z",
  "revoked_at": "2024-02-16T10:30:00.000Z",
  "device_info": {
    "device": "iPhone 14 Pro",
    "os": "iOS 17.2",
    "app_version": "1.0.0"
  }
}
```

### Expired Token (Not Cleaned Up Yet)
```json
{
  "id": "660f9511-f30c-52e5-b827-557766551004",
  "user_id": "550e8400-e29b-41d4-a716-446655440003",
  "token_hash": "$2b$10$6I9n/8y9bJ.4Rs8rZAtA5cCg9iOlm5Hf3uDEj8yN4lXl1WI4mHn6pQ",
  "expires_at": "2024-02-01T12:00:00.000Z",
  "created_at": "2024-01-02T12:00:00.000Z",
  "revoked_at": null,
  "device_info": null
}
```

---

## Courts

Sample basketball court records in the `courts` table (Sydney, Australia).

### Court 1 - Sydney Park Basketball Courts
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551001",
  "name": "Sydney Park Basketball Courts",
  "address": "Sydney Park Rd, Alexandria NSW 2015",
  "latitude": -33.9142,
  "longitude": 151.1835,
  "location": "POINT(151.1835 -33.9142)",
  "suburb": "Alexandria",
  "city": "Sydney",
  "state": "NSW",
  "postcode": "2015",
  "country": "Australia",
  "num_hoops": 4,
  "indoor": false,
  "surface_type": "concrete",
  "has_lights": true,
  "description": "Large outdoor basketball facility with multiple full courts. Popular spot with good lighting for night games. Well-maintained courts with painted lines.",
  "facilities": {
    "parking": true,
    "restrooms": true,
    "water": true,
    "seating": true
  },
  "created_at": "2024-02-01T10:00:00.000Z",
  "updated_at": "2024-02-01T10:00:00.000Z"
}
```

### Court 2 - Prince Alfred Park Courts
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551002",
  "name": "Prince Alfred Park Basketball Courts",
  "address": "Chalmers St, Surry Hills NSW 2010",
  "latitude": -33.8854,
  "longitude": 151.2101,
  "location": "POINT(151.2101 -33.8854)",
  "suburb": "Surry Hills",
  "city": "Sydney",
  "state": "NSW",
  "postcode": "2010",
  "country": "Australia",
  "num_hoops": 2,
  "indoor": false,
  "surface_type": "asphalt",
  "has_lights": true,
  "description": "Central city location with two full courts. Gets busy during lunch and after work. Good for quick games.",
  "facilities": {
    "parking": false,
    "restrooms": true,
    "water": true,
    "seating": true
  },
  "created_at": "2024-02-01T10:00:00.000Z",
  "updated_at": "2024-02-01T10:00:00.000Z"
}
```

### Court 3 - Redfern Park Basketball Courts
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551003",
  "name": "Redfern Park Basketball Courts",
  "address": "Redfern St, Redfern NSW 2016",
  "latitude": -33.8926,
  "longitude": 151.2057,
  "location": "POINT(151.2057 -33.8926)",
  "suburb": "Redfern",
  "city": "Sydney",
  "state": "NSW",
  "postcode": "2016",
  "country": "Australia",
  "num_hoops": 2,
  "indoor": false,
  "surface_type": "concrete",
  "has_lights": false,
  "description": "Community courts in Redfern Park. No lights so daylight games only. Free and open to all.",
  "facilities": {
    "parking": true,
    "restrooms": true,
    "water": true,
    "seating": false
  },
  "created_at": "2024-02-01T10:00:00.000Z",
  "updated_at": "2024-02-01T10:00:00.000Z"
}
```

### Court 4 - Alexandria Park Community Centre
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551004",
  "name": "Alexandria Park Community Centre",
  "address": "262 McEvoy St, Alexandria NSW 2015",
  "latitude": -33.9089,
  "longitude": 151.1983,
  "location": "POINT(151.1983 -33.9089)",
  "suburb": "Alexandria",
  "city": "Sydney",
  "state": "NSW",
  "postcode": "2015",
  "country": "Australia",
  "num_hoops": 1,
  "indoor": true,
  "surface_type": "wooden",
  "has_lights": true,
  "description": "Indoor basketball court with wooden floor. Excellent condition. Booking required for full court access, but casual pickup games allowed when available.",
  "facilities": {
    "parking": true,
    "restrooms": true,
    "water": true,
    "seating": true
  },
  "created_at": "2024-02-01T10:00:00.000Z",
  "updated_at": "2024-02-01T10:00:00.000Z"
}
```

### Court 5 - Bondi Pavilion Courts
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551005",
  "name": "Bondi Pavilion Basketball Courts",
  "address": "Queen Elizabeth Dr, Bondi Beach NSW 2026",
  "latitude": -33.8915,
  "longitude": 151.2767,
  "location": "POINT(151.2767 -33.8915)",
  "suburb": "Bondi Beach",
  "city": "Sydney",
  "state": "NSW",
  "postcode": "2026",
  "country": "Australia",
  "num_hoops": 2,
  "indoor": false,
  "surface_type": "concrete",
  "has_lights": true,
  "description": "Beachside courts with ocean views. Very popular on weekends. Can get windy. Great atmosphere.",
  "facilities": {
    "parking": true,
    "restrooms": true,
    "water": true,
    "seating": true
  },
  "created_at": "2024-02-01T10:00:00.000Z",
  "updated_at": "2024-02-01T10:00:00.000Z"
}
```

### Court 6 - Marrickville Youth Resource Centre
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551006",
  "name": "Marrickville Youth Resource Centre",
  "address": "111 Marrickville Rd, Marrickville NSW 2204",
  "latitude": -33.9112,
  "longitude": 151.1559,
  "location": "POINT(151.1559 -33.9112)",
  "suburb": "Marrickville",
  "city": "Sydney",
  "state": "NSW",
  "postcode": "2204",
  "country": "Australia",
  "num_hoops": 1,
  "indoor": true,
  "surface_type": "rubber",
  "has_lights": true,
  "description": "Indoor court with modern rubber flooring. Open during centre hours. Great for all-weather play.",
  "facilities": {
    "parking": true,
    "restrooms": true,
    "water": true,
    "seating": false
  },
  "created_at": "2024-02-01T10:00:00.000Z",
  "updated_at": "2024-02-01T10:00:00.000Z"
}
```

---

## Check-ins

Sample check-in records in the `checkins` table.

### Active Check-in 1 (John at Sydney Park)
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551001",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "court_id": "770f9622-f30c-52e5-b827-557766551001",
  "checked_in_at": "2024-02-16T10:30:00.000Z",
  "checked_out_at": null,
  "auto_expired": false,
  "created_at": "2024-02-16T10:30:00.000Z",
  "updated_at": "2024-02-16T10:30:00.000Z"
}
```

### Active Check-in 2 (Sarah at Prince Alfred)
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551002",
  "user_id": "550e8400-e29b-41d4-a716-446655440002",
  "court_id": "770f9622-f30c-52e5-b827-557766551002",
  "checked_in_at": "2024-02-16T11:00:00.000Z",
  "checked_out_at": null,
  "auto_expired": false,
  "created_at": "2024-02-16T11:00:00.000Z",
  "updated_at": "2024-02-16T11:00:00.000Z"
}
```

### Active Check-in 3 (Mike at Sydney Park)
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551003",
  "user_id": "550e8400-e29b-41d4-a716-446655440004",
  "court_id": "770f9622-f30c-52e5-b827-557766551001",
  "checked_in_at": "2024-02-16T10:45:00.000Z",
  "checked_out_at": null,
  "auto_expired": false,
  "created_at": "2024-02-16T10:45:00.000Z",
  "updated_at": "2024-02-16T10:45:00.000Z"
}
```

### Completed Check-in (Manually Checked Out)
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551004",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "court_id": "770f9622-f30c-52e5-b827-557766551003",
  "checked_in_at": "2024-02-16T08:00:00.000Z",
  "checked_out_at": "2024-02-16T09:30:00.000Z",
  "auto_expired": false,
  "created_at": "2024-02-16T08:00:00.000Z",
  "updated_at": "2024-02-16T09:30:00.000Z"
}
```

### Auto-Expired Check-in
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551005",
  "user_id": "550e8400-e29b-41d4-a716-446655440002",
  "court_id": "770f9622-f30c-52e5-b827-557766551005",
  "checked_in_at": "2024-02-15T18:00:00.000Z",
  "checked_out_at": "2024-02-15T19:30:00.000Z",
  "auto_expired": true,
  "created_at": "2024-02-15T18:00:00.000Z",
  "updated_at": "2024-02-15T19:30:00.000Z"
}
```

### Old Completed Check-in
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551006",
  "user_id": "550e8400-e29b-41d4-a716-446655440004",
  "court_id": "770f9622-f30c-52e5-b827-557766551002",
  "checked_in_at": "2024-02-14T16:00:00.000Z",
  "checked_out_at": "2024-02-14T17:15:00.000Z",
  "auto_expired": false,
  "created_at": "2024-02-14T16:00:00.000Z",
  "updated_at": "2024-02-14T17:15:00.000Z"
}
```

---

## API Response Examples

### Authentication Responses

#### POST /api/auth/dev/login - Success
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6ImpvaG4uc21pdGhAZ21haWwuY29tIiwiaWF0IjoxNzA4MDc3MDAwLCJleHAiOjE3MDgwNzc5MDB9.xYz123ABC456def",
  "refreshToken": "660f9511-f30c-52e5-b827-557766551001",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "john.smith@gmail.com",
    "name": "John Smith",
    "profilePictureUrl": "https://lh3.googleusercontent.com/a/AATXAJyXyz123..."
  }
}
```

#### GET /api/auth/me - Success
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "john.smith@gmail.com",
  "name": "John Smith",
  "profilePictureUrl": "https://lh3.googleusercontent.com/a/AATXAJyXyz123..."
}
```

#### POST /api/auth/refresh - Success
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6ImpvaG4uc21pdGhAZ21haWwuY29tIiwiaWF0IjoxNzA4MDc3MzAwLCJleHAiOjE3MDgwNzgyMDB9.aBc789XYZ012ghi",
  "refreshToken": "770f9622-f30c-52e5-b827-557766552001"
}
```

### Courts Responses

#### GET /api/courts - List All Courts
```json
{
  "data": [
    {
      "id": "770f9622-f30c-52e5-b827-557766551001",
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
      "description": "Large outdoor basketball facility with multiple full courts. Popular spot with good lighting for night games. Well-maintained courts with painted lines.",
      "facilities": {
        "parking": true,
        "restrooms": true,
        "water": true,
        "seating": true
      }
    },
    {
      "id": "770f9622-f30c-52e5-b827-557766551002",
      "name": "Prince Alfred Park Courts",
      "address": "Chalmers St, Surry Hills NSW 2010",
      "latitude": -33.8854,
      "longitude": 151.2101,
      "suburb": "Surry Hills",
      "city": "Sydney",
      "state": "NSW",
      "postcode": "2010",
      "country": "Australia",
      "numHoops": 2,
      "indoor": false,
      "surfaceType": "asphalt",
      "hasLights": true,
      "description": "Central city location with two full courts. Gets busy during lunch and after work. Good for quick games.",
      "facilities": {
        "parking": false,
        "restrooms": true,
        "water": true,
        "seating": true
      }
    }
  ],
  "pagination": {
    "total": 6,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### GET /api/courts?latitude=-33.8688&longitude=151.2093&radiusKm=5 - Location Search
```json
{
  "data": [
    {
      "id": "770f9622-f30c-52e5-b827-557766551002",
      "name": "Prince Alfred Park Courts",
      "address": "Chalmers St, Surry Hills NSW 2010",
      "latitude": -33.8854,
      "longitude": 151.2101,
      "suburb": "Surry Hills",
      "city": "Sydney",
      "state": "NSW",
      "postcode": "2010",
      "country": "Australia",
      "numHoops": 2,
      "indoor": false,
      "surfaceType": "asphalt",
      "hasLights": true,
      "description": "Central city location with two full courts. Gets busy during lunch and after work. Good for quick games.",
      "facilities": {
        "parking": false,
        "restrooms": true,
        "water": true,
        "seating": true
      },
      "distance": 1.2
    },
    {
      "id": "770f9622-f30c-52e5-b827-557766551003",
      "name": "Redfern Park Basketball Courts",
      "address": "Redfern St, Redfern NSW 2016",
      "latitude": -33.8926,
      "longitude": 151.2057,
      "suburb": "Redfern",
      "city": "Sydney",
      "state": "NSW",
      "postcode": "2016",
      "country": "Australia",
      "numHoops": 2,
      "indoor": false,
      "surfaceType": "concrete",
      "hasLights": false,
      "description": "Community courts in Redfern Park. No lights so daylight games only. Free and open to all.",
      "facilities": {
        "parking": true,
        "restrooms": true,
        "water": true,
        "seating": false
      },
      "distance": 2.8
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### GET /api/courts/:id - Single Court
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551001",
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
  "description": "Large outdoor basketball facility with multiple full courts. Popular spot with good lighting for night games. Well-maintained courts with painted lines.",
  "facilities": {
    "parking": true,
    "restrooms": true,
    "water": true,
    "seating": true
  }
}
```

#### GET /api/courts/:id/occupancy - Court Occupancy
```json
{
  "courtId": "770f9622-f30c-52e5-b827-557766551001",
  "courtName": "Sydney Park Basketball Courts",
  "activeCheckins": 6,
  "occupancyLevel": "moderate",
  "lastUpdated": "2024-02-16T11:15:00.000Z"
}
```

#### GET /api/courts/occupancy - Multiple Court Occupancies
```json
{
  "data": [
    {
      "courtId": "770f9622-f30c-52e5-b827-557766551001",
      "courtName": "Sydney Park Basketball Courts",
      "activeCheckins": 6,
      "occupancyLevel": "moderate"
    },
    {
      "courtId": "770f9622-f30c-52e5-b827-557766551002",
      "courtName": "Prince Alfred Park Courts",
      "activeCheckins": 2,
      "occupancyLevel": "low"
    },
    {
      "courtId": "770f9622-f30c-52e5-b827-557766551003",
      "courtName": "Redfern Park Basketball Courts",
      "activeCheckins": 0,
      "occupancyLevel": "empty"
    },
    {
      "courtId": "770f9622-f30c-52e5-b827-557766551004",
      "courtName": "Alexandria Park Community Centre",
      "activeCheckins": 10,
      "occupancyLevel": "high"
    },
    {
      "courtId": "770f9622-f30c-52e5-b827-557766551005",
      "courtName": "Bondi Pavilion Basketball Courts",
      "activeCheckins": 14,
      "occupancyLevel": "full"
    }
  ],
  "lastUpdated": "2024-02-16T11:15:00.000Z"
}
```

### Check-ins Responses

#### POST /api/checkins - Create Check-in
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551001",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "courtId": "770f9622-f30c-52e5-b827-557766551001",
  "checkedInAt": "2024-02-16T10:30:00.000Z",
  "checkedOutAt": null,
  "autoExpired": false,
  "court": {
    "id": "770f9622-f30c-52e5-b827-557766551001",
    "name": "Sydney Park Basketball Courts",
    "suburb": "Alexandria",
    "city": "Sydney"
  }
}
```

#### GET /api/checkins/active - Active Check-in
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551001",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "courtId": "770f9622-f30c-52e5-b827-557766551001",
  "checkedInAt": "2024-02-16T10:30:00.000Z",
  "checkedOutAt": null,
  "autoExpired": false,
  "court": {
    "id": "770f9622-f30c-52e5-b827-557766551001",
    "name": "Sydney Park Basketball Courts",
    "suburb": "Alexandria",
    "city": "Sydney"
  }
}
```

#### GET /api/checkins/active - No Active Check-in
```json
{
  "active": false
}
```

#### POST /api/checkins/:id/checkout - Checkout
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551001",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "courtId": "770f9622-f30c-52e5-b827-557766551001",
  "checkedInAt": "2024-02-16T10:30:00.000Z",
  "checkedOutAt": "2024-02-16T11:45:00.000Z",
  "autoExpired": false
}
```

#### GET /api/checkins - Check-in History
```json
{
  "data": [
    {
      "id": "880f9733-f30c-52e5-b827-557766551001",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "courtId": "770f9622-f30c-52e5-b827-557766551001",
      "checkedInAt": "2024-02-16T10:30:00.000Z",
      "checkedOutAt": null,
      "autoExpired": false,
      "court": {
        "id": "770f9622-f30c-52e5-b827-557766551001",
        "name": "Sydney Park Basketball Courts",
        "suburb": "Alexandria",
        "city": "Sydney"
      }
    },
    {
      "id": "880f9733-f30c-52e5-b827-557766551004",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "courtId": "770f9622-f30c-52e5-b827-557766551003",
      "checkedInAt": "2024-02-16T08:00:00.000Z",
      "checkedOutAt": "2024-02-16T09:30:00.000Z",
      "autoExpired": false,
      "court": {
        "id": "770f9622-f30c-52e5-b827-557766551003",
        "name": "Redfern Park Basketball Courts",
        "suburb": "Redfern",
        "city": "Sydney"
      }
    },
    {
      "id": "880f9733-f30c-52e5-b827-557766551005",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "courtId": "770f9622-f30c-52e5-b827-557766551005",
      "checkedInAt": "2024-02-15T18:00:00.000Z",
      "checkedOutAt": "2024-02-15T19:30:00.000Z",
      "autoExpired": true,
      "court": {
        "id": "770f9622-f30c-52e5-b827-557766551005",
        "name": "Bondi Pavilion Basketball Courts",
        "suburb": "Bondi Beach",
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

---

## Occupancy Level Calculation

Occupancy levels are calculated based on the number of active check-ins:

| Active Check-ins | Occupancy Level | Description |
|------------------|-----------------|-------------|
| 0 | `empty` | No one at the court |
| 1-3 | `low` | Light activity, plenty of space |
| 4-7 | `moderate` | Some activity, games available |
| 8-11 | `high` | Busy, may need to wait |
| 12+ | `full` | Very busy, long waits likely |

**Note:** These thresholds are estimates and don't account for actual court capacity (number of hoops).

---

## Data Relationships

### User → Refresh Tokens (One-to-Many)
```
users.id → refresh_tokens.user_id
```
- One user can have multiple refresh tokens (different devices)
- Tokens are cascade-deleted when user is deleted

### User → Check-ins (One-to-Many)
```
users.id → checkins.user_id
```
- One user can have many check-ins over time
- **Constraint:** Only ONE active check-in per user at a time
- Check-ins are cascade-deleted when user is deleted

### Court → Check-ins (One-to-Many)
```
courts.id → checkins.court_id
```
- One court can have many check-ins over time
- Multiple users can be checked in at the same court simultaneously
- Check-ins are cascade-deleted when court is deleted

### Complete Example: John's Session

**User:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "john.smith@gmail.com",
  "name": "John Smith"
}
```

**Active Token:**
```json
{
  "id": "660f9511-f30c-52e5-b827-557766551001",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "expires_at": "2024-03-18T10:30:00.000Z"
}
```

**Active Check-in:**
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551001",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "court_id": "770f9622-f30c-52e5-b827-557766551001",
  "checked_in_at": "2024-02-16T10:30:00.000Z",
  "checked_out_at": null
}
```

**Court:**
```json
{
  "id": "770f9622-f30c-52e5-b827-557766551001",
  "name": "Sydney Park Basketball Courts",
  "suburb": "Alexandria",
  "city": "Sydney"
}
```

---

## SQL Insert Examples

### Insert a User
```sql
INSERT INTO users (id, email, name, google_id, email_verified, last_login_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'john.smith@gmail.com',
  'John Smith',
  '105842077123456789012',
  true,
  NOW()
);
```

### Insert a Court
```sql
INSERT INTO courts (
  id, name, address, latitude, longitude, location,
  suburb, city, state, postcode, country,
  num_hoops, indoor, surface_type, has_lights, description, facilities
)
VALUES (
  '770f9622-f30c-52e5-b827-557766551001',
  'Sydney Park Basketball Courts',
  'Sydney Park Rd, Alexandria NSW 2015',
  -33.9142,
  151.1835,
  POINT(151.1835, -33.9142),
  'Alexandria',
  'Sydney',
  'NSW',
  '2015',
  'Australia',
  4,
  false,
  'concrete',
  true,
  'Large outdoor basketball facility with multiple full courts.',
  '{"parking": true, "restrooms": true, "water": true, "seating": true}'::jsonb
);
```

### Insert a Check-in
```sql
INSERT INTO checkins (id, user_id, court_id, checked_in_at)
VALUES (
  '880f9733-f30c-52e5-b827-557766551001',
  '550e8400-e29b-41d4-a716-446655440001',
  '770f9622-f30c-52e5-b827-557766551001',
  NOW()
);
```

---

## Notes

- All UUIDs are version 4 (random)
- Timestamps are stored in UTC with timezone (`TIMESTAMPTZ`)
- Token hashes are bcrypt with 10 salt rounds
- `location` field uses PostGIS `POINT` type for efficient spatial queries
- `facilities` is stored as JSONB for flexible structure
- All `null` values represent optional/unset fields
- Refresh tokens should never be stored in plain text
- Access tokens (JWTs) are not stored in database (stateless)

---

**For more information, see:**
- [README.md](README.md) - Complete API documentation
- [TESTING.md](TESTING.md) - Testing guide
- Database migrations in `src/db/migrations/`
