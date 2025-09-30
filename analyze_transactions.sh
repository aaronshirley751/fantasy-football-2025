#!/bin/bash

# Count transactions by roster and type for 2025 league
echo "=== TRANSACTION ANALYSIS FOR 2025 LEAGUE ==="

echo "Getting Week 1 transactions..."
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/transactions/1" > /tmp/transactions.json

echo "Transaction Summary:"
echo "Total free agent transactions: $(grep -o '"type":"free_agent"' /tmp/transactions.json | wc -l)"
echo "Total commissioner transactions: $(grep -o '"type":"commissioner"' /tmp/transactions.json | wc -l)"

echo ""
echo "=== FREE AGENT TRANSACTIONS BY ROSTER ==="

# Extract roster_ids from free_agent transactions only
grep -A 10 -B 5 '"type":"free_agent"' /tmp/transactions.json | grep '"roster_ids":\[' | sed 's/.*"roster_ids":\[\([0-9]*\)\].*/\1/' | sort | uniq -c | sort -nr

echo ""
echo "=== ROSTER TO USER MAPPING ==="
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/users" | grep -o '"user_id":"[^"]*","display_name":"[^"]*"' | sed 's/"user_id":"[^"]*","display_name":"//' | sed 's/"//'

echo ""
echo "=== ROSTER OWNERSHIP ==="
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/rosters" | grep -o '"roster_id":[0-9]*,"owner_id":"[^"]*"' | sed 's/"roster_id":\([0-9]*\),"owner_id":"\([^"]*\)"/Roster \1: \2/'

rm -f /tmp/transactions.json
