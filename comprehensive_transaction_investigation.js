// COMPREHENSIVE TRANSACTION TYPE INVESTIGATION
// Check ALL transaction types in the league to see what we might be missing

async function comprehensiveTransactionTypeInvestigation() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 COMPREHENSIVE TRANSACTION TYPE INVESTIGATION');
  console.log('🎯 Finding ALL transaction types in the league to identify what we\'re missing');
  console.log('=' .repeat(80));
  console.log('');
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  const WATTS52_ROSTER_ID = 6;
  
  try {
    console.log('🔍 STEP 1: ANALYZE ALL TRANSACTION TYPES IN LEAGUE');
    console.log('-' .repeat(50));
    
    const allTransactionTypes = new Set();
    const watts52TransactionsByType = {};
    const allTransactions = [];
    let totalLeagueTransactions = 0;
    
    // Check all weeks
    for (let week = 1; week <= 18; week++) {
      try {
        const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
        if (transRes.ok) {
          const weekTransactions = await transRes.json();
          totalLeagueTransactions += weekTransactions.length;
          
          // Analyze ALL transaction types in the league
          weekTransactions.forEach(t => {
            allTransactionTypes.add(t.type);
            
            // Check if this involves Watts52 in ANY way
            const involvesWatts52 = 
              (t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)) ||
              (t.consenter_ids && t.consenter_ids.includes(WATTS52_ROSTER_ID)) ||
              (t.creator && t.creator === '862853736618364928') || // Watts52's user ID
              (t.settings && t.settings.waiver_budget && Object.keys(t.settings.waiver_budget).includes(WATTS52_ROSTER_ID.toString()));
            
            if (involvesWatts52) {
              const type = t.type || 'unknown';
              watts52TransactionsByType[type] = (watts52TransactionsByType[type] || 0) + 1;
              allTransactions.push({...t, week_found: week});
            }
          });
        }
      } catch (e) {
        // Silent continue
      }
    }
    
    console.log(`Total league transactions across all weeks: ${totalLeagueTransactions}`);
    console.log(`All transaction types found in league: ${Array.from(allTransactionTypes).join(', ')}`);
    console.log('');
    
    console.log('🔍 STEP 2: WATTS52 INVOLVEMENT ANALYSIS');
    console.log('-' .repeat(50));
    console.log(`Total Watts52-related transactions: ${allTransactions.length}`);
    console.log('');
    console.log('By Type:');
    Object.entries(watts52TransactionsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} transactions`);
    });
    console.log('');
    
    // Show detailed breakdown of all Watts52 transactions
    console.log('🔍 STEP 3: DETAILED WATTS52 TRANSACTION BREAKDOWN');
    console.log('-' .repeat(50));
    
    allTransactions.sort((a, b) => a.created - b.created);
    
    allTransactions.forEach((t, index) => {
      const date = new Date(t.created).toLocaleDateString();
      const time = new Date(t.created).toLocaleTimeString();
      console.log(`${String(index + 1).padStart(2, ' ')}. ${date} ${time} - ${t.type}`);
      console.log(`    ID: ${t.transaction_id}`);
      console.log(`    Week found: ${t.week_found}`);
      console.log(`    Status: ${t.status || 'N/A'}`);
      
      // Show involvement details
      if (t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)) {
        console.log(`    ✅ Direct roster involvement`);
      }
      if (t.consenter_ids && t.consenter_ids.includes(WATTS52_ROSTER_ID)) {
        console.log(`    ✅ Consenter involvement`);
      }
      if (t.creator && t.creator === '862853736618364928') {
        console.log(`    ✅ Creator involvement`);
      }
      
      // Show adds/drops
      if (t.adds && Object.keys(t.adds).length > 0) {
        console.log(`    Adds: ${Object.keys(t.adds).join(', ')}`);
      }
      if (t.drops && Object.keys(t.drops).length > 0) {
        console.log(`    Drops: ${Object.keys(t.drops).join(', ')}`);
      }
      
      console.log('');
    });
    
    console.log('🔍 STEP 4: POSSIBLE MISSING TRANSACTION ANALYSIS');
    console.log('-' .repeat(50));
    
    // Check if we're missing any transaction types
    const countableTypes = ['waiver', 'free_agent'];
    const nonCountableTypes = ['trade', 'commissioner'];
    
    console.log('Transaction type analysis:');
    allTransactionTypes.forEach(type => {
      const isCountable = countableTypes.includes(type);
      const watts52Count = watts52TransactionsByType[type] || 0;
      console.log(`  ${type}: ${isCountable ? 'COUNTABLE' : 'non-countable'} (Watts52: ${watts52Count})`);
    });
    
    console.log('');
    console.log('🎯 SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`Total Watts52 transactions found with broader search: ${allTransactions.length}`);
    console.log(`Previous narrow search: 15`);
    console.log(`Sleeper chat shows: 20`);
    console.log(`Still missing: ${20 - allTransactions.length}`);
    
    if (allTransactions.length > 15) {
      console.log('');
      console.log('🚨 FOUND ADDITIONAL TRANSACTIONS!');
      console.log('Our original filter was too narrow.');
    } else if (allTransactions.length === 15) {
      console.log('');
      console.log('🤔 NO ADDITIONAL TRANSACTIONS FOUND');
      console.log('The 5 missing transactions may be:');
      console.log('1. In a different league');
      console.log('2. Classified differently in Sleeper chat vs API');
      console.log('3. From pre-season that chat still shows');
      console.log('4. API limitation or sync delay');
    }
    
  } catch (error) {
    console.error('❌ Error in comprehensive investigation:', error);
  }
}

comprehensiveTransactionTypeInvestigation();