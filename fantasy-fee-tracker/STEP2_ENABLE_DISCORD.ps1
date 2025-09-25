# 🔔 STEP 2: RE-ENABLE DISCORD NOTIFICATIONS

Write-Host "🔔 RE-ENABLING DISCORD NOTIFICATIONS" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "📝 INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open this file:" -ForegroundColor Yellow
Write-Host "   fantasy-fee-tracker/supabase/functions/process-weekly-fees/index.ts" -ForegroundColor Green
Write-Host ""
Write-Host "2. Find lines 114-116 (around line 114):" -ForegroundColor Yellow
Write-Host "   // TEMPORARILY DISABLE Discord notifications..." -ForegroundColor Red
Write-Host "   // await sendDiscordNotification(league.discord_webhook_url, fees, week_number)" -ForegroundColor Red
Write-Host "   console.log('⚠️ Discord notification DISABLED for safety...')" -ForegroundColor Red
Write-Host ""
Write-Host "3. REPLACE those lines with:" -ForegroundColor Yellow
Write-Host "   await sendDiscordNotification(league.discord_webhook_url, fees, week_number)" -ForegroundColor Green
Write-Host "   console.log('✅ Discord notification sent successfully')" -ForegroundColor Green
Write-Host ""
Write-Host "4. Save the file" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Deploy the updated function:" -ForegroundColor Yellow
Write-Host "   npx supabase functions deploy process-weekly-fees" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 This will re-enable Discord notifications!" -ForegroundColor Cyan
