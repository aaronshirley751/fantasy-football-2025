-- Discord Webhook Rotation Script
-- Run this in Supabase Dashboard → SQL Editor after project is restored

-- Step 1: Verify current webhook status
SELECT 
  id,
  name,
  sleeper_league_id,
  CASE 
    WHEN discord_webhook_url IS NULL THEN 'NULL (not set)'
    WHEN discord_webhook_url = '' THEN 'Empty string'
    ELSE CONCAT(LEFT(discord_webhook_url, 50), '...')
  END as current_webhook_status
FROM leagues
WHERE sleeper_league_id = '1249067741470539776';

-- Step 2: Update to new webhook URL
UPDATE leagues
SET discord_webhook_url = 'https://discordapp.com/api/webhooks/1442747370982084763/NBzEZXuvziL3RVjbRHgBVm665SyC4vjDDKy4BjkGxemMi84UKv-9ExpizI79_0y6d91d'
WHERE sleeper_league_id = '1249067741470539776';

-- Step 3: Verify update succeeded
SELECT 
  id,
  name,
  sleeper_league_id,
  CONCAT(LEFT(discord_webhook_url, 50), '...') as new_webhook_preview,
  updated_at
FROM leagues
WHERE sleeper_league_id = '1249067741470539776';

-- Expected output: Should show the new webhook URL starting with https://discordapp.com/api/webhooks/1442747370982084763/
