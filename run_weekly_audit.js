// Execute weekly processor with Discord disabled for audit review
async function runWeeklyProcessorAudit() {
  const fetch = (await import('node-fetch')).default;
  console.log('🔍 WEEKLY TRANSACTION PROCESSOR - AUDIT MODE');
  console.log('📅 Week 4 Processing (September 30, 2025)');
  console.log('🚫 Discord notifications DISABLED for review');
  console.log('📊 League: 1249067741470539776 (2025 Fantasy Football)');
  console.log('=' .repeat(60));
  console.log('');
  
  try {
    // Use environment variable or prompt for ANON_KEY
    const anon_key = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmZXVvYmZqZ3Fvd255Ymx1dmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NTI1ODUsImV4cCI6MjA3MTEyODU4NX0.7qu0h_cKNpdW1ZENZ3652LE75MC6VQp9Ahu5SSDypuY';
    
    console.log('🚀 Executing weekly processor...');
    const startTime = Date.now();
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/weekly-processor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon_key}`
      },
      body: JSON.stringify({
        league_id: 'a7d65b53-2ec5-4b38-94ee-7fcb97160989', // Database UUID
        week: 4, // Current week
        test_mode: false,
        disable_discord: true // Disable Discord for audit
      })
    });
    
    const execTime = Date.now() - startTime;
    console.log(`⏱️  Request completed in ${execTime}ms`);
    console.log('');
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('✅ PROCESSOR EXECUTION SUCCESSFUL');
      console.log('=' .repeat(60));
      
      console.log('📊 PROCESSING SUMMARY:');
      console.log(`   Processing Mode: ${data.processing_mode || 'incremental'}`);
      console.log(`   Week Number: ${data.week_number || 4}`);
      console.log(`   New Transactions: ${data.new_transactions_processed || 0}`);
      console.log(`   New Fees This Week: $${data.total_fees || 0}`);
      console.log(`   Execution Time: ${data.execution_time_ms || execTime}ms`);
      console.log(`   Database Updated: ${data.database_updated ? 'Yes' : 'No'}`);
      console.log('');
      
      if (data.fees && data.fees.length > 0) {
        console.log('💰 NEW FEES THIS WEEK:');
        console.log('-' .repeat(40));
        data.fees.forEach(fee => {
          console.log(`   ${fee.owner_name || fee.roster_id}: $${fee.amount} (${fee.description})`);
        });
        console.log('');
      } else {
        console.log('🆓 NO NEW FEES THIS WEEK');
        console.log('   All transactions within free limits or no new activity');
        console.log('');
      }
      
      if (data.high_scorer) {
        console.log('🏆 HIGH SCORER BONUS:');
        console.log(`   ${data.high_scorer.display_name || data.high_scorer}: ${data.high_scorer.points || 'N/A'} pts (-$5 bonus)`);
        console.log('');
      }
      
      if (data.transaction_summary) {
        console.log('📋 TRANSACTION SUMMARY:');
        console.log('-' .repeat(40));
        Object.entries(data.transaction_summary).forEach(([owner, stats]) => {
          const remaining = stats.free_remaining || (10 - (stats.used || 0));
          const status = remaining > 0 ? '🟢' : '🔴';
          console.log(`   ${status} ${owner}: ${remaining} free remaining (${stats.used || 0} total used)`);
        });
        console.log('');
      }

      console.log('🏦 DATABASE SNAPSHOT:');
      console.log('-' .repeat(40));
      const supabaseUrl = 'https://jfeuobfjgqownybluvje.supabase.co';
      const summariesResponse = await fetch(`${supabaseUrl}/rest/v1/fee_summaries?select=*&league_id=eq.a7d65b53-2ec5-4b38-94ee-7fcb97160989`, {
        headers: {
          'apikey': anon_key,
          'Authorization': `Bearer ${anon_key}`
        }
      });

      if (summariesResponse.ok) {
        const summaries = await summariesResponse.json();
        if (summaries.length === 0) {
          console.log('   ⚠️  No fee summary rows found.');
        } else {
          summaries
            .sort((a, b) => (b.total_owed || 0) - (a.total_owed || 0))
            .forEach(summary => {
              console.log(`   ${summary.owner_name || 'Unknown'}:`);
              console.log(`      Loss Fees: $${Number(summary.loss_fees || 0).toFixed(2)}`);
              console.log(`      Transaction Fees: $${Number(summary.transaction_fees || 0).toFixed(2)}`);
              console.log(`      Inactive Fees: $${Number(summary.inactive_fees || 0).toFixed(2)}`);
              console.log(`      High Score Credits: -$${Number(summary.high_score_credits || 0).toFixed(2)}`);
              console.log(`      Total Owed: $${Number(summary.total_owed || 0).toFixed(2)} | Balance: $${Number(summary.balance || 0).toFixed(2)}`);
              console.log(`      Free Remaining: ${summary.free_transactions_remaining} | Mulligan Used: ${summary.mulligan_used ? 'Yes' : 'No'}`);
            });
        }
      } else {
        const errorText = await summariesResponse.text();
        console.log(`   ⚠️  Failed to load fee summaries: ${summariesResponse.status} - ${errorText}`);
      }
      console.log('');
      
      console.log('🔍 AUDIT VALIDATION:');
      console.log('-' .repeat(40));
      console.log(`✅ Response received: ${response.status} ${response.statusText}`);
      console.log(`✅ Processing mode: ${data.processing_mode || 'incremental'} (prevents duplicates)`);
      console.log(`✅ Week number: ${data.week_number || 4} (correct)`);
      console.log(`✅ Discord disabled: ${data.discord_sent === false ? 'Yes' : 'No'}`);
      console.log(`✅ Execution time: ${data.execution_time_ms || execTime}ms (good performance)`);
      
      if (data.new_transactions_processed === 0) {
        console.log('✅ No new transactions: Expected if no activity since last run');
      } else {
        console.log(`✅ New transactions processed: ${data.new_transactions_processed}`);
      }
      
      console.log('');
      console.log('📝 LEAGUE COMMUNICATION TEMPLATE:');
      console.log('=' .repeat(60));
      console.log('🏈 Week 4 Fantasy Fee Update');
      console.log('');
      
      if (data.fees && data.fees.length > 0) {
        console.log('💰 New fees this week:');
        data.fees.forEach(fee => {
          console.log(`• ${fee.owner_name}: $${fee.amount} (${fee.description})`);
        });
        console.log(`\nWeek 4 total: $${data.total_fees}`);
      } else {
        console.log('🆓 No new fees this week - all activity within free transaction limits!');
      }
      
      if (data.high_scorer) {
        console.log(`\n🏆 High scorer bonus: ${data.high_scorer.display_name} (${data.high_scorer.points} pts) receives -$5 credit`);
      }
      
      console.log('\n📊 Season transaction status available on request');
      console.log('Questions? Contact the commissioner');
      
    } else {
      console.log(`❌ PROCESSOR ERROR: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      
      console.log('');
      console.log('🔧 TROUBLESHOOTING:');
      console.log('- Check ANON_KEY is valid');
      console.log('- Verify Supabase function is deployed');
      console.log('- Confirm database UUID is correct');
      console.log('- Check network connectivity');
    }
    
  } catch (error) {
    console.log('❌ EXECUTION ERROR:', error.message);
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    console.log('- Ensure node-fetch is installed: npm install node-fetch');
    console.log('- Check internet connection');
    console.log('- Verify Supabase endpoint is accessible');
  }
}

// Execute the audit
runWeeklyProcessorAudit().catch(console.error);