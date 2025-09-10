# Copilot Instructions for Fantasy Football 2025

## Overview
This project is a **production-ready Fantasy Football fee tracker** built using Supabase Edge Functions and Deno. It integrates with the Sleeper API to process weekly fees, calculate penalties, and send rich Discord notifications with automated GitHub Actions workflows. The system has been validated with real league data processing $99.00 in actual fees.

**CRITICAL STATUS (September 9, 2025)**: System is production-ready but requires authentication resolution and 2025 league transition to begin live operation. Automated scheduling is SAFELY DISABLED to prevent test data execution.

## Architecture & Key Components
- **Supabase Edge Functions**: Located in `fantasy-fee-tracker/supabase/functions/`. Three main functions:
  - `process-weekly-fees/`: Core fee processing logic (552 lines, Version 6 deployed)
  - `setup-league/`: League configuration management with 2025 transition capability
  - `debug-league/`: Development and testing utilities
- **Database**: PostgreSQL with enhanced schema supporting owner mapping, transaction tracking, and mulligan system
- **External APIs**: Sleeper API for league data + Discord webhooks for rich notifications
- **Automation**: GitHub Actions with weekly scheduling (CURRENTLY DISABLED) and manual triggers

## Project Structure
```
Fantasy Football 2025/
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
│       └── weekly-fee-processing.yml    # Automated scheduling (DISABLED for safety)
├── SESSION_SUMMARY_2025-09-04.md       # Latest session findings & transaction analysis
├── TRANSACTION_INVESTIGATION_FINDINGS.txt # Critical transaction audit results
├── count_transactions.js               # Transaction analysis tools
├── post_draft_transaction_analysis.js  # August 24 cutoff analysis
└── fantasy-fee-tracker/
    ├── supabase/
    │   ├── config.toml
    │   └── functions/
    │       ├── process-weekly-fees/     # Main function (552 lines)
    │       ├── setup-league/            # Configuration management + 2025 setup
    │       └── debug-league/           # Testing utilities
    └── README.md                        # Current production status & action plan
```

## 2025 Season Transition Status (CRITICAL)
### Current State (September 9, 2025)
- **Live League ID**: `1249067741470539776` (verified active, in_season, 10 teams)
- **Test League ID**: `d06f0672-2848-4b5d-86f5-9ab559605b4f` (2024 historical data, $99 validation)
- **Database**: Still configured with test data - needs transition
- **GitHub Actions**: SAFELY DISABLED to prevent test data execution during live season
- **Authentication**: Requires Supabase ANON_KEY or SERVICE_ROLE_KEY for production execution
- **Transaction Cutoff**: August 24, 2025 rule established (only post-draft transactions count)

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

### 2025 Season Transition (CRITICAL NEXT STEPS)
```bash
# 1. Execute database transition to 2025 league (requires authentication token)
curl -X POST 'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/setup-league' \
  -H 'Authorization: Bearer [ANON_KEY or SERVICE_ROLE_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"action": "setup_2025_league", "league_id": "1249067741470539776"}'

# 2. Test Week 1 processing with live league
curl -X POST 'https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees' \
  -H 'Authorization: Bearer [TOKEN]' \
  -d '{"league_id": "1249067741470539776", "week": 1}'
```

### Testing Production Function (Historical Validation)
```bash
# Test with validated 2024 historical data (Week 16 validated with $99.00 fees)
curl -X POST https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"week_number": 16, "league_id": "d06f0672-2848-4b5d-86f5-9ab559605b4f"}'
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
// CORRECT: Trades excluded from transaction fees  
if (['waiver', 'free_agent'].includes(transaction.type)) {
  // Apply free transaction logic and fees after 10 free
} else if (transaction.type === 'trade') {
  // Trades are always free - no fees, no transaction count
  fee_amount: 0
}
```

### August 24, 2025 Transaction Cutoff Rule (CRITICAL)
```typescript
// Only count transactions after August 24, 2025 (post-draft)
const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime();
const validTransactions = transactions.filter(t => t.created >= draftCutoff);
```

## Environment Variables & Configuration
- `SUPABASE_URL`: Project URL for database connection
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for full database access
- **Production Project**: `jfeuobfjgqownybluvje`
- **Test League ID**: `d06f0672-2848-4b5d-86f5-9ab559605b4f` (2024 historical data for validation)
- **Live League ID**: `1249067741470539776` (2025 active league - not yet configured in database)

## GitHub Actions Integration
- **Scheduled**: Every Tuesday 2 AM EST (after Monday Night Football)
- **Manual triggers**: Support week number input via `workflow_dispatch`
- **Success rate**: 16+ consecutive successful runs validated
- **Error handling**: Comprehensive logging with Discord notifications
- **SAFETY STATUS**: Cron schedule currently DISABLED to prevent test data execution during live season

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
