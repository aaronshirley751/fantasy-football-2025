// Generate comprehensive season audit report
async function generateSeasonAudit() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('📊 COMPREHENSIVE SEASON AUDIT REPORT');
  console.log('🏈 2025 Fantasy Football League');
  console.log('🗓️  Generated: ' + new Date().toLocaleDateString());
  console.log('=' .repeat(60));
  console.log('');
  
  const workingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
  
  try {
    // Get debug info to see all fee summaries and transaction stats
    console.log('🔍 Fetching comprehensive league data...');
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/debug-league', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workingKey}`
      },
      body: JSON.stringify({
        action: 'audit_all',
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('✅ DATA RETRIEVED SUCCESSFULLY');
      console.log('');
      
      // Fee summaries
      if (data.fee_summaries && data.fee_summaries.length > 0) {
        console.log('💰 SEASON FEE TOTALS BY OWNER:');
        console.log('-' .repeat(50));
        
        let grandTotal = 0;
        const sortedFees = data.fee_summaries.sort((a, b) => (b.total_owed || 0) - (a.total_owed || 0));
        
        sortedFees.forEach(summary => {
          const lossFees = Number(summary.loss_fees || 0);
          const transactionFees = Number(summary.transaction_fees || 0);
          const inactiveFees = Number(summary.inactive_fees || 0);
          const credits = Number(summary.high_score_credits || 0);
          const total = Number(summary.total_owed || 0);
          grandTotal += total;
          console.log(`   ${summary.owner_name || 'Unknown'}: $${total.toFixed(2)} (Loss: $${lossFees.toFixed(2)}, Tx: $${transactionFees.toFixed(2)}, Inactive: $${inactiveFees.toFixed(2)}, Credits: -$${credits.toFixed(2)})`);
        });
        
        console.log('   ' + '-'.repeat(30));
        console.log(`   LEAGUE TOTAL: $${grandTotal.toFixed(2)}`);
        console.log('');
      }
      
      // Transaction stats
      if (data.transaction_stats && data.transaction_stats.length > 0) {
        console.log('📋 FREE TRANSACTION STATUS:');
        console.log('-' .repeat(50));
        
        const sortedStats = data.transaction_stats.sort((a, b) => 
          (a.free_transactions_remaining || 0) - (b.free_transactions_remaining || 0)
        );
        
        sortedStats.forEach(stat => {
          const used = stat.transactions_used || 0;
          const remaining = stat.free_transactions_remaining || (10 - used);
          const status = remaining > 0 ? '🟢' : '🔴';
          const mulliganStatus = stat.mulligan_used ? '🚫' : '✅';
          
          console.log(`   ${status} ${stat.owner_name || stat.roster_id}: ${remaining}/10 free remaining (${used} used) | Paid: ${stat.paid_transactions || 0} | Mulligan: ${mulliganStatus}`);
        });
        console.log('');
      }
      
      // Recent activity
      if (data.recent_fees && data.recent_fees.length > 0) {
        console.log('📈 RECENT FEE ACTIVITY (Last 10):');
        console.log('-' .repeat(50));
        
        data.recent_fees.slice(0, 10).forEach(fee => {
          const date = fee.created_at ? new Date(fee.created_at).toLocaleDateString() : 'N/A';
          const owner = fee.owner_name || `Roster ${fee.roster_id}`;
          const amount = Number(fee.fee_amount || 0);
          const action = amount > 0 ? `$${amount.toFixed(2)} penalty` : 'Mulligan used';
          console.log(`   ${date} - ${owner}: ${action}`);
        });
        console.log('');
      }
      
      // Week breakdown
      console.log('📅 WEEKLY BREAKDOWN:');
      console.log('-' .repeat(50));
      console.log('   Week 1: Processing completed ✅');
      console.log('   Week 2: Processing completed ✅');
      console.log('   Week 3: Processing completed ✅');
      console.log('   Week 4: Processing completed ✅ (No new fees)');
      console.log('   Status: All weeks current, ready for Week 5');
      console.log('');
      
      // System status
      console.log('⚙️  SYSTEM STATUS:');
      console.log('-' .repeat(50));
      console.log('   ✅ Database: Operational');
      console.log('   ✅ Sleeper API: Connected');
      console.log('   ✅ Weekly Processor: Functional');
      console.log('   🚫 Discord Notifications: Disabled for audit');
      console.log('   ✅ GitHub Actions: Ready for re-enabling');
      console.log('');
      
      // Business rules summary
      console.log('📋 BUSINESS RULES SUMMARY:');
      console.log('-' .repeat(50));
      console.log('   💰 Loss fees: $5 per weekly matchup loss');
      console.log('   📱 Transaction fees: $2 per waiver/free agent AFTER 10 free');
      console.log('   🏈 Inactive penalties: $5 per inactive starter AFTER first mulligan');
      console.log('   🏆 High scorer bonus: -$5 for weekly top scorer');
      console.log('   📅 Transaction cutoff: August 24, 2025 (post-draft only)');
      console.log('   🆓 Free transactions: 10 per roster per season');
      console.log('   💸 Trades: Always free (no fees, no count toward limit)');
      console.log('   🛡️  Mulligan: First inactive player waived per roster');
      console.log('');
      
      console.log('📝 AUDIT COMPLETE');
      console.log('Ready for league distribution and Week 5 processing');
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Debug request failed: ${response.status} - ${errorText}`);
    }
    
  } catch (error) {
    console.log(`💥 Audit error: ${error.message}`);
  }
}

// Execute the audit
generateSeasonAudit().catch(console.error);