# Discord Webhook Rotation - November 24, 2025

## Current Status
- **Old Webhook**: Deleted from Discord (compromised/spammed)
- **New Webhook**: `https://discordapp.com/api/webhooks/1442747370982084763/NBzEZXuvziL3RVjbRHgBVm665SyC4vjDDKy4BjkGxemMi84UKv-9ExpizI79_0y6d91d`
- **Supabase Project**: Currently paused (needs restoration)

## Steps to Complete Rotation

### 1. Restore Supabase Project
1. Go to: https://supabase.com/dashboard/project/jfeuobfjgqownybluvje
2. Click "Restore Project" or "Resume" if paused
3. Wait for project to become active (usually 1-2 minutes)

### 2. Update Database Webhook URL

**Option A: Using SQL Editor (Recommended)**
1. Open Supabase Dashboard → SQL Editor
2. Paste the contents of `UPDATE_WEBHOOK_SQL.sql`
3. Click "Run" to execute all statements
4. Verify the final SELECT shows the new webhook URL

**Option B: Using Node Script**
```bash
node UPDATE_DISCORD_WEBHOOK.js
```
(Only works after Supabase project is restored)

### 3. Deploy Updated Function
```bash
cd fantasy-fee-tracker
npx supabase functions deploy process-weekly-fees
```

This ensures the latest code with:
- ✅ `DISCORD_DISABLE` environment variable support
- ✅ Webhook URL validation (only allows discord.com/discordapp.com)
- ✅ Security hardening from DISCORD_WEBHOOK_SECURITY.md

### 4. Test the New Webhook

**Manual Workflow Test:**
1. Go to: https://github.com/aaronshirley751/fantasy-football-2025/actions
2. Click "Weekly Fantasy Football Fee Processing"
3. Click "Run workflow"
4. Enter week number: `12` (current NFL week for Nov 24, 2025)
5. Leave league_id as default: `1249067741470539776`
6. Click "Run workflow"

**Expected Results:**
- ✅ Workflow completes successfully
- ✅ `discord_sent: true` in response JSON
- ✅ Discord notification appears in your channel
- ✅ No spam or unauthorized messages

### 5. Monitor Next Scheduled Run
- **Next Tuesday**: December 3, 2025 at 2:00 AM EST
- **Week**: 13 (auto-calculated)
- **Action**: Verify scheduled run completes and Discord notification arrives

## Verification Checklist
- [ ] Supabase project restored and active
- [ ] Database updated with new webhook URL (via SQL or script)
- [ ] Function deployed with latest security code
- [ ] Manual test workflow succeeded
- [ ] Discord notification received in channel
- [ ] No unauthorized/spam messages for 24+ hours
- [ ] Scheduled run on Tuesday Dec 3 completes successfully

## Security Notes
- New webhook URL includes validation checks (only discord.com/discordapp.com allowed)
- Kill switch available via `DISCORD_DISABLE=true` environment variable
- Webhook can be instantly disabled by blanking DB field or deleting in Discord
- See `DISCORD_WEBHOOK_SECURITY.md` for full security procedures

## Rollback Plan
If issues arise:
```bash
# Disable Discord immediately
supabase functions secrets set DISCORD_DISABLE=true
npx supabase functions deploy process-weekly-fees
```

Then investigate and fix before re-enabling.

## Files Updated
- `UPDATE_DISCORD_WEBHOOK.js` - Node.js script to update DB
- `UPDATE_WEBHOOK_SQL.sql` - SQL script for Supabase SQL Editor
- `DISCORD_ROTATION_GUIDE.md` - This file

---
**Date**: November 24, 2025  
**Action**: Discord webhook rotation after compromise  
**Status**: Awaiting Supabase project restoration
