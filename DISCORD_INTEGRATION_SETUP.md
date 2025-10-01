# Discord Integration Setup Guide

## ✅ Status: Discord Capability Added to Production Function

The production `process-weekly-fees` function (Version 73) now includes Discord webhook capability using the exact approved format.

## 🔧 Setup Instructions

### Step 1: Get Your Discord Webhook URL

1. Go to your Discord server
2. Click on the channel where you want fee notifications
3. Click the gear icon (Channel Settings)
4. Go to **Integrations** → **Webhooks**
5. Click **"New Webhook"** or use an existing one
6. Copy the **Webhook URL** (starts with `https://discord.com/api/webhooks/...`)

### Step 2: Configure the Webhook in Database

Run this SQL command in your Supabase dashboard:

```sql
UPDATE leagues 
SET discord_webhook_url = 'YOUR_WEBHOOK_URL_HERE'
WHERE sleeper_league_id = '1249067741470539776';
```

**Replace `YOUR_WEBHOOK_URL_HERE` with your actual Discord webhook URL.**

### Step 3: Test the Integration

Once configured, run the production function and it will:
1. Process fees normally
2. Send the approved Discord format to your channel
3. Return `"discord_sent": true` in the response

## 🚫 Safety Features

✅ **No spam risk**: Function only sends ONE message per execution  
✅ **Optional**: Function works perfectly without Discord configured  
✅ **Controlled**: Only the production `process-weekly-fees` function can send messages  
✅ **Approved format**: Uses exactly the format we tested and approved  

## 📊 Discord Message Format

When configured, Discord will receive messages in this exact format:

```
📊 Week 4 Fantasy Football Fees
🏆 Highest Scorer
Watts52: 213.66 pts (-$5 bonus)
🆕 THIS WEEK'S ACTIVITY
━━━━━━━━━━━━━━━━━━━━━━━━
• j1fisher25: Loss ($5) = $5.00
• SaladBar751: Loss ($5) = $5.00
• LastOne2022: Loss ($5) = $5.00
• Shaklee77: Loss ($5) = $5.00
• Turd_Ferguson24: Loss ($5) = $5.00
• Watts52: Bonus (-$5) = -$5.00
💰 Week Total
$20.00
📈 SEASON TOTALS (All Teams)
━━━━━━━━━━━━━━━━━━━━━━━━
• SaladBar751: $20.00 total ($20.00 losses/inactive), 10/10 free remaining
• Turd_Ferguson24: $14.00 total ($4.00 transactions, $10.00 losses/inactive), 0/10 free remaining (2 paid)
• BillyTrim: -$5.00 total ($-5.00 high scorer bonus), 7/10 free remaining
• BeanerDipp: -$5.00 total ($-5.00 high scorer bonus), 9/10 free remaining
• Shaklee77: $15.00 total ($15.00 losses/inactive), 10/10 free remaining
• Watts52: $5.00 total ($10.00 transactions, $5.00 losses/inactive, $-10.00 high scorer bonus), 0/10 free remaining (5 paid)
• tscotty85: $53.00 total ($38.00 transactions, $15.00 losses/inactive), 0/10 free remaining (19 paid)
• LastOne2022: $10.00 total ($10.00 losses/inactive), 1/10 free remaining
• petergell: $10.00 total ($10.00 losses/inactive), 4/10 free remaining
• j1fisher25: $15.00 total ($15.00 losses/inactive), 6/10 free remaining
🏦 Season Grand Total
$132.00 across all teams
```

## 🤖 Automated Workflow Integration

When you configure the Discord webhook:

1. **GitHub Actions** runs every Tuesday at 2 AM EST
2. **Calls production function** to process fees
3. **Function automatically sends** Discord message if webhook configured
4. **Your league gets notified** with the complete fee summary

## 🔧 Troubleshooting

### Discord Not Sending:
- Check that webhook URL is correctly configured in database
- Verify webhook URL is active in Discord
- Check function response: `"discord_sent": false` indicates configuration issue

### Test Configuration:
Run this to check current setup:
```bash
node CONFIGURE_DISCORD_WEBHOOK.js
```

### Verify Function Response:
```bash
node TEST_DISCORD_FEATURE.js
```

## ✅ Current Status

- ✅ **Function Deployed**: Version 73 with Discord capability
- ✅ **Format Approved**: Exact format we tested and verified
- ✅ **Safety Confirmed**: No spam risk, controlled messaging
- ✅ **Ready for Production**: Just needs webhook URL configuration

**Once you add your Discord webhook URL, your fantasy football fee tracker will automatically notify your league every week!** 🏈