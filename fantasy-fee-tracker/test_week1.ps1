# Test Week 1 Processing Script
Write-Host "🔄 TESTING WEEK 1 PROCESSING" -ForegroundColor Cyan
Write-Host "League: 1249067741470539776" -ForegroundColor Yellow
Write-Host "Week: 1" -ForegroundColor Yellow
Write-Host "=" * 60

$uri = "https://jfeuobfjgqownybluvje.supabase.co/functions/v1/process-weekly-fees"

# Try with service role key
$serviceHeaders = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE5NzI5NiwiZXhwIjoyMDM5NzczMjk2fQ.vJv1aNlJ48875yKTkKVZ3o-YCtBhH1MZtPzV5_8ZJj8"
    "Content-Type" = "application/json"
}

$body = @{
    league_id = "1249067741470539776"
    week = 1
} | ConvertTo-Json

try {
    Write-Host "Attempting with Service Role Key..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $serviceHeaders -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    exit 0
} catch {
    Write-Host "❌ Service Role Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Try with anon key
$anonHeaders = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxOTcyOTYsImV4cCI6MjAzOTc3MzI5Nn0.W9CPUL5RNhtnaTe7XYK1Nnn0QZMVefLQ4hHRKaBtyH0"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Attempting with Anon Key..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $anonHeaders -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    exit 0
} catch {
    Write-Host "❌ Anon Key Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "❌ BOTH AUTHENTICATION METHODS FAILED" -ForegroundColor Red
Write-Host "This might be a temporary issue or token expiration." -ForegroundColor Yellow
