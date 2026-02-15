# Quick Start - Testing Commands

## Start the Server

```bash
npm run dev
```

Server runs at: http://localhost:3000

---

## Automated Testing (Recommended)

Run all tests with one command:

```bash
npm run test:auth
```

Expected output:
```
✅ All tests passed!
✓ Dev login successful
✓ Protected route accessible
✓ Token refresh working
✓ Logout successful
✓ Database state verified
```

---

## Manual Testing with curl

### 1. Login (Get Tokens)

```bash
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Test User"}'
```

**Save the tokens from the response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "550e8400-...",
  "user": { ... }
}
```

### 2. Get Current User (Protected Route)

```bash
# Replace YOUR_ACCESS_TOKEN with the token from step 1
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Refresh Token

```bash
# Replace YOUR_REFRESH_TOKEN with the token from step 1
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

**Important:** Old refresh token is deleted (single-use). Save the new tokens!

### 4. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

## Database Inspection

View users and tokens in the database:

```bash
npm run db:inspect
```

Shows:
- All users
- Active refresh tokens
- Token statistics
- Recently revoked tokens
- Login activity

---

## Complete Test Flow (One Script)

Save tokens automatically with jq:

```bash
# Install jq if needed: brew install jq

# 1. Login and save tokens
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"flow@test.com","name":"Flow Test"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

echo "Logged in!"

# 2. Get user profile
curl -s http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq

# 3. Refresh token
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

echo "Token refreshed!"

# 4. Logout
curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

echo "Logged out!"
```

---

## Database Commands

### Connect to Database

```bash
source .env
psql $DATABASE_URL
```

### View Users

```sql
SELECT id, email, name, created_at FROM users;
```

### View Active Tokens

```sql
SELECT user_id, expires_at, created_at
FROM refresh_tokens
WHERE revoked_at IS NULL;
```

### Count Tokens by User

```sql
SELECT u.email, COUNT(*) as token_count
FROM users u
JOIN refresh_tokens rt ON u.id = rt.user_id
WHERE rt.revoked_at IS NULL
GROUP BY u.email;
```

---

## Troubleshooting

### Server not running?

```bash
# Check if PostgreSQL is running
brew services list

# Start PostgreSQL if needed
brew services start postgresql@15

# Start the API server
npm run dev
```

### Clear test data?

```bash
# Delete all test users
source .env
psql $DATABASE_URL -c "DELETE FROM users WHERE email LIKE '%@test.com';"
```

### Check server logs?

The `npm run dev` terminal shows all requests and errors in real-time.

---

## For Full Documentation

See `TESTING.md` for:
- Complete API reference
- Error handling examples
- Real OAuth testing (Google/Apple)
- Security considerations
- Performance testing

---

## Summary

**Quick commands:**
- `npm run dev` - Start server
- `npm run test:auth` - Run all tests
- `npm run db:inspect` - View database

**That's it!** You can now test your entire authentication system without needing OAuth credentials. 🚀
