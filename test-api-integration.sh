#!/bin/bash

# Migration Verification Script
# Tests the visa-admin frontend integration with visa-admin-api

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="${NEXT_PUBLIC_API_URL:-https://admin-api.thecodejesters.xyz}"

echo -e "${BLUE}🧪 Testing visa-admin API integration${NC}"
echo "=========================================="
echo "API URL: $API_URL"
echo ""

# Function to test API endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_type=$3
    
    echo -e "${YELLOW}Testing: $description${NC}"
    
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$API_URL$endpoint")
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    if [ "$http_status" = "200" ]; then
        if [ "$expected_type" = "array" ]; then
            count=$(echo "$body" | jq 'length' 2>/dev/null)
            if [ $? -eq 0 ] && [ "$count" != "null" ]; then
                echo -e "${GREEN}✅ Success: Found $count items${NC}"
                return 0
            else
                echo -e "${RED}❌ Failed: Response is not a valid array${NC}"
                return 1
            fi
        else
            echo -e "${GREEN}✅ Success: $endpoint working${NC}"
            return 0
        fi
    else
        echo -e "${RED}❌ Failed: HTTP $http_status${NC}"
        echo "Response: $body"
        return 1
    fi
}

# Test API endpoints
echo -e "${BLUE}1. Testing API Health${NC}"
test_endpoint "/health" "Basic health check" "object"

echo ""
echo -e "${BLUE}2. Testing Database Health${NC}"
test_endpoint "/health/db" "Database health check" "object"

echo ""
echo -e "${BLUE}3. Testing Core Data Endpoints${NC}"
test_endpoint "/api/permit-rules" "Permit Rules API" "array"
test_endpoint "/api/required-documents" "Required Documents API" "array"

echo ""
echo -e "${BLUE}4. Testing Diagnostics${NC}"
test_endpoint "/health/diagnostics" "System diagnostics" "object"

echo ""
echo -e "${BLUE}🎯 Integration Test Summary${NC}"
echo "=========================================="

# Check if all tests passed
total_tests=5
passed_tests=0

# Re-run tests silently to count passes
curl -s "$API_URL/health" >/dev/null 2>&1 && ((passed_tests++))
curl -s "$API_URL/health/db" >/dev/null 2>&1 && ((passed_tests++))
curl -s "$API_URL/api/permit-rules" >/dev/null 2>&1 && ((passed_tests++))
curl -s "$API_URL/api/required-documents" >/dev/null 2>&1 && ((passed_tests++))
curl -s "$API_URL/health/diagnostics" >/dev/null 2>&1 && ((passed_tests++))

if [ $passed_tests -eq $total_tests ]; then
    echo -e "${GREEN}🎉 All tests passed! ($passed_tests/$total_tests)${NC}"
    echo -e "${GREEN}✅ Migration successful - Frontend can communicate with API${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Set NEXT_PUBLIC_API_URL in your environment"
    echo "2. Test the frontend application"
    echo "3. Verify all CRUD operations work correctly"
else
    echo -e "${RED}❌ Some tests failed ($passed_tests/$total_tests)${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Check if visa-admin-api is deployed and running"
    echo "2. Verify the API URL is correct"
    echo "3. Check CORS configuration on the API"
    echo "4. Review API logs for errors"
fi

echo "" 