# UPDATED BACKFILL SCRIPT - Insert Fresh Service Role Key
Write-Host "🚨 CRITICAL BACKFILL: Processing missing Weeks 1 & 2" -ForegroundColor Red
Write-Host "This will fix the fundamental data integrity issue" -ForegroundColor Yellow
Write-Host "=" * 80

$uri = "https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees"

# ⚠️ REPLACE THIS WITH YOUR FRESH SERVICE_ROLE KEY FROM SUPABASE DASHBOARD
$serviceRoleKey = "PASTE_YOUR_FRESH_SERVICE_ROLE_KEY_HERE"

$headers = @{
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
}

# Test authentication first
Write-Host "`n🔐 Testing Authentication..." -ForegroundColor Cyan
try {
    $testResponse = Invoke-RestMethod -Uri "https://jfeuobfjgqownybluvje.supabase.co/functions/v1/setup-league" -Method POST -Headers $headers -Body '{}' -ErrorAction Stop
    Write-Host "✅ Authentication successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication failed. Please check your service_role key." -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Process Week 1 with all fixes applied
Write-Host "`n🔄 PROCESSING WEEK 1" -ForegroundColor Cyan
Write-Host "Features: retro_free_fix, audit_mode, disable_discord" -ForegroundColor Yellow

$week1Body = @{
    week_number = 1
    league_id = "a7d65b53-2ec5-4b38-94ee-7fcb97160989"
    disable_discord = $true
    audit_mode = $true
    retro_free_fix = $true
} | ConvertTo-Json

try {
    $week1Response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $week1Body
    Write-Host "✅ WEEK 1 SUCCESS!" -ForegroundColor Green
    Write-Host "Week 1 Results:" -ForegroundColor Cyan
    $week1Response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Week 1 Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Process Week 2 with all fixes applied  
Write-Host "`n🔄 PROCESSING WEEK 2" -ForegroundColor Cyan

$week2Body = @{
    week_number = 2
    league_id = "a7d65b53-2ec5-4b38-94ee-7fcb97160989" 
    disable_discord = $true
    audit_mode = $true
    retro_free_fix = $true
} | ConvertTo-Json

try {
    $week2Response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $week2Body
    Write-Host "✅ WEEK 2 SUCCESS!" -ForegroundColor Green
    Write-Host "Week 2 Results:" -ForegroundColor Cyan
    $week2Response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Week 2 Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 BACKFILL COMPLETE!" -ForegroundColor Green
Write-Host "SaladBar751 should now show correct fees instead of $0" -ForegroundColor Yellow
