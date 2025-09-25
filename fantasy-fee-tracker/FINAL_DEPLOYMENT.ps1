# 🚀 FINAL DEPLOYMENT SCRIPT
# Copy your tokens from: https://supabase.com/dashboard/project/jfeuobfjgqownybluvje/settings/api

Write-Host "🚀 FANTASY FOOTBALL 2025 - FINAL DEPLOYMENT" -ForegroundColor Green
Write-Host "=" * 60

# STEP 1: Test with your fresh tokens
Write-Host "📋 STEP 1: PASTE YOUR TOKENS BELOW" -ForegroundColor Cyan
Write-Host ""
Write-Host "From Supabase Dashboard > Settings > API:" -ForegroundColor Yellow
Write-Host "1. Copy 'anon public' key" -ForegroundColor Green
Write-Host "2. Copy 'service_role' key" -ForegroundColor Green
Write-Host ""

# You'll paste your tokens here:
$ANON_KEY = "PASTE_YOUR_ANON_KEY_HERE"
$SERVICE_KEY = "PASTE_YOUR_SERVICE_ROLE_KEY_HERE"

Write-Host "🔑 Testing authentication..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    league_id = "1249067741470539776"
    week = 1
} | ConvertTo-Json

$uri = "https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees"

try {
    Write-Host "🔄 Executing Week 1 processing..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ SUCCESS! Week 1 processing complete!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    Write-Host ""
    Write-Host "🎯 READY FOR STEP 2: RE-ENABLE DISCORD" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Double-check your tokens and try again." -ForegroundColor Yellow
}
