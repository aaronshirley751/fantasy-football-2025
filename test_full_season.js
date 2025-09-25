// Test the FULL SEASON transaction fetching
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

async function testFullSeasonTransactions() {
  console.log('🔍 TESTING FULL SEASON TRANSACTION FETCHING');
  console.log('🎯 This will show ALL transactions for the entire season');
  console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
  
  try {
    const anon_key = await getUserInput('ANON_KEY: ');
    rl.close();
    
    console.log('\n🚀 FETCHING FULL SEASON TRANSACTIONS...');
    console.log('📊 This may take longer as we fetch multiple weeks...\n');
    
    const startTime = Date.now();
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/fee-processor-fresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon_key}`
      },
      body: JSON.stringify({
        league_id: '1249067741470539776',
        week: 3, // Use a higher week number to fetch more transactions
        test_mode: false
      })
    });
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.log(`⏰ TOTAL REQUEST TIME: ${totalDuration}ms\n`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('🎉 ========== FULL SEASON RESULTS ==========\n');
      
      // System Overview
      console.log('📊 SYSTEM OVERVIEW:');
      console.log(`   Week Processing: ${data.week_number}`);
      console.log(`   Total Season Transactions: ${data.transaction_count}`);
      console.log(`   Function Execution: ${data.execution_time_ms}ms\n`);
      
      // Show Discord notification with full season data
      if (data.discord_notification) {
        console.log('💬 ========== FULL SEASON DISCORD NOTIFICATION ==========');
        console.log(data.discord_notification);
        console.log('========================================================\n');
      }
      
      // Show transaction stats
      if (data.transaction_stats && data.transaction_stats.length > 0) {
        console.log('💳 FULL SEASON TRANSACTION SUMMARY:');
        console.log('   ===================================');
        
        data.transaction_stats
          .filter(stat => stat.total_transactions > 0)
          .sort((a, b) => b.total_transactions - a.total_transactions)
          .forEach(stat => {
            const ownerName = data.fees.find(f => f.roster_id === stat.roster_id)?.owner_name || `Team ${stat.roster_id}`;
            console.log(`\n   📊 ${ownerName}:`);
            console.log(`      Total Transactions: ${stat.total_transactions}`);
            console.log(`      Free Remaining: ${stat.free_remaining}/10`);
            console.log(`      Paid Transactions: ${stat.paid_transactions}`);
            if (stat.paid_transactions > 0) {
              console.log(`      Transaction Fees: $${stat.paid_transactions * 2}`);
            }
          });
        console.log('   ===================================\n');
      }
      
      // Show fee summary
      const transactionFees = data.fees?.filter(f => f.type === 'transaction_fee') || [];
      if (transactionFees.length > 0) {
        console.log('💰 TRANSACTION FEES BEING CHARGED:');
        transactionFees.forEach(fee => {
          console.log(`   ${fee.owner_name}: $${fee.amount} - ${fee.description}`);
        });
      } else {
        console.log('💚 NO TRANSACTION FEES: All users within free limits');
      }
      
      console.log('\n🔍 For detailed transaction logs, check:');
      console.log('https://supabase.com/dashboard/project/jfeuobfjgqownybluvje/functions');
      
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
testFullSeasonTransactions();