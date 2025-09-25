# Getting Fresh Supabase Credentials

## Method 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/jfeuobfjgqownybluvje
   - Log in with your Supabase account

2. **Navigate to Settings > API:**
   - Click on "Settings" in the left sidebar
   - Click on "API" 
   - You'll see your API keys

3. **Get Both Keys:**
   - **anon/public key**: Starts with `eyJ...` (for GitHub Actions)
   - **service_role key**: Also starts with `eyJ...` (for local testing)

4. **Copy the Fresh Keys:**
   - The anon key is safe to use in GitHub Actions
   - The service_role key should be kept private but can be used for local testing

## Method 2: Supabase CLI (Alternative)

If you have Supabase CLI installed and linked:

```bash
cd fantasy-fee-tracker
npx supabase status
```

This will show your local project URLs and may have API info.

## Method 3: Check GitHub Secrets

Your GitHub repository should have these secrets configured:
- `SUPABASE_ANON_KEY` - for the GitHub Actions workflow
- `SUPABASE_FUNCTION_URL` - the function endpoint URL

To check/update GitHub secrets:
1. Go to: https://github.com/aaronshirley751/fantasy-football-2025/settings/secrets/actions
2. Update `SUPABASE_ANON_KEY` with fresh anon key from dashboard

## Next Steps After Getting Credentials:

1. **Test Locally**: Update the PowerShell script with fresh service_role key
2. **Update GitHub Secrets**: Ensure GitHub Actions has fresh anon key  
3. **Run Backfill**: Execute the critical backfill for Weeks 1 & 2
4. **Verify Results**: Check that SaladBar751 shows correct $15 total instead of $0

## Quick Test Command (once you have fresh service_role key):

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_FRESH_SERVICE_ROLE_KEY_HERE"
    "Content-Type" = "application/json"
}

$body = @{
    week_number = 1
    league_id = "a7d65b53-2ec5-4b38-94ee-7fcb97160989"
    disable_discord = $true
    audit_mode = $true
    retro_free_fix = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees" -Method POST -Headers $headers -Body $body
```
