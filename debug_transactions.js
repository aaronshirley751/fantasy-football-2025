// Debug transaction data issues - focus on detailed logging
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

async function debugTransactionData() {
  console.log('🔍 DEBUGGING TRANSACTION DATA ISSUES');
  console.log('🎯 Focus: Why SaladBar751 shows 14 transactions when should be 0');
  console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
  
  try {
    const anon_key = await getUserInput('ANON_KEY: ');
    rl.close();
    
    console.log('\n🚀 DEBUGGING TRANSACTION PROCESSING...');
    console.log('📊 This will show ALL transaction details for audit...\n');
    
    const startTime = Date.now();
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/fee-processor-fresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon_key}`
      },
      body: JSON.stringify({
        league_id: '1249067741470539776',
        week: 1,
        test_mode: false
      })
    });
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.log(`⏰ TOTAL REQUEST TIME: ${totalDuration}ms\n`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('🔍 ========== TRANSACTION DEBUG RESULTS ==========\n');
      
      // Show the key transaction summary
      if (data.transaction_stats) {
        console.log('📊 CURRENT TRANSACTION COUNTS:');
        data.transaction_stats.forEach(stat => {
          const ownerName = data.fees?.find(f => f.roster_id === stat.roster_id)?.owner_name || `Team ${stat.roster_id}`;
          console.log(`  ${ownerName}: ${stat.total_transactions} total, ${stat.free_remaining} free remaining, ${stat.paid_transactions} paid`);
        });
        console.log('');
      }
      
      // Show Discord notification (which includes the problematic data)
      if (data.discord_notification) {
        const lines = data.discord_notification.split('\n');
        const transactionSection = lines.slice(lines.findIndex(l => l.includes('📊 Season Transaction Status:')));
        console.log('📊 TRANSACTION STATUS FROM DISCORD:');
        transactionSection.forEach(line => {
          if (line.trim()) console.log(`  ${line}`);
        });
        console.log('');
      }
      
      // Show fee breakdown
      if (data.fees && data.fees.length > 0) {
        const transactionFees = data.fees.filter(f => f.type === 'transaction_fee');
        if (transactionFees.length > 0) {
          console.log('💳 TRANSACTION FEES BEING CHARGED:');
          transactionFees.forEach(fee => {
            console.log(`  ${fee.owner_name}: $${fee.amount} - ${fee.description}`);
          });
          console.log('');
        }
      }
      
      console.log('🔍 DEBUGGING CONCLUSION:');
      console.log('The function logs above should show:');
      console.log('  1. ALL transactions received from Sleeper API');  
      console.log('  2. How many pass the August 24, 2025 cutoff filter');
      console.log('  3. How many are countable (waiver/free_agent, complete)');
      console.log('  4. Exact breakdown by roster');
      console.log('');
      console.log('Check the function logs in Supabase Dashboard for detailed debugging info!');
      console.log('Dashboard: https://supabase.com/dashboard/project/jfeuobfjgqownybluvje/functions');
      
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Error details:', text);
    }
    
  } catch (error) {
    console.log('❌ EXECUTION ERROR:', error.message);
  }
}

// Run the debug test
debugTransactionData();