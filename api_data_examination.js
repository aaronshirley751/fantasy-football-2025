// EXAMINE ACTUAL API DATA
// Deep dive into the raw API responses to find filtering criteria

async function examineActualData() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 EXAMINING ACTUAL API DATA');
  console.log('🎯 Looking for implicit filters or criteria excluding transactions');
  console.log('=' .repeat(80));
  console.log('');
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  const WATTS52_ROSTER_ID = 6;
  
  try {
    console.log('🔍 STEP 1: RAW API RESPONSE ANALYSIS');
    console.log('-' .repeat(50));
    
    // Get raw data for each week and examine ALL transactions, not just Watts52
    for (let week = 1; week <= 4; week++) {
      console.log(`\n📋 WEEK ${week} RAW DATA:`);
      const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
      
      if (transRes.ok) {
        const allTransactions = await transRes.json();
        console.log(`  Total transactions: ${allTransactions.length}`);
        
        // Check Watts52 transactions in detail
        const watts52Transactions = allTransactions.filter(t => 
          t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)
        );
        
        console.log(`  Watts52 transactions: ${watts52Transactions.length}`);
        
        if (watts52Transactions.length > 0) {
          watts52Transactions.forEach((t, index) => {
            console.log(`    ${index + 1}. ID: ${t.transaction_id}`);
            console.log(`       Type: ${t.type}`);
            console.log(`       Status: ${t.status || 'N/A'}`);
            console.log(`       Created: ${new Date(t.created).toLocaleString()}`);
            console.log(`       Week: ${t.week || 'N/A'}`);
            console.log(`       Roster IDs: ${t.roster_ids ? t.roster_ids.join(', ') : 'N/A'}`);
            
            // Check for any status filters
            if (t.status && t.status !== 'complete') {
              console.log(`       ⚠️  NON-COMPLETE STATUS: ${t.status}`);
            }
            
            // Check metadata
            if (t.metadata) {
              console.log(`       Metadata: ${JSON.stringify(t.metadata)}`);
            }
            
            console.log('');
          });
        }
        
        // Look for any failed/pending transactions that might be excluded
        const allWatts52Related = allTransactions.filter(t => {
          // More comprehensive check
          return t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID) ||
                 (t.consenter_ids && t.consenter_ids.includes(WATTS52_ROSTER_ID)) ||
                 (t.creator && t.creator === '862853736618364928'); // Watts52's user ID
        });
        
        if (allWatts52Related.length !== watts52Transactions.length) {
          console.log(`  ⚠️  FOUND ${allWatts52Related.length} vs ${watts52Transactions.length} with broader search!`);
        }
      }
    }
    
    console.log('\n🔍 STEP 2: STATUS AND TYPE ANALYSIS');
    console.log('-' .repeat(50));
    
    // Collect all Watts52 transactions and analyze their properties
    const allWatts52Transactions = [];
    
    for (let week = 1; week <= 18; week++) {
      try {
        const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
        if (transRes.ok) {
          const weekTransactions = await transRes.json();
          const watts52WeekTrans = weekTransactions.filter(t => 
            t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)
          );
          allWatts52Transactions.push(...watts52WeekTrans);
        }
      } catch (e) {
        // Silent continue
      }
    }
    
    console.log(`Total Watts52 transactions found: ${allWatts52Transactions.length}`);
    console.log('');
    
    // Group by status
    const byStatus = {};
    const byType = {};
    const byWeek = {};
    
    allWatts52Transactions.forEach(t => {
      const status = t.status || 'no_status';
      const type = t.type || 'no_type';
      const week = t.week || 'no_week';
      
      byStatus[status] = (byStatus[status] || 0) + 1;
      byType[type] = (byType[type] || 0) + 1;
      byWeek[week] = (byWeek[week] || 0) + 1;
    });
    
    console.log('📊 TRANSACTION BREAKDOWN:');
    console.log('By Status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    console.log('\nBy Type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\nBy Week:');
    Object.entries(byWeek).forEach(([week, count]) => {
      console.log(`  Week ${week}: ${count}`);
    });
    
    console.log('\n🔍 STEP 3: CHECKING FOR IMPLICIT FILTERS');
    console.log('-' .repeat(50));
    
    // Check if we're filtering by status inadvertently
    const nonCompleteTransactions = allWatts52Transactions.filter(t => t.status && t.status !== 'complete');
    if (nonCompleteTransactions.length > 0) {
      console.log(`⚠️  Found ${nonCompleteTransactions.length} non-complete transactions:`);
      nonCompleteTransactions.forEach(t => {
        console.log(`  ${t.transaction_id}: ${t.status} (${t.type})`);
      });
    } else {
      console.log('✅ All transactions have "complete" status');
    }
    
    // Check date ranges
    console.log('\n📅 DATE RANGE ANALYSIS:');
    const dates = allWatts52Transactions.map(t => new Date(t.created));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    console.log(`Earliest transaction: ${minDate.toLocaleString()}`);
    console.log(`Latest transaction: ${maxDate.toLocaleString()}`);
    console.log(`Date span: ${Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))} days`);
    
    // Check our August 24 cutoff
    const cutoffDate = new Date('2025-08-24T00:00:00Z');
    const beforeCutoff = allWatts52Transactions.filter(t => new Date(t.created) < cutoffDate);
    const afterCutoff = allWatts52Transactions.filter(t => new Date(t.created) >= cutoffDate);
    
    console.log(`\n📅 CUTOFF ANALYSIS (August 24, 2025):`);
    console.log(`Before cutoff: ${beforeCutoff.length}`);
    console.log(`After cutoff: ${afterCutoff.length}`);
    
    if (beforeCutoff.length > 0) {
      console.log('⚠️  Found transactions BEFORE cutoff that we should exclude');
    }
    
    console.log('\n🎯 POTENTIAL ISSUES IDENTIFIED:');
    console.log('=' .repeat(50));
    console.log('1. Check if our code inadvertently filters by transaction status');
    console.log('2. Verify if certain transaction types are excluded');
    console.log('3. Look for week assignment issues (many show "no_week")');
    console.log('4. Consider if API pagination limits results per week');
    console.log('5. Check if some transactions span multiple roster_ids');
    
  } catch (error) {
    console.error('❌ Error examining data:', error);
  }
}

examineActualData();