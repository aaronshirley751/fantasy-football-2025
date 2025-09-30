# Copilot Instructions for Fantasy Football 2025

## Overview
This project is a **production-ready Fantasy Football fee tracker** built using Supabase Edge Functions and Deno. It integrates with the Sleeper API to process weekly fees, calculate penalties, and send rich Discord notifications with automated GitHub Actions workflows. The system has been validated with real league data processing $99.00 in actual fees.

## 🚨 CURRENT STATUS: September 16, 2025 - Season Active
- **Production State**: System should be running live with 2025 league data
- **2025 League ID**: `1249067741470539776` (verified active, "in_season" status)
- **Legacy Test League**: `d06f0672-2848-4b5d-86f5-9ab559605b4f` (historical validation data)
- **Critical Business Rule**: **August 24, 2025 cutoff** - only post-draft transactions count toward fees
- **GitHub Actions**: Should be re-enabled for weekly Tuesday 2 AM EST processing

## Architecture & Key Components
- **Supabase Edge Functions**: Located in `fantasy-fee-tracker/supabase/functions/`. Three main functions:
  - `process-weekly-fees/`: Core fee processing logic (552 lines, production-deployed)
  - `setup-league/`: League configuration management with `setup_2025_league` action capability
  - `debug-league/`: Development and testing utilities
- **Database**: PostgreSQL with enhanced schema supporting owner mapping, transaction tracking, and mulligan system
- **External APIs**: Sleeper API for league data + Discord webhooks for rich notifications  
- **Automation**: GitHub Actions with weekly scheduling and manual triggers

## Project Structure
```
Fantasy Football 2025/
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
│       └── weekly-fee-processing.yml    # Automated scheduling (16+ successful historical runs)
├── fantasy-fee-tracker/
│   ├── supabase/
│   │   ├── config.toml
│   │   └── functions/
│   │       ├── process-weekly-fees/     # Main function (552 lines)
│   │       ├── setup-league/            # Configuration management
│   │       └── debug-league/           # Testing utilities
│   └── README.md
├── analysis scripts/                    # Transaction analysis tools (created Sept 4, 2025)
│   ├── count_transactions.js
│   ├── post_draft_transaction_analysis.js  # Implements August 24 cutoff rule
│   ├── transaction_audit.js
│   └── enhanced_transaction_analysis.js
└── SESSION_SUMMARY_2025-09-04.md      # Critical findings and business rule changes
```

## Enhanced Features (All Production-Ready)
### 1. **Owner Name Attribution System**
- Fetches actual owner names from Sleeper API instead of "Team X"
- Stores mappings in `users` table for persistence
- Shows "John Smith owes $7" in Discord notifications

### 2. **Free Transaction System** 
- **10 free waiver/free agent claims** per roster per season
- **Trades are always free** (excluded from transaction fees)
- Discord shows "[FREE] waiver (9 remaining)" indicators
- After 10 free: $2 per waiver/free agent transaction

### 3. **Mulligan System**
- First inactive player penalty waived per roster per season  
- Shows "[MULLIGAN] Free inactive player: PlayerName" in Discord
- Subsequent inactive players: $5 penalty each

## 🔍 CRITICAL BUSINESS RULE: August 24, 2025 Transaction Cutoff
**ESTABLISHED SEPTEMBER 4, 2025**: Only transactions occurring on/after August 24, 2025 count toward the 10 free transaction limit.

**Rationale**: Pre-draft roster cleanup should not count toward competitive limits.
**Implementation**: `const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime();`
**Impact**: Prevented $16 in incorrect pre-season fees, all teams start with 10 free transactions.

## Developer Workflows
### Environment Setup
```bash
cd fantasy-fee-tracker
npm install supabase
npx supabase link --project-ref jfeuobfjgqownybluvje
```

### Function Development & Deployment
```bash
# Deploy main function (use this for any code changes)
npx supabase functions deploy process-weekly-fees

# Deploy all functions
npx supabase functions deploy setup-league
npx supabase functions deploy debug-league

# Local testing (Docker required)
npx supabase functions serve process-weekly-fees
```

### Transaction Analysis Workflow (Critical for Fee Validation)
```bash
# Download current transaction data for analysis
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/transactions/1" > transactions.json
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/users" > users.json  
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/rosters" > rosters.json

# Run post-draft analysis (implements August 24 cutoff)
node post_draft_transaction_analysis.js

# Detailed audit for investigating discrepancies
node transaction_audit.js
```

### Testing Production Function
```bash
# Test with 2025 live league data  
curl -X POST https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"week_number": 1, "league_id": "1249067741470539776"}'
```

