# Discord Webhook Security & Kill Switch Guide

## Overview
This document explains how to immediately disable, rotate, and harden the Discord webhook used by the Fantasy Fee Tracker. Use these procedures whenever you suspect abuse, spam, or compromise.

## 1. Immediate Disable Options (Fastest First)
| Action | Speed | Side Effects | Reversal |
|--------|-------|--------------|----------|
| Delete webhook in Discord UI | Seconds | Channel loses current webhook URL permanently | Create new webhook & update DB | 
| Set `DISCORD_DISABLE=true` env var & redeploy function | <1 min | All fee reports stop going to Discord | Remove/false & redeploy |
| Blank/NULL `discord_webhook_url` in `leagues` table | 1–2 min | Prevents sending, code still runs | Restore URL value |
| Remove URL from DB AND rotate in Discord | 2–3 min | Full isolation & rotation | Store new rotated URL |

### Recommended Emergency Sequence
1. Delete existing webhook in Discord (Server Settings → Integrations → Webhooks).
2. Set `DISCORD_DISABLE=true` and redeploy edge function.
3. Audit logs & DB (`fees`, `matchups`) for unexpected usage.
4. Create & store new webhook when ready; unset kill switch.

## 2. Using the Global Kill Switch
A kill switch was added to `process-weekly-fees/index.ts`:
```ts
const DISCORD_DISABLE = (Deno.env.get('DISCORD_DISABLE') || '').toLowerCase() === 'true';
```
When true, all Discord sends are skipped safely.

### Set / Unset in Supabase
```bash
# Set kill switch
supabase functions secrets set DISCORD_DISABLE=true

# Unset kill switch
supabase functions secrets unset DISCORD_DISABLE

# Redeploy function
npx supabase functions deploy process-weekly-fees
```
(Or use Supabase Dashboard → Project Settings → Functions → Add Secret.)

## 3. Valid Webhook Enforcement
Only URLs starting with:
```
https://discord.com/api/webhooks/
https://discordapp.com/api/webhooks/
```
are accepted. Anything else is ignored.

## 4. Rotating the Webhook
1. Create new webhook in Discord (Server Settings → Integrations → Webhooks → New). 
2. Copy URL (do NOT share publicly).
3. Update `leagues.discord_webhook_url`:
```bash
curl -X PATCH \
  "https://jfeuobfjgqownybluvje.supabase.co/rest/v1/leagues?id=eq.<LEAGUE_UUID>" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"discord_webhook_url":"https://discord.com/api/webhooks/..."}'
```
4. Unset `DISCORD_DISABLE` and redeploy (if previously set).
5. Trigger manual test run (`week_number` for current NFL week) to validate.

## 5. Manual Verification Steps
After any change:
```bash
# Local test (without sending if kill switch active)
node PRODUCTION_RUN_WEEK5_DISCORD.js   # adjust week_number inside if needed
```
GitHub Actions manual dispatch:
- Actions → Weekly Fantasy Football Fee Processing → Run workflow → Provide `week_number`.

## 6. Forensic / Audit Checklist
- Compare timestamps of spam messages vs scheduled run times.
- Ensure webhook was not leaked into public repo (search for `discord.com/api/webhooks/`).
- Rotate service role key if suspicious activity occurred.
- Consider adding message signature logging (future enhancement).

## 7. Optional Hardening Ideas (Not Yet Implemented)
- Rate limiting outbound Discord posts per run.
- SHA256 hashing or signing stored message before send for integrity audit.
- Store last sent message + timestamp in `discord_audit` table.
- Add allowlist for content (reject messages containing `discord.gg/`).

## 8. Resume Normal Operation
1. Confirm no further spam for 24h.
2. Restore webhook URL & unset kill switch.
3. Run manual workflow test.
4. Monitor first scheduled run.

## 9. Quick Commands Summary
```bash
# Emergency disable (fast)
supabase functions secrets set DISCORD_DISABLE=true
npx supabase functions deploy process-weekly-fees

# Rotate webhook (after deletion & recreation)
curl -X PATCH "https://jfeuobfjgqownybluvje.supabase.co/rest/v1/leagues?id=eq.<LEAGUE_UUID>" \
  -H "apikey: <SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"discord_webhook_url":"https://discord.com/api/webhooks/NEW_ID/NEW_TOKEN"}'

# Re-enable
supabase functions secrets unset DISCORD_DISABLE
npx supabase functions deploy process-weekly-fees
```

## 10. Indicators of Compromise
| Indicator | Meaning | Action |
|-----------|---------|--------|
| Unscheduled Discord posts | Unauthorized trigger or external misuse | Kill switch + delete webhook |
| Webhook URL found in public code | Credential exposure | Rotate URL & purge history |
| Repeated messages outside Tuesday window | Automation misuse | Enable kill switch & audit logs |

---
Maintainer: Fantasy Fee Tracker Operations
Last Updated: November 24, 2025
