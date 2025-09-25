// Enhanced debugging to capture ALL transaction details
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

async function auditWatts52Transactions() {
  console.log('🔍 AUDITING WATTS52 TRANSACTION DETAILS');
  console.log('🎯 Focus: Show ALL transaction details to verify if 6 is correct');
  console.log('🔐 Please paste your ANON_KEY from Supabase dashboard:');
  
  try {
    const anon_key = await getUserInput('ANON_KEY: ');
    rl.close();
    
    console.log('\n🚀 DETAILED TRANSACTION AUDIT...');
    console.log('📊 This will show every transaction and filtering step...\n');
    
    // First, let's also check the raw Sleeper API directly
    console.log('📡 STEP 1: Checking raw Sleeper API data...');
    
    const leagueId = '1249067741470539776';
    const week = 1;
    
    // Get transactions directly from Sleeper API
    const transactionsResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/transactions/${week}`);
    const rawTransactions = await transactionsResponse.json();
    
    console.log(`📊 Raw transactions from Sleeper API: ${rawTransactions.length}`);
    
    // Find Watts52's roster_id first
    const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    const rosters = await rostersResponse.json();
    
    const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
    const users = await usersResponse.json();
    
    // Find Watts52
    let watts52RosterId = null;
    for (const roster of rosters) {
      const user = users.find(u => u.user_id === roster.owner_id);
      if (user && user.display_name === 'Watts52') {
        watts52RosterId = roster.roster_id;
        break;
      }
    }
    
    console.log(`🎯 Watts52 Roster ID: ${watts52RosterId}`);
    
    // Show all transactions for Watts52
    const watts52Transactions = rawTransactions.filter(t => 
      t.roster_ids && t.roster_ids.includes(watts52RosterId)
    );
    
    console.log(`\n📊 ALL ${watts52Transactions.length} TRANSACTIONS FOR WATTS52:`);
    watts52Transactions.forEach((t, index) => {
      const transactionDate = new Date(t.created);
      const isAfterAug24 = t.created >= new Date('2025-08-24T00:00:00Z').getTime();
      const isCountable = ['waiver', 'free_agent'].includes(t.type) && t.status === 'complete';
      
      console.log(`\n  ${index + 1}. Transaction ID: ${t.transaction_id}`);
      console.log(`     Type: ${t.type}`);
      console.log(`     Status: ${t.status}`);
      console.log(`     Date: ${transactionDate.toISOString()}`);
      console.log(`     Week: ${t.week || 'unknown'}`);
      console.log(`     After Aug 24?: ${isAfterAug24}`);
      console.log(`     Will Count?: ${isCountable && isAfterAug24}`);
      
      if (t.adds && Object.keys(t.adds).length > 0) {
        console.log(`     Added: ${JSON.stringify(t.adds)}`);
      }
      if (t.drops && Object.keys(t.drops).length > 0) {
        console.log(`     Dropped: ${JSON.stringify(t.drops)}`);
      }
    });
    
    const countableWatts52 = watts52Transactions.filter(t => 
      t.created >= new Date('2025-08-24T00:00:00Z').getTime() &&
      ['waiver', 'free_agent'].includes(t.type) && 
      t.status === 'complete'
    );
    
    console.log(`\n✅ WATTS52 COUNTABLE TRANSACTIONS: ${countableWatts52.length}`);
    
    // Now run our function to compare
    console.log('\n📡 STEP 2: Running our function for comparison...');
    
    const startTime = Date.now();
    
    const response = await fetch('https://jfeuobfjgqownybluvje.supabase.co/functions/v1/fee-processor-fresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anon_key}`
      },
      body: JSON.stringify({
        league_id: leagueId,
        week: week,
        test_mode: false
      })
    });
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    if (response.ok) {
      const data = await response.json();
      
      const watts52Stats = data.transaction_stats?.find(s => 
        data.fees?.find(f => f.roster_id === s.roster_id)?.owner_name === 'Watts52'
      );
      
      console.log(`\n🔍 FUNCTION RESULT FOR WATTS52:`);
      if (watts52Stats) {
        console.log(`   Function counted: ${watts52Stats.total_transactions} transactions`);
        console.log(`   Free remaining: ${watts52Stats.free_remaining}`);
        console.log(`   Paid transactions: ${watts52Stats.paid_transactions}`);
      }
      
      console.log(`\n📊 COMPARISON:`);
      console.log(`   Direct API count: ${countableWatts52.length}`);
      console.log(`   Function count: ${watts52Stats?.total_transactions || 0}`);
      console.log(`   Match?: ${countableWatts52.length === (watts52Stats?.total_transactions || 0)}`);
      
      console.log('\n🔍 For detailed function logs, check:');
      console.log('https://supabase.com/dashboard/project/jfeuobfjgqownybluvje/functions');
      
    } else {
      console.log(`❌ ERROR: ${response.status} - ${response.statusText}`);
    }
    
  } catch (error) {
    console.log('❌ EXECUTION ERROR:', error.message);
  }
}

// Run the audit
auditWatts52Transactions();