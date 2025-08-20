# GitHub Actions Setup Guide

## Ì¥ê Required GitHub Secrets

Your workflow is now deployed, but you need to add these secrets to your GitHub repository:

### How to Add Secrets:
1. Go to: https://github.com/aaronshirley751/fantasy-football-2025/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret below:

### Required Secrets:

**SUPABASE_FUNCTION_URL**
- Value: `https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees`
- Description: URL to your deployed Supabase edge function

**SUPABASE_ANON_KEY** 
- Value: Get from https://supabase.com/dashboard/project/jfeuobfjgqownybluvje/settings/api
- Description: Your Supabase anonymous/public key (starts with `eyJ...`)

## Ì∫Ä How to Use the Workflow

### Automatic Execution:
- Runs every Tuesday at 2 AM EST
- Automatically calculates the current NFL week
- Processes fees and sends Discord notifications

### Manual Execution:
1. Go to: https://github.com/aaronshirley751/fantasy-football-2025/actions
2. Click "Weekly Fantasy Football Fee Processing"
3. Click "Run workflow"
4. Enter the week number you want to process
5. Click "Run workflow"

## Ì≥ä Monitoring

### Check Results:
- Go to the Actions tab to see workflow runs
- Each run shows a summary with success/failure status
- Failed runs include error details in the logs

### Discord Notifications:
- Successful runs will post fee summaries to your Discord channel
- Manual runs and scheduled runs work the same way

## Ìª†Ô∏è Customization

### Change Schedule:
Edit `.github/workflows/weekly-fee-processing.yml`:
- Current: `0 7 * * 2` (Tuesday 2 AM EST)
- Syntax: https://crontab.guru/

### Change Default Week Calculation:
Modify the `start_date` in the workflow to match NFL season start.

## ‚úÖ Next Steps

1. Add the GitHub secrets above
2. Test with manual workflow run
3. Verify Discord notification works
4. Schedule is ready for automatic weekly processing!
