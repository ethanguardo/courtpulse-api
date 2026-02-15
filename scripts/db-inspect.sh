#!/bin/bash

# CourtPulse API - Database Inspection Script
# Quick commands to view users and tokens

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Make sure you're running this from the project root directory"
    exit 1
fi

# Source .env to get DATABASE_URL
source .env

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set in .env${NC}"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found${NC}"
    echo "Install PostgreSQL client tools"
    exit 1
fi

# Test database connection
if ! psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
    echo -e "${RED}Error: Could not connect to database${NC}"
    echo "Check your DATABASE_URL and make sure PostgreSQL is running"
    exit 1
fi

echo "========================================="
echo "  CourtPulse API - Database Inspector"
echo "========================================="
echo ""

# 1. Users
echo -e "${BLUE}=== Users ===${NC}"
psql "$DATABASE_URL" -c "
SELECT
    id,
    email,
    name,
    google_id,
    apple_id,
    email_verified,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
    TO_CHAR(last_login_at, 'YYYY-MM-DD HH24:MI:SS') as last_login
FROM users
ORDER BY created_at DESC
LIMIT 20;
"

# 2. User count
echo -e "\n${BLUE}=== User Statistics ===${NC}"
psql "$DATABASE_URL" -c "
SELECT
    COUNT(*) as total_users,
    COUNT(google_id) as google_users,
    COUNT(apple_id) as apple_users,
    COUNT(CASE WHEN email_verified THEN 1 END) as verified_emails
FROM users;
"

# 3. Active refresh tokens
echo -e "\n${BLUE}=== Active Refresh Tokens ===${NC}"
psql "$DATABASE_URL" -c "
SELECT
    rt.id,
    rt.user_id,
    u.email,
    TO_CHAR(rt.created_at, 'YYYY-MM-DD HH24:MI:SS') as created,
    TO_CHAR(rt.expires_at, 'YYYY-MM-DD HH24:MI:SS') as expires,
    CASE
        WHEN rt.expires_at > NOW() THEN '✓ Valid'
        ELSE '✗ Expired'
    END as status
FROM refresh_tokens rt
JOIN users u ON rt.user_id = u.id
WHERE rt.revoked_at IS NULL
ORDER BY rt.created_at DESC
LIMIT 20;
"

# 4. Token statistics
echo -e "\n${BLUE}=== Token Statistics ===${NC}"
psql "$DATABASE_URL" -c "
SELECT
    COUNT(*) as total_tokens,
    COUNT(CASE WHEN revoked_at IS NULL THEN 1 END) as active_tokens,
    COUNT(CASE WHEN revoked_at IS NOT NULL THEN 1 END) as revoked_tokens,
    COUNT(CASE WHEN expires_at < NOW() AND revoked_at IS NULL THEN 1 END) as expired_tokens
FROM refresh_tokens;
"

# 5. Tokens per user
echo -e "\n${BLUE}=== Tokens Per User ===${NC}"
psql "$DATABASE_URL" -c "
SELECT
    u.email,
    COUNT(CASE WHEN rt.revoked_at IS NULL THEN 1 END) as active_tokens,
    COUNT(CASE WHEN rt.revoked_at IS NOT NULL THEN 1 END) as revoked_tokens
FROM users u
LEFT JOIN refresh_tokens rt ON u.id = rt.user_id
GROUP BY u.id, u.email
HAVING COUNT(rt.id) > 0
ORDER BY active_tokens DESC
LIMIT 10;
"

# 6. Recently revoked tokens
echo -e "\n${BLUE}=== Recently Revoked Tokens ===${NC}"
psql "$DATABASE_URL" -c "
SELECT
    u.email,
    TO_CHAR(rt.created_at, 'YYYY-MM-DD HH24:MI:SS') as created,
    TO_CHAR(rt.revoked_at, 'YYYY-MM-DD HH24:MI:SS') as revoked,
    EXTRACT(EPOCH FROM (rt.revoked_at - rt.created_at))/60 as lifetime_minutes
FROM refresh_tokens rt
JOIN users u ON rt.user_id = u.id
WHERE rt.revoked_at IS NOT NULL
ORDER BY rt.revoked_at DESC
LIMIT 10;
"

# 7. Recent login activity
echo -e "\n${BLUE}=== Recent Login Activity ===${NC}"
psql "$DATABASE_URL" -c "
SELECT
    email,
    name,
    TO_CHAR(last_login_at, 'YYYY-MM-DD HH24:MI:SS') as last_login,
    CASE
        WHEN last_login_at > NOW() - INTERVAL '1 hour' THEN 'Just now'
        WHEN last_login_at > NOW() - INTERVAL '1 day' THEN 'Today'
        WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 'This week'
        ELSE 'Older'
    END as recency
FROM users
WHERE last_login_at IS NOT NULL
ORDER BY last_login_at DESC
LIMIT 10;
"

echo ""
echo "========================================="
echo -e "${GREEN}✓ Database inspection complete${NC}"
echo "========================================="
