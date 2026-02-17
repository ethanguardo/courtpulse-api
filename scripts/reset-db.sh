#!/bin/bash

# Reset database - drop all tables and re-run migrations
# Usage: npm run db:reset
# WARNING: This will delete ALL data!

set -e  # Exit on error

echo "⚠️  WARNING: This will DELETE ALL DATA in your database!"
echo ""

# Check if in production
if [ "$NODE_ENV" = "production" ]; then
  echo "❌ Error: Cannot reset database in production environment"
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  # Try to load from .env
  if [ -f .env ]; then
    export $(cat .env | grep DATABASE_URL | xargs)
  fi

  if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in environment or .env file"
    exit 1
  fi
fi

# Prompt for confirmation (skip if SKIP_CONFIRM=1)
if [ "$SKIP_CONFIRM" != "1" ]; then
  read -p "Are you sure you want to reset the database? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "❌ Database reset cancelled"
    exit 0
  fi
fi

echo ""
echo "🗑️  Dropping all tables..."

# Drop all tables (cascade will remove dependencies)
psql "$DATABASE_URL" -c "
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_courts_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_checkins_updated_at() CASCADE;
" > /dev/null 2>&1

echo "✅ Tables dropped"
echo ""

echo "🔨 Running migrations..."
echo ""

# Run migrations
echo "📄 Running: 001_create_auth_tables.sql"
psql "$DATABASE_URL" < src/db/migrations/001_create_auth_tables.sql > /dev/null 2>&1

echo "📄 Running: 002_create_courts_table.sql"
psql "$DATABASE_URL" < src/db/migrations/002_create_courts_table.sql > /dev/null 2>&1

echo "📄 Running: 003_create_checkins_table.sql"
psql "$DATABASE_URL" < src/db/migrations/003_create_checkins_table.sql > /dev/null 2>&1

echo "✅ Migrations complete"
echo ""

# Ask if user wants to seed data
if [ "$SKIP_CONFIRM" != "1" ]; then
  read -p "Would you like to seed sample data? (yes/no): " seed
  if [ "$seed" = "yes" ]; then
    echo ""
    bash scripts/seed-db.sh
  else
    echo ""
    echo "✨ Database reset complete (no seed data)"
    echo ""
    echo "💡 Run 'npm run db:seed' to add sample courts"
  fi
else
  # Auto-seed if confirmation is skipped
  echo ""
  bash scripts/seed-db.sh
fi
