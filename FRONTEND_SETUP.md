# Frontend Setup Guide

Quick guide for frontend developers to get started with the CourtPulse API.

## Backend Status

✅ **Backend is ready for frontend development!**

The API includes:
- Authentication system (dev login, Google OAuth, Apple Sign-In)
- Basketball court discovery with location search
- Check-ins and real-time occupancy tracking
- 12+ seeded basketball courts in Sydney

---

## Quick Start

### 1. Start the Backend

```bash
cd courtpulse-api
npm run dev
```

Server runs at: **http://localhost:3000**

### 2. Test the API

```bash
# Health check
curl http://localhost:3000/health

# List all courts
curl http://localhost:3000/api/courts

# Dev login (get auth tokens)
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"frontend@test.com","name":"Frontend Dev"}'
```

---

## API Base URL

**Development:** `http://localhost:3000`

All endpoints are prefixed with `/api/` except health checks.

---

## Authentication Flow

### 1. Login (Development Mode)

For development, use the dev login endpoint (no OAuth required):

```javascript
const response = await fetch('http://localhost:3000/api/auth/dev/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'Test User'
  })
});

const { accessToken, refreshToken, user } = await response.json();

// Store tokens securely
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "Test User",
    "profilePictureUrl": null
  }
}
```

### 2. Make Authenticated Requests

Include the access token in the Authorization header:

```javascript
const response = await fetch('http://localhost:3000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const user = await response.json();
```

### 3. Token Refresh

Access tokens expire after **15 minutes**. When you get a 401 error, refresh the token:

```javascript
const response = await fetch('http://localhost:3000/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();

// Update stored tokens
localStorage.setItem('accessToken', newAccessToken);
localStorage.setItem('refreshToken', newRefreshToken);
```

**Important:** The old refresh token is deleted (single-use). Always save the new tokens!

### 4. Logout

```javascript
await fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ refreshToken })
});

// Clear stored tokens
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

---

## Court Discovery

### List All Courts

```javascript
const response = await fetch('http://localhost:3000/api/courts');
const { data, pagination } = await response.json();

// data: array of courts
// pagination: { total, limit, offset, hasMore }
```

**Response:**
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
      "description": "Large outdoor basketball facility...",
      "facilities": {
        "parking": true,
        "restrooms": true,
        "water": true,
        "seating": true
      }
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

### Search by Location

Find courts near a specific location:

```javascript
// User's current location
const latitude = -33.8688;  // Sydney CBD
const longitude = 151.2093;
const radiusKm = 5;  // Within 5km

const response = await fetch(
  `http://localhost:3000/api/courts?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`
);

const { data } = await response.json();
// Each court includes a "distance" field in kilometers
```

### Filter Courts

```javascript
// Indoor courts only
const response = await fetch('http://localhost:3000/api/courts?indoor=true');

// Courts with lights
const response = await fetch('http://localhost:3000/api/courts?hasLights=true');

// Courts in specific suburb
const response = await fetch('http://localhost:3000/api/courts?suburb=Alexandria');

// Combined filters
const response = await fetch(
  'http://localhost:3000/api/courts?indoor=true&hasLights=true&city=Sydney'
);
```

### Get Single Court

```javascript
const courtId = '770f9622-f30c-52e5-b827-557766551001';
const response = await fetch(`http://localhost:3000/api/courts/${courtId}`);
const court = await response.json();
```

---

## Check-ins

### Check In at a Court

User must be authenticated:

```javascript
const response = await fetch('http://localhost:3000/api/checkins', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courtId: '770f9622-f30c-52e5-b827-557766551001'
  })
});

