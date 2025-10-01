// WAIVER VS FREE AGENT INVESTIGATION
// Check if we're missing waiver transactions by only filtering for free_agent

async function waiversVsFreeAgentInvestigation() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 WAIVER VS FREE AGENT INVESTIGATION');
  console.log('🎯 Checking if we\'re missing waiver transactions by filtering only free_agent');
  console.log('=' .repeat(80));
  console.log('');
  
  const SLEEPER_LEAGUE_ID = '1249067741470539776';
  const WATTS52_ROSTER_ID = 6;
  
  try {
    console.log('🔍 CHECKING ALL TRANSACTION TYPES FOR WATTS52');
    console.log('-' .repeat(50));
    
    let totalTransactions = 0;
    const transactionsByType = {};
    const allWatts52Transactions = [];
    
    // Check all weeks, but this time don't filter by transaction type
    for (let week = 1; week <= 18; week++) {
      try {
        const transRes = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/transactions/${week}`);
        if (transRes.ok) {
          const weekTransactions = await transRes.json();
          
          // Get ALL Watts52 transactions, not just free_agent
          const watts52WeekTrans = weekTransactions.filter(t => 
            t.roster_ids && t.roster_ids.includes(WATTS52_ROSTER_ID)
          );
          
          if (watts52WeekTrans.length > 0) {
            console.log(`Week ${week}: ${watts52WeekTrans.length} total transactions`);
            
            // Break down by type
            watts52WeekTrans.forEach(t => {
              const type = t.type || 'unknown';
              transactionsByType[type] = (transactionsByType[type] || 0) + 1;
              totalTransactions++;
              allWatts52Transactions.push(t);
              
              console.log(`  ${t.type}: ${new Date(t.created).toLocaleDateString()} - ID: ${t.transaction_id}`);
            });
            console.log('');
          }
        }
      } catch (e) {
        // Silent continue
      }
    }
    
    console.log('📊 TRANSACTION TYPE BREAKDOWN:');
    console.log('-' .repeat(50));
    console.log(`Total Watts52 transactions found: ${totalTransactions}`);
    console.log('');
    console.log('By Type:');
    Object.entries(transactionsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} transactions`);
    });
    
    console.log('');
    console.log('🔍 DETAILED ANALYSIS:');
    console.log('-' .repeat(50));
    
    // Check what our original filter would have caught
    const freeAgentOnly = allWatts52Transactions.filter(t => t.type === 'free_agent');
    const waiverOnly = allWatts52Transactions.filter(t => t.type === 'waiver');
    const countableTransactions = allWatts52Transactions.filter(t => ['waiver', 'free_agent'].includes(t.type));
    
    console.log(`Free agent transactions: ${freeAgentOnly.length}`);
    console.log(`Waiver transactions: ${waiverOnly.length}`);
    console.log(`Total countable (waiver + free_agent): ${countableTransactions.length}`);
    console.log('');
    
    if (waiverOnly.length > 0) {
      console.log('🚨 FOUND WAIVER TRANSACTIONS:');
      waiverOnly.forEach((t, index) => {
        const date = new Date(t.created).toLocaleDateString();
        const time = new Date(t.created).toLocaleTimeString();
        console.log(`  ${index + 1}. ${date} ${time} - ID: ${t.transaction_id}`);
        console.log(`     Week: ${t.week || 'N/A'}`);
        console.log(`     Status: ${t.status}`);
        if (t.adds) {
          console.log(`     Adds: ${Object.keys(t.adds).join(', ')}`);
        }
        if (t.drops) {
          console.log(`     Drops: ${Object.keys(t.drops).join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('✅ No waiver transactions found - all are free_agent type');
    }
    
    // Check if our database logic is correct
    console.log('🔍 DATABASE LOGIC CHECK:');
    console.log('-' .repeat(50));
    console.log('Our production code filters for:');
    console.log('  .in(\'transaction_type\', [\'waiver\', \'free_agent\'])');
    console.log('');
    console.log('Our API code was filtering for:');
    console.log('  t.type === \'free_agent\' only');
    console.log('');
    
    if (waiverOnly.length > 0) {
      console.log('🚨 ISSUE IDENTIFIED:');
      console.log(`We were missing ${waiverOnly.length} waiver transactions!`);
      console.log('This explains the discrepancy between Sleeper chat and API results.');
    } else {
      console.log('🤔 ALL TRANSACTIONS ARE free_agent TYPE');
      console.log('The discrepancy must be from another source.');
    }
    
    console.log('');
    console.log('🎯 UPDATED COUNTS:');
    console.log('=' .repeat(50));
    console.log(`Previous count (free_agent only): 15`);
    console.log(`New count (waiver + free_agent): ${countableTransactions.length}`);
    console.log(`Sleeper chat shows: 20`);
    console.log(`Still missing: ${20 - countableTransactions.length}`);
    
  } catch (error) {
    console.error('❌ Error in waiver investigation:', error);
  }
}

waiversVsFreeAgentInvestigation();