# Copilot Instructions for Fantasy Football 2025

## Overview
This project is a Fantasy Football fee tracker built using Supabase and Deno. It integrates with the Sleeper API to process weekly fees, calculate penalties, and send notifications via Discord. The project is structured to support edge functions and database interactions.

## Key Components
- **Supabase Edge Functions**: Located in `fantasy-fee-tracker/supabase/functions/`. These are serverless functions that handle core logic, such as processing weekly fees.
- **Database**: Managed by Supabase, with tables for leagues, matchups, transactions, and fee summaries.
- **External APIs**: Integrates with the Sleeper API for league data and Discord for notifications.

## Project Structure
```
Fantasy Football 2025/
├── .github/
│   └── copilot-instructions.md
└── fantasy-fee-tracker/
    ├── supabase/
    │   ├── config.toml
    │   └── functions/
    │       └── process-weekly-fees/
    │           ├── index.ts
    │           └── deno.json
    └── README.md
```

## Developer Workflows
### Setting Up the Environment
1. Install the Supabase CLI locally:
   ```bash
   npm install supabase
   ```
2. Initialize Supabase:
   ```bash
   npx supabase init
   ```
3. Link to your Supabase project:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

### Working with Edge Functions
1. Create new function:
   ```bash
   npx supabase functions new function-name
   ```
2. Deploy function:
   ```bash
   npx supabase functions deploy process-weekly-fees
   ```
3. Test locally:
   ```bash
   npx supabase functions serve process-weekly-fees
   ```

### Database Schema
Key tables and their relationships:
- `leagues`: Configuration (fees, discord webhook, sleeper league ID)
- `matchups`: Weekly results, winners/losers, high scorer tracking
- `transactions`: Waiver/trade fees from Sleeper API
- `fee_summary`: Running totals per roster

## Project-Specific Conventions
- **CORS Headers**: All edge function responses include CORS headers for cross-origin requests
- **Error Handling**: Errors returned as JSON with appropriate HTTP status codes
- **Database Operations**: Use `upsert` for idempotent operations to handle duplicate processing
- **Type Safety**: TypeScript interfaces defined for Discord embeds, fee data, and API responses

## Integration Points
- **Sleeper API Endpoints**:
  - `/league/{id}/matchups/{week}`: Weekly matchup results
  - `/league/{id}/rosters`: Team roster information
  - `/league/{id}/users`: League member details
  - `/league/{id}/transactions/{week}`: Waiver/trade activity

- **Discord Webhooks**: Rich embeds with fee summaries, high scorer recognition, and weekly totals

## Key Files
- `fantasy-fee-tracker/supabase/functions/process-weekly-fees/index.ts`: Main processing logic
- `fantasy-fee-tracker/supabase/config.toml`: Supabase project configuration
- `fantasy-fee-tracker/supabase/functions/process-weekly-fees/deno.json`: Deno imports and compiler options

## Development Patterns
### Fee Processing Flow
1. Fetch league configuration from database
2. Retrieve weekly data from Sleeper API
3. Process matchups and identify winners/losers
4. Calculate fees (loss fees, inactive player penalties, transaction fees)
5. Update database with results and fee totals
6. Send Discord notification with summary

### TypeScript Patterns
```typescript
// Define interfaces for type safety
interface FeeData {
  roster_id: number;
  type: string;
  amount: number;
  description: string;
}

// Use proper typing for Discord embeds
interface DiscordEmbed {
  title: string;
  color: number;
  fields: EmbedField[];
  footer: { text: string; icon_url: string; };
  timestamp: string;
}
```

## Environment Variables
- `SUPABASE_URL`: Project URL for database connection
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for full database access
- Discord webhook URLs stored in league configuration table

## Common Issues & Solutions
- **Module Import Errors**: Use `deno.json` imports mapping for external dependencies
- **Type Errors**: Define proper TypeScript interfaces for all data structures
- **CORS Issues**: Always include corsHeaders in edge function responses
- **Rate Limiting**: Sleeper API allows 1000 requests/minute, batch operations when possible

## Testing
```bash
# Local function testing
curl -X POST http://localhost:54321/functions/v1/process-weekly-fees \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"week_number": 1, "league_id": "uuid-here"}'
```
