# Week 1 & 2 Backfill Script - CRITICAL SYSTEM FIX
Write-Host "🚨 CRITICAL BACKFILL: Processing missing Weeks 1 & 2" -ForegroundColor Red
Write-Host "This will fix the fundamental data integrity issue" -ForegroundColor Yellow
Write-Host "=" * 80

$uri = "https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees"

# Use service role key from existing test script
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE5NzI5NiwiZXhwIjoyMDM5NzczMjk2fQ.vJv1aNlJ48875yKTkKVZ3o-YCtBhH1MZtPzV5_8ZJj8"
    "Content-Type" = "application/json"
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
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Process Week 2 with all fixes applied
Write-Host "`n🔄 PROCESSING WEEK 2" -ForegroundColor Cyan
Write-Host "Features: retro_free_fix, audit_mode, disable_discord" -ForegroundColor Yellow

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
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Reprocess Week 3 to verify corrected totals
Write-Host "`n🔄 REPROCESSING WEEK 3 (Verification)" -ForegroundColor Cyan
Write-Host "This will show corrected season totals after backfill" -ForegroundColor Yellow

$week3Body = @{
    week_number = 3
    league_id = "a7d65b53-2ec5-4b38-94ee-7fcb97160989"
    disable_discord = $true
    audit_mode = $true
    retro_free_fix = $false  # Already applied in Weeks 1&2
} | ConvertTo-Json

try {
    $week3Response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $week3Body
    Write-Host "✅ WEEK 3 REPROCESSED!" -ForegroundColor Green
    Write-Host "Week 3 Corrected Results:" -ForegroundColor Cyan
    $week3Response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Week 3 Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 BACKFILL COMPLETE!" -ForegroundColor Green
Write-Host "All weeks processed with corrected transaction logic and fee calculations" -ForegroundColor Yellow
Write-Host "SaladBar751 should now show proper $15 season total from 3 losses" -ForegroundColor Cyan
