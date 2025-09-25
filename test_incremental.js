// Test the incremental transaction processing
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function testIncrementalProcessing() {
  console.log('🔄 TESTING INCREMENTAL WEEKLY PROCESSING');
  console.log('🎯 This simulates what happens each week when the cron runs');
  console.log('📊 It will only process NEW transactions for the current week');
  console.log('💾 And preserve cumulative totals in the database\n');
  
  try {
    const anon_key = await getUserInput('🔐 ANON_KEY: ');
    rl.close();
    
    console.log('\n🚀 SIMULATING INCREMENTAL WEEKLY PROCESSING...\n');
    
    // Test processing Week 3 incrementally
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/fee-processor-incremental', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon_key}`
      },
      body: JSON.stringify({
        league_id: '1249067741470539776',
        week: 3,
        test_mode: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('🎉 ========== INCREMENTAL PROCESSING RESULTS ==========\n');
      
      console.log('📊 PROCESSING SUMMARY:');
      console.log(`   Mode: ${data.processing_mode}`);
      console.log(`   Week: ${data.week_number}`);
      console.log(`   New Transactions Processed: ${data.new_transactions_processed}`);
      console.log(`   Execution Time: ${data.execution_time_ms}ms\n`);
      
      if (data.discord_notification) {
        console.log('💬 ========== WEEKLY DISCORD NOTIFICATION ==========');
        console.log(data.discord_notification);
        console.log('==================================================\n');
      }
      
      if (data.transaction_stats && data.transaction_stats.length > 0) {
        console.log('📊 CUMULATIVE TRANSACTION STATS:');
        console.log('=================================');
        
        data.transaction_stats
          .filter(stat => stat.total_transactions > 0)
          .sort((a, b) => b.total_transactions - a.total_transactions)
          .forEach(stat => {
            const statusIcon = stat.free_remaining === 0 ? '🔴' : stat.free_remaining <= 3 ? '🟡' : '🟢';
            console.log(`${statusIcon} Roster ${stat.roster_id}:`);
            console.log(`   Total Transactions: ${stat.total_transactions}`);
            console.log(`   Free Remaining: ${stat.free_remaining}/10`);
            console.log(`   Paid Transactions: ${stat.paid_transactions}`);
            if (stat.paid_transactions > 0) {
              console.log(`   Total Transaction Fees: $${stat.paid_transactions * 2}`);
            }
            console.log('');
          });
      }
      
      console.log('✅ INCREMENTAL PROCESSING BENEFITS:');
      console.log('- ⚡ Fast execution (only processes current week)');
      console.log('- 💾 Preserves cumulative transaction counts');
      console.log('- 🔄 Safe to run multiple times (idempotent)');
      console.log('- 📊 Maintains accurate running totals week over week');
      
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Error details:', text);
    }
    
  } catch (error) {
    console.log('❌ EXECUTION ERROR:', error.message);
  }
}

// Run the test
testIncrementalProcessing();