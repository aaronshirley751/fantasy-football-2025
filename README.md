# Fantasy Football 2025 Fee Tracker

A comprehensive Fantasy Football fee tracker built using Supabase and Deno. It integrates with the Sleeper API to process weekly fees, calculate penalties, and send notifications via Discord with automated GitHub Actions workflows.

## í¾‰ Project Status: **PRODUCTION READY** 

### âœ… **Phase 1 - Core System (COMPLETED)**
- [x] Supabase project setup and configuration
- [x] Edge function development (`process-weekly-fees`)
- [x] TypeScript support with custom Deno types
- [x] Production deployment to Supabase
- [x] GitHub repository with full version control
- [x] Complete project documentation
- [x] CORS handling and error management
- [x] Sleeper API integration
- [x] Discord webhook notifications
- [x] Database schema and operations

### âœ… **Phase 2 - Automation (COMPLETED)**
- [x] GitHub Actions workflow for automated processing
- [x] Weekly scheduling (Tuesdays 2 AM EST after MNF)
- [x] Manual trigger capabilities with week number input
- [x] Repository secrets configuration
- [x] Workflow monitoring and error handling
- [x] End-to-end testing confirmed via Discord notifications

### âœ… **Phase 3 - Enhanced Features (DESIGNED & READY)**
- [x] Enhanced Discord notifications with owner names
- [x] Detailed fee breakdowns (loss vs transaction vs penalty)
- [x] Free transaction tracking (first 10 per roster)
- [x] Mulligan system for inactive players (first one free)
- [x] Season-to-date fee summaries
- [x] Comprehensive user experience improvements

## íº€ **System Architecture**

**Current Production Stack:**
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: PostgreSQL with optimized fantasy league schema
- **APIs**: Sleeper API for league data, Discord webhooks for notifications
- **Automation**: GitHub Actions for scheduled processing
- **Frontend**: Discord-based notifications and Supabase dashboard

## í³Š **Current Database Schema**

```sql
-- Core tables (ALL DEPLOYED & WORKING)
leagues          -- League configuration with Discord webhooks
users            -- Team owner mapping (roster_id â†’ username)
matchups         -- Weekly results and high scorer tracking
transactions     -- Waiver/trade fees from Sleeper API
inactive_penalties -- Lineup violation tracking
fee_summary      -- Running totals per roster with breakdowns
```

## í´§ **Production Deployment Details**

**Supabase Project:** `jfeuobfjgqownybluvje`
**Function URL:** `https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees`
**Repository:** `aaronshirley751/fantasy-football-2025`
**Current Version:** v2 (stable production release)

**Successfully Tested With:**
- Real league data (UUID: `d06f0672-2848-4b5d-86f5-9ab559605b4f`)
- Discord notifications confirmed working
- GitHub Actions automation triggered and executed
- All database operations validated

## í¾¯ **What Works Right Now**

### Core Fee Processing
- âœ… Loss fees: $5 per matchup loss
- âœ… Transaction fees: $1 per waiver/trade from Sleeper
- âœ… Inactive player penalties: $2 per inactive starter
- âœ… High scorer bonus tracking: -$5 for weekly top scorer
- âœ… Weekly fee calculations with database persistence
- âœ… Rich Discord notifications with team stats

### Automation Features
- âœ… Scheduled processing every Tuesday 2 AM EST
- âœ… Manual workflow triggers with week number selection
- âœ… Error handling and status reporting
- âœ… NFL season calendar integration
- âœ… Robust retry logic and logging

### Data Management
- âœ… Upsert operations prevent duplicate processing
- âœ… Season-long tracking with cumulative totals
- âœ… Real-time Sleeper API synchronization
- âœ… Comprehensive audit trails
- âœ… Discord webhook configuration per league

## í¾Š **START HERE: Next Session Tasks**

### íº¨ **IMMEDIATE PRIORITY: Enhanced Function Deployment**

**Issue:** Enhanced function with all advanced features ready but blocked by UTF-8 encoding error during deployment.

**What's Ready:**
- Enhanced Discord notifications with owner names (not roster IDs)
- Detailed fee breakdowns by type (loss/transaction/penalty)
- Season-to-date fee summaries per roster
- Free transaction logic (first 10 per roster)
- Mulligan system (first inactive player free per roster)
- Complete enhanced function saved as `index_enhanced.ts`

**Required Action:**
1. Fix UTF-8 encoding issue in enhanced function
2. Deploy enhanced version successfully
3. Test all new features with real data
4. Verify free transaction counting works correctly
5. Confirm mulligan system activates properly

