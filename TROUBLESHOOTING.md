# Troubleshooting Guide

## Quick Fix Commands

### 1. Can't start server? Run diagnostics first

```bash
npm run troubleshoot
```

This checks:
- ✓ Node.js and npm installed
- ✓ PostgreSQL running
- ✓ Environment variables set
- ✓ Database connection working
- ✓ Port 3000 availability
- ✓ Dependencies installed
- ✓ Database tables exist

### 2. Port 3000 already in use?

```bash
npm run fix-port
```

Then try starting the server again:
```bash
npm run dev
```

---

## Common Issues

### ❌ "Port 3000 is already in use"

**Problem:** Another process is using port 3000.

**Quick fix:**
```bash
npm run fix-port
npm run dev
```

**Manual fix:**
```bash
lsof -ti :3000 | xargs kill -9
```

---

### ❌ "Cannot connect to database"

**Problem:** PostgreSQL isn't running or DATABASE_URL is wrong.

**Fix:**
```bash
# Start PostgreSQL
brew services start postgresql@15

# Check status
brew services list

# Test connection
source .env
psql $DATABASE_URL -c "SELECT 1"
```

---

### ❌ "Missing DATABASE_URL in .env"

**Problem:** .env file not configured.

**Fix:**
```bash
# Check if .env exists
ls -la .env

# If not, copy from example
cp .env.example .env

# Then edit .env with your settings
```

---

### ❌ "relation 'users' does not exist"

**Problem:** Database tables not created.

**Fix:**
```bash
# Run the migration
source .env
psql $DATABASE_URL < src/db/migrations/001_create_auth_tables.sql

# Verify
psql $DATABASE_URL -c "\dt"
```

---

### ❌ "Module not found" or dependency errors

**Problem:** Dependencies not installed.

**Fix:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ "Token expired" when testing

**Problem:** JWT access tokens expire after 15 minutes.

**Fix:** Use the refresh endpoint to get a new token:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

Or just login again:
```bash
curl -X POST http://localhost:3000/api/auth/dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

### ❌ Server starts but endpoints return 404

**Problem:** Code wasn't compiled or server needs restart.

**Fix:**
```bash
# Kill any running servers
npm run fix-port

# Rebuild
npm run build

# Start fresh
npm run dev
```

---

## Complete Server Reset

If everything is broken, start from scratch:

```bash
# 1. Stop all processes
npm run fix-port
pkill -f ts-node-dev

# 2. Clean dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Rebuild
npm run build

# 4. Check PostgreSQL
brew services restart postgresql@15

# 5. Test database connection
source .env
psql $DATABASE_URL -c "SELECT 1"

# 6. Run diagnostics
npm run troubleshoot

# 7. Start server
npm run dev
```

---

## Checking Server Status

### Is the server running?

```bash
curl http://localhost:3000/health
```

Expected: `{"ok":true}`

### What's using port 3000?

```bash
lsof -i :3000
```

### View server logs

Server logs appear in the terminal where you ran `npm run dev`.

---

## Database Issues

### Can't connect to PostgreSQL?

```bash
# Check if running
brew services list | grep postgresql

# Start if not running
brew services start postgresql@15

# Check logs
tail -f ~/Library/LaunchAgents/homebrew.mxcl.postgresql@15.plist
```

### Database exists but can't connect?

```bash
# Check DATABASE_URL format
cat .env | grep DATABASE_URL

# Should be: postgresql://user:password@host:port/database
# Example: postgresql://courtpulse:courtpulse@localhost:5432/courtpulse
```

### Reset database completely?

```bash
source .env

# Drop and recreate database (⚠️ THIS DELETES ALL DATA)
psql postgres -c "DROP DATABASE courtpulse;"
psql postgres -c "CREATE DATABASE courtpulse OWNER courtpulse;"

# Run migration again
psql $DATABASE_URL < src/db/migrations/001_create_auth_tables.sql
```

---

## Testing Issues

### Tests fail but server works?

```bash
# Make sure server is running first
npm run dev

# In another terminal, run tests
npm run test:auth
```

### jq not installed?

```bash
# Tests work without jq, but output is uglier
# To install jq for pretty JSON:
brew install jq
```

---

## Getting Help

1. **Run diagnostics first:**
   ```bash
   npm run troubleshoot
   ```

2. **Check server logs** in the terminal where `npm run dev` is running

3. **Verify database:**
   ```bash
   npm run db:inspect
   ```

4. **Check all systems:**
   ```bash
   # Node/npm
   node --version
   npm --version

   # PostgreSQL
   brew services list

   # Port availability
   lsof -i :3000

   # Database connection
   source .env && psql $DATABASE_URL -c "SELECT 1"
   ```

---

## Prevention Tips

- **Always stop the server gracefully**: Use `Ctrl+C` instead of closing the terminal
- **Check port before starting**: Run `npm run troubleshoot` if unsure
- **Keep PostgreSQL running**: It starts automatically on system boot once started with `brew services`
- **Update .env carefully**: Always use .env.example as reference

---

## Still Having Issues?

The server should work if:
1. PostgreSQL is running ✓
2. .env is configured ✓
3. Dependencies are installed ✓
4. Port 3000 is free ✓
5. Database tables exist ✓

Run `npm run troubleshoot` to verify all of these automatically!