const checkin = await response.json();
```

**Response:**
```json
{
  "id": "880f9733-f30c-52e5-b827-557766551001",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "courtId": "770f9622-f30c-52e5-b827-557766551001",
  "checkedInAt": "2024-02-17T10:30:00.000Z",
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

**Notes:**
- Only one active check-in per user
- Checking in at a new court auto-checks out from previous court
- Check-ins auto-expire after 90 minutes

### Get Active Check-in

```javascript
const response = await fetch('http://localhost:3000/api/checkins/active', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const checkin = await response.json();

// If no active check-in:
// { "active": false }

// If checked in:
// { id, userId, courtId, checkedInAt, court: {...} }
```

### Manual Checkout

```javascript
const checkinId = '880f9733-f30c-52e5-b827-557766551001';

await fetch(`http://localhost:3000/api/checkins/${checkinId}/checkout`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Get Check-in History

```javascript
const response = await fetch(
  'http://localhost:3000/api/checkins?limit=20&offset=0',
  { headers: { 'Authorization': `Bearer ${accessToken}` } }
);

const { data, pagination } = await response.json();
```

---

## Occupancy Tracking

### Get Court Occupancy

Get real-time player count at a specific court:

```javascript
const courtId = '770f9622-f30c-52e5-b827-557766551001';
const response = await fetch(`http://localhost:3000/api/courts/${courtId}/occupancy`);
const occupancy = await response.json();
```

**Response:**
```json
{
  "courtId": "770f9622-f30c-52e5-b827-557766551001",
  "courtName": "Sydney Park Basketball Courts",
  "activeCheckins": 6,
  "occupancyLevel": "moderate",
  "lastUpdated": "2024-02-17T11:15:00.000Z"
}
```

**Occupancy Levels:**
- `empty` - 0 players
- `low` - 1-3 players
- `moderate` - 4-7 players
- `high` - 8-11 players
- `full` - 12+ players

### Get Multiple Court Occupancies

Get occupancy for nearby courts:

```javascript
const latitude = -33.8688;
const longitude = 151.2093;
const radiusKm = 10;

const response = await fetch(
  `http://localhost:3000/api/courts/occupancy?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`
);

const { data, lastUpdated } = await response.json();

// data: array of { courtId, courtName, activeCheckins, occupancyLevel }
```

Or by specific court IDs:

```javascript
const courtIds = [
  '770f9622-f30c-52e5-b827-557766551001',
  '770f9622-f30c-52e5-b827-557766551002'
];

const response = await fetch(
  `http://localhost:3000/api/courts/occupancy?courtIds=${courtIds.join(',')}`
);
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message"
}
```

Or with details:

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

**Common Status Codes:**
- `200` - Success
- `201` - Created (check-ins)
- `204` - No Content (logout)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (dev endpoint in production)
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Handling

```javascript
async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // Handle token expiry
  if (response.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (refreshResponse.ok) {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refreshResponse.json();

      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Retry original request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`
        }
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response;
}
```

---

## CORS Configuration

CORS is enabled for all origins in development. The API accepts requests from any domain.

If you encounter CORS errors:
1. Check the backend is running on port 3000
2. Verify you're using `http://localhost:3000` (not `127.0.0.1`)
3. Check browser console for specific CORS error messages

---

## Available Endpoints

### Health & Info
- `GET /health` - API health check (includes database status)
- `GET /` - API information and endpoint list

### Authentication
- `POST /api/auth/dev/login` - Dev login (no OAuth)
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/apple` - Apple Sign-In login
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (requires auth)

### Courts
- `GET /api/courts` - List all courts (with filters)
- `GET /api/courts/:id` - Get single court
- `GET /api/courts/:id/occupancy` - Get court occupancy
- `GET /api/courts/occupancy` - Get multiple court occupancies

### Check-ins
- `POST /api/checkins` - Check in at a court (requires auth)
- `POST /api/checkins/:id/checkout` - Manual checkout (requires auth)
- `GET /api/checkins/active` - Get active check-in (requires auth)
- `GET /api/checkins` - Get check-in history (requires auth)

---

## Example React Hook

Here's a sample React hook for authentication:

```javascript
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      fetchUser(accessToken);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser(token) {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, name) {
    const response = await fetch(`${API_URL}/api/auth/dev/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });

    if (response.ok) {
      const { accessToken, refreshToken, user } = await response.json();
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      return true;
    }
    return false;
  }

  async function logout() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }

  return { user, loading, login, logout };
}
```

---

## Sample Courts in Database

The database includes 12 basketball courts in Sydney:

1. Sydney Park Basketball Courts (Alexandria)
2. Prince Alfred Park Courts (Surry Hills)
3. Redfern Park Basketball Courts (Redfern)
4. Alexandria Park Community Centre (Alexandria) - Indoor
5. Bondi Pavilion Basketball Courts (Bondi Beach)
6. Marrickville Youth Resource Centre (Marrickville) - Indoor
7. Victoria Park Basketball Courts (Camperdown)
8. Cook and Phillip Park Basketball Courts (Sydney CBD) - Indoor
9. Green Square Recreation Centre (Zetland) - Indoor
10. Erskineville Park Basketball Courts (Erskineville)
11. Centennial Park Basketball Courts (Centennial Park)
12. St Peters Park Basketball Courts (St Peters)

---

## Development Tips

### Testing Different Users

Each dev login creates a new user account. Use different emails to test multi-user scenarios:

```javascript
await login('alice@test.com', 'Alice');
await login('bob@test.com', 'Bob');
```

### Simulating Occupancy

Check in multiple users at the same court to test occupancy levels:

```javascript
// User 1 checks in
await fetch('http://localhost:3000/api/checkins', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${user1Token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ courtId })
});

// User 2 checks in at same court
await fetch('http://localhost:3000/api/checkins', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${user2Token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ courtId })
});

// Check occupancy
const response = await fetch(`http://localhost:3000/api/courts/${courtId}/occupancy`);
// Should show: activeCheckins: 2, occupancyLevel: "low"
```

### Pagination

All list endpoints support pagination:

```javascript
// First page (20 results)
fetch('http://localhost:3000/api/courts?limit=20&offset=0');

// Second page
fetch('http://localhost:3000/api/courts?limit=20&offset=20');

// Check hasMore in pagination response
const { data, pagination } = await response.json();
if (pagination.hasMore) {
  // Load more...
}
```

---

## Troubleshooting

### Backend not responding?

```bash
# Make sure it's running
cd courtpulse-api
npm run dev

# Check port 3000 is free
lsof -i :3000

# Kill process if needed
npm run fix-port
```

### No courts showing up?

```bash
# Seed the database
npm run db:seed
```

### Database errors?

```bash
# Check database connection
npm run troubleshoot

# Reset database (WARNING: deletes all data)
npm run db:reset
```

### CORS errors?

- Ensure backend is running on `http://localhost:3000`
- Try accessing `http://localhost:3000/health` in your browser
- Check browser console for specific error message

---

## Resources

- **Complete API Docs:** `README.md`
- **Sample Data:** `DATA.md`
- **Testing Guide:** `TESTING.md`
- **Quick Reference:** `QUICK_START.md`

---

## Support

Questions? Check the main `README.md` or run:

```bash
npm run troubleshoot
```

**Happy coding!** 🏀🚀
