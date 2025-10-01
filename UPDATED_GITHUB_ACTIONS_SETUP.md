# GitHub Actions Setup Guide - Updated October 1, 2025

## Required Secrets

To enable the weekly automated fee processing, you need to configure the following secret in your GitHub repository:

### 1. SUPABASE_SERVICE_ROLE_KEY

**Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ`

**How to add**:
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SUPABASE_SERVICE_ROLE_KEY`
5. Value: (paste the key above)
6. Click **Add secret**

## Workflow Schedule

The workflow is configured to run:
- **Automatically**: Every Tuesday at 2 AM EST (7 AM UTC) after Monday Night Football
- **Manually**: Via workflow dispatch with custom week number

## Current Configuration (Production Ready)

- **League ID**: `1249067741470539776` (2025 Production League)
- **Function URL**: `https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees`
- **Season Start**: September 5, 2025 (Week 1)
- **Max Weeks**: 18 (regular season)
- **Real-time Data**: Uses current transaction data with August 24, 2025 cutoff rule

## Manual Execution

To run the workflow manually:
1. Go to **Actions** tab in GitHub
2. Select "Weekly Fantasy Football Fee Processing"
3. Click **Run workflow**
4. Enter the week number you want to process
5. Optionally modify the league ID (defaults to 2025 production)
6. Click **Run workflow**

## Monitoring & Output

The workflow will:
- ✅ Process fees using production function with all business rules
- ✅ Generate detailed summary with week total, season total, and fee counts
- ✅ Show success/failure status with helpful troubleshooting
- ✅ Store all data in Supabase database for future access

### Example Success Output:
```
🏈 Week 4 Fee Processing Complete
- League ID: 1249067741470539776
- Week Number: 4
- Week Total: $20.00
- Season Total: $132.00
- Fees Processed: 6
- Status: ✅ Success
```

## Getting Formatted Discord Messages

The workflow processes and stores data in the database. To get the approved Discord format:

1. **Local Option**: Run `node FORMAT_APPROVED_DISCORD.js` locally
2. **Production Verification**: Function returns JSON data that can be formatted as needed

## Features Included

✅ **Real-time 2025 season data**  
✅ **August 24, 2025 transaction cutoff rule**  
✅ **Multi-week season totals calculation**  
✅ **Separated loss/inactive vs high scorer bonus tracking**  
✅ **Owner name attribution from Sleeper API**  
✅ **10 free transactions per season rule**  
✅ **Automatic NFL week calculation**  
✅ **Error handling and detailed logging**  

## Status: Production Ready ✅

The GitHub Actions workflow is fully configured and ready for automated weekly processing of the 2025 fantasy football season!