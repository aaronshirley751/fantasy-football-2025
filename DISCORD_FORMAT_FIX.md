# CLEAN DISCORD MESSAGE FORMAT
# This should replace the corrupted Discord function

"""
The Discord message should send EXACTLY this format:

🎉 **COMPLETE WEEKLY FEE ASSESSMENT - Week 3**

💰 **Weekly Fees Breakdown:**
SaladBar751: $5 (Loss fee)
Turd_Ferguson24: $5 (Loss fee) 
Shaklee77: $5 (Loss fee)
tscotty85: $5 (Loss fee)
petergell: $5 (Loss fee)
BeanerDipp: -$5 (High score bonus) 🎯
**Week 3 Total: $20.00**

🏆 **Week 3 Champion:**
BeanerDipp with **204.04 points** (earned $5 bonus!)

📊 **Season Transaction Status:**
Watts52: 🔴 0 free remaining (13 total: 10 free + 3 paid)
tscotty85: 🟡 1 free remaining (22 total: 9 free + 13 paid)  
Turd_Ferguson24: 🟢 10 free remaining (7 total: all paid)
All others: 🟢 8-10 free remaining

The current Discord function is pulling corrupted season data ($300, $1607 totals).
We need to revert to ONLY sending the weekly data + transaction status from the audit mode.
"""

# The fix is to:
# 1. Use ONLY the fees from the current week processing (cleanResponse.fees.fees)
# 2. Use ONLY the transaction stats from audit mode (cleanResponse.audit.season_transaction_summary) 
# 3. NOT pull any aggregated database totals that are corrupted
# 4. Send simple text format, not embeds
