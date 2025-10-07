# 🚀 GitHub Actions Automation - Final Setup Steps

## ✅ Current Status: READY FOR DEPLOYMENT

Your GitHub Actions workflow is **fully configured** and ready to automate your Fantasy Football fee processing every Tuesday at 2 AM EST.

---

## 🎯 REQUIRED: Complete These 3 Steps on GitHub.com

### Step 1: Set GitHub Actions Secret (CRITICAL)
**This is required for the workflow to authenticate with Supabase**

1. **Navigate to Secrets Settings**:
   ```
   https://github.com/aaronshirley751/fantasy-football-2025/settings/secrets/actions
   ```

2. **Add the Secret**:
   - Click the **"New repository secret"** button
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: 
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1MjU4NSwiZXhwIjoyMDcxMTI4NTg1fQ.TYZBL4UNLEJN6ovM6HQS5wxm2zkbZHBYtmQYALHDkqQ
     ```
   - Click **"Add secret"**

3. **Verify**:
   - You should see `SUPABASE_SERVICE_ROLE_KEY` in your secrets list
   - It will show "Updated X seconds ago"

---

### Step 2: Enable GitHub Actions (If Not Already Enabled)
**Ensure workflows can run automatically**

1. **Navigate to Actions Settings**:
   ```
   https://github.com/aaronshirley751/fantasy-football-2025/settings/actions
   ```

2. **Check/Set Permissions**:
   - Under "Actions permissions", select:
     - ✅ **"Allow all actions and reusable workflows"**
   - Under "Workflow permissions", ensure:
     - ✅ **"Read and write permissions"** (or at minimum "Read repository contents")

3. **Save Changes** if any modifications were made

---

### Step 3: Run Manual Test Workflow (HIGHLY RECOMMENDED)
**Test the automation before relying on scheduled runs**

1. **Navigate to Actions Tab**:
   ```
   https://github.com/aaronshirley751/fantasy-football-2025/actions
   ```

2. **Select the Workflow**:
   - Click on **"Weekly Fantasy Football Fee Processing"** in the left sidebar

3. **Trigger Manual Run**:
   - Click the **"Run workflow"** dropdown button (top right)
   - Enter **week_number**: `5` (uses already processed Week 5 data for safe testing)
   - Leave **league_id** as default: `1249067741470539776`
   - Click the green **"Run workflow"** button

4. **Monitor Execution**:
   - Workflow will appear in the runs list
   - Click on the run to see real-time logs
   - Should complete in ~10-30 seconds

5. **Verify Success**:
   - ✅ All steps show green checkmarks
   - ✅ "Create Processing Summary" shows Week 5 total: $20
   - ✅ Season total: $156
   - ✅ Discord notification sent (check your Discord channel)

---

## 📅 Automation Schedule

Once enabled, the workflow will automatically run:

- **Day**: Every Tuesday
- **Time**: 2:00 AM EST (7:00 AM UTC)
- **Week Calculation**: Automatic (based on NFL season start: September 5, 2025)
- **Discord Notification**: Automatic (sent to league owners)

### Next Scheduled Runs:
- **October 8, 2025** - Week 6 (Tuesday 2 AM EST)
- **October 15, 2025** - Week 7 (Tuesday 2 AM EST)
- **October 22, 2025** - Week 8 (Tuesday 2 AM EST)
- ...continues every Tuesday until end of season

---

## 🎉 What Happens During Automated Runs

Every Tuesday at 2 AM EST, the workflow will:

1. ✅ **Calculate Current Week**: Automatically determines NFL week based on date
2. ✅ **Fetch League Data**: Pulls rosters, matchups, transactions from Sleeper API
3. ✅ **Process Fees**: Applies all business rules (losses, transactions, inactive penalties, bonuses)
4. ✅ **Update Database**: Stores fee records in PostgreSQL
5. ✅ **Send Discord Notification**: Posts formatted message to your Discord channel
6. ✅ **Generate Summary**: Creates GitHub Actions summary with totals
7. ✅ **Error Handling**: Sends notifications if anything fails

**All of this happens automatically - no manual intervention needed!**

---

## 📊 Monitoring Automated Runs

### View Run History
1. Go to: https://github.com/aaronshirley751/fantasy-football-2025/actions
2. Look for runs with "schedule" trigger
3. Green ✅ = Success, Red ❌ = Failed

### What to Check After Each Run
- ✅ GitHub Actions shows success
- ✅ Discord notification received by league
- ✅ Week total and season total look correct
- ✅ No errors in workflow logs

### If a Run Fails
1. Click on the failed run in Actions tab
2. Review error logs for details
3. Common issues:
   - Sleeper API temporarily down (retry will fix)
   - Discord webhook URL changed (update in database)
   - Database connection issue (verify Supabase status)

---

## 🔧 Manual Workflow Triggers

You can also run the workflow manually anytime:

### When to Use Manual Triggers:
- **Test before first automated run**: Verify everything works
- **Reprocess a week**: If you need to recalculate fees
- **Catch up missed week**: If automation failed or was disabled
- **Generate notifications**: Re-send Discord messages

### How to Trigger:
1. Go to Actions tab: https://github.com/aaronshirley751/fantasy-football-2025/actions
2. Click "Weekly Fantasy Football Fee Processing"
3. Click "Run workflow" dropdown
4. Enter desired week number (1-18)
5. Click "Run workflow" button

---

## 💡 Pro Tips

### Disable Scheduled Runs (If Needed)
If you want to temporarily stop automatic processing:
1. Edit `.github/workflows/weekly-fee-processing.yml`
2. Comment out the `schedule:` section:
   ```yaml
   # schedule:
   #   - cron: '0 7 * * 2'
   ```
3. Commit and push
4. Manual triggers will still work

### Re-enable Scheduled Runs
1. Uncomment the `schedule:` section
2. Commit and push
3. Automation resumes next Tuesday

### Check Workflow Status
Run this command locally to verify setup:
```bash
bash verify_automation_setup.sh
```

---

## 🎯 Success Checklist

Before considering setup complete, verify:

- [ ] ✅ `SUPABASE_SERVICE_ROLE_KEY` secret added to GitHub
- [ ] ✅ GitHub Actions enabled in repository settings
- [ ] ✅ Manual test workflow executed successfully
- [ ] ✅ Discord notification received during test
- [ ] ✅ Week and season totals correct in test run
- [ ] ✅ Workflow logs show no errors
- [ ] ✅ Next scheduled run confirmed for Tuesday 2 AM EST

---

## 📞 Support & Troubleshooting

### If You Need Help:
- Review workflow logs in GitHub Actions tab
- Check `VERIFY_GITHUB_ACTIONS_SETUP.md` for detailed troubleshooting
- Verify Supabase service is running: https://supabase.com/dashboard
- Test Discord webhook manually with `PRODUCTION_RUN_WEEK5_DISCORD.js`

### Useful Commands:
```bash
# Verify local setup
bash verify_automation_setup.sh

# Test production function manually
node PRODUCTION_RUN_WEEK5_DISCORD.js

# Check Discord webhook configuration
node CHECK_WEBHOOK_CONFIG.js
```

---

## 🚀 You're All Set!

Once you complete the 3 steps above:
1. ✅ Secret added
2. ✅ Actions enabled  
3. ✅ Manual test successful

**Your Fantasy Football fee tracker will run automatically every Tuesday at 2 AM EST!**

Your league owners will receive Discord notifications, and all fees will be tracked in the database with zero manual work required.

---

**Setup Date**: October 7, 2025  
**Production Status**: ✅ READY FOR AUTOMATION  
**Next Scheduled Run**: Tuesday, October 8, 2025 at 2:00 AM EST (Week 6)
