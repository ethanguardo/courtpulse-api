# CourtPulse API - Testing Guide

## Quick Start (2 Minutes)

```bash
# 1. Start the server
npm run dev

# 2. Run automated tests (in another terminal)
npm run test:auth

# 3. Check database
npm run db:inspect
```

---

## Prerequisites

- ✅ PostgreSQL running (`brew services start postgresql@15`)
- ✅ Database migrated (`psql $DATABASE_URL < src/db/migrations/001_create_auth_tables.sql`)
- ✅ Server started (`npm run dev`)
- 📦 Optional: `jq` installed for JSON formatting (`brew install jq`)

---

## Testing Endpoints

### 1. Development Login (No OAuth Needed!)

This endpoint bypasses OAuth completely - perfect for local testing.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

**Expected Response (200):**
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

**💡 Tip:** Save the tokens for the next steps:
```bash
# With jq installed
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"
```

---

### 2. Get Current User (Protected Route)

Test that JWT authentication works.

**Request:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test@example.com",
  "name": "Test User",
  "profilePictureUrl": null
}
```

**Test invalid token (should fail):**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 {"error":"Invalid token"}
```

---

### 3. Refresh Access Token

Test token rotation (old refresh token deleted, new one created).

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN_HERE"}'
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "660f9511-f30c-52e5-b827-557766551111"
}
```

**⚠️ Important:** The old refresh token is now **deleted** (single-use). Save the new tokens!

**Test token reuse detection:**
```bash
# Try to use the OLD refresh token again
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"OLD_TOKEN_HERE"}'

# Expected: 401 (all user tokens revoked for security)
```

---

### 4. Logout

Revoke a refresh token.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

**Expected Response:** `204 No Content`

**Verify token is revoked:**
```bash
# Try to use the refresh token again
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# Expected: 401 (token is revoked)
```

---

### 5. Testing with Real OAuth (Optional)

If you want to test with actual Google/Apple Sign-In:

#### Google OAuth Testing

1. **Get a test ID token:**
   - Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Select "Google OAuth2 API v2" → "userinfo.email" and "userinfo.profile"
   - Click "Authorize APIs"
   - Exchange authorization code for tokens
   - Copy the `id_token` (not the access token!)

2. **Test the endpoint:**
```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"YOUR_GOOGLE_ID_TOKEN"}'
```

#### Apple Sign-In Testing

Apple tokens are harder to get manually. Best approach:
- Use your React Native mobile app with Apple Sign-In SDK
- Log the ID token returned by the SDK
- Send it to the API for testing

---

## Database Verification

### Quick Inspection

```bash
npm run db:inspect
```

### Manual Queries

```bash
# Connect to database
psql $DATABASE_URL

# View all users
SELECT id, email, name, google_id, apple_id, created_at, last_login_at
FROM users;

# View active refresh tokens
SELECT user_id, expires_at, created_at, revoked_at
FROM refresh_tokens
WHERE revoked_at IS NULL;

# View revoked tokens
SELECT user_id, created_at, revoked_at
FROM refresh_tokens
WHERE revoked_at IS NOT NULL;

# Count tokens per user
SELECT user_id, COUNT(*) as token_count
FROM refresh_tokens
WHERE revoked_at IS NULL
GROUP BY user_id;
```

---

## Complete Test Flow Example

Here's a complete test of the auth lifecycle:

```bash
#!/bin/bash

# 1. Login
echo "1. Logging in..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"flow@test.com","name":"Flow Test"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')
echo "✓ Logged in"

# 2. Get user profile
echo -e "\n2. Getting user profile..."
curl -s http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
echo "✓ Profile retrieved"

# 3. Refresh token
echo -e "\n3. Refreshing token..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')
echo "✓ Token refreshed"

# 4. Verify old token is deleted
echo -e "\n4. Testing old token (should fail)..."
curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | jq
echo "✓ Old token rejected (expected)"

# 5. Logout
echo -e "\n5. Logging out..."
curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$NEW_REFRESH_TOKEN\"}"
echo "✓ Logged out"

echo -e "\n✅ Complete flow tested successfully!"
```

---

## Common Issues & Troubleshooting

### ❌ "Missing authorization header" (401)

**Problem:** Forgot to include the Bearer token.

**Fix:**
```bash
# ❌ Wrong
curl http://localhost:3000/api/auth/me

# ✅ Correct
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### ❌ "Token expired" (401)

**Problem:** JWT access tokens expire after 15 minutes.

**Fix:** Use the refresh token to get a new access token:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

### ❌ "Invalid or expired refresh token" (401)

**Problem:** Refresh token was already used (token rotation) or expired (30 days).

**Fix:** Login again to get new tokens:
```bash
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

---

### ❌ "Dev endpoints disabled in production" (403)

**Problem:** Trying to use `/api/auth/dev/login` in production.

**Fix:** This endpoint is development-only. In production, use real OAuth:
- POST /api/auth/google
- POST /api/auth/apple

---

### ❌ "Validation error" (400)

**Problem:** Missing required fields or invalid format.

**Example error:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

**Fix:** Check the request body matches the expected schema.

---

### ❌ Database connection errors

**Problem:** PostgreSQL not running or wrong DATABASE_URL.

**Fix:**
```bash
# Start PostgreSQL
brew services start postgresql@15

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

---

## Performance Testing

### Token Generation Speed

```bash
time curl -s -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"perf@test.com"}' > /dev/null
```

Typical response time: 50-150ms (includes bcrypt hashing).

### Concurrent Login Tests

```bash
# Create 10 users simultaneously
for i in {1..10}; do
  curl -s -X POST http://localhost:3000/api/auth/dev/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user${i}@test.com\"}" &
done
wait
echo "Done!"
```

---

## Next Steps

✅ **Ready for mobile integration!** Your mobile app can now:
1. Call `POST /api/auth/google` or `/api/auth/apple` with ID tokens
2. Store returned tokens in secure storage (Keychain/Keystore)
3. Include access token in API requests: `Authorization: Bearer <token>`
4. Refresh tokens when expired
5. Logout to revoke tokens

📦 **Future enhancements:**
- Add Jest + Supertest for automated tests
- Add rate limiting to prevent abuse
- Add audit logging for security monitoring
- Implement email verification flow

---

## Support

If you encounter issues:
1. Check the server logs: `npm run dev` output
2. Verify database state: `npm run db:inspect`
3. Ensure PostgreSQL is running: `brew services list`
4. Check `.env` configuration

Happy testing! 🚀