### í³‹ **Session Continuation Steps**

1. **Encoding Fix & Deploy**
   ```bash
   cd "C:/Users/tasms/my-new-project/fantasy-football-2025"
   # Fix encoding in supabase/functions/process-weekly-fees/index_enhanced.ts
   # Deploy: npx supabase functions deploy process-weekly-fees
   ```

2. **Feature Validation**
   - Test enhanced Discord notifications
   - Verify owner name mapping works
   - Confirm free transaction logic
   - Validate mulligan system

3. **Documentation Updates**
   - Update this README with enhanced features
   - Create user guide for new functionality
   - Document business rules (10 free, 1 mulligan)

### í´ **Key Files for Next Session**

- `supabase/functions/process-weekly-fees/index_enhanced.ts` - Complete enhanced function
- `supabase/functions/process-weekly-fees/index.ts` - Current working production version
- `.github/workflows/weekly-fee-processing.yml` - Automation workflow
- Database needs no changes - all tables ready for enhanced features

### í²¡ **Known Working Configuration**

**Environment Variables Set:**
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY configured
- GitHub Repository Secrets: SUPABASE_FUNCTION_URL, SUPABASE_ANON_KEY
- Discord webhook URLs stored in database

**Validated League Setup:**
- Test league UUID: `d06f0672-2848-4b5d-86f5-9ab559605b4f`
- Discord notifications confirmed working
- All core processing logic tested and functional

---

> **Success Metric:** When enhanced function deploys successfully, you'll see Discord notifications with actual owner names like "John Smith owes $7 (Loss: $5, Penalty: $2)" instead of "Roster 4 owes $7"

## ï¿½ï¿½ **Quick Reference Guide**

### Current Working Commands
```bash
# Navigate to project
cd "C:/Users/tasms/my-new-project/fantasy-football-2025"

# Check function status
npx supabase functions list

# Deploy current working version
npx supabase functions deploy process-weekly-fees

# Test with real data
curl -X POST "https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"week_number": 1, "league_id": "d06f0672-2848-4b5d-86f5-9ab559605b4f"}'

# Check GitHub Actions
# Go to: https://github.com/aaronshirley751/fantasy-football-2025/actions
```

### GitHub Actions Automation
- **Schedule**: Every Tuesday 2:00 AM EST (after Monday Night Football)
- **Manual Trigger**: Available with week number input (1-18)
- **Workflow File**: `.github/workflows/weekly-fee-processing.yml`
- **Secrets Required**: `SUPABASE_FUNCTION_URL`, `SUPABASE_ANON_KEY`

### Project Files Overview
```
fantasy-football-2025/
â”œâ”€â”€ supabase/
â”‚   â”œâ”€â”€ config.toml                              # Supabase configuration
â”‚   â””â”€â”€ functions/process-weekly-fees/
â”‚       â”œâ”€â”€ index.ts                             # í¿¢ PRODUCTION (deployed)
â”‚       â”œâ”€â”€ index_enhanced.ts                    # í¿¡ ENHANCED (ready, encoding issue)
â”‚       â”œâ”€â”€ types.d.ts                           # TypeScript definitions
â”‚       â””â”€â”€ deno.json                            # Deno import configuration
â”œâ”€â”€ .github/workflows/
â”‚   â””â”€â”€ weekly-fee-processing.yml                # í¿¢ AUTOMATION (working)
â””â”€â”€ README.md                                    # This file
```

### Database Access
- **Supabase Dashboard**: https://supabase.com/dashboard/project/jfeuobfjgqownybluvje
- **Direct Database URL**: Available in Supabase settings
- **Tables Ready**: leagues, users, matchups, transactions, inactive_penalties, fee_summary

---

## í³ˆ **Project Evolution Timeline**

**Session 1 Achievements:**
1. âœ… Created complete Supabase-based fee tracking system
2. âœ… Implemented Discord notifications with rich embeds  
3. âœ… Built automated GitHub Actions workflow
4. âœ… Deployed and tested with real league data
5. âœ… Designed enhanced features with business logic
6. âœ… Established robust error handling and logging

**Next Session Goals:**
1. í¾¯ Deploy enhanced function with UTF-8 encoding fix
2. í¾¯ Validate free transaction and mulligan systems
3. í¾¯ Confirm enhanced Discord notifications
4. í¾¯ Complete comprehensive testing
5. í¾¯ Document final user guide

**Long-term Vision:**
- Multi-league support with league-specific configurations
- Web dashboard for fee management and reporting
- Mobile notifications via Discord bot commands
- Historical analytics and season comparisons
- Integration with additional fantasy platforms
