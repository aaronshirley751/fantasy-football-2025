// ALL ADD/DROP TRANSACTIONS INVESTIGATION  
// Remove type filters and check ALL transactions with adds/drops for Watts52

async function allAddDropTransactionsInvestigation() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 ALL ADD/DROP TRANSACTIONS INVESTIGATION');
  console.log('🎯 Removing type filters - checking ALL transactions with adds/drops for Watts52');
  console.log('=' .repeat(80));
  console.log('');
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  const WATTS52_ROSTER_ID = 6;
  
  try {
    console.log('🔍 FINDING ALL TRANSACTIONS WITH ROSTER CHANGES');
    console.log('-' .repeat(50));
    
    const allWatts52AddDrops = [];
    let totalLeagueTransactions = 0;
    
    // Check all weeks without any type filtering
    for (let week = 1; week <= 18; week++) {
      try {
        const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
        if (transRes.ok) {
          const weekTransactions = await transRes.json();
          totalLeagueTransactions += weekTransactions.length;
          
          // Find ANY transaction that involves Watts52 AND has adds/drops
          const watts52AddDropTrans = weekTransactions.filter(t => {
            // Must involve Watts52 roster
            const involvesWatts52 = 
              (t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)) ||
              (t.consenter_ids && t.consenter_ids.includes(WATTS52_ROSTER_ID));
            
            // Must have adds or drops (actual roster changes)
            const hasRosterChanges = (t.adds && Object.keys(t.adds).length > 0) || 
                                   (t.drops && Object.keys(t.drops).length > 0);
            
            return involvesWatts52 && hasRosterChanges;
          });
          
          if (watts52AddDropTrans.length > 0) {
            console.log(`Week ${week}: ${watts52AddDropTrans.length} add/drop transactions`);
            allWatts52AddDrops.push(...watts52AddDropTrans.map(t => ({...t, week_found: week})));
          }
        }
      } catch (e) {
        // Silent continue
      }
    }
    
    console.log('');
    console.log('📊 RESULTS SUMMARY:');
    console.log('-' .repeat(50));
    console.log(`Total league transactions: ${totalLeagueTransactions}`);
    console.log(`Watts52 add/drop transactions found: ${allWatts52AddDrops.length}`);
    console.log(`Previous filtered count (free_agent only): 15`);
    console.log(`Difference: ${allWatts52AddDrops.length - 15}`);
    console.log('');
    
    // Group by transaction type
    const byType = {};
    allWatts52AddDrops.forEach(t => {
      const type = t.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    });
    
    console.log('📋 BREAKDOWN BY TRANSACTION TYPE:');
    console.log('-' .repeat(50));
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} transactions`);
    });
    console.log('');
    
    // Show detailed analysis of each transaction
    console.log('🔍 DETAILED TRANSACTION ANALYSIS:');
    console.log('-' .repeat(50));
    
    allWatts52AddDrops.sort((a, b) => a.created - b.created);
    
    allWatts52AddDrops.forEach((t, index) => {
      const date = new Date(t.created).toLocaleDateString();
      const time = new Date(t.created).toLocaleTimeString();
      console.log(`${String(index + 1).padStart(2, ' ')}. ${date} ${time} - ${t.type.toUpperCase()}`);
      console.log(`    Transaction ID: ${t.transaction_id}`);
      console.log(`    Week found: ${t.week_found}`);
      console.log(`    Status: ${t.status || 'N/A'}`);
      
      // Show roster involvement
      if (t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)) {
        console.log(`    ✅ Roster ${WATTS52_ROSTER_ID} in roster_ids: [${t.roster_ids.join(', ')}]`);
      }
      if (t.consenter_ids && t.consenter_ids.includes(WATTS52_ROSTER_ID)) {
        console.log(`    ✅ Roster ${WATTS52_ROSTER_ID} in consenter_ids: [${t.consenter_ids.join(', ')}]`);
      }
      
      // Show adds/drops with more detail
      if (t.adds && Object.keys(t.adds).length > 0) {
        const adds = Object.entries(t.adds).map(([player, roster]) => `${player} → Roster ${roster}`);
        console.log(`    ADDS: ${adds.join(', ')}`);
      }
      if (t.drops && Object.keys(t.drops).length > 0) {
        const drops = Object.entries(t.drops).map(([player, roster]) => `${player} ← Roster ${roster}`);
        console.log(`    DROPS: ${drops.join(', ')}`);
      }
      
      // Check if this would be counted for fees
      const isCountableType = ['waiver', 'free_agent'].includes(t.type);
      const afterCutoff = new Date(t.created) >= new Date('2025-08-24T00:00:00Z');
      const shouldCount = isCountableType && afterCutoff;
      
      console.log(`    Fee eligible: ${shouldCount ? '✅ YES' : '❌ NO'} (${isCountableType ? 'countable type' : 'non-countable type'}, ${afterCutoff ? 'after cutoff' : 'before cutoff'})`);
      console.log('');
    });
    
    // Compare with Sleeper chat expectations
    console.log('🎯 COMPARISON WITH SLEEPER CHAT:');
    console.log('-' .repeat(50));
    
    const countableTransactions = allWatts52AddDrops.filter(t => {
      const isCountableType = ['waiver', 'free_agent'].includes(t.type);
      const afterCutoff = new Date(t.created) >= new Date('2025-08-24T00:00:00Z');
      return isCountableType && afterCutoff;
    });
    
    console.log(`All add/drop transactions: ${allWatts52AddDrops.length}`);
    console.log(`Fee-eligible transactions: ${countableTransactions.length}`);
    console.log(`Sleeper chat shows: 20 transactions`);
    console.log(`Still missing: ${20 - allWatts52AddDrops.length}`);
    
    if (allWatts52AddDrops.length > 15) {
      console.log('');
      console.log('🚨 FOUND ADDITIONAL TRANSACTIONS!');
      const newTransactions = allWatts52AddDrops.length - 15;
      console.log(`Discovered ${newTransactions} additional transactions by removing type filters`);
      
      // Show which types were being missed
      const additionalTypes = new Set();
      allWatts52AddDrops.forEach(t => {
        if (t.type !== 'free_agent') {
          additionalTypes.add(t.type);
        }
      });
      
      if (additionalTypes.size > 0) {
        console.log(`Previously missed types: ${Array.from(additionalTypes).join(', ')}`);
      }
    } else {
      console.log('');
      console.log('🤔 NO ADDITIONAL TRANSACTIONS FOUND');
      console.log('All add/drop transactions are already accounted for in our previous search');
    }
    
  } catch (error) {
    console.error('❌ Error in add/drop investigation:', error);
  }
}

allAddDropTransactionsInvestigation();