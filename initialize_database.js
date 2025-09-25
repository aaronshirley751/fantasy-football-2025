// Initialize the database with historical transaction data
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

async function initializeDatabase() {
  console.log('🎯 DATABASE INITIALIZATION FOR 2025 SEASON');
  console.log('📊 This will load ALL historical transactions (Weeks 1-3)');
  console.log('💾 And set up the database for incremental weekly processing');
  console.log('⚠️  WARNING: This will clear existing data for the live league\n');
  
  try {
    const anon_key = await getUserInput('🔐 ANON_KEY: ');
    rl.close();
    
    console.log('\n🚀 INITIALIZING DATABASE WITH HISTORICAL DATA...\n');
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/database-init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon_key}`
      },
      body: JSON.stringify({
        league_id: '1249067741470539776', // Live 2025 league
        current_week: 3 // Current week as of Sept 25, 2025
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('🎉 ========== DATABASE INITIALIZATION RESULTS ==========\n');
      
      console.log('📊 INITIALIZATION SUMMARY:');
      console.log(`   League ID: ${data.league_id}`);
      console.log(`   Current Week: ${data.current_week}`);
      console.log(`   Total Historical Transactions: ${data.total_historical_transactions}`);
      console.log(`   Valid Transactions (post-draft): ${data.valid_transactions}`);
      console.log(`   Execution Time: ${data.execution_time_ms}ms\n`);
      
      if (data.transaction_stats && data.transaction_stats.length > 0) {
        console.log('📊 HISTORICAL TRANSACTION SUMMARY:');
        console.log('==================================');
        
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
              console.log(`   Starting Transaction Fees: $${stat.paid_transactions * 2}`);
            }
            console.log('');
          });
      }
      
      console.log('✅ DATABASE INITIALIZATION COMPLETE!');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Database now contains accurate historical transaction data');
      console.log('2. Weekly cron can use incremental processing going forward');
      console.log('3. Each week will only process new transactions and add to totals');
      console.log('4. Transaction counts will persist correctly week over week');
      
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
      const text = await response.text();
      console.log('Error details:', text);
    }
    
  } catch (error) {
    console.log('❌ EXECUTION ERROR:', error.message);
  }
}

// Run the initialization
initializeDatabase();