#!/bin/bash

# CourtPulse API - Troubleshooting Script

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "  CourtPulse API - Troubleshooting"
echo "========================================="
echo ""

ISSUES=0

# 1. Check Node.js
echo -e "${BLUE}1. Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not installed${NC}"
    echo "  Install from: https://nodejs.org/"
    ISSUES=$((ISSUES+1))
fi

# 2. Check npm
echo -e "\n${BLUE}2. Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not installed${NC}"
    ISSUES=$((ISSUES+1))
fi

# 3. Check PostgreSQL
echo -e "\n${BLUE}3. Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL client installed${NC}"

    # Check if server is running
    if brew services list | grep postgresql | grep started > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL server is running${NC}"
    else
        echo -e "${YELLOW}⚠ PostgreSQL server not running${NC}"
        echo "  Start with: brew services start postgresql@15"
        ISSUES=$((ISSUES+1))
    fi
else
    echo -e "${RED}✗ PostgreSQL not installed${NC}"
    echo "  Install with: brew install postgresql@15"
    ISSUES=$((ISSUES+1))
fi

# 4. Check .env file
echo -e "\n${BLUE}4. Checking .env file...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"

    # Check required variables
    source .env

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}✗ DATABASE_URL not set${NC}"
        ISSUES=$((ISSUES+1))
    else
        echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
    fi

    if [ -z "$JWT_SECRET" ]; then
        echo -e "${RED}✗ JWT_SECRET not set${NC}"
        ISSUES=$((ISSUES+1))
    else
        echo -e "${GREEN}✓ JWT_SECRET is set${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo "  Copy .env.example to .env and configure it"
    ISSUES=$((ISSUES+1))
fi

# 5. Check database connection
echo -e "\n${BLUE}5. Checking database connection...${NC}"
if [ -f .env ]; then
    source .env
    if [ -n "$DATABASE_URL" ]; then
        if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Database connection successful${NC}"
        else
            echo -e "${RED}✗ Cannot connect to database${NC}"
            echo "  Check your DATABASE_URL in .env"
            echo "  Current: $DATABASE_URL"
            ISSUES=$((ISSUES+1))
        fi
    fi
fi

# 6. Check port 3000
echo -e "\n${BLUE}6. Checking port 3000...${NC}"
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3000 is in use${NC}"
    echo "  Process using port:"
    lsof -i :3000 | grep LISTEN
    echo ""
    echo "  To fix, run: lsof -ti :3000 | xargs kill -9"
    ISSUES=$((ISSUES+1))
else
    echo -e "${GREEN}✓ Port 3000 is available${NC}"
fi

# 7. Check node_modules
echo -e "\n${BLUE}7. Checking dependencies...${NC}"
if [ -d node_modules ]; then
    echo -e "${GREEN}✓ node_modules exists${NC}"
else
    echo -e "${RED}✗ node_modules not found${NC}"
    echo "  Run: npm install"
    ISSUES=$((ISSUES+1))
fi

# 8. Check if database tables exist
echo -e "\n${BLUE}8. Checking database tables...${NC}"
if [ -f .env ]; then
    source .env
    if [ -n "$DATABASE_URL" ]; then
        if psql "$DATABASE_URL" -c "SELECT 1 FROM users LIMIT 1" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Database tables exist${NC}"
        else
            echo -e "${YELLOW}⚠ Database tables not found${NC}"
            echo "  Run migration: psql \$DATABASE_URL < src/db/migrations/001_create_auth_tables.sql"
            ISSUES=$((ISSUES+1))
        fi
    fi
fi

# Summary
echo ""
echo "========================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "You can now start the server with:"
    echo "  npm run dev"
else
    echo -e "${RED}❌ Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Please fix the issues above and try again."
fi
echo "========================================="
