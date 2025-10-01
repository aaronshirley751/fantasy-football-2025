// Check recent transaction activity for tscotty85 (roster_id 7)
async function checkRecentTransactions() {
  console.log('🔍 Checking recent transactions for tscotty85...\n');
  
  try {
    // Get all transactions for league
    const allTransactions = []
    for (let week = 1; week <= 18; week++) {
      try {
        const weekResponse = await fetch(`https://api.sleeper.app/v1/league/1249067741470539776/transactions/${week}`)
        if (weekResponse.ok) {
          const weekTransactions = await weekResponse.json()
          if (weekTransactions && weekTransactions.length > 0) {
            allTransactions.push(...weekTransactions)
          }
        }
      } catch (error) {
        console.log(`No transactions found for week ${week}`)
      }
    }
    
    console.log(`Total transactions found: ${allTransactions.length}`);
    
    // Filter for tscotty85 (roster_id 7) and after Aug 24 cutoff
    const draftCutoff = new Date('2025-08-24T00:00:00Z').getTime()
    const tscottyTransactions = allTransactions.filter(t => {
      return t.roster_ids && 
             t.roster_ids.includes(7) && 
             ['waiver', 'free_agent'].includes(t.type) &&
             t.created >= draftCutoff
    }).sort((a, b) => b.created - a.created) // Most recent first
    
    console.log(`tscotty85 transactions after Aug 24: ${tscottyTransactions.length}`);
    console.log('\nMost recent 5 transactions:');
    
    tscottyTransactions.slice(0, 5).forEach((t, i) => {
      const date = new Date(t.created).toLocaleDateString()
      const time = new Date(t.created).toLocaleTimeString()
      console.log(`${i + 1}. ${date} ${time} - Week ${t.leg} - ${t.type}`);
    });
    
    // Check if any transactions happened recently (last 7 days)
    const recentCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days ago
    const recentTransactions = tscottyTransactions.filter(t => t.created >= recentCutoff)
    
    if (recentTransactions.length > 0) {
      console.log(`\n🚨 ${recentTransactions.length} transactions in last 7 days!`);
      recentTransactions.forEach((t, i) => {
        const date = new Date(t.created).toLocaleDateString()
        const time = new Date(t.created).toLocaleTimeString()
        console.log(`${i + 1}. ${date} ${time} - Week ${t.leg} - ${t.type}`);
      });
    } else {
      console.log('\n✅ No transactions in last 7 days');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRecentTransactions();