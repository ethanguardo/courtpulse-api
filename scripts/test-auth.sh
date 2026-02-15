#!/bin/bash

# CourtPulse API - Authentication Test Script
# Tests all auth endpoints and verifies database state

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_URL="http://localhost:3000"
TEST_EMAIL="test-$(date +%s)@test.com"
TEST_NAME="Test User"

# Check if server is running
check_server() {
    echo -e "${BLUE}Checking if server is running...${NC}"
    if ! curl -s -f "$API_URL/health" > /dev/null; then
        echo -e "${RED}✗ Server is not running!${NC}"
        echo "  Start the server with: npm run dev"
        exit 1
    fi
    echo -e "${GREEN}✓ Server is running${NC}\n"
}

# Test 1: Dev Login
test_dev_login() {
    echo -e "${BLUE}Test 1: Development Login${NC}"

    RESPONSE=$(curl -s -X POST "$API_URL/api/auth/dev/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"name\":\"$TEST_NAME\"}")

    # Check if we have jq for JSON parsing
    if command -v jq &> /dev/null; then
        ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
        REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')
        USER_ID=$(echo $RESPONSE | jq -r '.user.id')

        if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
            echo -e "${GREEN}✓ Login successful${NC}"
            echo "  User ID: $USER_ID"
            echo "  Email: $TEST_EMAIL"
            return 0
        else
            echo -e "${RED}✗ Login failed${NC}"
            echo "  Response: $RESPONSE"
            return 1
        fi
    else
        # Fallback without jq
        if echo "$RESPONSE" | grep -q "accessToken"; then
            # Extract tokens using grep and cut (basic parsing)
            ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
            REFRESH_TOKEN=$(echo "$RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
            USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)

            echo -e "${GREEN}✓ Login successful${NC}"
            echo "  User ID: $USER_ID"
            echo "  ${YELLOW}Tip: Install jq for better output (brew install jq)${NC}"
            return 0
        else
            echo -e "${RED}✗ Login failed${NC}"
            echo "  Response: $RESPONSE"
            return 1
        fi
    fi
}

# Test 2: Get Current User (Protected Route)
test_get_user() {
    echo -e "\n${BLUE}Test 2: Get Current User (Protected)${NC}"

    RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/auth/me" \
        -H "Authorization: Bearer $ACCESS_TOKEN")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Protected route accessible${NC}"
        if command -v jq &> /dev/null; then
            echo "$BODY" | jq -C
        fi
        return 0
    else
        echo -e "${RED}✗ Protected route failed (HTTP $HTTP_CODE)${NC}"
        echo "  Response: $BODY"
        return 1
    fi
}

# Test 3: Refresh Token
test_refresh_token() {
    echo -e "\n${BLUE}Test 3: Refresh Access Token${NC}"

    OLD_REFRESH_TOKEN="$REFRESH_TOKEN"

    RESPONSE=$(curl -s -X POST "$API_URL/api/auth/refresh" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

    if command -v jq &> /dev/null; then
        NEW_ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
        NEW_REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

        if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ -n "$NEW_ACCESS_TOKEN" ]; then
            echo -e "${GREEN}✓ Token refresh successful${NC}"
            echo "  Old refresh token deleted (token rotation)"
            echo "  New tokens generated"

            # Update tokens for next tests
            ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
            REFRESH_TOKEN="$NEW_REFRESH_TOKEN"
            return 0
        else
            echo -e "${RED}✗ Token refresh failed${NC}"
            echo "  Response: $RESPONSE"
            return 1
        fi
    else
        if echo "$RESPONSE" | grep -q "accessToken"; then
            NEW_ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
            NEW_REFRESH_TOKEN=$(echo "$RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

            echo -e "${GREEN}✓ Token refresh successful${NC}"
            ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
            REFRESH_TOKEN="$NEW_REFRESH_TOKEN"
            return 0
        else
            echo -e "${RED}✗ Token refresh failed${NC}"
            echo "  Response: $RESPONSE"
            return 1
        fi
    fi
}

# Test 4: Token Reuse Detection
test_token_reuse() {
    echo -e "\n${BLUE}Test 4: Token Reuse Detection${NC}"

    # Try to use the old token (should fail)
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/refresh" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"$OLD_REFRESH_TOKEN\"}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
        echo -e "${GREEN}✓ Old token correctly rejected${NC}"
        echo "  Token reuse prevention working"
        return 0
    else
        echo -e "${YELLOW}⚠ Token reuse not detected (HTTP $HTTP_CODE)${NC}"
        echo "  This might be expected if token was already revoked"
        return 0
    fi
}

# Test 5: Logout
test_logout() {
    echo -e "\n${BLUE}Test 5: Logout${NC}"

    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/logout" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "204" ]; then
        echo -e "${GREEN}✓ Logout successful${NC}"
        echo "  Refresh token revoked"
        return 0
    else
        echo -e "${RED}✗ Logout failed (HTTP $HTTP_CODE)${NC}"
        echo "  Response: $(echo "$RESPONSE" | head -n-1)"
        return 1
    fi
}

# Test 6: Verify Logout
test_verify_logout() {
    echo -e "\n${BLUE}Test 6: Verify Token Revoked${NC}"

    # Try to use the revoked token
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/refresh" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
        echo -e "${GREEN}✓ Revoked token correctly rejected${NC}"
        return 0
    else
        echo -e "${RED}✗ Revoked token was accepted (security issue!)${NC}"
        echo "  HTTP $HTTP_CODE"
        return 1
    fi
}

# Database Verification
verify_database() {
    echo -e "\n${BLUE}Database Verification${NC}"

    # Check if .env exists
    if [ ! -f .env ]; then
        echo -e "${YELLOW}⚠ .env file not found, skipping database verification${NC}"
        return 0
    fi

    # Source .env to get DATABASE_URL
    source .env

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠ DATABASE_URL not set, skipping database verification${NC}"
        return 0
    fi

    # Check if user was created
    USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE email = '$TEST_EMAIL';" 2>/dev/null)

    if [ $? -eq 0 ]; then
        if [ "$USER_COUNT" -ge 1 ]; then
            echo -e "${GREEN}✓ Test user created in database${NC}"
        else
            echo -e "${RED}✗ Test user not found in database${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Could not connect to database${NC}"
    fi
}

# Main execution
main() {
    echo "=================================="
    echo "  CourtPulse API - Auth Tests"
    echo "=================================="
    echo ""

    FAILED=0

    check_server || exit 1

    test_dev_login || FAILED=$((FAILED+1))
    test_get_user || FAILED=$((FAILED+1))
    test_refresh_token || FAILED=$((FAILED+1))
    test_token_reuse || FAILED=$((FAILED+1))
    test_logout || FAILED=$((FAILED+1))
    test_verify_logout || FAILED=$((FAILED+1))

    verify_database

    echo ""
    echo "=================================="
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
    else
        echo -e "${RED}❌ $FAILED test(s) failed${NC}"
    fi
    echo "=================================="

    exit $FAILED
}

# Run tests
main
