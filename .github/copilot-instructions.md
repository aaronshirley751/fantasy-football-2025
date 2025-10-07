# Copilot Instructions for Fantasy Football 2025

## Overview
This project is a **production-ready Fantasy Football fee tracker** built using Supabase Edge Functions (Deno) and PostgreSQL. It integrates with the Sleeper API to process weekly fees, calculate penalties, and sends rich Discord notifications via automated GitHub Actions workflows. The system is **fully operational** with live 2025 season data.

## 🚨 CURRENT STATUS: October 7, 2025 - Production Live
- **Production State**: ✅ FULLY OPERATIONAL with Discord integration (Version 73)
- **2025 League ID**: `1249067741470539776` (active, in_season)
- **Season Progress**: Week 5+ (as of October 2025), $132+ processed through Week 4
- **Critical Business Rule**: **August 24, 2025 cutoff** - only post-draft transactions count toward free transaction limit
- **GitHub Actions**: ✅ ENABLED - Automated Tuesday 2 AM EST processing active

## Architecture & Key Components
- **Supabase Edge Functions**: Located in `fantasy-fee-tracker/supabase/functions/`
  - `process-weekly-fees/`: Core fee processor (Version 73, 462 lines) with Discord integration
  - `setup-league/`: League configuration management
  - `debug-league/`: Development and testing utilities
- **Database**: PostgreSQL with enhanced schema (see `migrations/20250921083000_create_fee_summaries_table.sql`)
  - Tables: `leagues`, `users`, `matchups`, `transactions`, `inactive_penalties`, `fee_summaries`
  - Key feature: `discord_webhook_url` in leagues table for notifications
- **External APIs**: 
  - Sleeper API: League data, rosters, transactions, matchups (1000 req/min limit)
  - Discord webhooks: Rich formatted notifications with emojis
- **Automation**: GitHub Actions `.github/workflows/weekly-fee-processing.yml`
  - Scheduled: Every Tuesday 2 AM EST (7 AM UTC)
  - Manual triggers: `workflow_dispatch` with week number input
  - Success rate: 16+ consecutive successful runs

## Data Flow Architecture
```
Sleeper API → Edge Function → PostgreSQL → Discord Webhook
     ↓              ↓              ↓              ↓
  Matchups    Fee Calc     Upsert Ops    Formatted
  Rosters     Business     fee_summaries  Messages
  Transactions Rules       + user names   + Emojis
  Players     Mulligans
```

## Project Structure
```
Fantasy Football 2025/
├── .github/
│   ├── copilot-instructions.md            # This file
│   └── workflows/
│       └── weekly-fee-processing.yml      # Production automation (active)
├── fantasy-fee-tracker/
│   ├── supabase/
│   │   ├── config.toml                    # Supabase project config
│   │   ├── functions/
│   │   │   └── process-weekly-fees/       # Main function (Version 73, 462 lines)
│   │   │       ├── index.ts               # Core logic with Discord integration
│   │   │       └── types.d.ts             # TypeScript definitions
│   │   └── migrations/
│   │       └── 20250921083000_create_fee_summaries_table.sql
│   └── README.md
├── Utility Scripts/ (root directory)      # 100+ analysis/testing scripts
│   ├── CONFIGURE_DISCORD_WEBHOOK_FOR_TESTING.js  # Discord setup
│   ├── CHECK_WEBHOOK_CONFIG.js            # Webhook validation
│   ├── enhanced_transaction_analysis.js   # August 24 cutoff validation
│   ├── comprehensive_all_rosters_audit.js # Full roster audit
│   └── check_database_state.js            # DB verification
└── Documentation/ (root directory)
    ├── README.md                          # Comprehensive production docs
    ├── COMMIT_MESSAGE_OCTOBER_1_2025.md   # Latest deployment details
    └── SESSION_SUMMARY_2025-09-04.md      # Critical business rule findings
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

### 4. **Discord Integration (Version 73)**
- Rich formatted notifications with emojis (📊 🏆 💰)
- Weekly summary with individual fees and season totals
- Webhook URL stored in `leagues.discord_webhook_url` field
- Approved format: Single message with weekly + season breakdown
- Safety: Only sends if webhook URL is configured (NULL check)

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

### Production Testing
```bash
# Test with 2025 live league data  
curl -X POST https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"week_number": 4, "league_id": "1249067741470539776"}'

# Expected response includes:
# - success: true
# - discord_sent: true (if webhook configured)
# - week_total: "20"
# - season_grand_total: "132"
```

### Transaction Analysis Workflow (Critical for Fee Validation)
```bash
# Download current transaction data for analysis
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/transactions/1" > transactions.json
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/users" > users.json  
curl -s "https://api.sleeper.app/v1/league/1249067741470539776/rosters" > rosters.json

# Run post-draft analysis (implements August 24 cutoff)
node enhanced_transaction_analysis.js

# Detailed audit for investigating discrepancies
node comprehensive_all_rosters_audit.js
```

### Discord Configuration
```bash
# Configure webhook URL for notifications
node CONFIGURE_DISCORD_WEBHOOK_FOR_TESTING.js

# Verify webhook configuration in database
node CHECK_WEBHOOK_CONFIG.js

# Test production function with Discord
node TRIGGER_PRODUCTION_FUNCTION.js
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

// Season summary with detailed breakdowns
interface SeasonSummary {
  roster_id: number;
  owner_name: string;
  season_total: number;
  transaction_fees: number;
  losses_inactive_fees: number;
  high_scorer_bonuses: number;
  transactions_used: number;
  free_remaining: number;
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

// Approved production format (Version 73):
message = `📊 Week ${weekNumber} Fantasy Football Fees
🏆 Highest Scorer
${owner}: ${points} pts (-$5 bonus)
🆕 THIS WEEK'S ACTIVITY
━━━━━━━━━━━━━━━━━━━━━━━━
• ${owner}: Loss ($5) = $5.00
💰 Week Total
$${weekTotal}
📈 SEASON TOTALS (All Teams)
━━━━━━━━━━━━━━━━━━━━━━━━
• ${owner}: $${total} total ($X transactions, $Y losses/inactive, -$Z high scorer bonus), ${free}/10 free remaining
🏦 Season Grand Total
$${seasonGrandTotal} across all teams`;
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
- **2025 Live League**: `1249067741470539776` (active, in production)
- **Discord Webhook**: Configured in `leagues.discord_webhook_url` (per league)

## GitHub Actions Integration
- **Scheduled**: Every Tuesday 2 AM EST (7 AM UTC) - **CURRENTLY ACTIVE**
- **Manual triggers**: `workflow_dispatch` with week number and league ID inputs
- **Success rate**: 16+ consecutive successful runs validated
- **Error handling**: Comprehensive logging with Discord notifications
- **Auto-calculation**: Automatically determines current NFL week from season start date

## Common Development Patterns
- **Import structure**: Use `/// <reference path="./types.d.ts" />` for custom types
- **CORS handling**: Always include `corsHeaders` in all responses
- **Error responses**: Return JSON with proper HTTP status codes
- **API integration**: Sleeper API rate limit: 1000 requests/minute
- **Upsert strategy**: Use `onConflict` parameters for duplicate prevention

## Testing & Validation
- **Production validation**: $132+ in actual fees processed through Week 4+ (October 2025)
- **Enhanced features confirmed**: Owner names, free transactions, mulligan system all working
- **Discord integration**: Live with approved format and emoji indicators
- **Database operations**: All enhanced features validated with real 2025 league data
- **Automation verified**: GitHub Actions running weekly with 100% success rate
- **Real-time processing**: Sub-3-second execution with immediate Discord delivery
