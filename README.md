# Fantasy Football 2025 Fee Tracker

A Fantasy Football fee tracker built using Supabase and Deno. It integrates with the Sleeper API to process weekly fees, calculate penalties, and send notifications via Discord.

## Setup

1. **Install Dependencies**
   ```bash
   npm install supabase
   ```

2. **Initialize Supabase**
   ```bash
   npx supabase init
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Environment Variables**
   Set in your Supabase project:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

## Architecture

- **Edge Functions**: Serverless functions in `supabase/functions/`
- **Database**: Postgres tables for leagues, matchups, transactions, fees
- **External APIs**: Sleeper API for league data, Discord for notifications

## Development

### Local Testing
```bash
# Start local development
npx supabase start

# Deploy function
npx supabase functions deploy process-weekly-fees

# Test function
curl -X POST http://localhost:54321/functions/v1/process-weekly-fees \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"week_number": 1, "league_id": "your-league-uuid"}'
```

### Database Schema
Key tables:
- `leagues`: League configuration and settings
- `matchups`: Weekly matchup results and fees
- `transactions`: Waiver/trade transaction fees
- `fee_summary`: Running totals per team

## Usage

The main function processes weekly fees by:
1. Fetching matchups from Sleeper API
2. Calculating loss fees and penalties
3. Storing results in database
4. Sending Discord notifications

## Key Files

- `supabase/functions/process-weekly-fees/index.ts`: Main processing logic
- `supabase/config.toml`: Supabase configuration
- `supabase/functions/process-weekly-fees/deno.json`: Deno module configuration