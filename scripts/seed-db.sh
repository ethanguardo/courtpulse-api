#!/bin/bash

# Seed database with sample data
# Usage: npm run db:seed

set -e  # Exit on error

echo "🌱 Seeding database with sample data..."
echo ""

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

echo "📍 Database: $DATABASE_URL"
echo ""

# Seed courts
echo "🏀 Seeding basketball courts..."
if psql "$DATABASE_URL" < src/db/seeds/001_seed_courts.sql > /dev/null 2>&1; then
  echo "✅ Courts seeded successfully"
else
  echo "❌ Failed to seed courts"
  exit 1
fi

echo ""
echo "✨ Database seeding complete!"
echo ""
echo "📊 Database summary:"
psql "$DATABASE_URL" -c "
SELECT
  'Users' as table_name,
  COUNT(*) as count
FROM users
UNION ALL
SELECT
  'Courts' as table_name,
  COUNT(*) as count
FROM courts
UNION ALL
SELECT
  'Check-ins' as table_name,
  COUNT(*) as count
FROM checkins
UNION ALL
SELECT
  'Active Check-ins' as table_name,
  COUNT(*) as count
FROM checkins
WHERE checked_out_at IS NULL;
"

echo ""
echo "🚀 Ready to go! Start the server with: npm run dev"