## Project-Specific Conventions
### Enhanced TypeScript Patterns
```typescript
// Enhanced FeeData interface with owner attribution
interface FeeData {
  roster_id: number;
  type: string;
  amount: number;
  description: string;
  owner_name?: string; // Enhanced: Shows actual names in Discord
}

// User mapping for owner name resolution
interface UserMapping {
  roster_id: number;
  sleeper_user_id: string;
  display_name: string;
}

// Transaction tracking for free transaction system
interface TransactionStats {
  roster_id: number;
  transactions_used: number;
  free_transactions_remaining: number;
  mulligan_used: boolean;
}
```

### Database Operations
- **Always use `upsert`** for idempotent operations to handle duplicate processing
- **Enhanced schema**: All fee records include `owner_name` field for Discord display
- **Transaction counting**: Only waiver/free agent claims count toward free limit (trades excluded)

### Discord Notification Format
```typescript
// Enhanced Discord embed with owner names and transaction indicators
const embed = {
  title: "Weekly Fee Summary - Week 16 Results",
  fields: [
    { name: "John Smith", value: "$12 (Loss: $5, Inactive: $5, Transaction: $2)" },
    { name: "Mike Johnson", value: "[FREE] waiver (9 remaining)" },
    { name: "Sarah Williams", value: "[MULLIGAN] Free inactive player: Josh Allen" },
    { name: "Tom Davis", value: "[FREE] Trade transaction" }
  ]
}
```

## Critical Business Logic
### Fee Structure (Final Validated Version)
- **Loss fees**: $5 per weekly matchup loss
- **Transaction fees**: $2 per waiver/free agent **after 10 free** (trades always free)
- **Inactive penalties**: $5 per inactive starter **after first mulligan**
- **High scorer bonus**: -$5 for weekly top scorer

### Transaction Fee Logic (CRITICAL)
```typescript
// CRITICAL: August 24, 2025 cutoff rule for transaction counting
const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime();
const validTransactions = transactions.filter(t => t.created >= draftCutoff);

// CORRECT: Trades excluded from transaction fees  
if (['waiver', 'free_agent'].includes(transaction.type)) {
  // Apply free transaction logic and fees after 10 free
} else if (transaction.type === 'trade') {
  // Trades are always free - no fees, no transaction count
  fee_amount: 0
}
```

## Environment Variables & Configuration
- `SUPABASE_URL`: Project URL for database connection
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for full database access
- **Production Project**: `jfeuobfjgqownybluvje`
- **2024 Test League**: `d06f0672-2848-4b5d-86f5-9ab559605b4f` (historical data for validation)
- **2025 Live League**: `1249067741470539776` (verified active, ready for transition)

## GitHub Actions Integration
- **Scheduled**: Every Tuesday 2 AM EST (after Monday Night Football) - **CURRENTLY DISABLED**
- **Manual triggers**: Support week number input via `workflow_dispatch`
- **Success rate**: 16+ consecutive successful runs validated
- **Error handling**: Comprehensive logging with Discord notifications
- **Production Safety**: Cron schedule commented out to prevent test data execution during 2025 season start

## 2025 Season Transition Workflow
### Execute Clean Transition (When Ready)
```bash
# 1. Clear test data and configure 2025 league
curl -X POST https://jfeuobfjgqownybluvje.supabase.co/functions/v1/setup-league \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"action": "setup_2025_league", "league_id_2025": "1249067741470539776"}'

# 2. Test Week 1 processing manually
curl -X POST https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"week_number": 1, "league_id": "1249067741470539776"}'

# 3. Update GitHub Actions default league_id to 2025 league
# 4. Re-enable cron schedule in .github/workflows/weekly-fee-processing.yml
```

## Common Development Patterns
- **Import structure**: Use `/// <reference path="./types.d.ts" />` for custom types
- **CORS handling**: Always include `corsHeaders` in all responses
- **Error responses**: Return JSON with proper HTTP status codes
- **API integration**: Sleeper API rate limit: 1000 requests/minute
- **Upsert strategy**: Use `onConflict` parameters for duplicate prevention

## Testing & Validation
- **Real data validation**: $99.00 in actual fees processed with Week 16 data
- **Enhanced features confirmed**: Owner names, free transactions, mulligan system all working
- **Discord integration**: "2025 FFL Tracker" server receiving rich notifications
- **Database operations**: All enhanced features validated with real league data
- **Production safety**: Emergency prevention system implemented for 2025 season start
- **Manual control**: All processing under explicit control until live season validated
