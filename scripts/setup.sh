#!/bin/bash

# Setup script for new developers
# Usage: npm run setup

set -e  # Exit on error

echo "🚀 CourtPulse API - Setup Script"
echo "================================"
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18 or higher is required (you have $(node -v))"
  exit 1
fi
echo "✅ Node.js $(node -v)"
echo ""

# Check if .env exists
echo "⚙️  Checking environment configuration..."
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please edit .env and set your DATABASE_URL and JWT_SECRET"
  echo ""
  read -p "Press enter to continue after editing .env..."
fi
echo "✅ .env file exists"
echo ""

# Load DATABASE_URL
export $(cat .env | grep DATABASE_URL | xargs)

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL not set in .env file"
  exit 1
fi

# Check PostgreSQL connection
echo "🐘 Checking PostgreSQL connection..."
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "✅ PostgreSQL connected"
else
  echo "❌ Error: Cannot connect to PostgreSQL"
  echo ""
  echo "💡 Make sure PostgreSQL is running:"
  echo "   brew services start postgresql@15"
  echo ""
  echo "💡 Or create the database:"
  echo "   psql -U postgres -c 'CREATE DATABASE courtpulse;'"
  exit 1
fi
echo ""

# Check if PostGIS is enabled
echo "🌍 Checking PostGIS extension..."
if psql "$DATABASE_URL" -c "SELECT PostGIS_version();" > /dev/null 2>&1; then
  echo "✅ PostGIS enabled"
else
  echo "📦 Enabling PostGIS extension..."
  psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS postgis;" > /dev/null 2>&1
  echo "✅ PostGIS enabled"
fi
echo ""

# Check if tables exist
echo "📊 Checking database tables..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ "$TABLE_COUNT" -lt 4 ]; then
  echo "🔨 Running database migrations..."
  psql "$DATABASE_URL" < src/db/migrations/001_create_auth_tables.sql > /dev/null 2>&1
  psql "$DATABASE_URL" < src/db/migrations/002_create_courts_table.sql > /dev/null 2>&1
  psql "$DATABASE_URL" < src/db/migrations/003_create_checkins_table.sql > /dev/null 2>&1
  echo "✅ Migrations complete"
else
  echo "✅ Tables already exist"
fi
echo ""

# Check if courts are seeded
echo "🏀 Checking for basketball courts..."
COURT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM courts;")

if [ "$COURT_COUNT" -eq 0 ]; then
  echo "🌱 Seeding basketball courts..."
  psql "$DATABASE_URL" < src/db/seeds/001_seed_courts.sql > /dev/null 2>&1
  echo "✅ Courts seeded"
else
  echo "✅ Courts already seeded ($COURT_COUNT courts)"
fi
echo ""

echo "✨ Setup complete!"
echo ""
echo "📊 Database Summary:"
psql "$DATABASE_URL" -c "
SELECT 'Courts' as item, COUNT(*)::text as count FROM courts
UNION ALL
SELECT 'Users', COUNT(*)::text FROM users
UNION ALL
SELECT 'Check-ins', COUNT(*)::text FROM checkins;
"

echo ""
echo "🚀 Next steps:"
echo "   1. Start the dev server:  npm run dev"
echo "   2. Test the API:          curl http://localhost:3000/health"
echo "   3. Run auth tests:        npm run test:auth"
echo ""
echo "📖 Documentation:"
echo "   - README.md       - Complete API documentation"
echo "   - DATA.md         - Sample data reference"
echo "   - TESTING.md      - Testing guide"
echo "   - QUICK_START.md  - Quick reference"
echo ""
