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
    
    console.log('\n� STEP 2: STATUS AND TYPE ANALYSIS');
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
    
    
  } catch (error) {
    console.error('❌ Error examining data:', error);
  }
}

examineActualData();
        
        // Analyze transaction counts per roster
        console.log('📊 TRANSACTION COUNT ANALYSIS:');
        console.log('-' .repeat(40));
        
        const transactionsByRoster = {};
        transactions.forEach(transaction => {
          const rosterId = transaction.roster_id;
          if (!transactionsByRoster[rosterId]) {
            transactionsByRoster[rosterId] = {
              count: 0,
              totalFees: 0,
              types: []
            };
          }
          transactionsByRoster[rosterId].count++;
          transactionsByRoster[rosterId].totalFees += parseFloat(transaction.fee_amount) || 0;
          transactionsByRoster[rosterId].types.push(transaction.type);
        });
        
        Object.entries(transactionsByRoster).forEach(([rosterId, stats]) => {
          const freeUsed = Math.min(stats.count, 10);
          const paidTransactions = Math.max(0, stats.count - 10);
          const expectedFees = paidTransactions * 2;
          
          console.log(`🏈 Roster ${rosterId}:`);
          console.log(`   Total Transactions: ${stats.count}`);
          console.log(`   Free Used: ${freeUsed}/10`);
          console.log(`   Paid Transactions: ${paidTransactions}`);
          console.log(`   Expected Fees: $${expectedFees}`);
          console.log(`   Actual Fees Stored: $${stats.totalFees}`);
          console.log(`   Transaction Types: ${stats.types.join(', ')}`);
          
          if (expectedFees !== stats.totalFees) {
            console.log(`   ⚠️  FEE MISMATCH: Expected $${expectedFees}, Got $${stats.totalFees}`);
          }
          console.log('');
        });
      }
      
      // Check matchup data for loss fees
      console.log('🏆 MATCHUP LOSS FEE ANALYSIS:');
      console.log('-' .repeat(40));
      
      if (data.database_info && data.database_info.matchups) {
        const matchups = data.database_info.matchups.recent;
        
        console.log(`Found ${matchups.length} matchup records:`);
        console.log('');
        
        let totalLossFees = 0;
        const lossFeesByRoster = {};
        
        matchups.forEach((matchup, idx) => {
          console.log(`🏈 Matchup ${idx + 1}:`);
          console.log(`   Week: ${matchup.week_number}`);
          console.log(`   Roster ${matchup.roster_id} vs Roster ${matchup.opponent_roster_id}`);
          console.log(`   Score: ${matchup.points} - ${matchup.opponent_points}`);
          console.log(`   Winner: ${matchup.is_winner ? 'YES' : 'NO'}`);
          console.log(`   High Scorer: ${matchup.is_high_scorer ? 'YES' : 'NO'}`);
          console.log(`   Loss Fee Applied: ${matchup.loss_fee_applied ? 'YES' : 'NO'}`);
          
          if (matchup.loss_fee_applied) {
            const lossFee = 5; // $5 per loss
            totalLossFees += lossFee;
            if (!lossFeesByRoster[matchup.roster_id]) {
              lossFeesByRoster[matchup.roster_id] = 0;
            }
            lossFeesByRoster[matchup.roster_id] += lossFee;
            console.log(`   💰 Loss Fee: $${lossFee}`);
          }
          console.log('');
        });
        
        console.log('💰 LOSS FEE SUMMARY:');
        console.log('-' .repeat(30));
        Object.entries(lossFeesByRoster).forEach(([rosterId, fees]) => {
          console.log(`   Roster ${rosterId}: $${fees} in loss fees`);
        });
        console.log(`   TOTAL LOSS FEES: $${totalLossFees}`);
        console.log('');
      }
      
      // The critical issue identification
      console.log('🚨 CRITICAL ISSUE IDENTIFIED:');
      console.log('==============================');
      console.log('❌ NO FEE_SUMMARIES TABLE: Database missing fee aggregation table');
      console.log('❌ NO COMPREHENSIVE FEE TRACKING: Fees calculated but not stored');
      console.log('❌ TRANSACTION FEES NOT AGGREGATED: Individual transaction fees exist but no summaries');
      console.log('');
      console.log('🎯 ROOT CAUSE:');
      console.log('===============');
      console.log('The system calculates fees correctly but may not be storing them in a');
      console.log('centralized fee_summaries table that our audit queries are looking for.');
      console.log('');
      console.log('🔧 SOLUTION NEEDED:');
      console.log('===================');
      console.log('1. Create/verify fee_summaries table exists');
      console.log('2. Ensure weekly processor stores aggregated fee data');
      console.log('3. Update audit queries to access correct fee storage location');
      console.log('4. Backfill missing fee summary data from transaction/matchup records');
      
    } else {
      console.log(`❌ Database query failed: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`💥 Examination error: ${error.message}`);
  }
}

// Execute the detailed examination
examineActualData().catch(console.error);